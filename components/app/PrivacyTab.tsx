import { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { colors, fonts, surfaces, typography } from '../../constants/theme';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import DeleteAccountModal from '../../src/features/settings/DeleteAccountModal';
import DeveloperTelemetryControls from '../../src/components/DeveloperTelemetryControls';
import PermissionsGate from '../../src/components/PermissionsGate';
import EditProfileModal from '../EditProfileModal';
import PrivacyWhyModal from '../../src/components/PrivacyWhyModal';
import { isInternalToolsAccount } from '../../src/lib/config/reviewMode';
import { resetOnboardingProgress } from '../../src/services/onboarding';
import { hasGivenAIConsent, setAIConsent } from '../../src/services/privacyConsent';
import ObsidianScreen from './ObsidianScreen';

const PRIVACY_URL = 'https://quanti-app.com/privacy';
const TERMS_URL = 'https://quanti-app.com/terms';
const PERM_KEY = '@quanti_permission_prefs';

type DomainId = 'health' | 'calendar' | 'plaid' | 'voice' | 'location';

type Perms = Record<DomainId, boolean>;

const DEFAULT_PERMS: Perms = {
  health: true,
  calendar: true,
  plaid: false,
  voice: true,
  location: false,
};

const DOMAINS: {
  id: DomainId;
  title: string;
  line: string;
  detail: string;
}[] = [
  {
    id: 'health',
    title: 'HealthKit',
    line: 'Sleep & HRV · on-device',
    detail: 'Read-only recovery context. Samples stay on this phone; Quanti uses summaries, not a health timeline.',
  },
  {
    id: 'calendar',
    title: 'Calendar & screens',
    line: 'Load, not event titles',
    detail: 'Density and late-night use, parsed locally. Titles and contacts are not uploaded.',
  },
  {
    id: 'plaid',
    title: 'Bank (Plaid)',
    line: 'Optional · read-only',
    detail: 'Impulse-spend patterns only. Quanti cannot move money or see login credentials.',
  },
  {
    id: 'voice',
    title: 'Microphone',
    line: 'Spoken context · not stored',
    detail: 'Audio goes to Whisper for a transcript, then the file is discarded. Raw voice is not kept.',
  },
  {
    id: 'location',
    title: 'Place',
    line: 'Home / travel · no GPS log',
    detail: 'Coarse place category on-device. Coordinates are not stored or sent.',
  },
];

async function openLegal(url: string) {
  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert('Link unavailable', 'Open quanti-app.com in a browser to read this document.');
      return;
    }
    await Linking.openURL(url);
  } catch {
    Alert.alert('Link unavailable', 'Open quanti-app.com in a browser to read this document.');
  }
}

