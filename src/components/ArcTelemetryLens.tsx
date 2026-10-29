import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../../constants/theme';
import type { AgencyArc } from '../services/arcSettings';

export type TelemetryLensKey = 'health' | 'screen' | 'calendar' | 'location' | 'plaid';

type LensChip = {
  key: TelemetryLensKey;
  activeLabel: string;
  connectLabel: string;
};

const LENSES: Record<AgencyArc, LensChip[]> = {
  deep_work: [
    { key: 'health', activeLabel: '⌚ HealthKit', connectLabel: '+ Connect HealthKit' },
    { key: 'screen', activeLabel: '📱 Screen Time', connectLabel: '+ Connect Screen Time' },
    { key: 'calendar', activeLabel: '📅 Calendar', connectLabel: '+ Connect Calendar' },
    { key: 'location', activeLabel: '📍 Location', connectLabel: '+ Connect Location' },
  ],
  recovery: [
    { key: 'health', activeLabel: '⌚ HRV & Sleep', connectLabel: '+ Connect HealthKit' },
    { key: 'screen', activeLabel: '📱 Night Screen Time', connectLabel: '+ Connect Screen Time' },
    { key: 'location', activeLabel: '📍 Ambient Location', connectLabel: '+ Connect Location' },
  ],
  capital: [
    { key: 'health', activeLabel: '⌚ Biometric Energy', connectLabel: '+ Connect HealthKit' },
    { key: 'plaid', activeLabel: '💳 Financial Signals', connectLabel: '+ Connect Plaid' },
    { key: 'calendar', activeLabel: '📅 Calendar', connectLabel: '+ Connect Calendar' },
  ],
  clarity: [
    { key: 'calendar', activeLabel: '📅 Calendar', connectLabel: '+ Connect Calendar' },
    { key: 'screen', activeLabel: '📱 Screen Time', connectLabel: '+ Connect Screen Time' },
    { key: 'health', activeLabel: '⌚ HealthKit', connectLabel: '+ Connect HealthKit' },
  ],
  momentum: [
    { key: 'calendar', activeLabel: '📅 Calendar', connectLabel: '+ Connect Calendar' },
    { key: 'health', activeLabel: '⌚ HealthKit', connectLabel: '+ Connect HealthKit' },
    { key: 'screen', activeLabel: '📱 Screen Time', connectLabel: '+ Connect Screen Time' },
    { key: 'location', activeLabel: '📍 Location', connectLabel: '+ Connect Location' },
  ],
  somatic: [
    { key: 'health', activeLabel: '⌚ HRV & Sleep', connectLabel: '+ Connect HealthKit' },
    { key: 'location', activeLabel: '📍 Ambient Location', connectLabel: '+ Connect Location' },
    { key: 'screen', activeLabel: '📱 Night Screen Time', connectLabel: '+ Connect Screen Time' },
  ],
};

type Props = {
  arc: AgencyArc;
  connected: Partial<Record<TelemetryLensKey, boolean>>;
  onConnect?: (key: TelemetryLensKey) => void;
};

export default function ArcTelemetryLens({ arc, connected, onConnect }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Signals for today’s bias</Text>
      <View style={styles.row}>
        {(LENSES[arc] ?? LENSES.deep_work).map((chip) => {
          const on = Boolean(connected[chip.key]);
          return (
            <Pressable
              key={chip.key}
              disabled={on || !onConnect}
              onPress={() => onConnect?.(chip.key)}
              style={[styles.chip, on ? styles.chipOn : styles.chipOff]}
            >
              {on ? <View style={styles.dot} /> : null}
              <Text style={[styles.chipText, on ? styles.chipTextOn : styles.chipTextOff]}>
                {on ? chip.activeLabel : chip.connectLabel}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: '#262626',
    borderRadius: 28,
    borderWidth: 1,
    marginBottom: 16,
    padding: 20,
  },
  label: {
    color: colors.inactive,
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.4,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipOn: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: colors.emeraldBorder,
  },
  chipOff: {
    backgroundColor: 'transparent',
    borderColor: '#262626',
  },
  chipText: { fontFamily: fonts.medium, fontSize: 12 },
  chipTextOn: { color: colors.heading },
  chipTextOff: { color: colors.inactive },
  dot: {
    backgroundColor: colors.emerald,
    borderRadius: 99,
    height: 6,
    width: 6,
  },
});
