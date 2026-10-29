import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts } from '../../constants/theme';
import { easeLayout } from '../lib/motion';
import type { FocusDirective, FocusHistoryStats } from '../../hooks/useFocusHistory';

type Filter = 'all' | 'verified' | 'missed';

type Props = {
  entries: FocusDirective[];
  stats: FocusHistoryStats;
  loading: boolean;
  error: string | null;
  defaultOpen?: boolean;
};

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'verified', label: 'Verified' },
  { id: 'missed', label: 'Missed' },
];

function formatDate(isoDate: string) {
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function FocusHistoryList({ entries, stats, loading, error, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const [filter, setFilter] = useState<Filter>('all');
  const visible = entries.filter((entry) => (filter === 'all' ? true : entry.status === filter));

  return (
    <View style={styles.wrap}>
      <Pressable
        style={styles.header}
        onPress={() => {
          easeLayout();
          setOpen((current) => !current);
        }}
      >
        <View style={styles.headerCopy}>
          <Ionicons name="sparkles" color="#A5B4FC" size={16} />
          <Text style={styles.kicker}>Flight Log History</Text>
        </View>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} color="#94A3B8" size={18} />
      </Pressable>
      {open ? (
        <View>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Ionicons name="flame" color="#F59E0B" size={16} />
              <Text style={styles.summaryValue}>{stats.currentStreak}</Text>
              <Text style={styles.summaryLabel}>Streak</Text>
            </View>
            <View style={styles.summaryCard}>
              <Ionicons name="checkmark-circle" color="#34D399" size={16} />
              <Text style={styles.summaryValue}>{stats.totalVerified}</Text>
              <Text style={styles.summaryLabel}>Verified</Text>
            </View>
            <View style={styles.summaryCard}>
              <Ionicons name="trending-up" color="#818CF8" size={16} />
              <Text style={styles.summaryValue}>+{stats.totalMomentumGained}</Text>
              <Text style={styles.summaryLabel}>Momentum</Text>
            </View>
          </View>
          <View style={styles.filters}>
            {FILTERS.map((item) => {
              const selected = filter === item.id;
              return (
                <Pressable key={item.id} style={[styles.pill, selected && styles.pillOn]} onPress={() => setFilter(item.id)}>
                  <Text style={[styles.pillText, selected && styles.pillTextOn]}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>
          {loading ? <Text style={styles.meta}>Loading flight log…</Text> : null}
          {error ? <Text style={styles.meta}>{error}</Text> : null}
          {!loading && !error && visible.length === 0 ? <Text style={styles.meta}>No directives in this view yet.</Text> : null}
          {visible.map((entry) => (
            <View
              key={entry.id}
              style={[
                styles.card,
                entry.status === 'verified' && styles.verified,
                entry.status === 'active' && styles.active,
                entry.status === 'missed' && styles.missed,
              ]}
            >
              <View style={styles.cardTop}>
                <Text style={styles.date}>{formatDate(entry.directive_date)}</Text>
                {entry.status === 'verified' ? (
                  <View style={styles.badge}>
                    <Ionicons name="ribbon" color="#34D399" size={14} />
                    <Text style={styles.badgeVerified}>+{entry.momentum_impact} Momentum</Text>
                  </View>
                ) : (
                  <View style={styles.badge}>
                    <Ionicons
                      name={entry.status === 'missed' ? 'close-circle' : 'time'}
                      color={entry.status === 'missed' ? '#FB7185' : '#A5B4FC'}
                      size={14}
                    />
                    <Text style={entry.status === 'missed' ? styles.badgeMissed : styles.badgeActive}>
                      {entry.status === 'missed' ? `${entry.momentum_impact} Momentum` : 'Active'}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.title}>{entry.title}</Text>
              <Text style={styles.rationale}>{entry.rationale}</Text>
              {entry.verification_note ? (
                <View style={styles.note}>
                  <Text style={styles.noteText}>{entry.verification_note}</Text>
                </View>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 22 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  headerCopy: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  kicker: {
    color: '#E2E8F0',
    fontFamily: fonts.semibold,
    fontSize: 13,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  summaryCard: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 4,
  },
  summaryValue: { color: '#F8FAFC', fontFamily: fonts.bold, fontSize: 18 },
  summaryLabel: { color: '#94A3B8', fontFamily: fonts.medium, fontSize: 11 },
  rule: { color: '#CBD5E1', fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, marginBottom: 12 },
  filters: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  pill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1E293B',
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pillOn: { borderColor: '#818CF8', backgroundColor: '#312E81' },
  pillText: { color: '#94A3B8', fontFamily: fonts.medium, fontSize: 13 },
  pillTextOn: { color: '#E0E7FF', fontFamily: fonts.semibold },
  meta: { color: '#94A3B8', fontFamily: fonts.regular, fontSize: 13, marginBottom: 8 },
  card: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderLeftWidth: 4,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  verified: { borderLeftColor: '#10B981' },
  active: { borderLeftColor: '#6366F1' },
  missed: { borderLeftColor: '#F43F5E' },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  date: { color: '#94A3B8', fontFamily: fonts.medium, fontSize: 12 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  badgeVerified: { color: '#34D399', fontFamily: fonts.semibold, fontSize: 12 },
  badgeActive: { color: '#A5B4FC', fontFamily: fonts.semibold, fontSize: 12 },
  badgeMissed: { color: '#FB7185', fontFamily: fonts.semibold, fontSize: 12 },
  title: { color: '#F8FAFC', fontFamily: fonts.semibold, fontSize: 16, marginTop: 8 },
  rationale: { color: '#CBD5E1', fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, marginTop: 6 },
  note: {
    marginTop: 10,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
    padding: 10,
  },
  noteText: { color: '#94A3B8', fontFamily: fonts.regular, fontSize: 12, lineHeight: 17 },
});
