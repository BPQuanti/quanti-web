import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppContext } from '../context/AppContext';
import DailyFocusCard from '../src/components/dashboard/DailyFocusCard';
import MetricDrawers from '../src/components/dashboard/MetricDrawers';
import MomentumHeader from '../src/components/dashboard/MomentumHeader';
import type { FocusDirective, HabitStreak } from '../src/components/dashboard/types';

type HealthPayload = {
  steps?: number | null;
  activeCalories?: number | null;
  sleepHours?: number | null;
  sleep?: number | null;
  status?: string | null;
} | null;

type PlaidPayload = {
  isConnected?: boolean;
  bankName?: string | null;
  accountBalance?: number | null;
  spent?: number | null;
} | null;

type StatPayload = { id?: string; title?: string; emoji?: string } | null;

function finite(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function buildDirective(health: HealthPayload, plaid: PlaidPayload, stepGoal: number): FocusDirective {
  const sleep = finite(health?.sleepHours ?? health?.sleep);
  const steps = finite(health?.steps);
  const spent = finite(plaid?.spent);
  const connected = Boolean(plaid?.isConnected);

  if (sleep != null && sleep < 6) {
    return {
      title: 'Guard the impulse window',
      rationale: `${sleep.toFixed(1)} hrs sleep detected → High risk of impulse food delivery spending.`,
      ctaLabel: 'Log $0 Impulse Day',
      domains: 'Sleep · spending · delivery',
    };
  }

  if (connected && spent != null && spent >= 80) {
    return {
      title: 'Park cash before it leaks',
      rationale: `$${Math.round(Math.abs(spent)).toLocaleString()} in recent spend. Move a slice to savings before the next order.`,
      ctaLabel: 'Transfer $25 to Savings',
      domains: 'Wealth · habits',
    };
  }

  if (steps != null && stepGoal > 0 && steps < stepGoal * 0.5) {
    return {
      title: 'Walk before you spend',
      rationale: `${Math.round(steps).toLocaleString()} steps so far. A short walk is the move before another delivery order.`,
      ctaLabel: 'Log $0 Impulse Day',
      domains: 'Health · spending',
    };
  }

  return {
    title: 'Hold a zero-impulse day',
    rationale: 'Today’s signals are steady. The move is to keep delivery and impulse spend at $0.',
    ctaLabel: 'Log $0 Impulse Day',
    domains: 'Health · wealth · habits',
  };
}

function momentumScore(health: HealthPayload, plaid: PlaidPayload, streaks: number, stepGoal: number, completed: boolean) {
  const steps = finite(health?.steps);
  const sleep = finite(health?.sleepHours ?? health?.sleep);
  const spent = finite(plaid?.spent);
  const goal = stepGoal > 0 ? stepGoal : 10000;
  const stepScore = steps == null ? 8 : Math.min(40, Math.round((steps / goal) * 40));
  const sleepScore = sleep == null ? 12 : sleep >= 7 ? 30 : sleep >= 5.5 ? 18 : 8;
  const wealthScore = !plaid?.isConnected ? 8 : spent != null && Math.abs(spent) > 2000 ? 8 : 20;
  const habitScore = Math.min(15, streaks * 5);
  const bonus = completed ? 15 : 0;
  return Math.max(0, Math.min(100, stepScore + sleepScore + wealthScore + habitScore + bonus));
}

type AppSnapshot = {
  healthData?: HealthPayload;
  plaidData?: PlaidPayload;
  savedStats?: StatPayload[] | null;
  userProfile?: { name?: string | null } | null;
  stepGoal?: number;
  connectPlaid?: () => Promise<unknown> | void;
};

export default function DashboardScreen() {
  const { height } = useWindowDimensions();
  const { healthData, plaidData, savedStats, userProfile, stepGoal, connectPlaid } = useAppContext() as AppSnapshot;
  const [completed, setCompleted] = useState(false);

  const health = (healthData || null) as HealthPayload;
  const plaid = (plaidData || null) as PlaidPayload;
  const goal = finite(stepGoal) || 10000;
  const streaks = useMemo<HabitStreak[]>(() => {
    const list = Array.isArray(savedStats) ? (savedStats as StatPayload[]) : [];
    return list
      .filter((item) => item && (item.title || item.id))
      .map((item, index) => ({
        id: String(item?.id || `habit-${index}`),
        label: `${item?.emoji ? `${item.emoji} ` : ''}${item?.title || 'Active streak'}`,
      }));
  }, [savedStats]);

  const directive = buildDirective(health, plaid, goal);
  const score = momentumScore(health, plaid, streaks.length, goal, completed);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { minHeight: Math.round(height * 0.55) }]}>
          <MomentumHeader name={userProfile?.name} score={score} />
          <DailyFocusCard
            directive={directive}
            completed={completed}
            onToggleComplete={() => setCompleted((current) => !current)}
            onPrimaryAction={() => setCompleted(true)}
          />
        </View>
        <MetricDrawers
          wealth={{
            connected: Boolean(plaid?.isConnected),
            bankName: plaid?.bankName || null,
            balance: finite(plaid?.accountBalance),
            spent: finite(plaid?.spent),
          }}
          health={{
            steps: finite(health?.steps),
            sleepHours: finite(health?.sleepHours ?? health?.sleep),
            calories: finite(health?.activeCalories),
            status: health?.status || null,
          }}
          habits={streaks}
          onLinkBank={() => {
            void connectPlaid?.();
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#020617' },
  scroll: { padding: 20, paddingBottom: 36 },
  hero: { justifyContent: 'flex-start' },
});
