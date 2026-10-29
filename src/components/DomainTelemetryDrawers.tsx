import { useState, type ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts } from '../../constants/theme';

export type TelemetryDay = {
  date: string;
  screen: number | null;
  lateNight: number | null;
  pickups: number | null;
  daylight: number | null;
  transit: number | null;
  headphones: number | null;
  stability: number | null;
  lowBattery: number | null;
};

type DrawerKey = 'digital' | 'circadian' | 'finance';

type Props = {
  days: TelemetryDay[];
  steps: number | null;
  sleepHours: number | null;
  spent: number | null;
  balance: number | null;
  connected: boolean;
  pluggedIn?: string | null;
  unplugged?: string | null;
  onLinkBank?: () => void;
};

function average(values: (number | null)[]) {
  const nums = values.filter((value): value is number => value != null && Number.isFinite(value));
  if (!nums.length) return null;
  return nums.reduce((sum, value) => sum + value, 0) / nums.length;
}

function countLabel(value: number | null, suffix: string) {
  if (value == null || !Number.isFinite(value)) return `No ${suffix} yet`;
  return `${Math.round(value).toLocaleString()} ${suffix}`;
}

function clock(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function money(value: number | null) {
  if (value == null || !Number.isFinite(value)) return '—';
  const sign = value < 0 ? '-' : '';
  return `${sign}$${Math.abs(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function WeekBars({ values, color }: { values: (number | null)[]; color: string }) {
  const peak = Math.max(...values.map((value) => (value != null && value > 0 ? value : 0)), 1);
  return (
    <View style={styles.bars}>
      {values.map((value, index) => {
        const height = value == null || value <= 0 ? 3 : Math.max(6, Math.round((value / peak) * 52));
        return (
          <View key={`${index}-${value ?? 'empty'}`} style={styles.barCol}>
            <View style={styles.barTrack}>
              <View style={[styles.bar, { height, backgroundColor: value == null ? '#334155' : color }]} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

function Drawer({
  icon,
  title,
  summary,
  open,
  onPress,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  summary: string;
  open: boolean;
  onPress: () => void;
  children: ReactNode;
}) {
  return (
    <View style={styles.drawer}>
      <TouchableOpacity style={styles.head} onPress={onPress} activeOpacity={0.8}>
        <View style={styles.headCopy}>
          <Ionicons name={icon} color="#A5B4FC" size={16} />
          <Text style={styles.drawerTitle}>{title}</Text>
        </View>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} color="#94A3B8" size={18} />
      </TouchableOpacity>
      <Text style={styles.summary}>{summary}</Text>
      {open ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

export default function DomainTelemetryDrawers({
  days,
  steps,
  sleepHours,
  spent,
  balance,
  connected,
  pluggedIn,
  unplugged,
  onLinkBank,
}: Props) {
  const [open, setOpen] = useState<DrawerKey | null>('digital');
  const toggle = (key: DrawerKey) => setOpen((current) => (current === key ? null : key));

  const screenAvg = average(days.map((day) => day.screen));
  const pickupAvg = average(days.map((day) => day.pickups));
  const lateAvg = average(days.map((day) => day.lateNight));
  const daylightAvg = average(days.map((day) => day.daylight));
  const transitAvg = average(days.map((day) => day.transit));
  const headphoneAvg = average(days.map((day) => day.headphones));
  const stabilityAvg = average(days.map((day) => day.stability));
  const lowBatteryAvg = average(days.map((day) => day.lowBattery));
  const loggedDays = days.filter((day) => day.screen != null || day.daylight != null || day.pickups != null).length;

  const digitalSummary = screenAvg == null ? 'No screen log this week' : `${Math.round(screenAvg)} min screen, 7-day avg`;
  const circadianSummary = sleepHours == null ? 'Sleep not synced' : `${sleepHours.toFixed(1)} hrs sleep today`;
  const financeSummary = connected && spent != null ? `${money(spent)} recent spend` : 'Bank not linked';

  return (
    <View style={styles.wrap}>
      <View style={styles.sectionRow}>
        <Ionicons name="trending-up" color="#818CF8" size={14} />
        <Text style={styles.section}>Domain telemetry</Text>
      </View>
      <Drawer
        icon="phone-portrait"
        title="Digital Balance"
        summary={digitalSummary}
        open={open === 'digital'}
        onPress={() => toggle('digital')}
      >
        <Text style={styles.chartLabel}>Screen minutes, last 7 days</Text>
        <WeekBars values={days.map((day) => day.screen)} color="#818CF8" />
        <Text style={styles.line}>{countLabel(screenAvg, 'min average screen')}</Text>
        <Text style={styles.line}>{countLabel(lateAvg, 'min average late night')}</Text>
        <Text style={styles.line}>{countLabel(pickupAvg, 'average pickups')}</Text>
        <Text style={styles.line}>{countLabel(transitAvg, 'min average transit')}</Text>
        <Text style={styles.line}>{countLabel(headphoneAvg, 'min average headphones')}</Text>
        <Text style={styles.line}>
          {stabilityAvg == null ? 'Location stability not logged' : `${stabilityAvg.toFixed(2)} location stability`}
        </Text>
        <Text style={styles.line}>{countLabel(lowBatteryAvg, 'average low-battery events')}</Text>
        <Text style={styles.line}>
          {clock(pluggedIn) || clock(unplugged)
            ? `Charge window ${clock(pluggedIn) || '—'} to ${clock(unplugged) || '—'}`
            : 'Charge window not logged'}
        </Text>
        <Text style={styles.meta}>{loggedDays ? `${loggedDays} of 7 days logged` : 'Daily device logs fill this average.'}</Text>
      </Drawer>
      <Drawer
        icon="moon"
        title="Circadian & Sleep"
        summary={circadianSummary}
        open={open === 'circadian'}
        onPress={() => toggle('circadian')}
      >
        <Text style={styles.chartLabel}>Daylight minutes, last 7 days</Text>
        <WeekBars values={days.map((day) => day.daylight)} color="#34D399" />
        <Text style={styles.line}>{sleepHours == null ? 'Sleep not synced' : `${sleepHours.toFixed(1)} hrs sleep today`}</Text>
        <Text style={styles.line}>{steps == null ? 'Steps not synced' : `${Math.round(steps).toLocaleString()} steps today`}</Text>
        <Text style={styles.line}>{countLabel(daylightAvg, 'min average daylight')}</Text>
        <Text style={styles.meta}>Sleep and steps are today’s HealthKit reading. Daylight uses the stored daily log.</Text>
      </Drawer>
      <Drawer
        icon="wallet"
        title="Financial Velocity"
        summary={financeSummary}
        open={open === 'finance'}
        onPress={() => toggle('finance')}
      >
        {connected ? (
          <>
            <Text style={styles.line}>Recent spend {money(spent)}</Text>
            <Text style={styles.line}>Balance {money(balance)}</Text>
            <Text style={styles.meta}>A 7-day spend average appears when daily spend is stored. Today’s reading is the live bank snapshot.</Text>
          </>
        ) : (
          <>
            <Text style={styles.line}>Link a bank to compare spend with late-night screen time.</Text>
            {onLinkBank ? (
              <TouchableOpacity style={styles.link} onPress={onLinkBank}>
                <Text style={styles.linkText}>Link account</Text>
              </TouchableOpacity>
            ) : null}
          </>
        )}
      </Drawer>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 22 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  section: {
    color: '#94A3B8',
    fontFamily: fonts.semibold,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  drawer: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headCopy: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  drawerTitle: { color: '#F8FAFC', fontFamily: fonts.semibold, fontSize: 16 },
  summary: { color: '#94A3B8', fontFamily: fonts.regular, fontSize: 13, marginTop: 6 },
  body: { marginTop: 12, gap: 6 },
  chartLabel: { color: '#64748B', fontFamily: fonts.medium, fontSize: 12 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 56, marginVertical: 6 },
  barCol: { flex: 1, height: 56, justifyContent: 'flex-end' },
  barTrack: { justifyContent: 'flex-end', height: 56 },
  bar: { borderRadius: 4, width: '100%' },
  line: { color: '#E2E8F0', fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
  meta: { color: '#64748B', fontFamily: fonts.regular, fontSize: 12, lineHeight: 18, marginTop: 4 },
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
