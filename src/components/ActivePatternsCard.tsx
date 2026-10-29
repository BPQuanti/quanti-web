import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts } from '../../constants/theme';

export type PatternTone = 'rose' | 'amber' | 'indigo';

export type PatternInsight = {
  id: string;
  title: string;
  body: string;
  trajectory: string;
  impact: string;
  tone: PatternTone;
};

type Props = {
  patterns: PatternInsight[];
};

const TONE = {
  rose: { text: '#FB7185', wash: 'rgba(244, 63, 94, 0.12)', icon: '#F43F5E' },
  amber: { text: '#FBBF24', wash: 'rgba(245, 158, 11, 0.12)', icon: '#F59E0B' },
  indigo: { text: '#A5B4FC', wash: 'rgba(99, 102, 241, 0.16)', icon: '#818CF8' },
} as const;

export default function ActivePatternsCard({ patterns }: Props) {
  return (
    <View style={styles.stack}>
      {patterns.map((pattern) => {
        const tone = TONE[pattern.tone];
        return (
          <View key={pattern.id} style={styles.card}>
            <View style={styles.badgeRow}>
              <Ionicons name="flash" color="#A5B4FC" size={14} />
              <Text style={styles.badge}>Pattern</Text>
            </View>
            <Text style={styles.title}>{pattern.title}</Text>
            <Text style={styles.body}>{pattern.body}</Text>
            <View style={[styles.pill, { backgroundColor: tone.wash }]}>
              <Ionicons name={pattern.tone === 'indigo' ? 'compass' : 'shield'} color={tone.icon} size={14} />
              <Text style={[styles.pillText, { color: tone.text }]}>{pattern.impact}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 10 },
  card: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 18,
    padding: 16,
  },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  badge: {
    color: '#A5B4FC',
    fontFamily: fonts.semibold,
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  title: { color: '#F8FAFC', fontFamily: fonts.bold, fontSize: 17, lineHeight: 23, marginTop: 10 },
  body: { color: '#CBD5E1', fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, marginTop: 8 },
  trajectory: { color: '#94A3B8', fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, marginTop: 8 },
  pill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pillText: { fontFamily: fonts.semibold, fontSize: 12 },
});
