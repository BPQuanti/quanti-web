import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts } from '../../constants/theme';
import type { Duel } from '../../hooks/useDuels';
import { matchSides } from '../lib/momentum';
import { easeLayout } from '../lib/motion';
import { isSampleId } from '../lib/reviewSocial';

type Props = {
  duels: Duel[];
  youHandle: string;
  onOpen: (duel: Duel) => void;
};

function opponentName(duel: Duel, youHandle: string) {
  const raw = duel.youAreOpponent ? duel.challengerName : duel.opponentName;
  if (!raw || raw === 'you') return `@${youHandle}`;
  return `@${raw}`;
}

function purseLabel(purse: number, yours: number, theirs: number) {
  if (purse > 0) return `+${purse}`;
  if (yours === theirs) return 'Tie';
  return 'No purse';
}

export default function DuelLog({ duels, youHandle, onOpen }: Props) {
  const [open, setOpen] = useState(false);
  const settled = [...duels].sort((a, b) => b.endDate.localeCompare(a.endDate));
  const rows = settled.map((duel) => ({ duel, ...matchSides(duel) }));
  const wins = rows.filter((row) => row.purse > 0).length;
  const purse = rows.reduce((sum, row) => sum + row.purse, 0);

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
          <Ionicons name="ribbon" color="#A5B4FC" size={16} />
          <Text style={styles.kicker}>Duel Log</Text>
        </View>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} color="#94A3B8" size={18} />
      </Pressable>
      {open ? (
        <View>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Ionicons name="ribbon" color="#F59E0B" size={16} />
              <Text style={styles.summaryValue}>{wins}</Text>
              <Text style={styles.summaryLabel}>Wins</Text>
            </View>
            <View style={styles.summaryCard}>
              <Ionicons name="checkmark-circle" color="#818CF8" size={16} />
              <Text style={styles.summaryValue}>{settled.length}</Text>
              <Text style={styles.summaryLabel}>Matches</Text>
            </View>
            <View style={styles.summaryCard}>
              <Ionicons name="trending-up" color="#34D399" size={16} />
              <Text style={styles.summaryValue}>+{purse}</Text>
              <Text style={styles.summaryLabel}>Purse</Text>
            </View>
          </View>
          {settled.length === 0 ? <Text style={styles.meta}>Finished matches show up here.</Text> : null}
          {rows.map(({ duel, yours, theirs, purse: won }) => {
            const wonMatch = won > 0;
            const tied = yours === theirs;
            return (
              <Pressable
                key={duel.id}
                style={[styles.card, wonMatch ? styles.won : tied ? styles.tied : styles.lost]}
                onPress={() => onOpen(duel)}
              >
                <View style={styles.cardTop}>
                  <Text style={styles.title}>vs {opponentName(duel, youHandle)}</Text>
                  <View style={styles.badge}>
                    <Ionicons
                      name={wonMatch ? 'ribbon' : tied ? 'remove-circle' : 'close-circle'}
                      color={wonMatch ? '#34D399' : tied ? '#A5B4FC' : '#FB7185'}
                      size={14}
                    />
                    <Text style={wonMatch ? styles.badgeWon : tied ? styles.badgeTied : styles.badgeLost}>
                      {purseLabel(won, yours, theirs)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.detail}>
                  {duel.durationDays} days · You {yours}–{theirs}
                  {isSampleId(duel.id) ? ' · Sample' : ''}
                </Text>
              </Pressable>
            );
          })}
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
  won: { borderLeftColor: '#10B981' },
  tied: { borderLeftColor: '#6366F1' },
  lost: { borderLeftColor: '#F43F5E' },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { color: '#F8FAFC', fontFamily: fonts.semibold, fontSize: 16, flex: 1 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  badgeWon: { color: '#34D399', fontFamily: fonts.semibold, fontSize: 12 },
  badgeTied: { color: '#A5B4FC', fontFamily: fonts.semibold, fontSize: 12 },
  badgeLost: { color: '#FB7185', fontFamily: fonts.semibold, fontSize: 12 },
  detail: { color: '#94A3B8', fontFamily: fonts.regular, fontSize: 13, marginTop: 6 },
});
