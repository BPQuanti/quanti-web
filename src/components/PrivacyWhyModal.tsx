import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, surfaces, typography } from '../../constants/theme';

const CARDS = [
  {
    title: 'Destination you named',
    body: 'The Active Target is the plot. Quanti stores that on your account so today’s card is a 1% move toward that object—not a season, streak, or posture.',
  },
  {
    title: 'HealthKit sizes the window',
    body: 'Sleep and HRV only bound how hard today can go. Samples stay on-device; Quanti uses summaries, not a health timeline. Recovery does not rewrite the destination.',
  },
  {
    title: 'Transient voice fills one blank',
    body: 'Voice processed securely in-memory via encrypted edge transcription with zero data retention.',
  },
  {
    title: 'Zero-retention synthesizer',
    body: 'Destination, anonymized telemetry, yesterday’s mark (executed, partial, or shifted), and the transcript go to a Supabase Edge Function. The model returns one 1% directive and does not keep a training copy of your day.',
  },
  {
    title: 'Row-level isolation',
    body: 'Your profile, destination, directives, and execution marks are scoped to your account with Supabase Row Level Security. Other users cannot read your rows. There is no board, friends list, or duel.',
  },
] as const;

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function PrivacyWhyModal({ visible, onClose }: Props) {
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.scrim} onPress={onClose} />
        <SafeAreaView style={styles.sheet} edges={['bottom']}>
          <View style={styles.handle} />
          <View style={styles.head}>
            <Text style={styles.kicker}>Privacy</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Text style={styles.close}>Close</Text>
            </Pressable>
          </View>
          <Text style={styles.title}>How data is used</Text>
          <Text style={styles.lede}>
            You name now and next. Signals only size today’s 1%. Nothing here becomes a feed, a graph, or an audience.
          </Text>
          <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
            {CARDS.map((card) => (
              <View key={card.title} style={styles.card}>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardBody}>{card.body}</Text>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: colors.overlay,
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrim: { flex: 1 },
  sheet: {
    backgroundColor: colors.bg,
    borderTopColor: colors.border,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    maxHeight: '86%',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: colors.borderHover,
    borderRadius: 99,
    height: 4,
    marginBottom: 12,
    width: 40,
  },
  head: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  kicker: typography.kicker,
  close: {
    color: colors.accentSoft,
    fontFamily: fonts.semibold,
    fontSize: 15,
  },
  title: {
    ...typography.heading,
    fontSize: 24,
    marginTop: 8,
  },
  lede: {
    ...typography.body,
    marginTop: 8,
  },
  list: {
    gap: 10,
    paddingBottom: 24,
    paddingTop: 16,
  },
  card: {
    ...surfaces.glass,
    padding: 16,
  },
  cardTitle: {
    color: colors.heading,
    fontFamily: fonts.semibold,
    fontSize: 15,
  },
  cardBody: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
});
