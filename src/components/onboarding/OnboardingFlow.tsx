import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';
import { LogoMark } from '../../../components/Logo';
import FuturisticVoiceWave from '../../../components/app/FuturisticVoiceWave';
import { colors, fonts, surfaces, typography } from '../../../constants/theme';
import { requestHealthKitAuthorization } from '../../services/healthkit';
import { markOnboardingComplete, setPendingOnboardingVoice } from '../../services/onboarding';
import { ensureGuidedQuestion, setStallPattern } from '../../services/guidedQuestion';
import { syncDailyReminders } from '../../services/dailyReminders';
import { activeTargetFromText, DESTINATION_PLACEHOLDER, saveNorthStar, type NorthStar } from '../../services/northStar';
import { ONBOARDING_BOTTLENECK_PROMPT } from '../../services/voiceCheckPrompt';
import { setAIConsent } from '../../services/privacyConsent';
import { assembleAnonymizedPayload } from '../../services/telemetryPayload';
import { generateDailyDirective } from '../../services/directiveEngine';
import { transcribeVoiceRecording } from '../../services/transcribeVoice';
import LegalSafetyDrawer from '../LegalSafetyDrawer';
import { assessBottleneck, assessDestination, heardEcho } from '../../services/destinationQuality';
import type { DailyDirective, DailyTelemetryPayload } from '../../types/telemetry';

const STEPS = 4;

type Props = {
  onComplete: () => void;
};

