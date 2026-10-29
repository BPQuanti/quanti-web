import { useCallback, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fonts } from '../../../constants/theme';
import { tierFor } from '../../lib/momentum';

type Props = {
  name?: string | null;
  score: number;
  streak?: number;
  nextBonus?: number;
  tierName?: string;
  tierFloor?: number;
  tierCeiling?: number | null;
  tierColor?: string;
  tierWash?: string;
  duelPurse?: number;
};

function greeting(name?: string | null) {
  const hour = new Date().getHours();
  const hello = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const first = String(name || '').trim().split(/\s+/)[0];
  return first ? `${hello}, ${first}` : hello;
}

export default function MomentumHeader({
  name,
  score,
  streak = 0,
  nextBonus = 11,
  tierName = 'Ignition',
  tierFloor = 0,
  tierCeiling = 250,
  tierColor = '#F59E0B',
  tierWash = 'rgba(245, 158, 11, 0.14)',
  duelPurse = 0,
}: Props) {
  const safeScore = Number.isFinite(score) ? Math.max(0, Math.round(score)) : 0;
  const span = tierCeiling == null ? 1 : Math.max(1, tierCeiling - tierFloor);
  const gauge = tierCeiling == null ? 100 : Math.max(0, Math.min(100, Math.round(((safeScore - tierFloor) / span) * 100)));
  const projected = safeScore + nextBonus;
  const crosses = tierCeiling != null && projected > tierCeiling;
  const dateLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const streakLine = [
    streak > 0 ? `Streak ${streak}` : 'No streak yet',
    `next day +${nextBonus}`,
    crosses ? 'next tier' : null,
    duelPurse > 0 ? `wins +${duelPurse}` : null,
  ].filter(Boolean).join(' · ');
  const crossedByPurse = duelPurse > 0 && tierFor(Math.max(0, safeScore - duelPurse)).name !== tierName;
  const fill = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const [shownScore, setShownScore] = useState(0);
  const gaugeWidth = fill.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  useFocusEffect(useCallback(() => {
    fill.setValue(0);
    scale.setValue(1);
    const count = new Animated.Value(0);
    const listener = count.addListener(({ value }) => setShownScore(Math.round(value)));
    const motion = Animated.parallel([
      Animated.timing(fill, {
        toValue: gauge,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(count, {
        toValue: safeScore,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]);
    motion.start();
    let pulse: Animated.CompositeAnimation | null = null;
    if (crossedByPurse) {
      pulse = Animated.sequence([
        Animated.delay(460),
        Animated.timing(scale, { toValue: 1.08, duration: 140, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
      ]);
      pulse.start();
    }
    return () => {
      motion.stop();
      pulse?.stop();
      count.removeListener(listener);
    };
  }, [crossedByPurse, fill, gauge, safeScore, scale]));

  return (
    <View>
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text style={styles.date}>{dateLabel}</Text>
          <Text style={styles.greeting}>{greeting(name)}</Text>
        </View>
        <Animated.View style={[styles.badge, { borderColor: tierColor, backgroundColor: tierWash, transform: [{ scale }] }]}>
          <Text style={styles.badgeLabel}>{tierName}</Text>
          <Text style={[styles.score, { color: tierColor }]}>{shownScore.toLocaleString()}</Text>
          <View style={styles.gaugeTrack}>
            <Animated.View style={[styles.gaugeFill, { width: gaugeWidth, backgroundColor: tierColor }]} />
          </View>
          <Text style={[styles.status, { color: tierColor }]}>{tierCeiling == null ? 'Open ended' : `${Math.max(0, tierCeiling + 1 - safeScore).toLocaleString()} to next`}</Text>
        </Animated.View>
      </View>
      <Text style={styles.streakLine}>{streakLine}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  copy: { flex: 1, paddingTop: 4 },
  date: { color: '#94A3B8', fontFamily: fonts.medium, fontSize: 13 },
  greeting: { color: '#F8FAFC', fontFamily: fonts.bold, fontSize: 26, marginTop: 4, lineHeight: 32 },
  streakLine: { color: '#CBD5E1', fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, marginTop: 12 },
  badge: {
    minWidth: 108,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  badgeLabel: {
    color: '#94A3B8',
    fontFamily: fonts.semibold,
    fontSize: 10,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  score: { fontFamily: fonts.bold, fontSize: 28, marginTop: 2 },
  gaugeTrack: {
    width: '100%',
    height: 4,
    borderRadius: 99,
    backgroundColor: '#1E293B',
    marginTop: 6,
    overflow: 'hidden',
  },
  gaugeFill: { height: '100%', borderRadius: 99 },
  status: { fontFamily: fonts.semibold, fontSize: 11, marginTop: 6 },
});
