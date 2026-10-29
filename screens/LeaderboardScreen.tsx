/** Isolated legacy social surface — not registered in App.js. */
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { fonts } from '../constants/theme';
import AddSocialModal from '../src/components/AddSocialModal';
import { type Duel, type DuelDuration, useDuels } from '../hooks/useDuels';
import { useFriends } from '../hooks/useFriends';
import { usePublicBoard } from '../hooks/usePublicBoard';
import { useBoardVisibility } from '../hooks/useBoardVisibility';
import DuelLog from '../src/components/DuelLog';
import { duelSideScore } from '../src/lib/momentum';
import { buildReviewSocial, closestStranger, isSampleId, reviewDuelPurse, reviewWinCount, type ReviewSocial } from '../src/lib/reviewSocial';
import { useFocusHistory } from '../hooks/useFocusHistory';

const VISIBILITY_LINE = {
  private: 'You’re private.',
  friends: 'Friends see your handle and score.',
  public: 'Public shows only your handle and score.',
} as const;

function winLabel(wins?: number | null) {
  if (wins == null) return null;
  return wins === 1 ? '1 win' : `${wins} wins`;
}

function rowDetail(member: string | null, wins?: number | null, sample?: boolean) {
  return [member, winLabel(wins), sample ? 'Sample' : null].filter(Boolean).join(' · ') || null;
}

function memberLabel(since?: string | null) {
  if (!since) return null;
  const start = new Date(since);
  if (Number.isNaN(start.getTime())) return null;
  const days = Math.max(0, Math.floor((Date.now() - start.getTime()) / 86400000));
  if (days < 30) return days <= 1 ? 'Member 1 day' : `Member ${days} days`;
  if (days < 365) {
    const months = Math.max(1, Math.round(days / 30));
    return months === 1 ? 'Member 1 mo' : `Member ${months} mo`;
  }
  const years = Math.floor(days / 365);
  const months = Math.round((days % 365) / 30);
  if (months < 1 || months >= 12) return years === 1 ? 'Member 1 yr' : `Member ${years} yr`;
  return `Member ${years} yr ${months} mo`;
}

function isoDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

type MomentumNav = {
  navigate: (name: 'Duel' | 'Hub', params?: { duel: Duel; youHandle: string }) => void;
};

