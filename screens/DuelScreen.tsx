/** Isolated legacy social surface — not registered in App.js. */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { fonts } from '../constants/theme';
import type { Duel } from '../hooks/useDuels';
import { duelPurse, scoreDuelDays } from '../src/lib/momentum';
import { isSampleId } from '../src/lib/reviewSocial';

type DuelNav = {
  goBack: () => void;
  canGoBack: () => boolean;
  navigate: (name: 'Momentum' | 'Focus') => void;
};

type DuelRoute = {
  params?: { duel?: Duel; youHandle?: string };
};

function handle(name: string | null, youHandle: string) {
  if (!name || name === 'you') return youHandle || 'you';
  return name.replace(/^@+/, '');
}

function DayPip({ filled, current, delay }: { filled: boolean; current: boolean; delay: number }) {
  const lit = filled || current;
  const opacity = useRef(new Animated.Value(lit ? 0 : 1)).current;

  useEffect(() => {
    if (!lit) return undefined;
    const animation = Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      delay,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [current, delay, filled, lit, opacity]);

  return <Animated.View style={[styles.pip, filled && styles.pipFilled, current && styles.pipCurrent, { opacity }]} />;
}

function dayProgress(duel: Duel) {
  const start = new Date(`${duel.startDate}T00:00:00`).getTime();
  const end = new Date(`${duel.endDate}T00:00:00`).getTime();
  const total = Math.max(1, duel.durationDays || Math.round((end - start) / 86400000));
  if (duel.status === 'pending') return { total, elapsed: 0 };
  if (duel.status === 'completed') return { total, elapsed: total };
  const elapsed = Math.round((Date.now() - start) / 86400000);
  return { total, elapsed: Math.min(total, Math.max(0, elapsed)) };
}

export default function DuelScreen() {
  const navigation = useNavigation() as DuelNav;
  const route = useRoute() as DuelRoute;
  const duel = route.params?.duel;
  const youHandle = String(route.params?.youHandle || 'you').replace(/^@+/, '');

  const close = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('Momentum');
  };

  if (!duel) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <TouchableOpacity style={styles.back} onPress={close} accessibilityRole="button" accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={22} color="#E2E8F0" />
          <Text style={styles.backText}>Momentum</Text>
        </TouchableOpacity>
        <Text style={styles.missing}>This duel is not open.</Text>
      </SafeAreaView>
    );
  }

  return <DuelFloor duel={duel} youHandle={youHandle} onClose={close} />;
}

