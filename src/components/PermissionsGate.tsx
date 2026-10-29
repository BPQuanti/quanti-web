import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, surfaces, typography } from '../../constants/theme';
import { requestMicrophonePermission } from '../services/audio';
import { requestHealthKitAuthorization } from '../services/healthkit';
import {
  type AllPermissions,
  type PermissionState,
  checkAllPermissions,
  requestNotificationPermission,
  requestPermissionSequence,
} from '../services/permissions';

type RowId = keyof AllPermissions;

const ROWS: { id: RowId; title: string; body: string }[] = [
  { id: 'healthkit', title: 'Apple HealthKit', body: 'Sleep analysis and HRV, read-only on this device.' },
  {
    id: 'microphone',
    title: 'Microphone',
    body: 'Voice processed securely in-memory via encrypted edge transcription with zero data retention.',
  },
  { id: 'notifications', title: 'Local notifications', body: 'Optional directive reminders on this phone.' },
];

const STATE_COPY: Record<PermissionState, string> = {
  granted: 'Granted',
  pending: 'Pending',
  denied: 'Denied',
  unavailable: 'Unavailable',
};

const STATE_COLOR: Record<PermissionState, string> = {
  granted: colors.emerald,
  pending: colors.amber,
  denied: colors.mock,
  unavailable: colors.muted,
};

type Props = {
  onDone?: () => void;
};

export default function PermissionsGate({ onDone }: Props) {
  const [status, setStatus] = useState<AllPermissions | null>(null);
  const [busyId, setBusyId] = useState<RowId | 'all' | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const busy = busyId !== null;

  const refresh = useCallback(async () => {
    try {
      const next = await checkAllPermissions();
      setStatus(next);
    } catch {
      setMessage('Permission status could not be read on this device.');
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function runSequence() {
    setBusyId('all');
    setMessage(null);
    try {
      const mic = await requestMicrophonePermission();
      if (mic.error && !mic.granted) {
        setMessage(mic.error);
      }
      const next = await requestPermissionSequence();
      setStatus(next);
    } catch {
      setMessage('The permission sequence stopped before all prompts finished.');
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function requestOne(id: RowId) {
    setBusyId(id);
    setMessage(null);
    try {
      if (id === 'healthkit') {
        await requestHealthKitAuthorization();
      } else if (id === 'microphone') {
        const mic = await requestMicrophonePermission();
        if (!mic.granted) {
          setMessage(mic.error ?? 'Microphone was not granted. If no iOS dialog appeared, rebuild the development client.');
        }
      } else if (id === 'notifications') {
        await requestNotificationPermission();
      }
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'That permission prompt could not be completed.');
    } finally {
      setBusyId(null);
    }
  }

  async function openSettings() {
    try {
      await Linking.openSettings();
    } catch {
      setMessage('Open Settings on this iPhone to change Health, Microphone, or Notifications.');
    }
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.kicker}>Hardware handshake</Text>
      <Text style={styles.title}>Allow the signals this device can use.</Text>
      <Text style={styles.body}>
        Tap Allow to show the iOS permission prompt. Microphone will not appear in this app’s Settings page until that prompt has run once.
      </Text>

      {!status ? (
        <ActivityIndicator color={colors.accent} style={styles.spinner} />
      ) : (
        ROWS.map((row) => {
          const item = status[row.id];
          const state = item.state;
          return (
            <View key={row.id} style={styles.row}>
              <View style={styles.copy}>
                <Text style={styles.rowTitle}>{row.title}</Text>
                <Text style={styles.rowBody}>{row.body}</Text>
                {item.detail ? <Text style={styles.detail}>{item.detail}</Text> : null}
              </View>
              <View style={styles.actions}>
                <View style={[styles.badge, { borderColor: STATE_COLOR[state] }]}>
                  <Text style={[styles.badgeText, { color: STATE_COLOR[state] }]}>{STATE_COPY[state]}</Text>
                </View>
                {state !== 'granted' ? (
                  <Pressable disabled={busy} onPress={() => requestOne(row.id)} style={styles.miniButton}>
                    <Text style={styles.miniLabel}>Allow</Text>
                  </Pressable>
                ) : null}
                {state === 'denied' ? (
                  <Pressable onPress={openSettings} style={styles.miniButton}>
                    <Text style={styles.miniLabel}>Settings</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          );
        })
      )}

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <Pressable disabled={busy} onPress={runSequence} style={styles.primary}>
        <Text style={styles.primaryLabel}>{busy ? 'Requesting…' : 'Request all permissions'}</Text>
      </Pressable>
      <Pressable disabled={busy} onPress={openSettings} style={styles.secondary}>
        <Text style={styles.secondaryLabel}>Open iOS Settings</Text>
      </Pressable>
      {onDone ? (
        <Pressable disabled={busy} onPress={onDone} style={styles.skip}>
          <Text style={styles.skipLabel}>Continue</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...surfaces.glass,
    gap: 12,
    padding: 16,
  },
  kicker: typography.kicker,
  title: {
    ...typography.heading,
    fontSize: 22,
  },
  body: typography.body,
  spinner: { marginVertical: 16 },
  row: {
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  copy: { flex: 1, gap: 4 },
  rowTitle: {
    color: colors.heading,
    fontFamily: fonts.semibold,
    fontSize: 15,
  },
  rowBody: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  detail: {
    color: colors.inactive,
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  actions: { alignItems: 'flex-end', gap: 8 },
  badge: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  miniButton: {
    backgroundColor: colors.input,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  miniLabel: {
    color: colors.heading,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  message: {
    color: colors.amber,
    fontFamily: fonts.regular,
    fontSize: 13,
  },
  primary: {
    ...surfaces.button,
    minHeight: 48,
    paddingHorizontal: 16,
  },
  primaryLabel: {
    color: colors.white,
    fontFamily: fonts.semibold,
    fontSize: 15,
  },
  secondary: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  secondaryLabel: {
    color: colors.accentSoft,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  skip: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  skipLabel: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 13,
  },
});
