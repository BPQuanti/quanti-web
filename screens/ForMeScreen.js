import { useRef } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ViewShot from 'react-native-view-shot';
import { useAppContext } from '../context/AppContext';
import { LogoFull } from '../components/Logo';
import ForMeView from '../src/components/forme/ForMeView';
import { shareStatCard } from '../utils/shareCard';
import { colors, fonts, glow, radii } from './theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const STAMP_WIDTH = (SCREEN_WIDTH - 52) / 2;

function StampCard({ stamp, shotRef, onShare }) {
  return (
    <View style={styles.stampWrap}>
      <ViewShot
        ref={shotRef}
        options={{ format: 'png', quality: 1, result: 'tmpfile' }}
        collapsable={false}
      >
        <View style={styles.stampCard} collapsable={false}>
          <Text style={styles.stampEmoji}>{stamp.emoji}</Text>
          <Text style={styles.stampTitle}>{stamp.title}</Text>
          {stamp.subtitle ? <Text style={styles.stampSub}>{stamp.subtitle}</Text> : null}
          <View style={styles.stampBadge}>
            <Text style={styles.stampBadgeText}>Verified by Quanti AI</Text>
          </View>
        </View>
      </ViewShot>
      <TouchableOpacity style={styles.stampShare} onPress={onShare} hitSlop={8}>
        <Text style={styles.stampShareText}>Share</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function ForMeScreen() {
  const {
    healthData,
    locationData,
    plaidData,
    stepGoal,
    connectPlaid,
    savedStats,
  } = useAppContext();
  const stampRefs = useRef({});

  const progress = Math.min(healthData.steps / stepGoal, 1);
  const remaining = Math.max(stepGoal - healthData.steps, 0);
  const locationLabel =
    locationData.city && locationData.city !== 'Pending...'
      ? locationData.city
      : 'City pending';
  const coordinateLabel =
    locationData.latitude != null && locationData.longitude != null
      ? `${locationData.latitude.toFixed(4)}, ${locationData.longitude.toFixed(4)}`
      : 'GPS not synced';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <LogoFull width={156} />
        <Text style={styles.title}>Today</Text>
        <Text style={styles.subtitle}>Fitness, finance, recaps, and verified stamps.</Text>

        <ForMeView />

        <Text style={styles.sectionTitle}>Verified Stats Log</Text>
        <Text style={styles.sectionHint}>AI stamps saved from Quanti AI chats.</Text>
        <View style={styles.stampGrid}>
          {savedStats.map((stamp) => (
            <StampCard
              key={stamp.id}
              stamp={stamp}
              shotRef={(node) => {
                stampRefs.current[stamp.id] = node;
              }}
              onShare={() => shareStatCard({ current: stampRefs.current[stamp.id] })}
            />
          ))}
        </View>

        <View style={[styles.card, styles.cardGlow]}>
          <Text style={styles.cardLabel}>Health</Text>
          <View style={styles.healthRow}>
            <View style={styles.ring}>
              <Text style={styles.ringValue}>{Math.round(progress * 100)}%</Text>
              <Text style={styles.ringHint}>of goal</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.metric}>{Math.round(healthData.steps).toLocaleString()} steps</Text>
              {healthData.workouts ? (
                <Text style={styles.muted}>{Number(healthData.workouts).toLocaleString()} workouts</Text>
              ) : null}
              <Text style={styles.muted}>{Math.round(healthData.activeCalories).toLocaleString()} active kcal</Text>
              <Text style={styles.muted}>{remaining.toLocaleString()} to {stepGoal.toLocaleString()}</Text>
            </View>
          </View>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${Math.round(progress * 100)}%` }]} />
          </View>
          <Text style={[styles.tag, healthData.isMock ? styles.tagMock : styles.tagLive]}>
            {healthData.badge || (healthData.isMock ? 'Mock Data (Expo Go)' : 'Live HealthKit Data')}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardLabel}>Location</Text>
            <View style={[styles.badge, locationData.isPermissionGranted ? styles.badgeLive : styles.badgePending]}>
              <Text style={[styles.badgeText, locationData.isPermissionGranted ? styles.liveText : styles.pendingText]}>
                {locationData.isPermissionGranted ? 'Active' : 'Pending'}
              </Text>
            </View>
          </View>
          <Text style={styles.status}>{locationLabel}</Text>
          <Text style={styles.muted}>{coordinateLabel}</Text>
        </View>

        <View style={[styles.card, styles.cardGlow]}>
          <Text style={styles.cardLabel}>Transactions</Text>
          {plaidData.isConnected ? (
            <>
              <Text style={styles.status}>{plaidData.bankName}</Text>
              <Text style={styles.metric}>
                ${Number(plaidData.spent || plaidData.accountBalance || 0).toLocaleString()}
                {plaidData.spent ? ' spent' : ''}
              </Text>
              {plaidData.golfRounds ? (
                <Text style={styles.muted}>{plaidData.golfRounds} golf rounds</Text>
              ) : null}
              <View style={styles.txList}>
                {(plaidData.transactions?.length ? plaidData.transactions : plaidData.accounts || []).map((row) => (
                  <View key={row.id || row.mask || row.name} style={styles.txRow}>
                    <View style={styles.txCopy}>
                      <Text style={styles.txName}>{row.name}</Text>
                      <Text style={styles.txMeta}>
                        {row.date
                          ? row.date
                          : `${row.subtype || row.type || 'Account'}${row.mask ? ` ····${row.mask}` : ''}`}
                      </Text>
                    </View>
                    <Text style={styles.txTag}>
                      {typeof row.amount === 'number'
                        ? `${row.amount < 0 ? '-' : '+'}$${Math.abs(row.amount).toLocaleString()}`
                        : 'Linked'}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <>
              <Text style={styles.status}>No bank linked</Text>
              <Text style={styles.muted}>Connect Plaid to show a sandbox balance on this dashboard.</Text>
              <TouchableOpacity style={styles.button} onPress={connectPlaid}>
                <Text style={styles.buttonText}>Link Account</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 20, paddingBottom: 40 },
  title: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 32,
    fontWeight: '700',
    marginTop: 14,
  },
  subtitle: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 15,
    marginTop: 4,
    marginBottom: 20,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 8,
  },
  sectionHint: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 13,
    marginTop: -4,
    marginBottom: 12,
  },
  periodRow: { gap: 8, paddingBottom: 14 },
  periodChip: {
    backgroundColor: colors.input,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  periodChipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.borderGlow,
  },
  periodChipText: { color: colors.muted, fontFamily: fonts.semibold, fontWeight: '600', fontSize: 13 },
  periodChipTextActive: { color: colors.text },
  recapBlock: { marginBottom: 20 },
  storyCard: {
    width: RECAP_WIDTH,
    minHeight: 320,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderViolet,
    padding: 22,
    ...glow,
  },
  storyBrand: {
    color: colors.glow,
    fontFamily: fonts.semibold,
    fontWeight: '600',
    letterSpacing: 3,
    fontSize: 11,
  },
  storyPeriod: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 10,
  },
  storyRange: { color: colors.muted, fontFamily: fonts.regular, marginTop: 4 },
  storyEmoji: { fontSize: 42, marginTop: 18 },
  storyHeadline: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 26,
    fontWeight: '700',
    marginTop: 12,
    lineHeight: 32,
  },
  percentileBadge: {
    alignSelf: 'flex-start',
    marginTop: 14,
    backgroundColor: colors.accentDeep,
    borderRadius: radii.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.accentSoft,
  },
  percentileText: { color: colors.text, fontFamily: fonts.bold, fontWeight: '700', fontSize: 12 },
  storyMetric: { color: colors.accentSoft, fontFamily: fonts.mono, marginTop: 8, fontWeight: '500' },
  verifiedMark: {
    color: colors.muted,
    marginTop: 18,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  shareSocial: {
    marginTop: 12,
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: 'center',
    ...glow,
  },
  shareSocialText: { color: colors.text, fontFamily: fonts.bold, fontWeight: '700' },
  stampGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  stampWrap: { width: STAMP_WIDTH },
  stampCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: 12,
    minHeight: 160,
  },
  stampEmoji: { fontSize: 28 },
  stampTitle: { color: colors.text, fontFamily: fonts.bold, fontWeight: '700', fontSize: 14, marginTop: 8 },
  stampSub: { color: colors.muted, fontFamily: fonts.regular, fontSize: 12, marginTop: 4 },
  stampBadge: {
    marginTop: 10,
    alignSelf: 'flex-start',
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.borderGlow,
  },
  stampBadgeText: { color: colors.glow, fontFamily: fonts.bold, fontSize: 9, fontWeight: '700' },
  stampShare: { marginTop: 8, alignItems: 'center' },
  stampShareText: { color: colors.accentSoft, fontFamily: fonts.semibold, fontWeight: '600', fontSize: 12 },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: 16,
    marginBottom: 12,
  },
  cardGlow: {
    borderColor: colors.borderViolet,
    ...glow,
  },
  cardLabel: {
    color: colors.muted,
    fontFamily: fonts.semibold,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  healthRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  ring: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 8,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  ringValue: { color: colors.white, fontFamily: fonts.bold, fontSize: 18, fontWeight: '700' },
  ringHint: { color: colors.muted, fontFamily: fonts.regular, fontSize: 11 },
  metric: { color: colors.accentSoft, fontFamily: fonts.mono, fontSize: 20, fontWeight: '500' },
  muted: { color: colors.muted, fontFamily: fonts.regular, fontSize: 14, marginTop: 4 },
  status: { color: colors.white, fontFamily: fonts.bold, fontSize: 20, fontWeight: '700' },
  barTrack: {
    height: 8,
    borderRadius: radii.full,
    backgroundColor: colors.input,
    overflow: 'hidden',
    marginTop: 14,
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: radii.full,
  },
  tag: { fontFamily: fonts.semibold, fontSize: 12, fontWeight: '600', marginTop: 10 },
  tagMock: { color: colors.mock },
  tagLive: { color: colors.accent },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: {
    borderRadius: radii.full,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeLive: { borderColor: colors.accent, backgroundColor: colors.borderGlow },
  badgePending: { borderColor: colors.mock, backgroundColor: 'rgba(251, 191, 36, 0.12)' },
  badgeText: { fontFamily: fonts.semibold, fontSize: 11, fontWeight: '600' },
  liveText: { color: colors.accent },
  pendingText: { color: colors.mock },
  button: {
    marginTop: 14,
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: 'center',
    ...glow,
  },
  buttonText: { color: colors.text, fontFamily: fonts.bold, fontWeight: '700' },
  txList: { marginTop: 12 },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  txCopy: { flex: 1 },
  txName: { color: colors.text, fontFamily: fonts.semibold, fontSize: 15, fontWeight: '600' },
  txMeta: { color: colors.muted, fontFamily: fonts.regular, fontSize: 12, marginTop: 2 },
  txTag: { color: colors.glow, fontFamily: fonts.semibold, fontSize: 12, fontWeight: '600' },
});