function DuelFloor({ duel, youHandle, onClose }: { duel: Duel; youHandle: string; onClose: () => void }) {
  const navigation = useNavigation() as DuelNav;
  const yourLog = duel.youAreOpponent ? duel.opponentDays : duel.challengerDays;
  const theirLog = duel.youAreOpponent ? duel.challengerDays : duel.opponentDays;
  const yours = duel.youAreOpponent
    ? { name: handle(duel.opponentName, youHandle), board: duel.opponentScore, run: scoreDuelDays(yourLog || []) }
    : { name: handle(duel.challengerName, youHandle), board: duel.challengerScore, run: scoreDuelDays(yourLog || []) };
  const theirs = duel.youAreOpponent
    ? { name: handle(duel.challengerName, youHandle), board: duel.challengerScore, run: scoreDuelDays(theirLog || []) }
    : { name: handle(duel.opponentName, youHandle), board: duel.opponentScore, run: scoreDuelDays(theirLog || []) };
  const yourMatch = yours.run.score;
  const theirMatch = theirs.run.score;
  const gap = yourMatch - theirMatch;
  const evenStart = yourMatch === 0 && theirMatch === 0;
  const { total, elapsed } = dayProgress(duel);
  const live = duel.status === 'active';
  const pending = duel.status === 'pending';
  const finished = duel.status === 'completed';
  const purse = duelPurse(yourMatch, theirMatch, duel.kind === 'stranger');
  const lead = pending
    ? 'Both start at 0.'
    : finished && purse > 0
      ? `You won. +${purse}.`
      : finished && gap === 0
        ? 'Tie. No purse.'
        : finished
          ? 'You lost. Score unchanged.'
          : gap === 0
            ? 'Tied right now.'
            : gap > 0
              ? `You lead by ${gap}.`
              : `@${theirs.name} leads by ${Math.abs(gap)}.`;
  const statusLabel = live ? 'Live' : pending ? 'Pending' : 'Finished';
  const yourTarget = evenStart ? 1 : Math.max(yourMatch, 0.01);
  const theirTarget = evenStart ? 1 : Math.max(theirMatch, 0.01);
  const grow = useRef(new Animated.Value(0)).current;
  const flash = useRef(new Animated.Value(0)).current;
  const [pipRun, setPipRun] = useState(0);
  const yourFlex = grow.interpolate({ inputRange: [0, 1], outputRange: [0.02, yourTarget] });
  const theirFlex = grow.interpolate({ inputRange: [0, 1], outputRange: [0.02, theirTarget] });
  const leadColor = flash.interpolate({ inputRange: [0, 1], outputRange: ['#F8FAFC', '#34D399'] });

  useFocusEffect(useCallback(() => {
    grow.setValue(0);
    flash.setValue(0);
    setPipRun((run) => run + 1);
    const bar = Animated.timing(grow, {
      toValue: 1,
      duration: 520,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    bar.start();
    let win: Animated.CompositeAnimation | null = null;
    if (finished && purse > 0) {
      win = Animated.sequence([
        Animated.delay(480),
        Animated.timing(flash, { toValue: 1, duration: 160, useNativeDriver: false }),
        Animated.timing(flash, { toValue: 0, duration: 380, useNativeDriver: false }),
      ]);
      win.start();
    }
    return () => {
      bar.stop();
      win?.stop();
    };
  }, [duel.id, finished, flash, grow, purse]));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.back} onPress={onClose} accessibilityRole="button" accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={22} color="#E2E8F0" />
          <Text style={styles.backText}>Momentum</Text>
        </TouchableOpacity>

        <View style={styles.titleRow}>
          <View>
            <Text style={styles.kicker}>Duel</Text>
            <Text style={styles.title}>{pending ? 'Waiting' : live ? 'On the floor' : 'Final'}</Text>
          </View>
          <View style={[styles.pill, live && styles.pillLive, pending && styles.pillPending]}>
            <Text style={[styles.pillText, live && styles.pillTextLive, pending && styles.pillTextPending]}>{statusLabel}</Text>
          </View>
        </View>
        <Text style={styles.dayLine}>
          {pending ? `Opens for ${total} days after accept` : `Day ${Math.min(elapsed + (live ? 1 : 0), total)} of ${total}`}
          {duel.kind === 'stranger' ? ' · Stranger · a win pays double' : ''}
          {isSampleId(duel.id) ? ' · Sample' : ''}
        </Text>

        <View style={styles.arena}>
          <View style={styles.fighter}>
            <Text style={styles.sideLabel}>You</Text>
            <Text style={styles.handle} numberOfLines={1}>@{yours.name}</Text>
            <Text style={styles.score}>{yourMatch}</Text>
            <Text style={styles.board}>Board {yours.board.toLocaleString()}</Text>
          </View>
          <Text style={styles.vs}>VS</Text>
          <View style={[styles.fighter, styles.fighterRight]}>
            <Text style={styles.sideLabel}>Them</Text>
            <Text style={styles.handle} numberOfLines={1}>@{theirs.name}</Text>
            <Text style={[styles.score, styles.scoreThem]}>{theirMatch}</Text>
            <Text style={styles.board}>Board {theirs.board.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.track}>
          <Animated.View style={[styles.yourBar, { flex: yourFlex }]} />
          <View style={styles.marker} />
          <Animated.View style={[styles.theirBar, { flex: theirFlex }]} />
        </View>
        <Animated.Text style={[styles.lead, { color: leadColor }]}>{lead}</Animated.Text>

        <View style={styles.pips}>
          {Array.from({ length: total }, (_, index) => {
            const filled = index < elapsed || (!pending && !live && index < total);
            const current = live && index === Math.min(elapsed, total - 1);
            return <DayPip key={`${pipRun}-${index}`} filled={filled} current={current} delay={index * 70} />;
          })}
        </View>
        <Text style={styles.pipCaption}>{total} days in a row</Text>

        <View style={styles.action}>
          <Text style={styles.actionKicker}>To take the lead</Text>
          <Text style={styles.actionTitle}>Finish today's focus card</Text>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Focus')} activeOpacity={0.85}>
            <Text style={styles.actionButtonText}>Open today's focus</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.note}>
          <Ionicons name="flash" size={16} color="#818CF8" />
          <Text style={styles.noteText}>
            {pending
              ? 'First day pays +11.'
              : `Next card +${yours.run.nextPoints}. Theirs +${theirs.run.nextPoints}.`}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#020617' },
  scroll: { padding: 20, paddingBottom: 40 },
  back: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginBottom: 18 },
  backText: { color: '#E2E8F0', fontFamily: fonts.medium, fontSize: 16 },
  missing: { color: '#94A3B8', fontFamily: fonts.regular, fontSize: 15, paddingHorizontal: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  kicker: { color: '#818CF8', fontFamily: fonts.semibold, fontSize: 12, letterSpacing: 1.4, textTransform: 'uppercase' },
  title: { color: '#F8FAFC', fontFamily: fonts.bold, fontSize: 32, marginTop: 4 },
  pill: { borderRadius: 999, borderWidth: 1, borderColor: '#334155', paddingHorizontal: 12, paddingVertical: 6, marginBottom: 6 },
  pillLive: { borderColor: '#34D399', backgroundColor: '#022C22' },
  pillPending: { borderColor: '#FBBF24', backgroundColor: '#451A03' },
  pillText: { color: '#94A3B8', fontFamily: fonts.bold, fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase' },
  pillTextLive: { color: '#6EE7B7' },
  pillTextPending: { color: '#FDE68A' },
  dayLine: { color: '#94A3B8', fontFamily: fonts.regular, fontSize: 14, marginTop: 8 },
  arena: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 24,
    padding: 18,
    marginTop: 22,
  },
  fighter: { flex: 1 },
  fighterRight: { alignItems: 'flex-end' },
  sideLabel: { color: '#64748B', fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase' },
  handle: { color: '#F8FAFC', fontFamily: fonts.semibold, fontSize: 16, marginTop: 6 },
  score: { color: '#C7D2FE', fontFamily: fonts.mono, fontSize: 40, marginTop: 4 },
  scoreThem: { color: '#FECDD3' },
  board: { color: '#64748B', fontFamily: fonts.regular, fontSize: 12, marginTop: 2 },
  vs: { color: '#475569', fontFamily: fonts.bold, fontSize: 13, letterSpacing: 1, marginHorizontal: 8 },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 18,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 16,
    backgroundColor: '#1E293B',
  },
  yourBar: { height: 18, backgroundColor: '#818CF8' },
  theirBar: { height: 18, backgroundColor: '#F43F5E' },
  marker: { width: 4, height: 18, backgroundColor: '#F8FAFC' },
  lead: { color: '#F8FAFC', fontFamily: fonts.semibold, fontSize: 18, marginTop: 14 },
  pips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 22 },
  pip: { width: 18, height: 8, borderRadius: 999, backgroundColor: '#1E293B' },
  pipFilled: { backgroundColor: '#4338CA' },
  pipCurrent: { backgroundColor: '#A5B4FC' },
  pipCaption: { color: '#E2E8F0', fontFamily: fonts.semibold, fontSize: 15, marginTop: 10 },
  action: {
    marginTop: 22,
    backgroundColor: '#0F172A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4338CA',
    padding: 16,
  },
  actionKicker: { color: '#A5B4FC', fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase' },
  actionTitle: { color: '#F8FAFC', fontFamily: fonts.bold, fontSize: 20, marginTop: 8 },
  actionButton: {
    marginTop: 14,
    backgroundColor: '#4F46E5',
    borderRadius: 14,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonText: { color: '#FFFFFF', fontFamily: fonts.semibold, fontSize: 16 },
  note: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    marginTop: 22,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 14,
  },
  noteText: { flex: 1, color: '#94A3B8', fontFamily: fonts.regular, fontSize: 13, lineHeight: 18 },
});
