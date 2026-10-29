import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii } from '../../../constants/theme';

type Period = 'weekly' | 'monthly' | 'yearly';

const PERIODS: { id: Period; label: string }[] = [
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
];

const RECAPS: Record<Period, string> = {
  weekly: 'No weekly recap yet. Verified activity fills this in.',
  monthly: 'No monthly recap yet.',
  yearly: 'No yearly recap yet.',
};

export default function ForMeView() {
  const [period, setPeriod] = useState<Period>('weekly');

  return (
    <View style={styles.root}>
      <Text style={styles.kicker}>AI RECAPS</Text>
      <View style={styles.tabs}>
        {PERIODS.map((item) => {
          const active = period === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => setPeriod(item.id)}
              style={[styles.tab, active && styles.tabActive]}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.recap}>
        <Text style={styles.recapText}>{RECAPS[period]}</Text>
      </View>

      <Text style={styles.section}>Active badges</Text>
      <Text style={styles.detail}>Badges show up here after verified activity is saved.</Text>

      <View style={styles.insight}>
        <Text style={styles.insightKicker}>AI SYNTHESIS</Text>
        <Text style={styles.insightBody}>Sleep and spend correlations appear after both signals are synced.</Text>
        <Text style={styles.insightMeta}>HealthKit + Plaid</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { marginTop: 22 },
  kicker: {
    color: colors.glow,
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.6,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#18181B',
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: '#27272A',
    padding: 4,
    marginTop: 12,
    gap: 4,
  },
  tab: {
    flex: 1,
    borderRadius: radii.full,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabActive: {
    backgroundColor: '#7C3AED',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  tabText: { color: colors.muted, fontFamily: fonts.medium, fontSize: 13 },
  tabTextActive: { color: '#FFFFFF', fontFamily: fonts.semibold },
  recap: {
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    backgroundColor: 'rgba(24, 24, 27, 0.85)',
    padding: 14,
  },
  recapText: { color: colors.text, fontFamily: fonts.medium, fontSize: 14, lineHeight: 20 },
  section: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  card: {
    backgroundColor: 'rgba(24, 24, 27, 0.9)',
    borderWidth: 1,
    borderColor: '#27272A',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  cardTitle: { color: colors.text, fontFamily: fonts.semibold, fontSize: 15, flex: 1 },
  percent: { color: colors.glow, fontFamily: fonts.mono, fontSize: 12 },
  track: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#27272A',
    marginTop: 12,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#7C3AED',
  },
  detail: { color: colors.muted, fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, marginTop: 10 },
  insight: {
    marginTop: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.45)',
    backgroundColor: 'rgba(24, 24, 27, 0.92)',
    padding: 16,
    shadowColor: '#7C3AED',
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  insightKicker: { color: colors.glow, fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.2 },
  insightBody: { color: colors.text, fontFamily: fonts.semibold, fontSize: 15, lineHeight: 22, marginTop: 8 },
  insightMeta: { color: colors.muted, fontFamily: fonts.regular, fontSize: 12, marginTop: 8 },
});
