import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { colors, fonts, surfaces, typography } from '../../constants/theme';
import {
  getSelectedMockProfile,
  getUseRealHardwarePreference,
  isUseRealHardwareEnabled,
  setSelectedMockProfile,
  setUseRealHardware,
  subscribeTelemetrySettings,
  type MockTelemetryProfile,
} from '../services/telemetrySettings';

const PROFILES: { id: MockTelemetryProfile; label: string }[] = [
  { id: 'high_stress', label: 'High stress / burnout' },
  { id: 'peak_recovery', label: 'Peak recovery' },
  { id: 'balanced', label: 'Standard day' },
];

export default function DeveloperTelemetryControls() {
  const [hardware, setHardware] = useState(true);
  const [liveActive, setLiveActive] = useState(false);
  const [profile, setProfile] = useState<MockTelemetryProfile>('balanced');

  useEffect(() => {
    let mounted = true;

    async function load() {
      const [preferred, live, selected] = await Promise.all([
        getUseRealHardwarePreference(),
        isUseRealHardwareEnabled(),
        getSelectedMockProfile(),
      ]);
      if (!mounted) {
        return;
      }
      setHardware(preferred);
      setLiveActive(live);
      setProfile(selected);
    }

    load();
    const unsubscribe = subscribeTelemetrySettings(load);
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return (
    <View style={styles.card}>
      <Text style={styles.kicker}>Developer controls</Text>
      <View style={styles.badge}>
        <Text style={[styles.badgeText, { color: liveActive ? colors.emerald : colors.amber }]}>
          {liveActive ? 'Hardware Active' : 'Mock Data Active'}
        </Text>
      </View>
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text style={styles.title}>Use Physical iPhone Telemetry</Text>
          <Text style={styles.hint}>Live HealthKit sleep/HRV and voice when permissions allow.</Text>
        </View>
        <Switch
          value={hardware}
          onValueChange={(value) => {
            setHardware(value);
            setUseRealHardware(value).catch(() => setHardware(!value));
          }}
          trackColor={{ false: '#27272A', true: colors.emerald }}
          thumbColor="#F5F5F5"
          ios_backgroundColor="#27272A"
        />
      </View>
      <Text style={[styles.title, styles.gap]}>Simulate Mock Scenario</Text>
      <Text style={styles.hint}>Used when hardware is off or a live sensor returns nothing.</Text>
      <View style={styles.pills}>
        {PROFILES.map((item) => {
          const on = profile === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => {
                setProfile(item.id);
                setSelectedMockProfile(item.id).catch(() => {});
              }}
              style={[styles.pill, on && styles.pillOn]}
            >
              <Text style={[styles.pillLabel, on && styles.pillLabelOn]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...surfaces.glass,
    marginBottom: 12,
    padding: 16,
  },
  kicker: { ...typography.kicker, marginBottom: 8 },
  badge: {
    ...surfaces.badge,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  badgeText: {
    ...typography.badgeText,
  },
  row: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  copy: { flex: 1 },
  title: { color: colors.heading, fontFamily: fonts.semibold, fontSize: 16, letterSpacing: -0.3 },
  hint: { color: colors.muted, fontFamily: fonts.regular, fontSize: 13, lineHeight: 20, marginTop: 6 },
  gap: { marginTop: 16 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  pill: {
    backgroundColor: colors.input,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pillOn: {
    backgroundColor: colors.amberBg,
    borderColor: colors.amberBorder,
  },
  pillLabel: { color: colors.muted, fontFamily: fonts.medium, fontSize: 12 },
  pillLabelOn: { color: colors.amber },
});
