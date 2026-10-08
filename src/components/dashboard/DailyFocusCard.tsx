import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fonts } from '../../../constants/theme';
import type { FocusDirective } from './types';

type Props = {
  directive: FocusDirective;
  completed: boolean;
  onToggleComplete: () => void;
  onPrimaryAction: () => void;
};

export default function DailyFocusCard({ directive, completed, onToggleComplete, onPrimaryAction }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.kicker}>Daily focus</Text>
      <Text style={styles.title}>{directive.title}</Text>
      <Text style={styles.rationale}>{directive.rationale}</Text>
      <Text style={styles.domains}>{directive.domains}</Text>
      <TouchableOpacity
        style={[styles.cta, completed && styles.ctaDone]}
        onPress={onPrimaryAction}
        activeOpacity={0.85}
      >
        <Text style={styles.ctaText}>{completed ? 'Logged for today' : directive.ctaLabel}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.completeRow} onPress={onToggleComplete} activeOpacity={0.8}>
        <View style={[styles.box, completed && styles.boxOn]}>
          <Text style={styles.check}>{completed ? '✓' : ''}</Text>
        </View>
        <Text style={styles.completeLabel}>{completed ? 'Completed' : 'Mark completed'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 18,
    backgroundColor: '#0F172A',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 20,
  },
  kicker: {
    color: '#A5B4FC',
    fontFamily: fonts.semibold,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  title: { color: '#F8FAFC', fontFamily: fonts.bold, fontSize: 24, marginTop: 10, lineHeight: 30 },
  rationale: { color: '#E2E8F0', fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, marginTop: 12 },
  domains: { color: '#94A3B8', fontFamily: fonts.medium, fontSize: 13, marginTop: 10 },
  cta: {
    marginTop: 18,
    backgroundColor: '#4F46E5',
    borderRadius: 14,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  ctaDone: { backgroundColor: '#065F46' },
  ctaText: { color: '#FFFFFF', fontFamily: fonts.semibold, fontSize: 16 },
  completeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: { backgroundColor: '#34D399', borderColor: '#34D399' },
  check: { color: '#022C22', fontFamily: fonts.bold, fontSize: 14 },
  completeLabel: { color: '#CBD5E1', fontFamily: fonts.medium, fontSize: 14 },
});
