import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, surfaces, typography } from '../../constants/theme';

const CARDS = [
  {
    title: 'HealthKit energy bounds',
    body: 'Sleep duration and HRV are read as recovery context so today’s directive can match what your body can actually hold. Samples stay on-device; Quanti uses summaries, not a health timeline.',
  },
  {
    title: 'Transient voice',
    body: 'When you speak, audio is sent to Whisper only to produce a transcript. Raw audio is not stored in Quanti, and the file is discarded after transcription.',
  },
  {
    title: 'Zero-retention synthesis',
    body: 'The transcript and anonymized telemetry go to a Supabase Edge Function that calls the model, returns one directive, and does not keep a training copy of your day.',
  },
  {
    title: 'Row-level isolation',
    body: 'Your profile, destination, and directives are scoped to your account with Supabase Row Level Security. Other users cannot read your rows.',
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
          <Text style={styles.title}>Why Quanti asks</Text>
          <Text style={styles.lede}>
            Signals exist to write one directive—not a feed, not a graph, and not an audience.
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
