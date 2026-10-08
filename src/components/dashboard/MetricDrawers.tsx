import { useState, type ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fonts } from '../../../constants/theme';
import type { HabitStreak, HealthSnapshot, WealthSnapshot } from './types';

type Props = {
  wealth: WealthSnapshot;
  health: HealthSnapshot;
  habits: HabitStreak[];
  onLinkBank?: () => void;
};

function money(value: number | null) {
  if (value == null || !Number.isFinite(value)) return '—';
  return `$${Math.abs(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function count(value: number | null) {
  if (value == null || !Number.isFinite(value)) return '—';
  return Math.round(value).toLocaleString();
}

function Drawer({
  icon,
  title,
  summary,
  open,
  onPress,
  children,
}: {
  icon: string;
  title: string;
  summary: string;
  open: boolean;
  onPress: () => void;
  children: ReactNode;
}) {
  return (
    <View style={styles.drawer}>
      <TouchableOpacity style={styles.drawerHead} onPress={onPress} activeOpacity={0.8}>
        <Text style={styles.drawerTitle}>
          {icon}  {title}
        </Text>
        <Text style={styles.chevron}>{open ? '–' : '+'}</Text>
      </TouchableOpacity>
      <Text style={styles.summary}>{summary}</Text>
      {open ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

export default function MetricDrawers({ wealth, health, habits, onLinkBank }: Props) {
  const [open, setOpen] = useState<'wealth' | 'health' | 'habits' | null>(null);
  const toggle = (key: 'wealth' | 'health' | 'habits') => {
    setOpen((current) => (current === key ? null : key));
  };

  const wealthSummary = wealth.connected
    ? `${money(wealth.balance)} balance · ${money(wealth.spent)} spend`
    : 'Bank not linked';
  const sleepLabel = health.sleepHours == null ? 'Sleep not synced' : `${health.sleepHours.toFixed(1)} hrs sleep`;
  const healthSummary = `${count(health.steps)} steps · ${sleepLabel}`;
  const habitSummary = habits.length ? `${habits.length} active` : 'No active streaks';

  return (
    <View style={styles.wrap}>
      <Text style={styles.section}>Supporting metrics</Text>
      <Drawer
        icon="🏦"
        title="Wealth"
        summary={wealthSummary}
        open={open === 'wealth'}
        onPress={() => toggle('wealth')}
      >
        {wealth.connected ? (
          <>
            <Text style={styles.line}>{wealth.bankName || 'Linked bank'}</Text>
            <Text style={styles.line}>Balance {money(wealth.balance)}</Text>
            <Text style={styles.line}>Spend {money(wealth.spent)}</Text>
          </>
        ) : (
          <>
            <Text style={styles.line}>Connect a bank to show balance and daily spend.</Text>
            {onLinkBank ? (
              <TouchableOpacity style={styles.link} onPress={onLinkBank}>
                <Text style={styles.linkText}>Link account</Text>
              </TouchableOpacity>
            ) : null}
          </>
        )}
      </Drawer>
      <Drawer
        icon="⌚"
        title="Health"
        summary={healthSummary}
        open={open === 'health'}
        onPress={() => toggle('health')}
      >
        <Text style={styles.line}>Steps {count(health.steps)}</Text>
        <Text style={styles.line}>{sleepLabel}</Text>
        <Text style={styles.line}>Active energy {count(health.calories)} kcal</Text>
        {health.status ? <Text style={styles.meta}>{health.status}</Text> : null}
      </Drawer>
      <Drawer
        icon="⚡"
        title="Habits"
        summary={habitSummary}
        open={open === 'habits'}
        onPress={() => toggle('habits')}
      >
        {habits.length ? (
          habits.map((habit) => (
            <Text key={habit.id} style={styles.line}>
              {habit.label}
            </Text>
          ))
        ) : (
          <Text style={styles.line}>Streaks show up here after you save a verified stat.</Text>
        )}
      </Drawer>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 22 },
  section: {
    color: '#94A3B8',
    fontFamily: fonts.semibold,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  drawer: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  drawerHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  drawerTitle: { color: '#F8FAFC', fontFamily: fonts.semibold, fontSize: 16 },
  chevron: { color: '#94A3B8', fontFamily: fonts.bold, fontSize: 20 },
  summary: { color: '#94A3B8', fontFamily: fonts.regular, fontSize: 13, marginTop: 6 },
  body: { marginTop: 12, gap: 6 },
  line: { color: '#E2E8F0', fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
  meta: { color: '#64748B', fontFamily: fonts.regular, fontSize: 12, marginTop: 4 },
  link: {
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: '#1E293B',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  linkText: { color: '#E2E8F0', fontFamily: fonts.semibold, fontSize: 13 },
});
