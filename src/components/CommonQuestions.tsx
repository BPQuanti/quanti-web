import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts } from '../../constants/theme';
import { easeLayout } from '../lib/motion';

const QUESTIONS = [
  {
    q: 'What is Quanti?',
    a: 'Quanti is a private morning coach. It reads the signals you connect—sleep, recovery, screen time, spend—and a short voice check-in about how the day actually feels, then writes one directive. Nobody else sees that card.',
  },
  {
    q: 'What do I do today?',
    a: 'Open Today, read the one 1% move, and live it. If the morning has more weather, speak for ten to fifteen seconds and the card can refine. At the end of the day, mark Executed, Partial, or Shifted — that mark changes tomorrow’s card.',
  },
  {
    q: 'Where does the directive come from?',
    a: 'You say where you are and where you want to go. Overnight telemetry bounds what is realistic. A short voice check is today’s weather. Yesterday’s mark (executed, partial, or shifted) changes the size of today’s 1%. The card is that move—not a season badge.',
  },
  {
    q: 'Who can see my data?',
    a: 'You. Directives, voice context, health summaries, and bank-derived signals stay on your account. There is no friends list, public board, or duel.',
  },
];

export default function CommonQuestions() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <View style={styles.wrap}>
      <Text style={styles.section}>Common questions</Text>
      {QUESTIONS.map((item, index) => {
        const expanded = open === index;
        return (
          <Pressable
            key={item.q}
            style={styles.row}
            onPress={() => {
              easeLayout();
              setOpen(expanded ? null : index);
            }}
          >
            <View style={styles.questionRow}>
              <Text style={styles.question}>{item.q}</Text>
              <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} color="#64748B" size={16} />
            </View>
            {expanded ? <Text style={styles.answer}>{item.a}</Text> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 8 },
  section: {
    color: '#94A3B8',
    fontFamily: fonts.semibold,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  row: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 8,
  },
  questionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  question: { flex: 1, color: '#F8FAFC', fontFamily: fonts.semibold, fontSize: 15 },
  answer: { color: '#CBD5E1', fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, marginTop: 10 },
});
