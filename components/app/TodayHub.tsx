import { useEffect, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, fonts, surfaces, typography } from '../../constants/theme';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useTelemetryPayload } from '../../src/hooks/useTelemetryPayload';
import { MORNING_VOICE_PROMPT, VOICE_CHECK_SECONDS } from '../../src/services/arcVoicePrompts';
import { formatToward, getNorthStar, subscribeNorthStar, type NorthStar } from '../../src/services/northStar';
import { isInternalToolsAccount } from '../../src/lib/config/reviewMode';
import { displayNameFromAuthUser, firstNameFromDisplay } from '../../src/services/displayName';
import { clearStoredDirective, loadStoredDirective } from '../../src/services/dailyDirectiveStore';
import { generateDailyDirective } from '../../src/services/directiveEngine';
import { transcribeVoiceRecording } from '../../src/services/transcribeVoice';
import {
  getTodayLog,
  setTodayExecution,
  subscribeDirectiveHistory,
  type DirectiveLog,
} from '../../src/services/directiveHistory';
import type { DailyDirective, DailyTelemetryPayload } from '../../src/types/telemetry';
import FuturisticVoiceWave from './FuturisticVoiceWave';
import ObsidianScreen from './ObsidianScreen';
import SignalNudgeCard from './SignalNudgeCard';
import FeedbackModal from '../../src/components/FeedbackModal';

const PRIVACY_PERM_KEY = '@quanti_permission_prefs';
const SANDBOX_PERM_KEY = '@quanti_today_perm_sandbox';

type PermissionStatus = 'granted' | 'denied' | 'not_determined';

interface PermissionStates {
  healthKit: PermissionStatus;
  microphone: PermissionStatus;
  calendar: PermissionStatus;
  location: PermissionStatus;
}

const DEFAULT_PERMS: PermissionStates = {
  healthKit: 'granted',
  microphone: 'granted',
  calendar: 'granted',
  location: 'not_determined',
};

const DELIVERY = [
  { id: 'lock-screen', label: 'Lock Screen Widget' },
  { id: 'notification', label: 'Rich Notification' },
  { id: 'sms', label: 'SMS Push' },
] as const;

type DeliveryId = (typeof DELIVERY)[number]['id'];
type HubPhase = 'baseline' | 'refining' | 'refined';

