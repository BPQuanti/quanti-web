import { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { fonts } from '../constants/theme';
import { useFocusHistory } from '../hooks/useFocusHistory';
import { useDeviceHabits } from '../hooks/useDeviceHabits';
import ActivePatternsCard, { type PatternInsight } from '../src/components/ActivePatternsCard';
import DomainTelemetryDrawers, { type TelemetryDay } from '../src/components/DomainTelemetryDrawers';
import FocusHistoryList from '../src/components/FocusHistoryList';

type HealthPayload = {
  steps?: number | null;
  sleepHours?: number | null;
  sleep?: number | null;
} | null;

type PlaidPayload = {
  isConnected?: boolean;
  accountBalance?: number | null;
  spent?: number | null;
} | null;

function finite(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function money(value: number) {
  return `$${Math.abs(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function buildPatterns(input: {
  lateNight: number | null;
  social: number | null;
  spent: number | null;
  connected: boolean;
  steps: number | null;
  sleep: number | null;
  stability: number | null;
  pickups: number | null;
}): PatternInsight[] {
  const patterns: PatternInsight[] = [];
  const late = input.lateNight;
  const social = input.social;
  const lateHot = late != null && late >= 30;
  const socialHot = social != null && social >= 30;
  const spendHot = input.connected && input.spent != null && Math.abs(input.spent) >= 40;

  if (lateHot || socialHot) {
    const screenBits = [
      late != null ? `${Math.round(late)} min of late-night screen` : null,
      social != null ? `${Math.round(social)} min of social apps` : null,
    ].filter((bit): bit is string => Boolean(bit));
    const spendBit = spendHot && input.spent != null ? ` Spend ${money(input.spent)}.` : '';
    patterns.push({
      id: 'late-spend',
      title: 'Late night and spend',
      body: `${screenBits.join(' · ')}.${spendBit}`,
      trajectory: late != null && late > 15
        ? 'Trajectory: late-night screen above 15 minutes marks yesterday’s directive missed.'
        : 'Trajectory: keep late-night screen at or under 15 minutes and yesterday’s directive can verify.',
      impact: 'High friction',
      tone: spendHot ? 'rose' : 'amber',
    });
  }

  if (input.stability != null && input.stability >= 0.85 && input.pickups != null) {
    const isolatedSpike = input.pickups >= 30;
    patterns.push({
      id: 'location-pickups',
      title: 'Stillness and pickups',
      body: `Stability ${input.stability.toFixed(2)} · ${Math.round(input.pickups).toLocaleString()} pickups.`,
      trajectory: isolatedSpike
        ? 'Trajectory: another isolated, high-pickup day keeps the digital-balance directive in the missed range.'
        : 'Trajectory: holding pickups down while stationary keeps this loop quiet.',
      impact: isolatedSpike ? 'High friction' : 'Stable',
      tone: isolatedSpike ? 'amber' : 'indigo',
    });
  }

  if (input.steps != null && input.sleep != null) {
    const lowMove = input.steps < 5000;
    const shortSleep = input.sleep < 6.5;
    const friction = lowMove && shortSleep;
    patterns.push({
      id: 'steps-sleep',
      title: 'Steps and sleep',
      body: `${Math.round(input.steps).toLocaleString()} steps · ${input.sleep.toFixed(1)} hrs sleep.`,
      trajectory: friction
        ? 'Trajectory: another short-sleep day keeps the morning directive on recovery instead of output.'
        : 'Trajectory: holding this pairing keeps the sleep directive in verification range.',
      impact: friction ? 'High friction' : 'Stable',
      tone: friction ? 'amber' : 'indigo',
    });
  }

  if (!patterns.length) {
    patterns.push({
      id: 'waiting',
      title: 'Waiting on two signals',
      body: 'Sync sleep or screen time, or link a bank.',
      trajectory: 'Trajectory: the first paired day replaces this card with a live pattern.',
      impact: 'Waiting',
      tone: 'indigo',
    });
  }

  return patterns;
}

export default function TrendsScreen() {
  const { healthData, plaidData, connectPlaid, syncHealth } = useAppContext() as {
    healthData?: HealthPayload;
    plaidData?: PlaidPayload;
    connectPlaid?: () => Promise<unknown> | void;
    syncHealth?: () => Promise<unknown> | void;
  };
  const { entries, stats, loading: historyLoading, error: historyError, refresh } = useFocusHistory();
  const { week, today: habitToday, error: habitError, refetch: refetchHabits } = useDeviceHabits();
  const [refreshing, setRefreshing] = useState(false);

  const health = healthData || null;
  const plaid = plaidData || null;
  const steps = finite(health?.steps);
  const sleep = finite(health?.sleepHours ?? health?.sleep);
  const spent = finite(plaid?.spent);
  const balance = finite(plaid?.accountBalance);
  const days: TelemetryDay[] = week.map((day) => ({
    date: day.log_date,
    screen: day.total_screen_minutes,
    lateNight: day.late_night_screen_minutes,
    pickups: day.phone_pickups,
    daylight: day.daylight_minutes,
    transit: day.transit_minutes,
    headphones: day.headphone_minutes,
    stability: day.location_stability_score,
    lowBattery: day.low_battery_events,
  }));
  const socialToday = habitToday?.social_minutes ?? null;
  const lateToday = habitToday?.late_night_screen_minutes ?? null;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([syncHealth?.(), refetchHabits(), refresh()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchHabits, refresh, syncHealth]);

  const patterns = useMemo(
    () =>
      buildPatterns({
        lateNight: lateToday,
        social: socialToday,
        stability: habitToday?.location_stability_score ?? null,
        pickups: habitToday?.phone_pickups ?? null,
        spent,
        connected: Boolean(plaid?.isConnected),
        steps,
        sleep,
      }),
    [habitToday, lateToday, plaid?.isConnected, sleep, socialToday, spent, steps],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} tintColor="#818CF8" />}
      >
        <Text style={styles.kicker}>Behavioral Radar</Text>
        <Text style={styles.title}>Patterns</Text>
        <Text style={styles.subtitle}>Screen time, sleep, and spend.</Text>

        <View style={styles.sectionRow}>
          <Ionicons name="flash" color="#818CF8" size={14} />
          <Text style={styles.section}>Active patterns</Text>
        </View>
        <ActivePatternsCard patterns={patterns} />

        <DomainTelemetryDrawers
          days={days}
          steps={steps}
          sleepHours={sleep}
          spent={spent}
          balance={balance}
          connected={Boolean(plaid?.isConnected)}
          pluggedIn={habitToday?.plugged_in_timestamp}
          unplugged={habitToday?.unplugged_timestamp}
          onLinkBank={() => {
            void connectPlaid?.();
          }}
        />
        {habitError ? <Text style={styles.habitError}>{habitError}</Text> : null}

        <View style={styles.log}>
          <FocusHistoryList
            entries={entries}
            stats={stats}
            loading={historyLoading}
            error={historyError}
            defaultOpen
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#020617' },
  scroll: { padding: 20, paddingBottom: 40 },
  kicker: {
    color: '#818CF8',
    fontFamily: fonts.semibold,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  title: { color: '#F8FAFC', fontFamily: fonts.bold, fontSize: 28, marginTop: 6 },
  subtitle: { color: '#94A3B8', fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, marginTop: 6, marginBottom: 18 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  section: {
    color: '#94A3B8',
    fontFamily: fonts.semibold,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  log: { marginTop: 12 },
  habitError: { color: '#FB7185', fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, marginTop: 8 },
});
