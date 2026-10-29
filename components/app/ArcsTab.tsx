import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fonts, surfaces, typography } from '../../constants/theme';
import { getCustomArcContext, setCustomArcContext, subscribeCustomArcContext } from '../../src/lib/arcs';
import {
  clearNorthStar,
  getNorthStar,
  parseNorthStarFromSpeech,
  saveNorthStar,
  subscribeNorthStar,
  type NorthStar,
} from '../../src/services/northStar';
import FuturisticVoiceWave from './FuturisticVoiceWave';
import ObsidianScreen from './ObsidianScreen';

function formatElapsed(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function persistNarrative(next: NorthStar) {
  setCustomArcContext(`${next.now} ${next.next}`.trim());
  saveNorthStar(next).catch(() => {});
}

export default function ArcsTab() {
  const [context, setContext] = useState(getCustomArcContext());
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [writeOpen, setWriteOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [saved, setSaved] = useState<NorthStar | null>(null);

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

  function toggleRecord() {
    if (isRecording) {
      const narrative = parseNorthStarFromSpeech(draft.trim() || context);
      setSaved(narrative);
      persistNarrative(narrative);
      setIsRecording(false);
      setElapsed(0);
      setWriteOpen(false);
      return;
    }
    setElapsed(0);
    setIsRecording(true);
  }

  function submitWrite() {
    const narrative = parseNorthStarFromSpeech(draft || context);
    setSaved(narrative);
    persistNarrative(narrative);
    setWriteOpen(false);
    setIsRecording(false);
    setElapsed(0);
  }

  function resetNarrative() {
    setSaved(null);
    setDraft('');
    setCustomArcContext('');
    clearNorthStar().catch(() => {});
    setWriteOpen(false);
    setIsRecording(false);
    setElapsed(0);
  }

  return (
    <ObsidianScreen>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageKicker}>Direction</Text>
        <Text style={styles.pageTitle}>Where you are. Where you want to go.</Text>

        {saved ? (
          <View style={styles.alignCard}>
            <Text style={styles.seasonTag}>Destination</Text>
            <View style={styles.summaryBox}>
              <Text style={styles.micro}>Now</Text>
              <Text style={styles.summaryBody}>{saved.now}</Text>
              <Text style={[styles.micro, styles.microGap]}>Next</Text>
              <Text style={styles.summaryBody}>{saved.next}</Text>
              {saved.outcomes.length ? (
                <>
                  <Text style={[styles.micro, styles.microGap]}>Today should serve</Text>
                  {saved.outcomes.map((item) => (
                    <Text key={item} style={styles.summaryBody}>
                      {item}
                    </Text>
                  ))}
                </>
              ) : null}
            </View>
            <Pressable onPress={resetNarrative} style={styles.updateBtn}>
              <Text style={styles.updateText}>Rewrite now / next</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.alignCard}>
            <Text style={styles.seasonTag}>Now / next</Text>
            <Text style={styles.alignTitle}>Tell Quanti the destination</Text>
            <Text style={styles.alignPrompt}>
              Where are you now, and where do you want to go? Daily directives are 1% moves on that vector.
            </Text>
            <Text style={styles.alignSub}>
              Speak or write freely. Example: living at home, building an app, trying to get your own place and make
              money from it.
            </Text>

            <Pressable
              onPress={toggleRecord}
              accessibilityRole="button"
              accessibilityLabel={isRecording ? 'Tap to finish now and next' : 'Tap wave for 30 second voice check'}
              style={({ pressed }) => [
                styles.waveHit,
                isRecording && styles.waveHitActive,
                pressed && styles.waveHitPressed,
              ]}
            >
              <FuturisticVoiceWave isRecording={isRecording} gradientId="arcWaveGradient" />
            </Pressable>
            <Text style={styles.timer}>
              {isRecording
                ? `${formatElapsed(elapsed)} / 0:30+ recommended`
                : '0:30 recommended — keep talking if you need more'}
            </Text>

            <Pressable onPress={() => setWriteOpen((open) => !open)} style={styles.writeToggle}>
              <Text style={styles.writeToggleText}>Or write it instead</Text>
            </Pressable>
            {writeOpen ? (
              <View style={styles.writeBox}>
                <TextInput
                  value={draft}
                  onChangeText={setDraft}
                  placeholder="e.g. I'm 27, living with my mom, building an app. I want my own place and to make money from the app."
                  placeholderTextColor="#737373"
                  multiline
                  textAlignVertical="top"
                  style={styles.input}
                />
                <Pressable onPress={submitWrite} style={styles.submit}>
                  <Text style={styles.submitText}>Save direction</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>
    </ObsidianScreen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 32, paddingHorizontal: 20, paddingTop: 16 },
  kicker: typography.kicker,
  title: { ...typography.heading, marginTop: 8 },
  subtitle: { ...typography.body, marginBottom: 20, marginTop: 8 },
  pageKicker: typography.kicker,
  pageTitle: { ...typography.heading, fontSize: 24, marginBottom: 18, marginTop: 8 },
  examplesKicker: { ...typography.kicker, marginBottom: 6, marginTop: 22 },
  examplesHint: { color: colors.muted, fontFamily: fonts.regular, fontSize: 13, lineHeight: 20, marginBottom: 14 },
  card: {
    ...surfaces.glass,
    marginBottom: 12,
    padding: 16,
  },
  cardOn: {
    backgroundColor: '#1F180C',
    borderColor: 'rgba(245, 158, 11, 0.4)',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
  },
  cardPressed: {
    borderColor: colors.borderHover,
  },
  cardTitle: { color: colors.heading, fontFamily: fonts.semibold, fontSize: 16, letterSpacing: -0.3 },
  cardTarget: {
    color: colors.amber,
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
  cardBody: { color: colors.muted, fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, marginTop: 8 },
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
  micro: {
    ...typography.badgeText,
  },
  microGap: { marginTop: 14 },
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
    marginTop: 14,
    paddingVertical: 6,
  },
  writeToggleText: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  writeBox: { marginTop: 10, width: '100%' },
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
    marginTop: 12,
    paddingVertical: 12,
  },
  submitText: { color: colors.heading, fontFamily: fonts.semibold, fontSize: 14 },
  savedBadge: {
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: colors.amberBg,
    borderColor: colors.amberBorder,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  savedBadgeText: { ...typography.badgeText, color: colors.amber },
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
    fontSize: 14,
    lineHeight: 22,
    marginTop: 6,
  },
  updateBtn: { alignSelf: 'flex-start', marginTop: 14, paddingVertical: 4 },
  updateText: { color: colors.muted, fontFamily: fonts.medium, fontSize: 13 },
  sandboxHint: { ...typography.badgeText, marginTop: 16 },
});
