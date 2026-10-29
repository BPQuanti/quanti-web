import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
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
import PrivacyWhyModal from '../PrivacyWhyModal';
import { requestHealthKitAuthorization } from '../../services/healthkit';
import { markOnboardingComplete, setPendingOnboardingVoice } from '../../services/onboarding';
import { setSelectedArc } from '../../services/arcSettings';
import { parseNorthStarFromSpeech, saveNorthStar } from '../../services/northStar';
import { assembleAnonymizedPayload } from '../../services/telemetryPayload';
import { generateDailyDirective } from '../../services/directiveEngine';
import { transcribeVoiceRecording } from '../../services/transcribeVoice';

const STEPS = 5;
const MIN_VOICE_SECONDS = 30;
const MAX_VOICE_SECONDS = 60;
const FORMULA = ['Data Patterns', 'Spoken Context', 'Where You Are Going'] as const;

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
  const [micOn, setMicOn] = useState(false);
  const [permBusy, setPermBusy] = useState<'health' | 'mic' | null>(null);
  const [whyOpen, setWhyOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const finishVoiceRef = useRef<() => Promise<void>>(async () => {});

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
    setPermBusy('health');
    setError(null);
    try {
      const result = await requestHealthKitAuthorization();
      setHealthOn(Boolean(result.authorized));
      if (!result.authorized) {
        setError(result.available ? 'HealthKit was not enabled.' : 'HealthKit is unavailable in this build.');
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'HealthKit request failed.');
    } finally {
      setPermBusy(null);
    }
  }

  async function enableMic(next: boolean) {
    if (!next) {
      setMicOn(false);
      return;
    }
    setPermBusy('mic');
    setError(null);
    try {
      const permission = await requestRecordingPermissionsAsync();
      setMicOn(Boolean(permission.granted));
      if (!permission.granted) {
        setError('Microphone access is needed to speak where you are and where you want to go.');
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Microphone request failed.');
    } finally {
      setPermBusy(null);
    }
  }

  async function startVoice() {
    setError(null);
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        setError('Enable the microphone to speak where you are and where you want to go.');
        setMicOn(false);
        return;
      }
      setMicOn(true);
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setElapsed(0);
      setRecording(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Recording could not start.');
    }
  }

  async function finishVoice() {
    if (finishing) {
      return;
    }
    if (elapsed < MIN_VOICE_SECONDS && recorder.isRecording) {
      setError(`Keep going — speak at least ${MIN_VOICE_SECONDS} seconds.`);
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
      const uri = recorder.uri;
      const durationSeconds = recorder.currentTime || elapsed;
      if (!uri) {
        throw new Error('No audio file was produced. Try the mic again.');
      }
      const { transcript } = await transcribeVoiceRecording({ uri, durationSeconds });
      if (!transcript.trim()) {
        throw new Error('Speak where you are and where you want to go so Quanti can write a first directive.');
      }
      setPendingOnboardingVoice({ transcript, durationSeconds });
      const payload = await assembleAnonymizedPayload(transcript, { voiceDurationSeconds: durationSeconds });
      const directive = await generateDailyDirective({ ...payload, infer_arc: true });
      if (directive.inferred_arc) {
        await setSelectedArc(directive.inferred_arc);
      }
      const star = directive.north_star ?? parseNorthStarFromSpeech(transcript);
      if (!star.next && !star.now) {
        throw new Error('Name where you are and where you want to go. Then we can write today’s 1%.');
      }
      await saveNorthStar(star);
      await markOnboardingComplete();
      onComplete();
    } catch (caught) {
      const reason = caught instanceof Error ? caught.message : String(caught);
      console.error('[Onboarding] voice launch failed', reason);
      setError(reason);
      setFinishing(false);
    }
  }

  finishVoiceRef.current = finishVoice;
  const paneStyle = { width };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.progressRow}>
        {Array.from({ length: STEPS }, (_, index) => (
          <View key={index} style={[styles.dot, index === step && styles.dotOn, index < step && styles.dotDone]} />
        ))}
      </View>

      <Animated.View style={[styles.track, { width: width * STEPS, transform: [{ translateX: slide }] }]}>
        <View style={[styles.pane, paneStyle]}>
          <LogoMark width={72} />
          <Text style={styles.kicker}>01</Text>
          <Text style={styles.headline}>Meet Quanti.</Text>
          <Text style={styles.body}>
            We turn your raw daily data into an intelligent strategy for where you are and where you want to go.
          </Text>
        </View>

        <View style={[styles.pane, paneStyle]}>
          <Text style={styles.kicker}>02</Text>
          <Text style={styles.headline}>Built for Agency, Not Attention.</Text>
          <Text style={styles.body}>
            Modern software optimizes for continuous engagement and cognitive noise. Quanti is designed as a quiet,
            privacy-first decision mirror—giving you clarity and getting out of the way.
          </Text>
        </View>

        <View style={[styles.pane, paneStyle]}>
          <Text style={styles.kicker}>03</Text>
          <Text style={styles.headline}>The Formula.</Text>
          <View style={styles.bento}>
            <View style={styles.bentoRow}>
              {FORMULA.map((label, index) => (
                <View key={label} style={styles.bentoPiece}>
                  <View style={styles.bentoChip}>
                    <Text style={styles.bentoChipText}>{label}</Text>
                  </View>
                  <Text style={styles.operator}>{index < FORMULA.length - 1 ? '+' : '='}</Text>
                </View>
              ))}
            </View>
            <View style={styles.bentoResult}>
              <Text style={styles.bentoResultText}>One Daily Directive</Text>
            </View>
          </View>
          <Text style={styles.body}>
            1% better every day. No manual surveys—just speak your context and let your execution engine adapt.
          </Text>
        </View>

        <View style={[styles.pane, paneStyle]}>
          <View style={styles.screenHead}>
            <Text style={styles.kicker}>04</Text>
            <Pressable onPress={() => setWhyOpen(true)} style={styles.whyChip}>
              <Text style={styles.whyChipText}>Why?</Text>
            </Pressable>
          </View>
          <Text style={styles.headline}>Connect Your Signals.</Text>
          <View style={styles.permCard}>
            <View style={styles.permCopy}>
              <Text style={styles.permTitle}>HealthKit</Text>
              <Text style={styles.permBody}>Sleep & HRV recovery so Quanti can bound today’s energy.</Text>
            </View>
            <Switch
              value={healthOn}
              disabled={permBusy !== null}
              onValueChange={(value) => {
                enableHealth(value).catch(() => {});
              }}
              trackColor={{ false: colors.input, true: colors.emeraldBorder }}
              thumbColor={healthOn ? colors.emerald : colors.muted}
            />
          </View>
          <View style={styles.permCard}>
            <View style={styles.permCopy}>
              <Text style={styles.permTitle}>Microphone</Text>
              <Text style={styles.permBody}>Verbal context so the directive hears where you are, not just the sensors.</Text>
            </View>
            <Switch
              value={micOn}
              disabled={permBusy !== null}
              onValueChange={(value) => {
                enableMic(value).catch(() => {});
              }}
              trackColor={{ false: colors.input, true: colors.emeraldBorder }}
              thumbColor={micOn ? colors.emerald : colors.muted}
            />
          </View>
        </View>

        <View style={[styles.pane, paneStyle, styles.seasonPane]}>
          <ScrollView contentContainerStyle={styles.seasonScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.kicker}>05</Text>
            <Text style={styles.headline}>Where are you now — and where do you want to go?</Text>
            <Text style={styles.body}>
              Talk for 30–60 seconds. Example: you’re 27, at home, building an app, and you want your own place and
              revenue. Quanti keeps that destination and writes today’s 1% move.
            </Text>
            <Pressable
              onPress={() => {
                if (finishing) {
                  return;
                }
                if (recording) {
                  finishVoice().catch(() => {});
                  return;
                }
                startVoice().catch(() => {});
              }}
              style={[styles.voiceCard, recording && styles.voiceCardLive]}
            >
              <Text style={styles.voiceHint}>Speak where you are and where you want to go. 30–60 seconds.</Text>
              <FuturisticVoiceWave isRecording={recording} gradientId="onboardingWave" />
              <Text style={styles.voiceStatus}>
                {finishing
                  ? 'Transcribing and writing your first directive…'
                  : recording
                    ? `Listening ${formatElapsed(elapsed)} / 1:00`
                    : 'Tap to record'}
              </Text>
              {finishing ? <ActivityIndicator color={colors.heading} style={{ marginTop: 12 }} /> : null}
            </Pressable>
          </ScrollView>
        </View>
      </Animated.View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {step < 4 ? (
        <Pressable onPress={() => go(step + 1)} style={styles.next}>
          <Text style={styles.nextText}>Continue</Text>
        </Pressable>
      ) : null}

      <PrivacyWhyModal visible={whyOpen} onClose={() => setWhyOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.bg,
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
    width: 28,
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
  seasonPane: {
    justifyContent: 'flex-start',
    paddingVertical: 8,
  },
  seasonScroll: {
    gap: 14,
    paddingBottom: 16,
  },
  screenHead: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  whyChip: {
    borderColor: colors.indigoBorder,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  whyChipText: {
    color: colors.indigo,
    fontFamily: fonts.semibold,
    fontSize: 12,
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
  bento: {
    ...surfaces.glass,
    gap: 10,
    padding: 18,
  },
  bentoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bentoPiece: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  bentoChip: {
    backgroundColor: colors.input,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  bentoChipText: {
    color: colors.heading,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  operator: {
    color: colors.inactive,
    fontFamily: fonts.mono,
    fontSize: 16,
    width: 16,
  },
  bentoResult: {
    backgroundColor: colors.indigoBg,
    borderColor: colors.indigoBorder,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 4,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  bentoResultText: {
    color: colors.indigo,
    fontFamily: fonts.semibold,
    fontSize: 15,
  },
  permCard: {
    ...surfaces.glass,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  permCopy: { flex: 1, gap: 6 },
  permTitle: {
    color: colors.heading,
    fontFamily: fonts.semibold,
    fontSize: 16,
  },
  permBody: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipOn: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: colors.heading,
  },
  chipText: {
    color: colors.inactive,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  chipTextOn: { color: colors.heading },
  secondaryLabel: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 12,
    letterSpacing: 0.4,
    marginTop: 4,
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
  voiceHint: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 8,
    textAlign: 'center',
  },
  voiceStatus: {
    color: colors.inactive,
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 0.6,
    marginTop: 10,
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
  nextText: {
    color: colors.white,
    fontFamily: fonts.semibold,
    fontSize: 16,
  },
});