function formatElapsed(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function greetingForHour(hour = new Date().getHours()) {
  if (hour < 12) {
    return 'Good morning,';
  }
  if (hour < 17) {
    return 'Good afternoon,';
  }
  return 'Good evening,';
}

function formatGreetingDate(date = new Date()) {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

function granted(status: PermissionStatus) {
  return status === 'granted';
}

function formatSignedPercent(value: number | null) {
  if (value == null) {
    return '—';
  }
  const sign = value > 0 ? '+' : '';
  return `${sign}${value}%`;
}

function telemetrySourceBadge(payload: DailyTelemetryPayload | null) {
  if (!payload || payload.is_mock) {
    return `🟡 Mock Data (${payload?.mock_profile || 'Default'})`;
  }
  return '🟢 Live Sensors';
}

function clipDirective(text: string) {
  const clipped = text
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .join(' ');
  return clipped.length > 160 ? `${clipped.slice(0, 157).trim()}…` : clipped;
}

function SkeletonBlock({ height = 18, width = '100%' }: { height?: number; width?: number | `${number}%` }) {
  return <View style={[styles.skeleton, { height, width }]} />;
}

function SystemPermissionBanner({
  permissions,
  onOpenSettings,
}: {
  permissions: PermissionStates;
  onOpenSettings: () => void;
}) {
  if (permissions.microphone !== 'denied') {
    return null;
  }
  return (
    <View style={styles.micBanner}>
      <Text style={styles.micBannerText}>Microphone access is off. Switching to Quick Text Journal mode.</Text>
      <Pressable onPress={onOpenSettings} hitSlop={8}>
        <Text style={styles.micBannerAction}>Settings</Text>
      </Pressable>
    </View>
  );
}

function WellnessDisclaimer() {
  return (
    <View style={styles.disclaimer}>
      <Text style={styles.disclaimerText}>
        Quanti is a general wellness tool. It is not a medical device, does not provide medical advice, and does not
        diagnose, treat, or prevent any medical condition.
      </Text>
    </View>
  );
}

async function openSystemSettings() {
  try {
    await Linking.openSettings();
  } catch {
    // Expo Go still works without leaving the journal fallback.
  }
}

export default function TodayHub() {
  const navigation = useNavigation<{ navigate: (name: string) => void }>();
  const { userProfile } = useAppContext() as { userProfile?: { name?: string | null } | null };
  const { user } = useAuth();
  const firstName = firstNameFromDisplay(userProfile?.name || displayNameFromAuthUser(user));
  const [phase, setPhase] = useState<HubPhase>('baseline');
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [checkInQuote, setCheckInQuote] = useState('');
  const [delivery, setDelivery] = useState<DeliveryId[]>(['lock-screen']);
  const [reflectionOpen, setReflectionOpen] = useState(false);
  const [reflection, setReflection] = useState<'yes' | 'adjust' | null>(null);
  const [todayLog, setTodayLog] = useState<DirectiveLog | null>(null);
  const [northStar, setNorthStar] = useState<NorthStar | null>(null);
  const [starResolved, setStarResolved] = useState(false);
  const [mockSignals, setMockSignals] = useState(true);
  const [permissions, setPermissions] = useState<PermissionStates>(DEFAULT_PERMS);
  const { payload, loading, error, refreshTelemetry } = useTelemetryPayload();
  const [directive, setDirective] = useState<DailyDirective | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const recordFade = useRef(new Animated.Value(1)).current;
  const synthPulse = useRef(new Animated.Value(0.55)).current;
  const forceRegenerate = useRef(false);

  useEffect(() => {
    let mounted = true;
    getNorthStar()
      .then((star) => {
        if (mounted) {
          setNorthStar(star);
          setStarResolved(true);
        }
      })
      .catch(() => {
        if (mounted) {
          setStarResolved(true);
        }
      });
    const unsubStar = subscribeNorthStar(() => {
      getNorthStar().then((star) => {
        if (mounted) {
          setNorthStar(star);
        }
      });
    });
    return () => {
      mounted = false;
      unsubStar();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await loadStoredDirective(payload?.local_date);
      if (cancelled) {
        return;
      }
      const voice = payload?.voice_context?.transcript?.trim() || '';
      const storedVoice = stored?.voice_transcript?.trim() || '';
      const newVoice = Boolean(voice && voice !== storedVoice);
      const regenerate = forceRegenerate.current;
      if (regenerate) {
        forceRegenerate.current = false;
      }

      if (stored && !regenerate && !newVoice) {
        console.log('[TodayHub] restored saved directive', {
          date: stored.date,
          source: stored.source,
        });
        setDirective(stored);
        if (storedVoice) {
          setPhase('refined');
          setCheckInQuote(storedVoice);
        } else {
          setPhase('baseline');
        }
        return;
      }

      if (!payload) {
        if (stored) {
          setDirective(stored);
        }
        return;
      }

      console.log('[TodayHub] synthesizing directive from payload', {
        agency_arc: payload.agency_arc,
        voice: payload.voice,
        voice_context: payload.voice_context,
        biometrics: payload.biometrics,
        regenerate,
        newVoice,
      });
      try {
        const next = await generateDailyDirective(payload);
        if (cancelled) {
          return;
        }
        console.log('[TodayHub] directive applied to UI', {
          source: next.source,
          aborted: next.aborted ?? false,
          primary_directive: next.primary_directive,
        });
        setDirective(next);
        if (voice) {
          setPhase('refined');
          setCheckInQuote(voice);
        } else {
          setPhase('baseline');
        }
      } catch (caught) {
        console.error('[TodayHub] directive synthesis failed', caught);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [payload]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [privacyRaw, sandboxRaw] = await Promise.all([
          AsyncStorage.getItem(PRIVACY_PERM_KEY),
          AsyncStorage.getItem(SANDBOX_PERM_KEY),
        ]);
        if (!mounted) {
          return;
        }
        const privacy = privacyRaw ? (JSON.parse(privacyRaw) as Record<string, boolean>) : {};
        const sandbox = sandboxRaw ? (JSON.parse(sandboxRaw) as Partial<PermissionStates>) : {};
        setPermissions({
          healthKit: sandbox.healthKit ?? (privacy.health === false ? 'denied' : 'granted'),
          microphone: sandbox.microphone ?? (privacy.voice === false ? 'denied' : 'granted'),
          calendar: sandbox.calendar ?? (privacy.calendar === false ? 'denied' : 'granted'),
          location: sandbox.location ?? (privacy.location === true ? 'granted' : 'denied'),
        });
      } catch {
        if (mounted) {
          setPermissions(DEFAULT_PERMS);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    Animated.timing(recordFade, {
      toValue: permissions.microphone === 'denied' ? 0.28 : 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    if (permissions.microphone === 'denied') {
      setIsRecording(false);
    }
  }, [permissions.microphone, recordFade]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(synthPulse, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(synthPulse, {
          toValue: 0.55,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    if (phase === 'refining') {
      loop.start();
      return () => {
        loop.stop();
      };
    }
    synthPulse.setValue(0.55);
    return undefined;
  }, [phase, synthPulse]);

  useEffect(() => {
    if (!isRecording) {
      return undefined;
    }
    const tick = setInterval(() => {
      setElapsed((seconds) => seconds + 1);
    }, 1000);
    return () => clearInterval(tick);
  }, [isRecording]);

  useEffect(() => {
    if (isRecording && elapsed >= VOICE_CHECK_SECONDS) {
      startOrStopRecording().catch(() => {});
    }
  }, [elapsed, isRecording]);

  async function applyVoiceContext(quote: string, durationSeconds?: number) {
    const transcript = quote.trim();
    if (!transcript) {
      setVoiceError('No transcript was captured. Try recording again or write a note.');
      setPhase('baseline');
      return;
    }
    console.log('[TodayHub] applying voice context', { transcript, durationSeconds });
    setIsRecording(false);
    setNoteOpen(false);
    setCheckInQuote(transcript);
    setPhase('refining');
    const nextPayload = await refreshTelemetry(transcript, durationSeconds);
    if (!nextPayload) {
      setVoiceError('Telemetry could not be assembled with your voice context.');
      setPhase('baseline');
    }
  }

  async function startOrStopRecording() {
    if (isRecording || recorder.isRecording) {
      try {
        await recorder.stop();
      } catch (caught) {
        console.error('[TodayHub] recorder.stop failed', caught);
      }
      try {
        await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
      } catch {
        // Session restore is best-effort.
      }

      const uri = recorder.uri;
      const durationSeconds = recorder.currentTime || elapsed;
      console.log('[TodayHub] recording stopped', { uri, durationSeconds, isRecording: recorder.isRecording });
      setIsRecording(false);

      if (!uri) {
        setVoiceError('The recorder did not produce an audio file. Try again.');
        return;
      }

      setPhase('refining');
      setVoiceError(null);
      try {
        const { transcript } = await transcribeVoiceRecording({ uri, durationSeconds });
        await applyVoiceContext(transcript, durationSeconds);
      } catch (caught) {
        const reason = caught instanceof Error ? caught.message : String(caught);
        console.error('[TodayHub] transcription failed', reason);
        setPhase('baseline');
        setVoiceError(reason);
      }
      return;
    }

    setVoiceError(null);
    try {
      const permission = await requestRecordingPermissionsAsync();
      console.log('[TodayHub] microphone permission', permission);
      if (!permission.granted) {
        setVoiceError('Microphone access is needed to record. You can write a note instead.');
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setElapsed(0);
      setIsRecording(true);
      console.log('[TodayHub] recording started');
    } catch (caught) {
      console.error('[TodayHub] recording start failed', caught);
      setIsRecording(false);
      setVoiceError('Recording could not start. Try the wave again, or write a note.');
    }
  }

  function submitNote() {
    const transcript = note.trim();
    if (!transcript) {
      setVoiceError('Write a short note before using text instead of voice.');
      return;
    }
    applyVoiceContext(transcript).catch((caught) => {
      console.error('[TodayHub] note check-in failed', caught);
    });
  }

  function resetCheckIn() {
    setPhase('baseline');
    setIsRecording(false);
    setElapsed(0);
    setCheckInQuote('');
    setReflection(null);
    setReflectionOpen(false);
    forceRegenerate.current = true;
    clearStoredDirective()
      .catch(() => {})
      .finally(() => {
        refreshTelemetry('').catch(() => {});
      });
  }

  useEffect(() => {
    let mounted = true;
    function load() {
      getTodayLog()
        .then((log) => {
          if (mounted) {
            setTodayLog(log);
          }
        })
        .catch(() => {});
    }
    load();
    const unsubscribe = subscribeDirectiveHistory(load);
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  function toggleDelivery(id: DeliveryId) {
    setDelivery((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  async function setPermission(key: keyof PermissionStates, value: boolean) {
    const next: PermissionStates = { ...permissions, [key]: value ? 'granted' : 'denied' };
    setPermissions(next);
    try {
      await AsyncStorage.setItem(SANDBOX_PERM_KEY, JSON.stringify(next));
    } catch {
      // Sandbox still updates in memory for this session.
    }
  }

  if (starResolved && !northStar) {
    return (
      <ObsidianScreen>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greet}>{greetingForHour()}</Text>
            <Pressable onPress={() => navigation.navigate('SignalVault')} hitSlop={8}>
              <Text style={styles.wordmark}>{firstName}</Text>
            </Pressable>
            <Text style={styles.dateLine}>{formatGreetingDate()}</Text>
          </View>
          <Pressable onPress={() => setFeedbackOpen(true)} hitSlop={8} style={styles.feedbackChip}>
            <Text style={styles.feedbackChipText}>Feedback</Text>
          </Pressable>
        </View>
        <View style={styles.scroll}>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionKicker}>First-time setup</Text>
            <Text style={styles.directiveText}>Tell Quanti the Active Target — one checkable object.</Text>
            <Text style={styles.cardSubtext}>
              New accounts start empty. Name your destination — nothing is copied from another user on this
              phone.
            </Text>
            <Pressable onPress={() => navigation.navigate('Arcs')} style={styles.journalSubmit}>
              <Text style={styles.journalSubmitText}>Set your Active Target</Text>
            </Pressable>
          </View>
        </View>
        <FeedbackModal visible={feedbackOpen} userId={user?.id} onClose={() => setFeedbackOpen(false)} />
      </ObsidianScreen>
    );
  }

  const voiceBoosted = Boolean(payload?.voice_context?.transcript);
  const healthOn = granted(permissions.healthKit);
  const micOn = granted(permissions.microphone);
  const journalMode = !micOn;
  const toward = formatToward(northStar) || 'where you want to go';
  const headline = (
    directive?.primary_directive ?? `Take 1 small action toward ${toward} today.`
  ).trim();
  const focusLines = (directive?.focus_blocks ?? [])
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .slice(0, 2);
  const spokenPrompt = MORNING_VOICE_PROMPT;

  return (
    <ObsidianScreen>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greet}>{greetingForHour()}</Text>
          <Pressable onPress={() => navigation.navigate('SignalVault')} hitSlop={8}>
            <Text style={styles.wordmark}>{firstName}</Text>
          </Pressable>
          <Text style={styles.dateLine}>{formatGreetingDate()}</Text>
        </View>
        <Pressable onPress={() => setFeedbackOpen(true)} hitSlop={8} style={styles.feedbackChip}>
          <Text style={styles.feedbackChipText}>Feedback</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={colors.amber}
            onRefresh={async () => {
              setRefreshing(true);
              try {
                await refreshTelemetry();
              } finally {
                setRefreshing(false);
              }
            }}
          />
        }
      >
        <View style={styles.directiveWrap}>
            <SystemPermissionBanner permissions={permissions} onOpenSettings={openSystemSettings} />
            <SignalNudgeCard
              northStar={northStar}
              healthOn={healthOn}
              micOn={micOn}
              onOpenArcs={() => navigation.navigate('Arcs')}
              onOpenPrivacy={() => navigation.navigate('SignalVault')}
            />

            {!directive ? (
              <View style={styles.sectionCard}>
                <ActivityIndicator color={colors.heading} />
                <SkeletonBlock height={28} />
                <SkeletonBlock height={14} width="70%" />
              </View>
            ) : (
              <View style={styles.sectionCard}>
                <View style={styles.widgetHead}>
                  <Text style={styles.sectionKicker}>Today’s directive</Text>
                  {voiceBoosted ? (
                    <Text style={styles.statusBadgeTextRefined}>✨ Refined with Voice Context</Text>
                  ) : null}
                </View>
                <Pressable onPress={() => navigation.navigate('Arcs')} style={styles.arcShift}>
                  <Text style={styles.arcShiftText}>
                    {formatToward(northStar)
                      ? `Active Target: ${formatToward(northStar)}`
                      : 'Set an Active Target · rewrite anytime'}
                  </Text>
                </Pressable>
                <Text style={styles.directiveText}>{headline}</Text>
                {directive.why_today ? <Text style={styles.whyToday}>{directive.why_today}</Text> : null}
                {focusLines.map((line, index) => (
                  <Text key={`${index}-${line.slice(0, 24)}`} style={styles.focusLine}>
                    {line}
                  </Text>
                ))}
                <View style={[styles.outcomeCard, !todayLog?.status && styles.outcomeCardUrgent]}>
                  <Text style={styles.outcomeTitle}>
                    {todayLog?.status ? 'Today’s mark' : 'Mark today’s 1%'}
                  </Text>
                  <Text style={styles.outcomeSub}>
                    {todayLog?.status
                      ? 'This writes tomorrow’s card.'
                      : 'Executed, partial, or shifted — required so tomorrow can adapt.'}
                  </Text>
                  <View style={styles.checkInRow}>
                    {(
                      [
                        { id: 'executed', label: 'Executed' },
                        { id: 'partial', label: 'Partial' },
                        { id: 'shifted', label: 'Shifted' },
                      ] as const
                    ).map((option) => {
                      const on = todayLog?.status === option.id;
                      return (
                        <Pressable
                          key={option.id}
                          onPress={() => {
                            setTodayLog({
                              date: payload?.local_date ?? '',
                              primary_directive: headline,
                              agency_arc: payload?.agency_arc ?? '',
                              status: option.id,
                              feedback_note: todayLog?.feedback_note,
                            });
                            setTodayExecution({
                              date: payload?.local_date,
                              primary_directive: headline,
                              agency_arc: payload?.agency_arc ?? '',
                              status: option.id,
                            }).catch(() => {});
                          }}
                          style={[styles.checkInChip, on && styles.checkInChipOn, !todayLog?.status && styles.checkInChipIdle]}
                        >
                          <Text style={[styles.checkInChipText, on && styles.checkInChipTextOn]}>{option.label}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </View>
            )}

            {voiceBoosted && checkInQuote ? <Text style={styles.voiceQuote}>{checkInQuote}</Text> : null}

            {voiceBoosted ? (
              <Pressable onPress={resetCheckIn} style={styles.undo}>
                <Text style={styles.undoText}>↩ Return to baseline</Text>
              </Pressable>
            ) : null}
              <View style={[styles.refineCallout, isRecording && styles.refineCalloutLive, phase === 'refining' && styles.refineCalloutBusy]}>
                <Text style={styles.refineHeader}>Today’s weather · 10–15 seconds</Text>
                <Text style={styles.voicePrompt}>{spokenPrompt}</Text>
                <Text style={styles.refineStatus}>
                  {phase === 'refining'
                    ? 'Transcribing and synthesizing your directive…'
                    : isRecording
                      ? `Listening ${formatElapsed(elapsed)} / 0:15`
                      : MORNING_VOICE_PROMPT}
                </Text>
                {voiceError ? <Text style={styles.voiceError}>{voiceError}</Text> : null}
                <Animated.View style={{ opacity: recordFade }} pointerEvents={journalMode ? 'none' : 'auto'}>
                  <Pressable
                    onPress={startOrStopRecording}
                    accessibilityRole="button"
                    accessibilityLabel={
                      isRecording ? 'Tap to finish voice check-in' : 'Tap wave for 10 to 15 second voice check'
                    }
                    accessibilityState={{ disabled: journalMode }}
                    style={({ pressed }) => [
                      styles.record,
                      isRecording && styles.recordActive,
                      pressed && styles.recordPressed,
                    ]}
                  >
                    <FuturisticVoiceWave isRecording={isRecording} gradientId="todayWaveGradient" />
                  </Pressable>
                </Animated.View>
                {journalMode ? (
                  <View style={styles.journalBox}>
                    <TextInput
                      value={note}
                      onChangeText={setNote}
                      placeholder={spokenPrompt}
                      placeholderTextColor="#737373"
                      multiline
                      style={styles.journalInput}
                    />
                    <Pressable onPress={submitNote} style={styles.journalSubmit}>
                      <Text style={styles.journalSubmitText}>Use this note</Text>
                    </Pressable>
                    <Pressable onPress={openSystemSettings}>
                      <Text style={styles.settingsLink}>⚙️ Enable Microphone in iOS Settings</Text>
                    </Pressable>
                  </View>
                ) : (
                  <>
                    <Text style={styles.recordHint}>
                      {isRecording
                        ? `Listening ${formatElapsed(elapsed)} / 0:15`
                        : '〰️ Tap wave for 15s voice check'}
                    </Text>
                    <Pressable
                      onPress={() => setNoteOpen(true)}
                      style={({ pressed }) => [styles.fallback, pressed && styles.fallbackPressed]}
                    >
                      {({ pressed }) => (
                        <Text style={[styles.fallbackText, pressed && styles.fallbackTextOn]}>
                          Write a quick note instead
                        </Text>
                      )}
                    </Pressable>
                  </>
                )}
              </View>
          </View>

        <WellnessDisclaimer />

        {isInternalToolsAccount(user) ? (
          <View style={styles.sandbox}>
            <Text style={styles.sandboxTitle}>Lab sandbox</Text>
            <View style={styles.sandboxRow}>
              <Text style={styles.sandboxLabel}>Mock on-device signals</Text>
              <Switch
                value={mockSignals}
                onValueChange={setMockSignals}
                trackColor={{ false: '#27272A', true: colors.emerald }}
                thumbColor="#F5F5F5"
                ios_backgroundColor="#27272A"
              />
            </View>
            {(
              [
                ['healthKit', 'HealthKit granted'],
                ['microphone', 'Microphone granted'],
              ] as const
            ).map(([key, label]) => (
              <View key={key} style={styles.sandboxRow}>
                <Text style={styles.sandboxLabel}>{label}</Text>
                <Switch
                  value={granted(permissions[key])}
                  onValueChange={(value) => setPermission(key, value)}
                  trackColor={{ false: '#27272A', true: colors.emerald }}
                  thumbColor="#F5F5F5"
                  ios_backgroundColor="#27272A"
                />
              </View>
            ))}
            <Pressable onPress={resetCheckIn} style={styles.sandboxButton}>
              <Text style={styles.sandboxButtonText}>Reset today's check-in</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>

      <Modal visible={noteOpen} animationType="slide" transparent onRequestClose={() => setNoteOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalWrap}>
          <Pressable style={styles.modalBackdrop} onPress={() => setNoteOpen(false)} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Write a quick note instead</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="What's top of mind this morning?"
              placeholderTextColor="#71717A"
              multiline
              autoFocus
              style={styles.modalInput}
            />
            <View style={styles.modalActions}>
              <Pressable onPress={() => setNoteOpen(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </Pressable>
              <Pressable onPress={submitNote} style={styles.modalSubmit}>
                <Text style={styles.modalSubmitText}>Use this note</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <FeedbackModal visible={feedbackOpen} userId={user?.id} onClose={() => setFeedbackOpen(false)} />
    </ObsidianScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    paddingHorizontal: 24,
    paddingBottom: 16,
    paddingTop: 8,
    gap: 12,
  },
  feedbackChip: {
    borderColor: colors.indigoBorder,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  feedbackChipText: {
    color: colors.indigo,
    fontFamily: fonts.semibold,
    fontSize: 12,
  },
  mark: { height: 22, width: 22 },
  greet: {
    color: colors.inactive,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  wordmark: {
    color: colors.heading,
    fontFamily: fonts.semibold,
    fontSize: 28,
    letterSpacing: -0.6,
    marginTop: 2,
  },
  dateLine: {
    color: colors.inactive,
    fontFamily: fonts.regular,
    fontSize: 13,
    marginTop: 4,
  },
  widgetHead: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  syncRow: { alignItems: 'center', flexDirection: 'row', gap: 6, marginTop: 6 },
  syncDot: { backgroundColor: colors.emerald, borderRadius: 99, height: 6, width: 6 },
  syncText: { ...typography.badgeText, color: colors.emerald },
  sourceBadge: {
    ...surfaces.badge,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  sourceBadgeLive: {
    borderColor: colors.emeraldBorder,
  },
  sourceBadgeMock: {
    borderColor: colors.amberBorder,
  },
  sourceBadgeText: typography.badgeText,
  sourceBadgeTextLive: { color: colors.emerald },
  sourceBadgeTextMock: { color: colors.amber },
  arcBadge: {
    ...surfaces.badge,
    backgroundColor: colors.indigoBg,
    borderColor: colors.indigoBorder,
    maxWidth: 180,
  },
  arcBadgeText: {
    ...typography.badgeText,
    color: colors.indigo,
    textAlign: 'right',
  },
  scroll: { flexGrow: 1, paddingBottom: 40, paddingHorizontal: 20, paddingTop: 8 },
  hello: {
    color: colors.inactive,
    fontFamily: fonts.medium,
    fontSize: 13,
    marginBottom: 16,
  },
  checkIn: { alignItems: 'center', flexGrow: 1 },
  prompt: {
    color: colors.heading,
    fontFamily: fonts.semibold,
    fontSize: 22,
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusBadgeBase: {
    backgroundColor: colors.indigoBg,
    borderColor: colors.indigoBorder,
  },
  statusBadgeRefined: {
    backgroundColor: '#2A2310',
    borderColor: colors.amberBorder,
  },
  statusBadgeText: {
    ...typography.badgeText,
  },
  statusBadgeTextBase: { color: colors.indigo },
  statusBadgeTextRefined: { color: colors.amber },
  cardSubtext: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 14,
  },
  bento: { gap: 16, marginBottom: 16 },
  sectionCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: '#262626',
    borderRadius: 28,
    borderWidth: 1,
    gap: 12,
    marginBottom: 16,
    padding: 20,
  },
  chipCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: '#262626',
    borderRadius: 28,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 16,
  },
  focusLine: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
  },
  whyToday: {
    color: colors.indigo,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 4,
    marginTop: -4,
  },
  checkInHint: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
  },
  metricLine: {
    color: colors.heading,
    fontFamily: fonts.semibold,
    fontSize: 14,
    letterSpacing: -0.2,
    marginTop: 4,
  },
  checkInCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: '#262626',
    borderRadius: 28,
    borderWidth: 1,
    marginBottom: 16,
    padding: 20,
  },
  outcomeCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 16,
    padding: 14,
  },
  outcomeCardUrgent: {
    backgroundColor: colors.amberBg,
    borderColor: colors.amberBorder,
  },
  outcomeTitle: {
    color: colors.heading,
    fontFamily: fonts.semibold,
    fontSize: 16,
    letterSpacing: -0.3,
  },
  outcomeSub: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  checkInRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  checkInChip: {
    borderColor: '#262626',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    minHeight: 48,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  checkInChipIdle: {
    backgroundColor: 'rgba(9, 9, 11, 0.35)',
    borderColor: colors.heading,
  },
  checkInChipOn: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: colors.emeraldBorder,
  },
  checkInChipText: {
    color: colors.inactive,
    fontFamily: fonts.medium,
    fontSize: 13,
    textAlign: 'center',
  },
  checkInChipTextOn: { color: colors.heading },
  sectionKicker: {
    color: colors.muted,
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  arcShift: {
    alignSelf: 'flex-start',
    marginTop: -4,
  },
  arcShiftText: {
    color: colors.indigo,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  sectionBody: {
    color: colors.heading,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 24,
  },
  loadingCopy: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    marginVertical: 8,
    textAlign: 'center',
  },
  skeleton: {
    alignSelf: 'stretch',
    backgroundColor: '#262626',
    borderRadius: 8,
    marginTop: 8,
  },
  refineCallout: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: '#262626',
    borderRadius: 28,
    borderWidth: 1,
    marginBottom: 16,
    marginTop: 8,
    padding: 20,
  },
  refineCalloutLive: {
    borderColor: colors.amberBorder,
    backgroundColor: '#1A1710',
  },
  refineCalloutBusy: {
    borderColor: colors.indigoBorder,
    backgroundColor: '#17171F',
  },
  refineHeader: {
    color: colors.inactive,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  voicePrompt: {
    color: colors.heading,
    fontFamily: fonts.semibold,
    fontSize: 18,
    letterSpacing: -0.4,
    lineHeight: 24,
    marginTop: 10,
    textAlign: 'center',
  },
  refineStatus: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
    textAlign: 'center',
  },
  undo: {
    alignSelf: 'center',
    marginTop: 4,
    paddingVertical: 8,
  },
  undoText: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  guided: {
    ...typography.body,
    marginTop: 12,
    textAlign: 'center',
  },
  healthHint: {
    color: colors.inactive,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
    textAlign: 'center',
  },
  micBanner: {
    alignItems: 'center',
    backgroundColor: colors.amberBg,
    borderColor: colors.amberBorder,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: '100%',
  },
  micBannerText: {
    color: colors.amber,
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  micBannerAction: {
    color: colors.heading,
    fontFamily: fonts.medium,
    fontSize: 11,
    textDecorationLine: 'underline',
  },
  journalBox: {
    marginTop: 20,
    width: '100%',
  },
  journalInput: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    color: colors.heading,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 24,
    minHeight: 110,
    padding: 14,
    textAlignVertical: 'top',
    width: '100%',
  },
  journalSubmit: {
    alignItems: 'center',
    backgroundColor: colors.indigoBg,
    borderColor: colors.indigoBorder,
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 12,
    paddingVertical: 12,
  },
  journalSubmitText: { color: colors.heading, fontFamily: fonts.semibold, fontSize: 14 },
  settingsLink: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 12,
    marginTop: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  disclaimer: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 24,
    padding: 14,
  },
  disclaimerText: {
    color: '#737373',
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 16,
    textAlign: 'center',
  },
  signalRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginTop: 20,
  },
  provisional: {
    backgroundColor: colors.indigoBg,
    borderColor: colors.indigoBorder,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  provisionalText: {
    ...typography.badgeText,
    color: colors.indigo,
    textAlign: 'center',
  },
  previewRow: { flexDirection: 'row', gap: 10, marginTop: 16, width: '100%' },
  deviceCard: { flex: 1 },
  deviceDim: { opacity: 0.45 },
  deviceLabel: { ...typography.badgeText, marginBottom: 8, textAlign: 'center' },
  lockFace: {
    ...surfaces.glass,
    alignItems: 'center',
    minHeight: 148,
    paddingHorizontal: 10,
    paddingVertical: 16,
  },
  lockTime: {
    color: colors.heading,
    fontFamily: fonts.semibold,
    fontSize: 28,
    letterSpacing: -0.8,
  },
  lockWidget: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
    padding: 10,
    width: '100%',
  },
  lockKicker: { ...typography.badgeText, marginBottom: 4 },
  lockLine: { color: colors.heading, fontFamily: fonts.medium, fontSize: 11, lineHeight: 16 },
  homeWidget: {
    ...surfaces.glass,
    backgroundColor: '#1A1A28',
    borderColor: colors.indigoBorder,
    minHeight: 148,
    padding: 12,
  },
  homeLine: { color: colors.heading, fontFamily: fonts.medium, fontSize: 12, lineHeight: 18 },
  synthStage: { alignItems: 'center', paddingVertical: 48 },
  synthOrb: {
    alignItems: 'center',
    backgroundColor: colors.indigoBg,
    borderColor: colors.indigoBorder,
    borderRadius: 999,
    borderWidth: 1,
    height: 88,
    justifyContent: 'center',
    width: 88,
  },
  synthOrbGlyph: { fontSize: 32 },
  synthStatus: {
    color: colors.heading,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 18,
    paddingHorizontal: 16,
    textAlign: 'center',
  },
  synthHint: { ...typography.badgeText, marginTop: 10, textAlign: 'center' },
  stepRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  stepN: { ...typography.badgeText, color: colors.indigo, marginTop: 2, width: 22 },
  stepCopy: { flex: 1 },
  stepTitle: { color: colors.heading, fontFamily: fonts.semibold, fontSize: 13, letterSpacing: 0.4, textTransform: 'uppercase' },
  stepBody: { color: colors.muted, fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, marginTop: 4 },
  contextNote: { color: colors.inactive, fontFamily: fonts.regular, fontSize: 12, fontStyle: 'italic', lineHeight: 18, marginTop: 14 },
  signalPill: {
    ...surfaces.badge,
    ...typography.badgeText,
    overflow: 'hidden',
  },
  record: {
    alignItems: 'center',
    borderRadius: 24,
    justifyContent: 'center',
    marginTop: 12,
    minHeight: 96,
    paddingHorizontal: 8,
    paddingVertical: 8,
    width: 220,
  },
  recordPressed: {
    transform: [{ scaleY: 1.05 }],
  },
  recordActive: {
    backgroundColor: '#1A1710',
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 25,
  },
  recordHint: {
    color: colors.muted,
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 0.6,
    marginTop: 12,
    textAlign: 'center',
  },
  voiceError: {
    color: colors.amber,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
    textAlign: 'center',
  },
  fallback: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  fallbackPressed: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: colors.borderHover,
  },
  fallbackText: { color: colors.muted, fontFamily: fonts.medium, fontSize: 13 },
  fallbackTextOn: { color: colors.white },
  directiveWrap: { gap: 16 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  timeKicker: typography.kicker,
  timeValue: { ...typography.kicker, letterSpacing: 0.8 },
  voiceQuote: {
    backgroundColor: colors.amberBg,
    borderColor: colors.amberBorder,
    borderRadius: 16,
    borderWidth: 1,
    color: colors.amber,
    fontFamily: fonts.regular,
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 22,
    padding: 14,
  },
  directiveCard: {
    backgroundColor: '#171717',
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
  },
  directiveText: {
    color: colors.heading,
    fontFamily: fonts.bold,
    fontSize: 22,
    letterSpacing: -0.6,
    lineHeight: 28,
  },
  synthRow: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 12,
  },
  synthLabel: typography.badgeText,
  synthValue: typography.badgeText,
  deliveryCard: {
    ...surfaces.glass,
    padding: 16,
  },
  deliveryLabel: typography.kicker,
  deliveryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  deliveryChip: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  deliveryChipOn: {
    backgroundColor: colors.indigoBg,
    borderColor: colors.indigoBorder,
  },
  deliveryChipText: { color: colors.muted, fontFamily: fonts.medium, fontSize: 11 },
  deliveryChipTextOn: { color: colors.indigo },
  reflectionCard: surfaces.glass,
  reflectionToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  reflectionQuestion: { color: colors.muted, flex: 1, fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, paddingRight: 12 },
  reflectionCaret: { color: colors.inactive, fontSize: 16 },
  reflectionActions: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  reflectionChip: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  reflectionYes: { backgroundColor: colors.emeraldBg, borderColor: colors.emeraldBorder },
  reflectionAdjust: { backgroundColor: colors.amberBg, borderColor: colors.amberBorder },
  reflectionChipText: { color: colors.muted, fontFamily: fonts.medium, fontSize: 12 },
  sandbox: {
    ...surfaces.glass,
    marginTop: 28,
    padding: 14,
  },
  sandboxTitle: typography.badgeText,
  sandboxRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  sandboxLabel: { color: colors.muted, fontFamily: fonts.medium, fontSize: 13 },
  sandboxButton: { marginTop: 12 },
  sandboxButtonText: { color: colors.indigo, fontFamily: fonts.medium, fontSize: 13 },
  modalWrap: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.overlay },
  modalCard: {
    backgroundColor: '#171717',
    borderColor: colors.border,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    padding: 20,
    paddingBottom: 32,
  },
  modalTitle: { color: colors.heading, fontFamily: fonts.semibold, fontSize: 18, letterSpacing: -0.4, marginBottom: 12 },
  modalInput: {
    backgroundColor: colors.bg,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.heading,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 24,
    minHeight: 120,
    padding: 12,
    textAlignVertical: 'top',
  },
  modalActions: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  modalCancel: { color: colors.muted, fontFamily: fonts.medium, fontSize: 15 },
  modalSubmit: {
    backgroundColor: colors.indigoBg,
    borderColor: colors.indigoBorder,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  modalSubmitText: { color: colors.heading, fontFamily: fonts.semibold, fontSize: 14 },
});
