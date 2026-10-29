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
import { DESTINATION_PLACEHOLDER, parseNorthStarFromSpeech, saveNorthStar } from '../../services/northStar';
import { VOICE_CHECK_SECONDS } from '../../services/voiceCheckPrompt';
import { setAIConsent } from '../../services/privacyConsent';
import { assembleAnonymizedPayload } from '../../services/telemetryPayload';
import { generateDailyDirective } from '../../services/directiveEngine';
import { transcribeVoiceRecording } from '../../services/transcribeVoice';

const STEPS = 3;
const MIN_VOICE_SECONDS = 10;
const MAX_VOICE_SECONDS = VOICE_CHECK_SECONDS;

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
  const finishVoiceRef = useRef<(opts?: { skipVoice?: boolean }) => Promise<void>>(async () => {});

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

  useEffect(() => {
    if (recording && elapsed >= MAX_VOICE_SECONDS) {
      finishVoiceRef.current().catch(() => {});
    }
  }, [elapsed, recording]);

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

  async function completeOnboarding(opts?: { skipVoice?: boolean }) {
    if (finishing) {
      return;
    }
    const typed = destinationDraft.trim();
    if (!typed) {
      setError('Name a concrete target first.');
      go(1);
      return;
    }
    if (!opts?.skipVoice && elapsed < MIN_VOICE_SECONDS && recorder.isRecording) {
      setError(`Keep going — ${MIN_VOICE_SECONDS}–${MAX_VOICE_SECONDS} seconds.`);
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
      let spoken = '';
      const durationSeconds = recorder.currentTime || elapsed;
      if (!opts?.skipVoice && recorder.uri) {
        const result = await transcribeVoiceRecording({ uri: recorder.uri, durationSeconds });
        spoken = result.transcript.trim();
      }
      const star = parseNorthStarFromSpeech(typed);
      if (!star.next && !star.now) {
        throw new Error('Name a concrete target so Quanti can point at it.');
      }
      if (spoken) {
        setPendingOnboardingVoice({ transcript: spoken, durationSeconds });
      }
      await setAIConsent(true).catch(() => {});
      await saveNorthStar(star);
      const payload = await assembleAnonymizedPayload(spoken || undefined, {
        voiceDurationSeconds: spoken ? durationSeconds : undefined,
      });
      await generateDailyDirective({
        ...payload,
        north_star: star,
        infer_arc: false,
      });
      await markOnboardingComplete();
      onComplete();
    } catch (caught) {
      const reason = caught instanceof Error ? caught.message : String(caught);
      console.error('[Onboarding] complete failed', reason);
      setError(reason);
      setFinishing(false);
    }
  }

  finishVoiceRef.current = completeOnboarding;
  const paneStyle = { width };
  const hasTarget = destinationDraft.trim().length > 3;

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
            <View style={[styles.pane, paneStyle]}>
              <LogoMark width={72} />
              <Text style={styles.kicker}>The Compass</Text>
              <Text style={styles.headline}>One 1% move toward your target.</Text>
              <Text style={styles.body}>
                You name a concrete target. Each morning you get one 15–20 word action on that path. Sleep and a
                15-second check size the push. Last night&apos;s mark writes tomorrow.
              </Text>
              <Text style={styles.contrast}>No dashboards, streaks, or guilt.</Text>
            </View>

            <View style={[styles.pane, paneStyle, styles.loopPane]}>
              <ScrollView
                contentContainerStyle={styles.destScroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.kicker}>The Destination</Text>
                <Text style={styles.headline}>Where are you going?</Text>
                <Text style={styles.body}>
                  Name a finish line someone else could check. Vague goals make vague cards. Named targets make named
                  moves.
                </Text>
                <TextInput
                  value={destinationDraft}
                  onChangeText={setDestinationDraft}
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
                    &quot;Get in shape&quot; / &quot;Grow the app&quot;
                  </Text>
                  <Text style={styles.exampleLine}>
                    <Text style={styles.exampleLabelStrong}>Strong: </Text>
                    &quot;Run 5 miles this week&quot; / &quot;Launch iOS alpha to 10 testers&quot;
                  </Text>
                </View>
                <Text style={styles.reassure}>
                  Quanti can only point at what you name. You can change this later.
                </Text>
              </ScrollView>
            </View>

            <View style={[styles.pane, paneStyle, styles.loopPane]}>
              <ScrollView
                contentContainerStyle={styles.loopScroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.kicker}>The Daily Loop</Text>
                <Text style={styles.headline}>The 30-second daily loop.</Text>
                <Text style={styles.stepText}>
                  10–15s Check: Name what&apos;s in the way today (file, person, place, clock time) — that&apos;s what
                  shapes the card.
                </Text>
                <Pressable
                  onPress={() => {
                    if (finishing) {
                      return;
                    }
                    if (recording) {
                      completeOnboarding().catch(() => {});
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
                        ? `Listening ${formatElapsed(elapsed)} / 0:15`
                        : 'Tap to record · 10–15 seconds'}
                  </Text>
                  {finishing ? <ActivityIndicator color={colors.heading} style={{ marginTop: 12 }} /> : null}
                </Pressable>
                <View style={styles.healthRow}>
                  <View style={styles.healthCopy}>
                    <Text style={styles.stepText}>
                      Optional HealthKit: Sizes today&apos;s push window based on sleep & HRV.
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
                <Text style={styles.stepText}>
                  Tonight: Tap Executed / Partial / Shifted — that&apos;s how tomorrow adapts.
                </Text>
              </ScrollView>
            </View>
          </Animated.View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {step === 0 ? (
        <Pressable onPress={() => go(1)} style={styles.next}>
          <Text style={styles.nextText}>Continue</Text>
        </Pressable>
      ) : null}
      {step === 1 ? (
        <Pressable
          onPress={() => {
            Keyboard.dismiss();
            if (!hasTarget) {
              setError('Name a concrete target first.');
              return;
            }
            go(2);
          }}
          style={[styles.next, !hasTarget && styles.nextDim]}
        >
          <Text style={styles.nextText}>Continue</Text>
        </Pressable>
      ) : null}
      {step === 2 && !recording && !finishing ? (
        <Pressable
          onPress={() => {
            completeOnboarding({ skipVoice: true }).catch(() => {});
          }}
          style={styles.skip}
        >
          <Text style={styles.skipText}>Skip check-in still works, but the card will be blunter.</Text>
        </Pressable>
      ) : null}
        </Pressable>
      </KeyboardAvoidingView>
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
  contrast: {
    ...typography.body,
    color: colors.muted,
    fontFamily: fonts.medium,
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
  healthTitle: {
    color: colors.heading,
    fontFamily: fonts.semibold,
    fontSize: 15,
  },
  healthBody: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
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
    marginBottom: 16,
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
});
