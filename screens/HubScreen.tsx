import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { fonts } from '../constants/theme';
import CommonQuestions from '../src/components/CommonQuestions';
import DeleteAccountModal from '../src/features/settings/DeleteAccountModal';

type HubNav = {
  navigate: (name: 'Privacy' | 'Terms') => void;
};

export default function HubScreen() {
  const navigation = useNavigation() as HubNav;
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { session, signOut } = useAuth() as {
    session?: { access_token?: string } | null;
    signOut?: () => Promise<unknown>;
  };
  const { healthData, plaidData, connectPlaid, syncHealth, resetAppData, reviewDemoEnabled, setReviewDemo } = useAppContext() as {
    healthData?: { status?: string | null; isMock?: boolean; badge?: string | null } | null;
    plaidData?: { isConnected?: boolean; bankName?: string | null; status?: string | null } | null;
    connectPlaid?: () => Promise<unknown> | void;
    syncHealth?: () => Promise<unknown> | void;
    resetAppData?: () => Promise<unknown>;
    reviewDemoEnabled?: boolean;
    setReviewDemo?: (enabled: boolean) => void;
  };
  const health = healthData || null;
  const plaid = plaidData || null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>Hub</Text>
        <Text style={styles.title}>Integrations</Text>
        <Text style={styles.subtitle}>How it works, then bank and health.</Text>
        <CommonQuestions />

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Review demo data</Text>
          <Text style={styles.meta}>Sample numbers. Not a live login.</Text>
          <View style={styles.toggleRow}>
            <Text style={styles.status}>{reviewDemoEnabled ? 'Demo data on' : 'Demo data off'}</Text>
            <Switch
              value={Boolean(reviewDemoEnabled)}
              onValueChange={(value) => setReviewDemo?.(value)}
              trackColor={{ false: '#1E293B', true: '#4F46E5' }}
              thumbColor={reviewDemoEnabled ? '#E0E7FF' : '#94A3B8'}
            />
          </View>
        </View>

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

        <Text style={styles.section}>Legal & Privacy</Text>
        <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('Privacy')}>
          <Text style={styles.linkText}>Privacy Policy</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('Terms')}>
          <Text style={styles.linkText}>Terms of Service</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkRow} onPress={() => setDeleteOpen(true)}>
          <Text style={styles.deleteText}>Account Data Deletion</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => {
            Alert.alert('Sign out', 'You will need to sign in again.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Sign out', style: 'destructive', onPress: () => { void signOut?.(); } },
            ]);
          }}
        >
          <Text style={styles.linkText}>Sign out</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </ScrollView>
      <DeleteAccountModal
        visible={deleteOpen}
        accessToken={session?.access_token}
        onClose={() => setDeleteOpen(false)}
        onDeleted={async (result) => {
          setDeleteOpen(false);
          await resetAppData?.();
          await signOut?.();
          if (result?.success) {
            Alert.alert('Account deleted', result.message || 'Your Quanti profile was removed.');
            return;
          }
          Alert.alert('On-device data cleared', result?.message || 'The cloud account was not deleted.');
        }}
      />
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
  meta: { color: '#64748B', fontFamily: fonts.regular, fontSize: 13, marginTop: 4, lineHeight: 18 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
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
  deleteText: { color: '#FB7185', fontFamily: fonts.semibold, fontSize: 15 },
  chevron: { color: '#64748B', fontSize: 22 },
});
