import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts } from '../../../constants/theme';
import type { FocusDirective } from './types';

type Props = {
  directive: FocusDirective;
  onAction: () => void;
};

export default function DailyFocusCard({ directive, onAction }: Props) {
  const verified = directive.status === 'verified';
  const missed = directive.status === 'missed';

  return (
    <View style={styles.card}>
      <View style={styles.kickerRow}>
        <Ionicons name="compass" color="#A5B4FC" size={14} />
        <Text style={styles.kicker}>Daily focus</Text>
      </View>
      <Text style={styles.title}>{directive.title}</Text>
      <Text style={styles.rationale}>{directive.rationale}</Text>
      <Text style={styles.domains}>{directive.domains}</Text>
      <TouchableOpacity style={styles.cta} onPress={onAction} activeOpacity={0.85}>
        <Text style={styles.ctaText}>{directive.ctaLabel}</Text>
        <Ionicons name="open-outline" color="#FFFFFF" size={16} />
      </TouchableOpacity>
      <View style={[styles.pill, verified && styles.pillVerified, missed && styles.pillMissed, directive.status === 'active' && styles.pillActive]}>
        <Text style={[styles.pillLabel, verified && styles.pillLabelVerified, missed && styles.pillLabelMissed]}>
          {directive.statusLabel}
        </Text>
        <Text style={styles.pillDetail}>{directive.statusDetail}</Text>
      </View>
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
  kickerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  ctaText: { color: '#FFFFFF', fontFamily: fonts.semibold, fontSize: 16 },
  pill: {
    marginTop: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    backgroundColor: '#020617',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pillActive: {
    borderColor: '#818CF8',
    shadowColor: '#818CF8',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  pillVerified: { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(52, 211, 153, 0.35)' },
  pillMissed: { backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: '#334155' },
  pillLabel: { color: '#C7D2FE', fontFamily: fonts.semibold, fontSize: 13 },
  pillLabelVerified: { color: '#34D399' },
  pillLabelMissed: { color: '#FBBF24' },
  pillDetail: { color: '#94A3B8', fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, marginTop: 4 },
});
