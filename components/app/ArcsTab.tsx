import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fonts, surfaces, typography } from '../../constants/theme';
import { getCustomArcContext, setCustomArcContext, subscribeCustomArcContext } from '../../src/lib/arcs';
import { assessDestination } from '../../src/services/destinationQuality';
import {
  activeTargetFromText,
  clearNorthStar,
  daysOnTarget,
  DESTINATION_PLACEHOLDER,
  getNorthStar,
  isTargetStale,
  saveNorthStar,
  subscribeNorthStar,
  TARGET_STALE_DAYS,
  type NorthStar,
} from '../../src/services/northStar';
import FuturisticVoiceWave from './FuturisticVoiceWave';
import ObsidianScreen from './ObsidianScreen';

function formatElapsed(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function persistTarget(next: NorthStar) {
  setCustomArcContext(next.next.trim());
  saveNorthStar(next).catch(() => {});
}

export default function ArcsTab() {
  const [context, setContext] = useState(getCustomArcContext());
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [writeOpen, setWriteOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [saved, setSaved] = useState<NorthStar | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [staleDismissed, setStaleDismissed] = useState(false);

  useEffect(() => subscribeCustomArcContext(setContext), []);
  useEffect(() => {
    let mounted = true;
    getNorthStar().then((star) => {
      if (mounted && star) {
        setSaved(star);
      }
    });
    const unsubStar = subscribeNorthStar(() => {
      getNorthStar().then((star) => {
        if (mounted) {
          setSaved(star);
        }
      });
    });
    return () => {
      mounted = false;
      unsubStar();
    };
  }, []);

  useEffect(() => {
    if (!isRecording) {
      return undefined;
    }
    const tick = setInterval(() => {
      setElapsed((seconds) => seconds + 1);
    }, 1000);
    return () => clearInterval(tick);
  }, [isRecording]);

  function trySave(raw: string) {
    const check = assessDestination(raw);
    if (!check.ok) {
      setError(check.reason || 'Name one checkable Active Target.');
      setWriteOpen(true);
      return false;
    }
    const next = activeTargetFromText(raw, saved);
    setSaved(next);
    persistTarget(next);
    setError(null);
    setWriteOpen(false);
    setIsRecording(false);
    setElapsed(0);
    setStaleDismissed(false);
    return true;
  }

  function toggleRecord() {
    if (isRecording) {
      trySave(draft.trim() || context);
      return;
    }
    setElapsed(0);
    setIsRecording(true);
    setError(null);
  }

  function markAchieved() {
    setSaved(null);
    setDraft('');
    setCustomArcContext('');
    clearNorthStar().catch(() => {});
    setWriteOpen(true);
    setIsRecording(false);
    setElapsed(0);
    setError(null);
    setStaleDismissed(false);
  }

  const stale = isTargetStale(saved) && !staleDismissed;
  const age = daysOnTarget(saved);

  return (
    <ObsidianScreen>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageKicker}>Active Target</Text>
        <Text style={styles.pageTitle}>One checkable object. No calendar deadline.</Text>

        {saved ? (
          <View style={styles.alignCard}>
            <Text style={styles.seasonTag}>Active Target</Text>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryBody}>{saved.next}</Text>
              {age != null ? (
                <Text style={styles.alignSub}>
                  {age === 0 ? 'Set today' : `${age} day${age === 1 ? '' : 's'} on this target`}
                </Text>
              ) : null}
            </View>
            {stale ? (
              <View style={styles.staleBox}>
                <Text style={styles.alignPrompt}>
                  This has been the Active Target for {TARGET_STALE_DAYS}+ days. Still this, or did the next object
                  change?
                </Text>
                <View style={styles.row}>
                  <Pressable onPress={() => setStaleDismissed(true)} style={styles.submit}>
                    <Text style={styles.submitText}>Still this</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setDraft(saved.next);
                      setWriteOpen(true);
                      setStaleDismissed(true);
                    }}
                    style={styles.ghost}
                  >
                    <Text style={styles.updateText}>Retarget</Text>
                  </Pressable>
                </View>
              </View>
            ) : null}
            <Pressable onPress={markAchieved} style={styles.achieveBtn}>
              <Text style={styles.achieveText}>Achieved — set next Active Target</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setDraft(saved.next);
                setWriteOpen(true);
              }}
              style={styles.updateBtn}
            >
              <Text style={styles.updateText}>Rewrite</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.alignCard}>
            <Text style={styles.seasonTag}>Next object</Text>
            <Text style={styles.alignTitle}>Set your Active Target</Text>
            <Text style={styles.alignPrompt}>
              One finish line someone else could check yes or no. When it is done, mark Achieved and name the next one.
            </Text>
            <Text style={styles.alignSub}>{DESTINATION_PLACEHOLDER}</Text>

            <Pressable
              onPress={toggleRecord}
              accessibilityRole="button"
              accessibilityLabel={isRecording ? 'Tap to finish Active Target' : 'Tap wave to speak the Active Target'}
              style={({ pressed }) => [
                styles.waveHit,
                isRecording && styles.waveHitActive,
                pressed && styles.waveHitPressed,
              ]}
            >
              <FuturisticVoiceWave isRecording={isRecording} gradientId="arcWaveGradient" />
            </Pressable>
            <Text style={styles.timer}>
              {isRecording ? `${formatElapsed(elapsed)} / 0:15` : 'Speak for 10–15 seconds'}
            </Text>
          </View>
        )}

        {(writeOpen || !saved) && (
          <View style={styles.writeBox}>
            {!saved ? (
              <Pressable onPress={() => setWriteOpen((open) => !open)} style={styles.writeToggle}>
                <Text style={styles.writeToggleText}>Or write it instead</Text>
              </Pressable>
            ) : null}
            {(writeOpen || (saved && writeOpen)) && (
              <View>
                <TextInput
                  value={draft}
                  onChangeText={(value) => {
                    setDraft(value);
                    if (error) {
                      setError(null);
                    }
                  }}
                  placeholder={DESTINATION_PLACEHOLDER}
                  placeholderTextColor="#737373"
                  multiline
                  textAlignVertical="top"
                  style={styles.input}
                />
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <Pressable onPress={() => trySave(draft)} style={styles.submit}>
                  <Text style={styles.submitText}>Save Active Target</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </ObsidianScreen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 32, paddingHorizontal: 20, paddingTop: 16 },
  pageKicker: typography.kicker,
  pageTitle: { ...typography.heading, fontSize: 24, marginBottom: 18, marginTop: 8 },
  alignCard: {
    ...surfaces.glass,
    marginBottom: 16,
    padding: 16,
  },
  seasonTag: {
    ...typography.badgeText,
    color: colors.amber,
    marginBottom: 8,
  },
  alignTitle: {
    color: colors.heading,
    fontFamily: fonts.semibold,
    fontSize: 20,
    letterSpacing: -0.4,
    marginTop: 8,
  },
  alignPrompt: {
    color: colors.heading,
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
  alignSub: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  waveHit: {
    alignItems: 'center',
    alignSelf: 'center',
    borderColor: colors.amberBorder,
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 16,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  waveHitPressed: {
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  waveHitActive: {
    backgroundColor: '#1A1710',
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 25,
  },
  timer: {
    color: colors.muted,
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 0.6,
    marginTop: 10,
    textAlign: 'center',
  },
  writeToggle: {
    alignSelf: 'center',
    marginTop: 4,
    paddingVertical: 6,
  },
  writeToggleText: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  writeBox: { marginTop: 4, width: '100%' },
  input: {
    backgroundColor: 'rgba(23, 23, 23, 0.6)',
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.heading,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 24,
    minHeight: 120,
    padding: 14,
  },
  submit: {
    alignItems: 'center',
    backgroundColor: colors.indigoBg,
    borderColor: colors.indigoBorder,
    borderRadius: 999,
    borderWidth: 1,
    flex: 1,
    marginTop: 12,
    paddingVertical: 12,
  },
  submitText: { color: colors.heading, fontFamily: fonts.semibold, fontSize: 14 },
  ghost: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 12,
  },
  row: { flexDirection: 'row', gap: 10 },
  summaryBox: {
    backgroundColor: 'rgba(23, 23, 23, 0.6)',
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 14,
    padding: 16,
  },
  summaryBody: {
    color: colors.heading,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  updateBtn: { alignSelf: 'flex-start', marginTop: 10, paddingVertical: 4 },
  updateText: { color: colors.muted, fontFamily: fonts.medium, fontSize: 13 },
  achieveBtn: {
    alignItems: 'center',
    backgroundColor: colors.emeraldBg,
    borderColor: colors.emeraldBorder,
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 16,
    paddingVertical: 12,
  },
  achieveText: { color: colors.emerald, fontFamily: fonts.semibold, fontSize: 14 },
  staleBox: { marginTop: 8 },
  error: {
    color: colors.amber,
    fontFamily: fonts.regular,
    fontSize: 13,
    marginTop: 8,
  },
});