function formatElapsed(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export default function OnboardingFlow({ onComplete }: Props) {
  const { width } = useWindowDimensions();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const slide = useRef(new Animated.Value(0)).current;
  const [step, setStep] = useState(0);
  const [healthOn, setHealthOn] = useState(false);
  const [permBusy, setPermBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [destinationDraft, setDestinationDraft] = useState('');
  const [star, setStar] = useState<NorthStar | null>(null);
  const [spoken, setSpoken] = useState('');
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const [card, setCard] = useState<DailyDirective | null>(null);
  const [echo, setEcho] = useState('');
  const [healthShaped, setHealthShaped] = useState(false);
  const [usedRetry, setUsedRetry] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);
  const lastPayloadRef = useRef<DailyTelemetryPayload | null>(null);

  useEffect(() => {
    Animated.timing(slide, {
      toValue: -step * width,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [step, slide, width]);

  useEffect(() => {
    if (!recording) {
      return undefined;
    }
    const tick = setInterval(() => {
      setElapsed((seconds) => seconds + 1);
    }, 1000);
    return () => clearInterval(tick);
  }, [recording]);

  function go(next: number) {
    setError(null);
    setStep(Math.max(0, Math.min(STEPS - 1, next)));
  }

  async function enableHealth(next: boolean) {
    if (!next) {
      setHealthOn(false);
      return;
    }
    setPermBusy(true);
    try {
      const result = await requestHealthKitAuthorization();
      setHealthOn(Boolean(result.authorized));
    } catch {
      setHealthOn(false);
    } finally {
      setPermBusy(false);
    }
  }

  async function startVoice() {
    setError(null);
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        setError('Microphone is optional. You can skip and still start with your target.');
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setElapsed(0);
      setRecording(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Recording could not start.');
    }
  }

  async function synthesizeFirstCard(opts: {
    star: NorthStar;
    transcript: string;
    durationSeconds: number;
    retry: boolean;
  }) {
    await setAIConsent(true).catch(() => {});
    await saveNorthStar(opts.star);
    if (opts.transcript) {
      setPendingOnboardingVoice({ transcript: opts.transcript, durationSeconds: opts.durationSeconds });
      await setStallPattern(opts.transcript);
    }
    const payload = await assembleAnonymizedPayload(opts.transcript || undefined, {
      voiceDurationSeconds: opts.transcript ? opts.durationSeconds : undefined,
      synthesis_mode: 'onboarding',
      artifact_retry: opts.retry,
    });
    const sealed: DailyTelemetryPayload = {
      ...payload,
      north_star: opts.star,
      infer_arc: false,
      last_execution: undefined,
      synthesis_mode: 'onboarding',
      artifact_retry: opts.retry,
    };
    lastPayloadRef.current = sealed;
    const next = await generateDailyDirective(sealed);
    setCard(next);
    setEcho(opts.transcript ? heardEcho(opts.transcript) : '');
    setHealthShaped(payload.healthkit === true);
  }

  async function captureVoiceAndSynthesize(opts?: { skipVoice?: boolean }) {
    if (finishing) {
      return;
    }
    const typed = destinationDraft.trim();
    const destination = assessDestination(typed);
    if (!destination.ok) {
      setError(destination.reason || 'Name a concrete target first.');
      go(1);
      return;
    }
    setFinishing(true);
    setError(null);
    try {
      if (recorder.isRecording) {
        await recorder.stop();
      }
      try {
        await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
      } catch {
        // Session restore is best-effort.
      }
      setRecording(false);
      let transcript = '';
      const durationSeconds = recorder.currentTime || elapsed;
      if (!opts?.skipVoice && recorder.uri) {
        const result = await transcribeVoiceRecording({ uri: recorder.uri, durationSeconds });
        transcript = result.transcript.trim();
        const bottleneck = assessBottleneck(transcript);
        if (!bottleneck.ok) {
          setError(bottleneck.reason || 'Name the stall and try once more.');
          setFinishing(false);
          return;
        }
        await setStallPattern(transcript);
      }
      const nextStar = activeTargetFromText(typed, star);
      if (!nextStar.next && !nextStar.now) {
        throw new Error('Name a concrete target so Quanti can point at it.');
      }
      setStar(nextStar);
      setSpoken(transcript);
      setVoiceSeconds(durationSeconds);
      await synthesizeFirstCard({
        star: nextStar,
        transcript,
        durationSeconds,
        retry: false,
      });
      go(3);
      setFinishing(false);
    } catch (caught) {
      const reason = caught instanceof Error ? caught.message : String(caught);
      console.error('[Onboarding] first card failed', reason);
      setError(reason);
      setFinishing(false);
    }
  }

  async function retryArtifact() {
    if (usedRetry || finishing || !star) {
      return;
    }
    setUsedRetry(true);
    setFinishing(true);
    setError(null);
    try {
      const prior = lastPayloadRef.current;
      await synthesizeFirstCard({
        star,
        transcript: spoken,
        durationSeconds: voiceSeconds,
        retry: true,
      });
      if (prior) {
        lastPayloadRef.current = { ...prior, artifact_retry: true };
      }
    } catch (caught) {
      const reason = caught instanceof Error ? caught.message : String(caught);
      setError(reason);
      setUsedRetry(false);
    } finally {
      setFinishing(false);
    }
  }

  async function beginToday() {
    if (finishing) {
      return;
    }
    setFinishing(true);
    try {
      await ensureGuidedQuestion({
        destinationNext: star?.next || star?.now,
        stallPattern: spoken || null,
        source: 'onboarding',
      });
      await markOnboardingComplete();
      await syncDailyReminders().catch(() => {});
      onComplete();
    } catch (caught) {
      const reason = caught instanceof Error ? caught.message : String(caught);
      setError(reason);
      setFinishing(false);
    }
  }

  const paneStyle = { width };
  const destinationCheck = assessDestination(destinationDraft);
  const canLeaveDestination = destinationCheck.ok;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.flex} onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.progressRow}>
            {Array.from({ length: STEPS }, (_, index) => (
              <View key={index} style={[styles.dot, index === step && styles.dotOn, index < step && styles.dotDone]} />
            ))}
          </View>

          <Animated.View style={[styles.track, { width: width * STEPS, transform: [{ translateX: slide }] }]}>
            <View style={[styles.pane, paneStyle, styles.loopPane]}>
              <ScrollView
                contentContainerStyle={styles.destScroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <LogoMark width={56} />
                <Text style={styles.kicker}>Quanti</Text>
                <Text style={styles.headline}>This is an execution engine.</Text>
                <Text style={styles.body}>
                  You already have enough ideas. Quanti will not plan your life or tell you what should be first.
                </Text>
                <Text style={styles.stepText}>You name one checkable thing.</Text>
                <Text style={styles.stepText}>Each day you get one physical move.</Text>
                <Text style={styles.stepText}>Tonight you mark whether you did it.</Text>
                <Text style={styles.reassure}>That’s the whole product.</Text>
              </ScrollView>
            </View>

            <View style={[styles.pane, paneStyle, styles.loopPane]}>
              <ScrollView
                contentContainerStyle={styles.destScroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.kicker}>One thing</Text>
                <Text style={styles.headline}>Name one thing you want true</Text>
                <Text style={styles.body}>
                  One checkable object. Someone else could mark yes or no. Quanti will not pick this for you.
                </Text>
                <TextInput
                  value={destinationDraft}
                  onChangeText={(value) => {
                    setDestinationDraft(value);
                    if (error) {
                      setError(null);
                    }
                  }}
                  placeholder={DESTINATION_PLACEHOLDER}
                  placeholderTextColor={colors.inactive}
                  multiline
                  blurOnSubmit
                  returnKeyType="done"
                  submitBehavior="blurAndSubmit"
                  onSubmitEditing={Keyboard.dismiss}
                  style={styles.destinationInput}
                />
                <View style={styles.exampleBlock}>
                  <Text style={styles.exampleLine}>
                    <Text style={styles.exampleLabel}>Weak: </Text>
                    &quot;Get in shape&quot; / &quot;Be productive&quot;
                  </Text>
                  <Text style={styles.exampleLine}>
                    <Text style={styles.exampleLabelStrong}>Strong: </Text>
                    &quot;Draft landing page copy&quot; / &quot;Ship TestFlight to 10 testers&quot;
                  </Text>
                </View>
                <Text style={styles.reassure}>You can rewrite later. Today only executes what you name.</Text>
              </ScrollView>
            </View>

            <View style={[styles.pane, paneStyle, styles.loopPane]}>
              <ScrollView
                contentContainerStyle={styles.loopScroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.kicker}>What kills it</Text>
                <Text style={styles.headline}>What usually stalls this?</Text>
                <Text style={styles.body}>{ONBOARDING_BOTTLENECK_PROMPT}</Text>
                <Pressable
                  onPress={() => {
                    if (finishing) {
                      return;
                    }
                    if (recording) {
                      captureVoiceAndSynthesize().catch(() => {});
                      return;
                    }
                    startVoice().catch(() => {});
                  }}
                  style={[styles.voiceCard, recording && styles.voiceCardLive]}
                >
                  <FuturisticVoiceWave isRecording={recording} gradientId="onboardingWave" />
                  <Text style={styles.voiceStatus}>
                    {finishing
                      ? 'Writing your first 1%…'
                      : recording
                        ? `Listening ${formatElapsed(elapsed)} · tap to finish`
                        : 'Tap to record · about 10–15 seconds'}
                  </Text>
                  {finishing ? <ActivityIndicator color={colors.heading} style={{ marginTop: 12 }} /> : null}
                </Pressable>
                <View style={styles.healthRow}>
                  <View style={styles.healthCopy}>
                    <Text style={styles.stepText}>
                      Optional HealthKit. Sleep and HRV size the window — they do not pick the move.
                    </Text>
                  </View>
                  <Switch
                    value={healthOn}
                    disabled={permBusy || finishing}
                    onValueChange={(value) => {
                      enableHealth(value).catch(() => {});
                    }}
                    trackColor={{ false: colors.input, true: colors.emeraldBorder }}
                    thumbColor={healthOn ? colors.emerald : colors.muted}
                  />
                </View>
              </ScrollView>
            </View>

            <View style={[styles.pane, paneStyle, styles.loopPane]}>
              <ScrollView
                contentContainerStyle={styles.loopScroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.kicker}>Do this 1%</Text>
                <Text style={styles.headline}>Execute this today.</Text>
                {echo ? <Text style={styles.echo}>“{echo}”</Text> : null}
                {card ? (
                  <View style={styles.cardBox}>
                    <Text style={styles.cardText}>{card.primary_directive}</Text>
                    {card.why_today ? <Text style={styles.why}>{card.why_today}</Text> : null}
                  </View>
                ) : (
                  <ActivityIndicator color={colors.heading} />
                )}
                <Text style={styles.reassure}>
                  {healthShaped
                    ? 'Sleep and HRV sized the window. They did not pick the move.'
                    : 'Default window — HealthKit did not shape this card.'}
                </Text>
                <Text style={styles.stepText}>Tonight: did you do it? Executed, partial, or shifted writes tomorrow.</Text>
                {finishing ? <ActivityIndicator color={colors.heading} /> : null}
              </ScrollView>
            </View>
          </Animated.View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {step === 0 ? (
            <Pressable
              onPress={() => {
                setError(null);
                go(1);
              }}
              style={styles.next}
            >
              <Text style={styles.nextText}>Continue</Text>
            </Pressable>
          ) : null}
          {step === 1 ? (
            <Pressable
              onPress={() => {
                Keyboard.dismiss();
                if (!canLeaveDestination) {
                  setError(destinationCheck.reason || 'Name one checkable thing first.');
                  return;
                }
                saveNorthStar(activeTargetFromText(destinationDraft.trim())).catch(() => {});
                go(2);
              }}
              style={[styles.next, !canLeaveDestination && styles.nextDim]}
            >
              <Text style={styles.nextText}>This is first</Text>
            </Pressable>
          ) : null}
          {step === 2 && !recording && !finishing ? (
            <Pressable
              onPress={() => {
                captureVoiceAndSynthesize({ skipVoice: true }).catch(() => {});
              }}
              style={styles.skip}
            >
              <Text style={styles.skipText}>Skip — write the 1% without a stall</Text>
            </Pressable>
          ) : null}
          {step === 3 && card && !finishing ? (
            <View style={styles.cardActions}>
              {!usedRetry ? (
                <Pressable onPress={() => retryArtifact().catch(() => {})} style={styles.skip}>
                  <Text style={styles.skipText}>Not this</Text>
                </Pressable>
              ) : null}
              <Pressable onPress={() => beginToday().catch(() => {})} style={styles.next}>
                <Text style={styles.nextText}>Execute today</Text>
              </Pressable>
            </View>
          ) : null}

          <Pressable
            onPress={() => setLegalOpen(true)}
            style={styles.legalFoot}
            accessibilityRole="link"
            accessibilityLabel="Open Legal and Safety terms"
          >
            <Text style={styles.legalFootText}>Execution tool only — see Legal & Safety terms.</Text>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
      <LegalSafetyDrawer visible={legalOpen} onClose={() => setLegalOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.bg,
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  dot: {
    backgroundColor: colors.input,
    borderRadius: 99,
    height: 4,
    width: 36,
  },
  dotOn: { backgroundColor: colors.heading },
  dotDone: { backgroundColor: colors.indigo },
  track: {
    flex: 1,
    flexDirection: 'row',
  },
  pane: {
    flex: 1,
    gap: 16,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 24,
  },
  loopPane: {
    justifyContent: 'flex-start',
    paddingVertical: 8,
  },
  loopScroll: {
    gap: 14,
    paddingBottom: 16,
  },
  destScroll: {
    gap: 14,
    paddingBottom: 16,
  },
  kicker: typography.kicker,
  headline: {
    ...typography.heading,
    fontSize: 32,
    letterSpacing: -0.8,
  },
  body: {
    ...typography.body,
    maxWidth: 360,
  },
  destinationInput: {
    ...surfaces.glass,
    color: colors.heading,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 96,
    padding: 16,
    textAlignVertical: 'top',
  },
  exampleBlock: {
    gap: 6,
  },
  exampleLine: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  exampleLabel: {
    color: colors.amber,
    fontFamily: fonts.semibold,
  },
  exampleLabelStrong: {
    color: colors.emerald,
    fontFamily: fonts.semibold,
  },
  reassure: {
    color: colors.inactive,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  stepText: {
    ...typography.body,
    fontSize: 15,
    lineHeight: 22,
  },
  voiceCard: {
    ...surfaces.glass,
    alignItems: 'center',
    padding: 16,
  },
  voiceCardLive: {
    backgroundColor: '#1A1710',
    borderColor: colors.amberBorder,
  },
  voiceStatus: {
    color: colors.inactive,
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 0.6,
    marginTop: 10,
    textAlign: 'center',
  },
  healthRow: {
    ...surfaces.glass,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  healthCopy: { flex: 1, gap: 4 },
  echo: {
    color: colors.heading,
    fontFamily: fonts.medium,
    fontSize: 18,
    letterSpacing: -0.3,
    lineHeight: 26,
  },
  cardBox: {
    ...surfaces.glass,
    gap: 10,
    padding: 18,
  },
  cardText: {
    color: colors.heading,
    fontFamily: fonts.semibold,
    fontSize: 22,
    letterSpacing: -0.4,
    lineHeight: 30,
  },
  why: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  cardActions: {
    marginBottom: 8,
  },
  error: {
    color: colors.amber,
    fontFamily: fonts.regular,
    fontSize: 13,
    paddingHorizontal: 28,
    paddingVertical: 8,
    textAlign: 'center',
  },
  next: {
    ...surfaces.button,
    marginBottom: 12,
    marginHorizontal: 28,
    minHeight: 52,
  },
  nextDim: { opacity: 0.45 },
  nextText: {
    color: colors.white,
    fontFamily: fonts.semibold,
    fontSize: 16,
  },
  skip: {
    marginBottom: 8,
    marginHorizontal: 28,
    paddingVertical: 10,
  },
  skipText: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  legalFoot: {
    marginBottom: 4,
    marginHorizontal: 28,
    paddingVertical: 6,
  },
  legalFootText: {
    color: colors.inactive,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
