import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppContext } from '../context/AppContext';
import { fonts } from '../constants/theme';
import { useDuels } from '../hooks/useDuels';
import { useFriends } from '../hooks/useFriends';

type Recap = {
  id?: string;
  period?: string;
  range?: string;
  headline?: string;
  percentile?: string;
  metrics?: string[];
};

const GLOBAL = [
  { id: 'mina', name: 'Mina', score: 98, you: false as const },
  { id: 'chris', name: 'Chris', score: 95, you: false as const },
  { id: 'alex', name: 'Alex V.', score: 91, you: false as const },
  { id: 'priya', name: 'Priya', score: 88, you: false as const },
];

function finite(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function yourScore(steps: number | null, goal: number, connected: boolean) {
  const stepScore = steps == null || goal <= 0 ? 12 : Math.min(70, Math.round((steps / goal) * 70));
  return Math.max(0, Math.min(100, stepScore + (connected ? 16 : 6)));
}

export default function LeaderboardScreen() {
  const { healthData, plaidData, recaps, userProfile, stepGoal } = useAppContext() as {
    healthData?: { steps?: number | null } | null;
    plaidData?: { isConnected?: boolean } | null;
    recaps?: Recap[] | null;
    userProfile?: { name?: string | null } | null;
    stepGoal?: number;
  };
  const { friends, loading: friendsLoading, error: friendsError } = useFriends();
  const { duels, loading: duelsLoading, error: duelsError } = useDuels();
  const [board, setBoard] = useState<'friends' | 'global'>('friends');
  const you = yourScore(finite(healthData?.steps), finite(stepGoal) || 10000, Boolean(plaidData?.isConnected));
  const youName = String(userProfile?.name || 'You').split(/\s+/)[0] || 'You';
  const friendRows = [
    { id: 'you', name: youName, score: you, you: true as const },
    ...friends.map((friend) => ({
      id: friend.userId,
      name: friend.username || 'Friend',
      score: friend.momentumScore,
      you: false as const,
    })),
  ].sort((a, b) => b.score - a.score);
  const globalRows = [...GLOBAL, { id: 'you', name: youName, score: you, you: true as const }].sort(
    (a, b) => b.score - a.score,
  );
  const rows = board === 'friends' ? friendRows : globalRows;
  const cards = Array.isArray(recaps) ? recaps : [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>Momentum</Text>
        <Text style={styles.title}>Leaderboard</Text>
        <Text style={styles.subtitle}>Friends and the wider board, plus this week’s recap.</Text>

        <View style={styles.toggle}>
          {(['friends', 'global'] as const).map((key) => {
            const active = board === key;
            return (
              <Pressable key={key} style={[styles.toggleItem, active && styles.toggleOn]} onPress={() => setBoard(key)}>
                <Text style={[styles.toggleText, active && styles.toggleTextOn]}>{key === 'friends' ? 'Friends' : 'Global'}</Text>
              </Pressable>
            );
          })}
        </View>

        {board === 'friends' && friendsLoading ? <Text style={styles.meta}>Loading friends…</Text> : null}
        {board === 'friends' && friendsError ? <Text style={styles.meta}>{friendsError}</Text> : null}
        {board === 'friends' && !friendsLoading && friends.length === 0 && !friendsError ? (
          <Text style={styles.meta}>No accepted friends yet.</Text>
        ) : null}
        {rows.map((row, index) => (
          <View key={row.id} style={[styles.rank, row.you && styles.rankYou]}>
            <Text style={styles.place}>{index + 1}</Text>
            <Text style={styles.name}>{row.name}</Text>
            <Text style={styles.score}>{row.score}</Text>
          </View>
        ))}

        <Text style={styles.section}>Duels</Text>
        {duelsLoading ? <Text style={styles.meta}>Loading duels…</Text> : null}
        {duelsError ? <Text style={styles.meta}>{duelsError}</Text> : null}
        {!duelsLoading && duels.length === 0 && !duelsError ? (
          <Text style={styles.meta}>No pending or active duels.</Text>
        ) : null}
        {duels.map((duel) => (
          <View key={duel.id} style={styles.rank}>
            <View style={styles.duelCopy}>
              <Text style={styles.name}>{duel.status === 'active' ? 'Active duel' : 'Pending duel'}</Text>
              <Text style={styles.duelDates}>
                {duel.startDate} – {duel.endDate}
              </Text>
            </View>
            <Text style={styles.score}>{duel.status}</Text>
          </View>
        ))}

        <Text style={styles.section}>Weekly recap</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recapRow}>
          {cards.length ? (
            cards.map((card) => (
              <View key={card.id || card.headline} style={styles.recap}>
                <Text style={styles.recapPeriod}>{card.period || 'Recap'}</Text>
                <Text style={styles.recapHeadline}>{card.headline || 'No headline yet'}</Text>
                <Text style={styles.recapRange}>{card.percentile || card.range || ''}</Text>
              </View>
            ))
          ) : (
            <View style={styles.recap}>
              <Text style={styles.recapHeadline}>Recaps appear after the next sync.</Text>
            </View>
          )}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#020617' },
  scroll: { padding: 20, paddingBottom: 36 },
  kicker: { color: '#818CF8', fontFamily: fonts.semibold, fontSize: 12, letterSpacing: 1.4, textTransform: 'uppercase' },
  title: { color: '#F8FAFC', fontFamily: fonts.bold, fontSize: 28, marginTop: 6 },
  subtitle: { color: '#94A3B8', fontFamily: fonts.regular, fontSize: 14, marginTop: 6 },
  toggle: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 4,
    marginTop: 16,
    marginBottom: 14,
  },
  toggleItem: { flex: 1, borderRadius: 999, alignItems: 'center', paddingVertical: 8 },
  toggleOn: { backgroundColor: '#312E81' },
  toggleText: { color: '#64748B', fontFamily: fonts.medium, fontSize: 14 },
  toggleTextOn: { color: '#E0E7FF', fontFamily: fonts.semibold },
  rank: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  rankYou: { borderColor: '#818CF8' },
  place: { width: 22, color: '#818CF8', fontFamily: fonts.bold, fontSize: 16 },
  name: { flex: 1, color: '#F8FAFC', fontFamily: fonts.semibold, fontSize: 15 },
  score: { color: '#E0E7FF', fontFamily: fonts.bold, fontSize: 16 },
  meta: { color: '#94A3B8', fontFamily: fonts.regular, fontSize: 13, marginBottom: 10 },
  duelCopy: { flex: 1 },
  duelDates: { color: '#64748B', fontFamily: fonts.regular, fontSize: 12, marginTop: 2 },
  section: { color: '#94A3B8', fontFamily: fonts.semibold, fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 18, marginBottom: 10 },
  recapRow: { gap: 12, paddingRight: 8 },
  recap: {
    width: 230,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 18,
    padding: 16,
  },
  recapPeriod: { color: '#A5B4FC', fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' },
  recapHeadline: { color: '#F8FAFC', fontFamily: fonts.bold, fontSize: 18, marginTop: 8, lineHeight: 24 },
  recapRange: { color: '#94A3B8', fontFamily: fonts.regular, fontSize: 13, marginTop: 8 },
});
