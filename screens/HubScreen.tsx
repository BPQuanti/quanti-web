import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppContext } from '../context/AppContext';
import { fonts } from '../constants/theme';

type HubNav = {
  navigate: (name: 'Profile' | 'QuantiAI' | 'ForYou') => void;
};

export default function HubScreen() {
  const navigation = useNavigation() as HubNav;
  const { healthData, plaidData, connectPlaid, syncHealth } = useAppContext() as {
    healthData?: { status?: string | null; isMock?: boolean; badge?: string | null } | null;
    plaidData?: { isConnected?: boolean; bankName?: string | null; status?: string | null } | null;
    connectPlaid?: () => Promise<unknown> | void;
    syncHealth?: () => Promise<unknown> | void;
  };
  const health = healthData || null;
  const plaid = plaidData || null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>Hub</Text>
        <Text style={styles.title}>Integrations</Text>
        <Text style={styles.subtitle}>Bank, health, and the rest of the account.</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Plaid</Text>
          <Text style={styles.status}>{plaid?.isConnected ? plaid.bankName || 'Bank linked' : 'Not linked'}</Text>
          <Text style={styles.meta}>{plaid?.status || 'Bank status unavailable'}</Text>
          <TouchableOpacity style={styles.button} onPress={() => { void connectPlaid?.(); }}>
            <Text style={styles.buttonText}>{plaid?.isConnected ? 'Reconnect bank' : 'Link account'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>HealthKit</Text>
          <Text style={styles.status}>{health?.badge || (health?.isMock ? 'Mock data' : 'Health status')}</Text>
          <Text style={styles.meta}>{health?.status || 'Health has not synced yet'}</Text>
          <TouchableOpacity style={styles.button} onPress={() => { void syncHealth?.(); }}>
            <Text style={styles.buttonText}>Sync health</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.section}>App</Text>
        <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.linkText}>Account & privacy</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('QuantiAI')}>
          <Text style={styles.linkText}>Quanti AI</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('ForYou')}>
          <Text style={styles.linkText}>Shared ledger</Text>
          <Text style={styles.chevron}>›</Text>
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
  card: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: { color: '#F8FAFC', fontFamily: fonts.semibold, fontSize: 16 },
  status: { color: '#E2E8F0', fontFamily: fonts.medium, fontSize: 15, marginTop: 8 },
  meta: { color: '#64748B', fontFamily: fonts.regular, fontSize: 13, marginTop: 4 },
  button: {
    alignSelf: 'flex-start',
    marginTop: 12,
    backgroundColor: '#312E81',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  buttonText: { color: '#E0E7FF', fontFamily: fonts.semibold, fontSize: 14 },
  section: { color: '#94A3B8', fontFamily: fonts.semibold, fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 8, marginBottom: 10 },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 8,
  },
  linkText: { color: '#F8FAFC', fontFamily: fonts.semibold, fontSize: 15 },
  chevron: { color: '#64748B', fontSize: 22 },
});
