import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppContext } from '../context/AppContext';
import { fonts } from '../constants/theme';

type HealthPayload = {
  steps?: number | null;
  activeCalories?: number | null;
  sleepHours?: number | null;
  sleep?: number | null;
  workouts?: number | null;
  status?: string | null;
} | null;

type PlaidPayload = {
  isConnected?: boolean;
  bankName?: string | null;
  accountBalance?: number | null;
  spent?: number | null;
  transactions?: { id?: string; name?: string; amount?: number; date?: string }[] | null;
} | null;

function finite(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function money(value: number | null) {
  if (value == null) return '—';
  const sign = value < 0 ? '-' : '';
  return `${sign}$${Math.abs(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export default function TrendsScreen() {
  const navigation = useNavigation() as { navigate: (name: 'ForMeLedger') => void };
  const { healthData, plaidData } = useAppContext() as {
    healthData?: HealthPayload;
    plaidData?: PlaidPayload;
  };
  const health = healthData || null;
  const plaid = plaidData || null;
  const steps = finite(health?.steps);
  const sleep = finite(health?.sleepHours ?? health?.sleep);
  const spent = finite(plaid?.spent);
  const transactions = Array.isArray(plaid?.transactions) ? plaid.transactions : [];

  const correlation =
    sleep != null && sleep < 6
      ? `${sleep.toFixed(1)} hrs of sleep lines up with a higher chance of impulse delivery spend.`
      : spent != null && steps != null
        ? `${Math.round(steps).toLocaleString()} steps against ${money(spent)} recent spend. Short movement days are the ones to watch.`
        : 'Sleep is not synced yet, so this correlation is only using steps and spend.';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>Trends</Text>
        <Text style={styles.title}>Cross-domain</Text>
        <Text style={styles.subtitle}>How health and spending move together.</Text>

        <View style={styles.hero}>
          <Text style={styles.heroLabel}>Correlation</Text>
          <Text style={styles.heroBody}>{correlation}</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Steps</Text>
            <Text style={styles.statValue}>{steps == null ? '—' : Math.round(steps).toLocaleString()}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Sleep</Text>
            <Text style={styles.statValue}>{sleep == null ? '—' : `${sleep.toFixed(1)}h`}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Spend</Text>
            <Text style={styles.statValue}>{money(spent)}</Text>
          </View>
        </View>

        <Text style={styles.section}>Spend detail</Text>
        {plaid?.isConnected && transactions.length ? (
          transactions.slice(0, 8).map((row, index) => (
            <View key={row.id || `${row.name}-${index}`} style={styles.tx}>
              <View style={styles.txCopy}>
                <Text style={styles.txName}>{row.name || 'Transaction'}</Text>
                <Text style={styles.txMeta}>{row.date || plaid.bankName || 'Linked account'}</Text>
              </View>
              <Text style={styles.txAmount}>{typeof row.amount === 'number' ? money(row.amount) : '—'}</Text>
            </View>
          ))
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {plaid?.isConnected ? 'No transactions on this payload yet.' : 'Link a bank from Hub to open the spend dive.'}
            </Text>
          </View>
        )}
        {health?.status ? <Text style={styles.meta}>{health.status}</Text> : null}
        <TouchableOpacity style={styles.ledger} onPress={() => navigation.navigate('ForMeLedger')}>
          <Text style={styles.ledgerText}>Open the full ledger</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#020617' },
  scroll: { padding: 20, paddingBottom: 36 },
  kicker: { color: '#818CF8', fontFamily: fonts.semibold, fontSize: 12, letterSpacing: 1.4, textTransform: 'uppercase' },
  title: { color: '#F8FAFC', fontFamily: fonts.bold, fontSize: 28, marginTop: 6 },
  subtitle: { color: '#94A3B8', fontFamily: fonts.regular, fontSize: 14, marginTop: 6, marginBottom: 16 },
  hero: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 20,
    padding: 16,
  },
  heroLabel: { color: '#A5B4FC', fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase' },
  heroBody: { color: '#F8FAFC', fontFamily: fonts.medium, fontSize: 16, lineHeight: 24, marginTop: 8 },
  row: { flexDirection: 'row', gap: 8, marginTop: 12 },
  stat: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 16,
    padding: 12,
  },
  statLabel: { color: '#64748B', fontFamily: fonts.medium, fontSize: 12 },
  statValue: { color: '#F8FAFC', fontFamily: fonts.bold, fontSize: 16, marginTop: 6 },
  section: { color: '#94A3B8', fontFamily: fonts.semibold, fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 22, marginBottom: 10 },
  tx: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  txCopy: { flex: 1 },
  txName: { color: '#F8FAFC', fontFamily: fonts.semibold, fontSize: 14 },
  txMeta: { color: '#64748B', fontFamily: fonts.regular, fontSize: 12, marginTop: 2 },
  txAmount: { color: '#C7D2FE', fontFamily: fonts.semibold, fontSize: 14 },
  empty: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
  },
  emptyText: { color: '#94A3B8', fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
  meta: { color: '#64748B', fontFamily: fonts.regular, fontSize: 12, marginTop: 12 },
  ledger: { marginTop: 16, alignSelf: 'flex-start' },
  ledgerText: { color: '#818CF8', fontFamily: fonts.semibold, fontSize: 14 },
});
