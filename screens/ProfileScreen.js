import { useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { deleteAccount } from '../lib/accountDeletion';
import { IS_APP_REVIEW_DEMO } from '../lib/config/demoMode';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import EditProfileModal from '../components/EditProfileModal';
import { LogoFull } from '../components/Logo';

import { colors, fonts, glow, radii } from './theme';

const BG = colors.bg;
const SURFACE = colors.card;
const DIVIDER = colors.border;
const MUTED = colors.muted;
const WHITE = colors.text;
const ACCENT = colors.accent;
const TILE = (Dimensions.get('window').width - 2) / 3;

const SHARED_POSTS = [
  { id: 'p1', title: 'Top 12% Walker', metric: 'Daily steps', tag: 'VERIFIED' },
  { id: 'p2', title: 'Top 1% Coffee', metric: '4.2 cups/day', tag: 'NOTARIZED' },
  { id: 'p3', title: '42 Golf Rounds', metric: '2026 YTD', tag: 'RECAP' },
  { id: 'p4', title: 'Top 5% Fairways', metric: '78% accuracy', tag: 'VERIFIED' },
  { id: 'p5', title: 'Deep Work', metric: '6.5 hrs/day', tag: 'BADGE' },
  { id: 'p6', title: 'Weekly Focus', metric: '28 hrs locked in', tag: 'RECAP' },
];

const SAVED_RECAPS = [
  { id: 's1', title: 'September Recap', metric: '124 cups', tag: 'SAVED' },
  { id: 's2', title: 'YTD Fitness', metric: '214 active days', tag: 'MILESTONE' },
  { id: 's3', title: 'Trail Streak', metric: '12 outdoor days', tag: 'SAVED' },
];

const TIERS = [
  { id: 'free', name: 'Free', price: '$0' },
  { id: 'pro', name: 'Quanti Pro', price: '$9.99' },
  { id: 'platinum', name: 'Platinum', price: '$19.99' },
];

export default function ProfileScreen() {
  const {
    healthData,
    locationData,
    plaidData,
    syncHealth,
    syncLocation,
    connectPlaid,
    setHealthMock,
    reviewDemoEnabled,
    setReviewDemo,
    userProfile,
    updateUserProfile,
    fetchUserProfile,
    resetAppData,
  } = useAppContext();
  const { signOut, user, session } = useAuth();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [contentTab, setContentTab] = useState('grid');
  const [tier, setTier] = useState('pro');
  const [refreshing, setRefreshing] = useState(false);

  const usingMock = Boolean(healthData.isMock);
  const sourceBadge = healthData.badge || (usingMock ? 'Mock Data (Expo Go)' : 'Live HealthKit Data');
  const locationText =
    locationData.latitude != null && locationData.longitude != null
      ? `${locationData.city} · ${locationData.latitude.toFixed(4)}, ${locationData.longitude.toFixed(4)}`
      : locationData.city;

  const metricBadges = useMemo(
    () => [
      { label: 'Top 12% Walker', value: `${Math.round(healthData.steps).toLocaleString()} steps` },
      { label: 'Top 1% Coffee', value: '4.2 cups' },
      { label: '42 Golf Rounds', value: '2026 YTD' },
    ],
    [healthData.steps]
  );

  const feed = contentTab === 'grid' ? SHARED_POSTS : SAVED_RECAPS;

  const onRefreshProfile = async () => {
    setRefreshing(true);
    try {
      await fetchUserProfile();
    } finally {
      setRefreshing(false);
    }
  };

  const shareProfile = async () => {
    try {
      await Share.share({
        message: `Verified by Quanti — @${userProfile.username} | ${userProfile.name}`,
      });
    } catch (error) {
      Alert.alert('Share failed', error?.message ? String(error.message) : 'Unable to share profile.');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <LogoFull width={140} />
        <TouchableOpacity onPress={() => setSettingsOpen(true)} hitSlop={12} accessibilityLabel="Settings & Activity">
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefreshProfile}
            tintColor={ACCENT}
            colors={[ACCENT]}
          />
        }
      >
        <View style={styles.headerRow}>
          <View style={styles.avatarRing}>
            {userProfile.avatarUri ? (
              <Image source={{ uri: userProfile.avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {String(userProfile.name || 'Q')
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0]?.toUpperCase())
                    .join('') || 'Q'}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.metricsRow}>
            {metricBadges.map((badge) => (
              <View key={badge.label} style={styles.metricCell}>
                <Text style={styles.metricLabel}>{badge.label}</Text>
                <Text style={styles.metricValue}>{badge.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.bioBlock}>
          <Text style={styles.handle}>@{userProfile.username}</Text>
          <Text style={styles.displayName}>{userProfile.name}</Text>
          <Text style={styles.bio}>{userProfile.bio}</Text>
          <Text style={styles.link}>quanti.app/{userProfile.username}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setEditOpen(true)}>
            <Text style={styles.actionText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={shareProfile}>
            <Text style={styles.actionText}>Share Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profileTabs}>
          <TouchableOpacity style={styles.profileTab} onPress={() => setContentTab('grid')}>
            <Text style={[styles.tabIcon, contentTab === 'grid' && styles.tabIconActive]}>▦</Text>
            {contentTab === 'grid' ? <View style={styles.tabUnderline} /> : <View style={styles.tabSpacer} />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileTab} onPress={() => setContentTab('saved')}>
            <Text style={[styles.tabIcon, contentTab === 'saved' && styles.tabIconActive]}>🔖</Text>
            {contentTab === 'saved' ? <View style={styles.tabUnderline} /> : <View style={styles.tabSpacer} />}
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          {feed.map((item) => (
            <View key={item.id} style={styles.tile}>
              <Text style={styles.tileTag}>{item.tag}</Text>
              <Text style={styles.tileTitle}>{item.title}</Text>
              <Text style={styles.tileMetric}>{item.metric}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={settingsOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setSettingsOpen(false)}
      >
        <Pressable style={styles.sheetOverlay} onPress={() => setSettingsOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Settings & Activity</Text>
              <TouchableOpacity onPress={() => setSettingsOpen(false)}>
                <Text style={styles.menuIcon}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetBody}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardLabel}>Apple HealthKit Sync</Text>
                  <Text style={styles.chip}>{sourceBadge}</Text>
                </View>
                <Text style={styles.status}>{healthData.status}</Text>
                <Text style={styles.accent}>{Math.round(healthData.steps).toLocaleString()} steps</Text>
                <Text style={styles.muted}>{Math.round(healthData.activeCalories).toLocaleString()} kcal</Text>
                <View style={styles.toggleRow}>
                  <Text style={styles.muted}>Mock data (Expo Go)</Text>
                  <Switch
                    value={usingMock}
                    onValueChange={(value) => {
                      setHealthMock(value);
                      if (!value) {
                        syncHealth();
                      }
                    }}
                    trackColor={{ false: '#333', true: ACCENT }}
                    thumbColor={WHITE}
                  />
                </View>
                <TouchableOpacity style={styles.primaryBtn} onPress={syncHealth}>
                  <Text style={styles.primaryBtnText}>Sync HealthKit</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardLabel}>Location Services</Text>
                <Text style={styles.status}>{locationText}</Text>
                <Text style={styles.muted}>
                  {locationData.isPermissionGranted ? 'GPS permission granted' : 'Permission needed'}
                </Text>
                {locationData.error ? <Text style={styles.error}>{locationData.error}</Text> : null}
                <TouchableOpacity style={styles.primaryBtn} onPress={syncLocation}>
                  <Text style={styles.primaryBtnText}>Request location</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardLabel}>Plaid Bank Connection</Text>
                <Text style={styles.status}>{plaidData.status}</Text>
                {plaidData.isConnected ? (
                  <Text style={styles.accent}>
                    {plaidData.bankName} · ${Number(plaidData.accountBalance).toLocaleString()}
                  </Text>
                ) : (
                  <Text style={styles.muted}>Sandbox connection available in Expo Go.</Text>
                )}
                <TouchableOpacity style={styles.primaryBtn} onPress={connectPlaid}>
                  <Text style={styles.primaryBtnText}>
                    {plaidData.isConnected ? 'Reconnect sandbox' : 'Connect sandbox bank'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardLabel}>App Review demo</Text>
                <Text style={styles.muted}>
                  Simulated bank transactions and HealthKit metrics for reviewers. No live bank or Health login.
                </Text>
                <View style={styles.toggleRow}>
                  <Text style={styles.muted}>Show demo data</Text>
                  <Switch
                    value={Boolean(reviewDemoEnabled)}
                    disabled={IS_APP_REVIEW_DEMO}
                    onValueChange={setReviewDemo}
                    trackColor={{ false: '#333', true: ACCENT }}
                    thumbColor={WHITE}
                  />
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardLabel}>Subscription tier</Text>
                {TIERS.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.tierRow, tier === item.id && styles.tierRowActive]}
                    onPress={() => setTier(item.id)}
                  >
                    <Text style={styles.tierName}>{item.name}</Text>
                    <Text style={styles.tierPrice}>{item.price}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.resetBtn}
                onPress={() => {
                  Alert.alert(
                    'Delete account',
                    'This revokes your bank connection, deletes chat and profile data, and removes the login. This cannot be undone.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete account',
                        style: 'destructive',
                        onPress: async () => {
                          try {
                            const result = await deleteAccount(session?.access_token);
                            setSettingsOpen(false);
                            await resetAppData();
                            await signOut();
                            if (result?.success) {
                              Alert.alert('Account deleted', result.message);
                            } else {
                              Alert.alert('On-device data cleared', result?.message || 'Cloud account was not deleted.');
                            }
                          } catch (error) {
                            Alert.alert(
                              'Deletion failed',
                              error?.message ? String(error.message) : 'Account deletion failed.',
                            );
                          }
                        },
                      },
                    ],
                  );
                }}
              >
                <Text style={styles.resetBtnText}>Delete account</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resetBtn}
                onPress={() => {
                  Alert.alert('Sign out', 'You will need to sign in again to sync cloud data.', [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Sign out',
                      style: 'destructive',
                      onPress: async () => {
                        setSettingsOpen(false);
                        await signOut();
                      },
                    },
                  ]);
                }}
              >
                <Text style={styles.resetBtnText}>Sign out{user?.email ? ` (${user.email})` : ''}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resetBtn}
                onPress={() => {
                  Alert.alert(
                    'Reset App Data',
                    'This clears saved profile, health, location, and Plaid data on this device.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Restore defaults',
                        style: 'destructive',
                        onPress: async () => {
                          await resetAppData();
                          setSettingsOpen(false);
                        },
                      },
                    ]
                  );
                }}
              >
                <Text style={styles.resetBtnText}>Reset App Data / Restore Defaults</Text>
              </TouchableOpacity>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
      <EditProfileModal
        visible={editOpen}
        profile={userProfile}
        onClose={() => setEditOpen(false)}
        onSave={updateUserProfile}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER,
    backgroundColor: colors.bg,
  },
  handle: { color: WHITE, fontFamily: fonts.bold, fontSize: 18, fontWeight: '700' },
  menuIcon: { color: colors.accentSoft, fontSize: 26, lineHeight: 28 },
  tabIcon: { color: MUTED, fontSize: 20, lineHeight: 22 },
  tabIconActive: { color: colors.glow },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },
  avatarRing: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 2,
    borderColor: colors.borderViolet,
    ...glow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 82,
    height: 82,
    borderRadius: 41,
  },
  avatarText: { color: WHITE, fontSize: 24, fontWeight: '700' },
  metricsRow: { flex: 1, flexDirection: 'row' },
  metricCell: { flex: 1, alignItems: 'center' },
  metricLabel: { color: WHITE, fontFamily: fonts.semibold, fontSize: 11, fontWeight: '600', textAlign: 'center' },
  metricValue: { color: colors.accentSoft, fontFamily: fonts.mono, fontSize: 11, marginTop: 4, textAlign: 'center' },
  bioBlock: { paddingHorizontal: 16, paddingTop: 12 },
  displayName: { color: WHITE, fontFamily: fonts.semibold, fontSize: 14, fontWeight: '600', marginTop: 2 },
  bio: { color: WHITE, fontFamily: fonts.regular, fontSize: 14, marginTop: 4, lineHeight: 20 },
  link: { color: colors.glow, fontFamily: fonts.medium, fontSize: 14, marginTop: 4 },
  actions: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    paddingVertical: 12,
    alignItems: 'center',
    ...glow,
  },
  actionText: { color: WHITE, fontFamily: fonts.bold, fontWeight: '700', fontSize: 13 },
  profileTabs: {
    flexDirection: 'row',
    marginTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: DIVIDER,
  },
  profileTab: { flex: 1, alignItems: 'center', paddingTop: 10 },
  tabUnderline: {
    marginTop: 8,
    height: 1.5,
    width: '100%',
    backgroundColor: colors.glow,
  },
  tabSpacer: { marginTop: 8, height: 1.5, width: '100%' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  tile: {
    width: TILE,
    height: TILE,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
    justifyContent: 'flex-end',
  },
  tileTag: { color: colors.glow, fontFamily: fonts.semibold, fontSize: 9, fontWeight: '600', letterSpacing: 0.6 },
  tileTitle: { color: WHITE, fontFamily: fonts.semibold, fontSize: 13, fontWeight: '600', marginTop: 4 },
  tileMetric: { color: colors.accentSoft, fontFamily: fonts.mono, fontSize: 11, marginTop: 2 },
  sheetOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderColor: colors.borderViolet,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: '88%',
    paddingBottom: 20,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.inactive,
    marginTop: 8,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: DIVIDER,
  },
  sheetTitle: { color: WHITE, fontFamily: fonts.bold, fontSize: 16, fontWeight: '700' },
  sheetBody: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.borderViolet,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 6 },
  cardLabel: { color: MUTED, fontFamily: fonts.semibold, fontSize: 11, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase', flex: 1 },
  chip: { color: colors.glow, fontFamily: fonts.semibold, fontSize: 11, fontWeight: '600' },
  status: { color: WHITE, fontFamily: fonts.bold, fontSize: 16, fontWeight: '700' },
  accent: { color: colors.accentSoft, fontFamily: fonts.mono, fontSize: 14, fontWeight: '500', marginTop: 4 },
  muted: { color: MUTED, fontFamily: fonts.regular, fontSize: 13, marginTop: 4 },
  error: { color: '#FCA5A5', fontSize: 12, marginTop: 6 },
  toggleRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  primaryBtn: {
    marginTop: 12,
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: 'center',
    ...glow,
  },
  primaryBtnText: { color: colors.text, fontFamily: fonts.bold, fontWeight: '700' },
  tierRow: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: DIVIDER,
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tierRowActive: { borderColor: colors.accent, backgroundColor: colors.borderGlow },
  tierName: { color: WHITE, fontFamily: fonts.semibold, fontWeight: '600' },
  tierPrice: { color: colors.accentSoft, fontFamily: fonts.mono, fontWeight: '500' },
  resetBtn: {
    marginTop: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#7F1D1D',
    backgroundColor: 'rgba(127, 29, 29, 0.25)',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  resetBtnText: { color: '#FCA5A5', fontFamily: fonts.semibold, fontWeight: '600' },
});
