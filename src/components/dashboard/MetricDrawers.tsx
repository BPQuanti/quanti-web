import { useState, type ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fonts } from '../../../constants/theme';
import type { DeviceHabitSnapshot, HabitStreak, HealthSnapshot, WealthSnapshot } from './types';

type Props = {
  wealth: WealthSnapshot;
  health: HealthSnapshot;
  device: DeviceHabitSnapshot;
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

function minutes(value: number | null) {
  if (value == null || !Number.isFinite(value)) return null;
  return `${Math.round(value).toLocaleString()} min`;
}

export default function MetricDrawers({ wealth, health, device, habits, onLinkBank }: Props) {
  const [open, setOpen] = useState<'health' | 'wealth' | 'digital' | null>('health');
  const toggle = (key: 'health' | 'wealth' | 'digital') => {
    setOpen((current) => (current === key ? null : key));
  };

  const sleepLabel = health.sleepHours == null ? 'Sleep not synced' : `${health.sleepHours.toFixed(1)} hrs sleep`;
  const daylightLabel = minutes(device.daylightMinutes);
  const healthSummary = daylightLabel ? `${sleepLabel} · ${daylightLabel} daylight` : sleepLabel;
  const spendLabel = wealth.connected && wealth.spent != null ? `${money(wealth.spent)} spend` : 'Spend not synced';
  const wealthSummary = wealth.connected ? `${spendLabel} · no daily target` : 'Bank not linked';
  const screenLabel = minutes(device.screenMinutes);
  const digitalSummary = screenLabel ? `${screenLabel} screen` : 'No device log today';
  const impulse =
    wealth.connected && wealth.spent != null && Math.abs(wealth.spent) >= 80
      ? 'Spend is high enough to count as an impulse trigger.'
      : 'No impulse trigger logged.';

  return (
    <View style={styles.wrap}>
      <Text style={styles.section}>Supporting metrics</Text>
      <Drawer
        icon="☀"
        title="Health & Circadian"
        summary={healthSummary}
        open={open === 'health'}
        onPress={() => toggle('health')}
      >
        <Text style={styles.line}>{sleepLabel}</Text>
        <Text style={styles.line}>{daylightLabel ? `${daylightLabel} daylight` : 'Daylight not logged'}</Text>
        <Text style={styles.line}>{health.steps == null ? 'Steps not synced' : `${count(health.steps)} steps`}</Text>
        {health.status ? <Text style={styles.meta}>{health.status}</Text> : null}
        {habits.length ? <Text style={styles.meta}>{habits.length} saved streaks</Text> : null}
      </Drawer>
      <Drawer
        icon="🏦"
        title="Financial Velocity"
        summary={wealthSummary}
        open={open === 'wealth'}
        onPress={() => toggle('wealth')}
      >
        {wealth.connected ? (
          <>
            <Text style={styles.line}>{wealth.bankName || 'Linked bank'}</Text>
            <Text style={styles.line}>Balance {money(wealth.balance)}</Text>
            <Text style={styles.line}>Daily spend {money(wealth.spent)}</Text>
            <Text style={styles.line}>Daily target not set</Text>
            <Text style={styles.line}>{impulse}</Text>
          </>
        ) : (
          <>
            <Text style={styles.line}>Connect a bank to compare spend with a target.</Text>
            {onLinkBank ? (
              <TouchableOpacity style={styles.link} onPress={onLinkBank}>
                <Text style={styles.linkText}>Link account</Text>
              </TouchableOpacity>
            ) : null}
          </>
        )}
      </Drawer>
      <Drawer
        icon="📱"
        title="Digital Balance"
        summary={digitalSummary}
        open={open === 'digital'}
        onPress={() => toggle('digital')}
      >
        <Text style={styles.line}>{screenLabel ? `${screenLabel} screen time` : 'Screen time not logged'}</Text>
        <Text style={styles.line}>
          {minutes(device.lateNightMinutes) ? `${minutes(device.lateNightMinutes)} late night` : 'Late-night usage not logged'}
        </Text>
        <Text style={styles.line}>{device.pickups == null ? 'Pickups not logged' : `${count(device.pickups)} pickups`}</Text>
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