export default function LeaderboardScreen() {
  const navigation = useNavigation() as MomentumNav;
  const { userProfile, reviewDemoEnabled } = useAppContext() as {
    userProfile?: { name?: string | null; username?: string | null } | null;
    stepGoal?: number;
    reviewDemoEnabled?: boolean;
  };
  const { user } = useAuth() as { user?: { id?: string; created_at?: string } | null };
  const { friends, requests, loading: friendsLoading, error: friendsError, refresh: refreshFriends, respondToFriendRequest } = useFriends();
  const { duels, loading: duelsLoading, error: duelsError, refresh: refreshDuels, updateDuelStatus } = useDuels();
  const { players, loading: publicLoading, error: publicError, refresh: refreshPublic } = usePublicBoard();
  const { stats } = useFocusHistory();
  const [board, setBoard] = useState<'friends' | 'global'>('friends');
  const [modalVisible, setModalVisible] = useState(false);
  const [samples, setSamples] = useState<ReviewSocial | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchNote, setSearchNote] = useState<string | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { visibility } = useBoardVisibility();
  const reviewOn = Boolean(reviewDemoEnabled);
  const you = stats.totalMomentumGained + (reviewOn ? reviewDuelPurse() : 0);
  const youName = String(userProfile?.name || 'You').split(/\s+/)[0] || 'You';
  const youHandle = String(userProfile?.username || 'you').replace(/^@+/, '');
  const sampleFriends = reviewOn && samples ? samples.friends : [];
  const sampleRequests = reviewOn && samples ? samples.requests : [];
  const sampleDuels = reviewOn && samples ? samples.duels : [];
  const samplePublic = reviewOn && samples ? samples.publicPlayers : [];
  const shownFriends = [
    ...sampleFriends,
    ...friends.filter((friend) => !sampleFriends.some((sample) => sample.userId === friend.userId)),
  ];
  const shownRequests = [
    ...sampleRequests,
    ...requests.filter((request) => !sampleRequests.some((sample) => sample.friendshipId === request.friendshipId)),
  ];
  const shownDuels = [
    ...sampleDuels,
    ...duels.filter((duel) => !sampleDuels.some((sample) => sample.id === duel.id)),
  ];
  const shownPublic = [
    ...samplePublic,
    ...players.filter((player) => !samplePublic.some((sample) => sample.userId === player.userId)),
  ];
  const friendRows = [
    { id: 'you', name: youName, score: you, you: true as const, sample: false },
    ...shownFriends.map((friend) => ({
      id: friend.userId,
      name: friend.username || 'Friend',
      score: friend.momentumScore,
      you: false as const,
      sample: isSampleId(friend.userId),
    })),
  ].sort((a, b) => b.score - a.score);
  const globalPeople = shownPublic
    .map((player) => ({
      id: player.userId,
      name: player.username || 'Player',
      score: player.momentumScore,
      you: false as const,
      sample: false,
      detail: rowDetail(memberLabel(player.memberSince), player.wins, false),
    }))
    .sort((a, b) => b.score - a.score);
  const youPlace = 1 + globalPeople.filter((player) => player.score > you).length;
  const youDetail = rowDetail(memberLabel(user?.created_at), reviewOn ? reviewWinCount() : null);
  const rows = board === 'friends' ? friendRows : globalPeople;

  useEffect(() => {
    if (reviewOn) {
      setSamples((current) => current ?? buildReviewSocial());
      return;
    }
    setSamples(null);
  }, [reviewOn]);

  useEffect(() => () => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
  }, []);

  function acceptSampleRequest(friendshipId: string) {
    setSamples((current) => {
      if (!current) return current;
      const request = current.requests.find((item) => item.friendshipId === friendshipId);
      if (!request) return current;
      return {
        ...current,
        requests: current.requests.filter((item) => item.friendshipId !== friendshipId),
        friends: [
          {
            friendshipId: request.friendshipId,
            userId: request.userId,
            username: request.username,
            avatarUrl: null,
            momentumScore: 68,
            currentStreak: 1,
          },
          ...current.friends,
        ],
      };
    });
  }

  function openDuel(duel: Duel) {
    navigation.navigate('Duel', { duel, youHandle });
  }

  function cancelSearch() {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = null;
    setSearching(false);
    setSearchNote(null);
  }

  function queueStranger() {
    if (searching) return;
    setSearching(true);
    setSearchNote('Looking for the closest queue.');
    searchTimer.current = setTimeout(() => {
      searchTimer.current = null;
      setSearching(false);
      if (!reviewOn) {
        setSearchNote('No one is waiting right now.');
        return;
      }
      const busy = shownDuels
        .filter((duel) => duel.status !== 'completed')
        .map((duel) => (duel.youAreOpponent ? duel.challengerId : duel.opponentId));
      const match = closestStranger(busy);
      if (!match) {
        setSearchNote('No one is waiting right now.');
        return;
      }
      const start = new Date();
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      const duel: Duel = {
        id: `sample-duel-stranger-${Date.now()}`,
        challengerId: 'you',
        opponentId: match.userId,
        challengerName: youHandle,
        opponentName: match.username,
        challengerScore: you,
        opponentScore: match.momentumScore,
        challengerVerified: 0,
        opponentVerified: 0,
        status: 'active',
        startDate: isoDate(start),
        endDate: isoDate(end),
        durationDays: 7,
        winnerId: null,
        createdAt: isoDate(start),
        youAreOpponent: false,
        kind: 'stranger',
      };
      setSamples((current) => {
        const base = current ?? buildReviewSocial();
        return { ...base, duels: [duel, ...base.duels] };
      });
      setSearchNote(null);
      setModalVisible(false);
      openDuel(duel);
    }, 1400);
  }

  function acceptSampleDuel(duelId: string) {
    setSamples((current) => {
      if (!current) return current;
      return {
        ...current,
        duels: current.duels.map((duel) => (duel.id === duelId ? { ...duel, status: 'active' } : duel)),
      };
    });
  }

  function addSampleDuel(opponentId: string, duration: DuelDuration) {
    const opponent = [...sampleFriends, ...samplePublic].find((item) => item.userId === opponentId);
    if (!opponent) return;
    const start = new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + duration);
    setSamples((current) => {
      if (!current) return current;
      return {
        ...current,
        duels: [
          {
            id: `sample-duel-${Date.now()}`,
            challengerId: 'you',
            opponentId,
            challengerName: youHandle,
            opponentName: opponent.username,
            challengerScore: you,
            opponentScore: opponent.momentumScore,
            challengerVerified: 0,
            opponentVerified: 0,
            status: 'pending',
            startDate: isoDate(start),
            endDate: isoDate(end),
            durationDays: duration,
            winnerId: null,
            createdAt: isoDate(start),
            youAreOpponent: false,
          },
          ...current.duels,
        ],
      };
    });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.kicker}>Momentum</Text>
            <Text style={styles.title}>Leaderboard</Text>
          </View>
          <Pressable style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.addButtonText}>Add / Duel</Text>
          </Pressable>
        </View>
        <Text style={styles.subtitle}>Friends you accepted. Global is public.</Text>
        {reviewOn ? (
          <Text style={styles.meta}>Sample rows stay on this device.</Text>
        ) : null}

        <Pressable onPress={() => navigation.navigate('Hub')}>
          <Text style={styles.meta}>{VISIBILITY_LINE[visibility]} Change in Hub.</Text>
        </Pressable>

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
        {board === 'friends' && !friendsLoading && shownFriends.length === 0 && !friendsError ? (
          <Text style={styles.meta}>No accepted friends yet.</Text>
        ) : null}
        {board === 'global' && publicLoading ? <Text style={styles.meta}>Loading the public board…</Text> : null}
        {board === 'global' && publicError ? <Text style={styles.meta}>{publicError}</Text> : null}
        {board === 'global' && !publicLoading && shownPublic.length === 0 && !publicError ? (
          <Text style={styles.meta}>No one has joined the public board yet.</Text>
        ) : null}
        {board === 'global' && shownPublic.length > 0 ? (
          <Text style={styles.meta}>Time on Quanti and duel wins sit under each name.</Text>
        ) : null}
        {board === 'global' ? (
          <View style={[styles.rank, styles.rankYou]}>
            <Text style={styles.place}>#{youPlace}</Text>
            <View style={styles.duelCopy}>
              <Text style={styles.name}>{youName}</Text>
              {youDetail ? <Text style={styles.duelDates}>{youDetail}</Text> : null}
            </View>
            <Text style={styles.score}>{you.toLocaleString()}</Text>
          </View>
        ) : null}
        {rows.map((row, index) => {
          const place = board === 'global' && index + 1 >= youPlace ? index + 2 : index + 1;
          return (
          <View key={row.id} style={[styles.rank, row.you && styles.rankYou]}>
            <Text style={styles.place}>{place}</Text>
            <View style={styles.duelCopy}>
              <Text style={styles.name}>{row.name}</Text>
              {board === 'global' && 'detail' in row && row.detail ? (
                <Text style={styles.duelDates}>{row.detail}</Text>
              ) : row.sample ? (
                <Text style={styles.duelDates}>Sample</Text>
              ) : null}
            </View>
            <Text style={styles.score}>{row.score.toLocaleString()}</Text>
          </View>
          );
        })}

        <Text style={styles.section}>Requests</Text>
        {shownRequests.length === 0 ? <Text style={styles.meta}>No pending friend requests.</Text> : null}
        {shownRequests.map((request) => (
          <View key={request.friendshipId} style={styles.rank}>
            <View style={styles.duelCopy}>
              <Text style={styles.name}>@{request.username || 'friend'}</Text>
              <Text style={styles.duelDates}>
                {request.direction === 'incoming' ? 'Wants to connect' : 'Request sent'}
                {isSampleId(request.friendshipId) ? ' · Sample' : ''}
              </Text>
            </View>
            {request.direction === 'incoming' ? (
              <Pressable
                style={styles.accept}
                onPress={() => {
                  if (isSampleId(request.friendshipId)) {
                    acceptSampleRequest(request.friendshipId);
                    return;
                  }
                  void respondToFriendRequest(request.friendshipId, 'accepted').catch((error: unknown) => {
                    const message = error instanceof Error ? error.message : 'Could not accept that request.';
                    Alert.alert('Could not accept request', message);
                  });
                }}
              >
                <Text style={styles.acceptText}>Accept</Text>
              </Pressable>
            ) : null}
          </View>
        ))}

        <Text style={styles.section}>Duels</Text>
        <Text style={styles.meta}>Tap a duel.</Text>
        {duelsLoading ? <Text style={styles.meta}>Loading duels…</Text> : null}
        {duelsError ? <Text style={styles.meta}>{duelsError}</Text> : null}
        {!duelsLoading && shownDuels.every((duel) => duel.status === 'completed') && !duelsError ? (
          <Text style={styles.meta}>No pending or active duels.</Text>
        ) : null}
        {shownDuels.filter((duel) => duel.status !== 'completed').map((duel) => {
          const label = (name: string | null) => (name && name !== 'you' ? `@${name}` : `@${youHandle}`);
          const challenger = label(duel.challengerName);
          const opponent = label(duel.opponentName);
          return (
            <Pressable key={duel.id} style={styles.rank} onPress={() => openDuel(duel)}>
              <View style={styles.duelCopy}>
                <Text style={styles.name}>
                  {challenger} vs {opponent}
                </Text>
                <Text style={styles.duelDates}>
                  {duel.durationDays} days · {duel.startDate} – {duel.endDate}
                  {isSampleId(duel.id) ? ' · Sample' : ''}
                </Text>
              </View>
              <View style={styles.duelScore}>
                <Text style={styles.score}>
                  {duelSideScore(duel.challengerDays, duel.challengerVerified)}–{duelSideScore(duel.opponentDays, duel.opponentVerified)}
                </Text>
                <Text style={styles.duelDates}>{duel.status}</Text>
                {duel.status === 'pending' && duel.youAreOpponent ? (
                  <View onStartShouldSetResponder={() => true}>
                  <Pressable
                    style={styles.accept}
                    onPress={() => {
                      const live = { ...duel, status: 'active' as const };
                      if (isSampleId(duel.id)) {
                        acceptSampleDuel(duel.id);
                        openDuel(live);
                        return;
                      }
                      void updateDuelStatus(duel.id, 'active')
                        .then(() => openDuel(live))
                        .catch((error: unknown) => {
                          const message = error instanceof Error ? error.message : 'Could not accept that duel.';
                          Alert.alert('Could not accept duel', message);
                        });
                    }}
                  >
                    <Text style={styles.acceptText}>Accept</Text>
                  </Pressable>
                  </View>
                ) : null}
              </View>
            </Pressable>
          );
        })}

        <DuelLog
          duels={shownDuels.filter((duel) => duel.status === 'completed')}
          youHandle={youHandle}
          onOpen={openDuel}
        />
      </ScrollView>
      <AddSocialModal
        visible={modalVisible}
        extraFriends={sampleFriends}
        onLocalChallenge={addSampleDuel}
        searching={searching}
        searchNote={searchNote}
        onQueueStranger={queueStranger}
        onCancelQueue={cancelSearch}
        onClose={() => {
          cancelSearch();
          setModalVisible(false);
        }}
        onChanged={() => {
          void refreshFriends();
          void refreshDuels();
          void refreshPublic();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#020617' },
  scroll: { padding: 20, paddingBottom: 36 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  headerCopy: { flex: 1 },
  addButton: {
    marginTop: 18,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#818CF8',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addButtonText: { color: '#E0E7FF', fontFamily: fonts.semibold, fontSize: 13 },
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
  place: { width: 40, color: '#818CF8', fontFamily: fonts.bold, fontSize: 14 },
  name: { color: '#F8FAFC', fontFamily: fonts.semibold, fontSize: 15 },
  score: { color: '#E0E7FF', fontFamily: fonts.bold, fontSize: 16 },
  meta: { color: '#94A3B8', fontFamily: fonts.regular, fontSize: 13, marginBottom: 10 },
  duelCopy: { flex: 1 },
  duelDates: { color: '#64748B', fontFamily: fonts.regular, fontSize: 12, marginTop: 2 },
  duelScore: { alignItems: 'flex-end', gap: 4 },
  accept: { backgroundColor: '#818CF8', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, marginTop: 4 },
  acceptText: { color: '#020617', fontFamily: fonts.bold, fontSize: 12 },
  section: { color: '#94A3B8', fontFamily: fonts.semibold, fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 18, marginBottom: 10 },
});