export default function PrivacyTab() {
  const { resetAppData, userProfile, updateUserProfile } = useAppContext();
  const { session, signOut } = useAuth();
  const [perms, setPerms] = useState<Perms>(DEFAULT_PERMS);
  const [openId, setOpenId] = useState<DomainId | 'ai' | 'ios' | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);
  const [aiConsent, setAiConsent] = useState(false);
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const build = Constants.expoConfig?.ios?.buildNumber ?? '1';

  useEffect(() => {
    let mounted = true;
    hasGivenAIConsent().then((granted) => {
      if (mounted) {
        setAiConsent(granted);
      }
    });
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(PERM_KEY);
        if (!mounted || !raw) {
          return;
        }
        const saved = JSON.parse(raw) as Partial<Perms> & { screen?: boolean };
        setPerms({
          health: saved.health !== false,
          calendar: saved.calendar !== false && saved.screen !== false,
          plaid: saved.plaid === true,
          voice: saved.voice !== false,
          location: saved.location === true,
        });
      } catch {
        if (mounted) {
          setPerms(DEFAULT_PERMS);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function persistPerms(next: Perms) {
    setPerms(next);
    try {
      await AsyncStorage.setItem(PERM_KEY, JSON.stringify(next));
    } catch {
      Alert.alert('Not saved', 'The preference could not be stored on this device.');
    }
  }

  function setPerm(key: DomainId, value: boolean) {
    if (value && key === 'plaid') {
      Alert.alert(
        'Plaid preview',
        'Read-only. Quanti cannot move money or see bank credentials.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Enable', onPress: () => persistPerms({ ...perms, plaid: true }) },
        ],
      );
      return;
    }
    if (value && key === 'location') {
      Alert.alert(
        'Place stays on-device',
        'Only coarse home / travel / desk context. Precise GPS is not stored.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Enable', onPress: () => persistPerms({ ...perms, location: true }) },
        ],
      );
      return;
    }
    persistPerms({ ...perms, [key]: value });
  }

  function wipeLocalCache() {
    Alert.alert('Wipe local cache?', 'Clears embeddings and logs on this iPhone. iOS permissions stay as they are.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Wipe',
        style: 'destructive',
        onPress: async () => {
          const cleared: Perms = {
            health: false,
            calendar: false,
            plaid: false,
            voice: false,
            location: false,
          };
          await resetAppData();
          setPerms(cleared);
          try {
            await AsyncStorage.setItem(PERM_KEY, JSON.stringify(cleared));
          } catch {
            // Cache wipe already cleared stored app data.
          }
          Alert.alert('Memory reset', 'Local cache on this device was erased.');
        },
      },
    ]);
  }

  return (
    <ObsidianScreen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.privacyHead}>
          <Text style={styles.kicker}>Privacy</Text>
          <Pressable onPress={() => setWhyOpen(true)} style={styles.whyChip}>
            <Text style={styles.whyChipText}>How data is used</Text>
          </Pressable>
        </View>
        <Text style={styles.title}>Signals</Text>

        {isInternalToolsAccount(session?.user) ? <DeveloperTelemetryControls /> : null}

        <View style={styles.group}>
          {DOMAINS.map((domain, index) => {
            const on = perms[domain.id];
            const expanded = openId === domain.id;
            return (
              <View key={domain.id} style={[styles.row, index > 0 && styles.rowDivider]}>
                <Pressable
                  style={styles.rowHit}
                  onPress={() => setOpenId(expanded ? null : domain.id)}
                >
                  <Text style={styles.rowTitle}>{domain.title}</Text>
                  <Text style={styles.rowLine}>{domain.line}</Text>
                  {expanded ? <Text style={styles.rowDetail}>{domain.detail}</Text> : null}
                </Pressable>
                <Switch
                  value={on}
                  onValueChange={(value) => setPerm(domain.id, value)}
                  trackColor={{ false: '#27272A', true: colors.emerald }}
                  thumbColor="#F5F5F5"
                  ios_backgroundColor="#27272A"
                />
              </View>
            );
          })}
        </View>

        <View style={styles.group}>
          <View style={styles.row}>
            <Pressable style={styles.rowHit} onPress={() => setOpenId(openId === 'ai' ? null : 'ai')}>
              <Text style={styles.rowTitle}>AI synthesis</Text>
              <Text style={styles.rowLine}>{aiConsent ? 'Anonymized summary on' : 'Local rule only'}</Text>
              {openId === 'ai' ? (
                <Text style={styles.rowDetail}>
                  Off = on-device rule. On = one anonymized payload to the model, not kept for training.
                </Text>
              ) : null}
            </Pressable>
            <Switch
              value={aiConsent}
              onValueChange={(value) => {
                setAIConsent(value)
                  .then(() => setAiConsent(value))
                  .catch(() => {
                    setAiConsent(false);
                  });
              }}
              trackColor={{ false: '#27272A', true: colors.emerald }}
              thumbColor="#F5F5F5"
              ios_backgroundColor="#27272A"
            />
          </View>
        </View>

        <Pressable style={styles.iosToggle} onPress={() => setOpenId(openId === 'ios' ? null : 'ios')}>
          <Text style={styles.iosLabel}>iOS permission prompts</Text>
          <Text style={styles.iosCaret}>{openId === 'ios' ? 'Hide' : 'Show'}</Text>
        </Pressable>
        {openId === 'ios' ? (
          <View style={styles.iosWrap}>
            <PermissionsGate />
          </View>
        ) : null}

        <Text style={styles.section}>Account</Text>
        <View style={styles.group}>
          <Pressable
            style={({ pressed }) => [styles.accountRow, pressed && styles.rowPressed]}
            onPress={() => setEditProfileOpen(true)}
          >
            <Text style={styles.rowTitle}>Profile</Text>
            <Text style={styles.accountMeta}>{userProfile?.name || 'Name & photo'}</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.accountRow, styles.rowDivider, pressed && styles.rowPressed]}
            onPress={() => openLegal(PRIVACY_URL)}
          >
            <Text style={styles.rowTitle}>Privacy Policy</Text>
            <Text style={styles.accountMeta}>quanti-app.com</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.accountRow, styles.rowDivider, pressed && styles.rowPressed]}
            onPress={() => openLegal(TERMS_URL)}
          >
            <Text style={styles.rowTitle}>Terms</Text>
            <Text style={styles.accountMeta}>quanti-app.com</Text>
          </Pressable>
          {session?.access_token ? (
            <Pressable
              style={({ pressed }) => [styles.accountRow, styles.rowDivider, pressed && styles.rowPressed]}
              onPress={() => {
                Alert.alert('Replay onboarding?', 'Stay signed in. The first-run wizard starts again.', [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Replay',
                    onPress: () => {
                      resetOnboardingProgress().catch((caught) => {
                        Alert.alert(
                          'Could not reset onboarding',
                          caught instanceof Error ? caught.message : 'Try again.',
                        );
                      });
                    },
                  },
                ]);
              }}
            >
              <Text style={styles.rowTitle}>Replay onboarding</Text>
            </Pressable>
          ) : null}
          <Pressable
            style={({ pressed }) => [styles.accountRow, styles.rowDivider, pressed && styles.rowPressed]}
            onPress={wipeLocalCache}
          >
            <Text style={styles.rowTitle}>Wipe local cache</Text>
          </Pressable>
          {session?.access_token ? (
            <Pressable
              style={({ pressed }) => [styles.accountRow, styles.rowDivider, pressed && styles.rowPressed]}
              onPress={() => setDeleteOpen(true)}
            >
              <Text style={[styles.rowTitle, styles.danger]}>Delete account</Text>
            </Pressable>
          ) : null}
          <Pressable
            style={({ pressed }) => [styles.accountRow, styles.rowDivider, pressed && styles.rowPressed]}
            onPress={() => {
              signOut().catch(() => {
                Alert.alert('Still signed in', 'Try again, or close and reopen Quanti.');
              });
            }}
          >
            <Text style={styles.rowTitle}>Sign out</Text>
          </Pressable>
        </View>

        <Text style={styles.version}>
          Quanti v{version} (Build {build})
        </Text>
      </ScrollView>
      <PrivacyWhyModal visible={whyOpen} onClose={() => setWhyOpen(false)} />
      <EditProfileModal
        visible={editProfileOpen}
        profile={userProfile}
        onClose={() => setEditProfileOpen(false)}
        onSave={(next) => {
          updateUserProfile(next);
          setEditProfileOpen(false);
        }}
      />
      <DeleteAccountModal
        visible={deleteOpen}
        accessToken={session?.access_token}
        onClose={() => setDeleteOpen(false)}
        onDeleted={(result) => {
          setDeleteOpen(false);
          Alert.alert(
            result?.success ? 'Account deleted' : 'Local data cleared',
            result?.message || 'The request finished.',
          );
          signOut().catch(() => {});
        }}
      />
    </ObsidianScreen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 32, paddingHorizontal: 20, paddingTop: 16 },
  privacyHead: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  whyChip: {
    borderColor: colors.indigoBorder,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  whyChipText: {
    color: colors.indigo,
    fontFamily: fonts.semibold,
    fontSize: 12,
  },
  kicker: typography.kicker,
  title: { ...typography.heading, fontSize: 28, marginBottom: 16, marginTop: 8 },
  section: {
    ...typography.kicker,
    marginBottom: 10,
    marginTop: 22,
  },
  group: {
    ...surfaces.glass,
    overflow: 'hidden',
    paddingVertical: 4,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  rowDivider: {
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  rowHit: { flex: 1 },
  rowTitle: { color: colors.heading, fontFamily: fonts.semibold, fontSize: 16, letterSpacing: -0.3 },
  rowLine: { color: colors.muted, fontFamily: fonts.regular, fontSize: 13, marginTop: 3 },
  rowDetail: { color: colors.inactive, fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, marginTop: 8 },
  iosToggle: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingVertical: 8,
  },
  iosLabel: { color: colors.muted, fontFamily: fonts.medium, fontSize: 13 },
  iosCaret: { color: colors.indigo, fontFamily: fonts.medium, fontSize: 13 },
  iosWrap: { marginTop: 4 },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowPressed: { backgroundColor: 'rgba(255,255,255,0.04)' },
  accountMeta: { color: colors.muted, fontFamily: fonts.regular, fontSize: 14, marginLeft: 12 },
  danger: { color: '#FCA5A5' },
  version: {
    ...typography.badgeText,
    marginTop: 18,
    textAlign: 'center',
  },
});
