import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuth } from '../context/AuthContext';

import { colors } from './theme';

const BG = colors.bg;
const SURFACE = colors.card;
const WHITE = colors.text;
const MUTED = colors.muted;
const EMERALD = colors.accent;
const ERROR_BG = '#3F1D1D';
const ERROR_TEXT = '#FECACA';

export default function AuthScreen() {
  const { signInWithEmail, signUpWithEmail, signInWithApple, bypassAuthForTesting } = useAuth();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (Platform.OS !== 'ios') {
        return;
      }
      try {
        const available = await AppleAuthentication.isAvailableAsync();
        if (mounted) {
          setAppleAvailable(Boolean(available));
        }
      } catch {
        if (mounted) {
          setAppleAvailable(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const showMessage = (message, error = true) => {
    setIsError(error);
    setStatus(message);
  };

  const submit = async () => {
    const trimmed = email.trim();
    if (!trimmed || !password) {
      showMessage('Enter an email and password to continue.');
      return;
    }
    setBusy(true);
    setStatus('');
    try {
      const fn = mode === 'signup' ? signUpWithEmail : signInWithEmail;
      const { error } = await fn(trimmed, password);
      if (error) {
        showMessage(error.message || String(error));
        return;
      }
      if (mode === 'signup') {
        showMessage('Check your email to confirm the account, then sign in.', false);
      }
    } catch (error) {
      showMessage(error?.message || 'Authentication failed.');
    } finally {
      setBusy(false);
    }
  };

  const apple = async () => {
    setBusy(true);
    setStatus('');
    try {
      const { error } = await signInWithApple();
      if (error) {
        showMessage(error.message || String(error));
      }
    } catch (error) {
      showMessage(error?.message || 'Apple Sign-In is unavailable. Use email instead.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Text style={styles.logoMark}>Q</Text>
          <Text style={styles.brand}>Quanti — The Verified Social Ledger</Text>
          <Text style={styles.title}>{mode === 'signup' ? 'Create Account' : 'Sign In'}</Text>

          {status ? (
            <View style={[styles.banner, isError ? styles.bannerError : styles.bannerInfo]}>
              <Text style={[styles.bannerText, isError ? styles.bannerErrorText : styles.bannerInfoText]}>
                {status}
              </Text>
            </View>
          ) : null}

          {appleAvailable ? (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
              cornerRadius={14}
              style={styles.appleButton}
              onPress={apple}
            />
          ) : (
            <Text style={styles.hint}>
              Sign in with Apple isn’t available on this simulator or device. Continue with email.
            </Text>
          )}

          <View style={styles.dividerRow}>
            <View style={styles.line} />
            <Text style={styles.or}>or</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleChip, mode === 'signin' && styles.toggleChipActive]}
              onPress={() => setMode('signin')}
            >
              <Text style={[styles.toggleChipText, mode === 'signin' && styles.toggleChipTextActive]}>
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleChip, mode === 'signup' && styles.toggleChipActive]}
              onPress={() => setMode('signup')}
            >
              <Text style={[styles.toggleChipText, mode === 'signup' && styles.toggleChipTextActive]}>
                Create Account
              </Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
            placeholder="Email"
            placeholderTextColor="#6B7280"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            secureTextEntry
            textContentType={mode === 'signup' ? 'newPassword' : 'password'}
            placeholder="Password"
            placeholderTextColor="#6B7280"
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.primary} onPress={submit} disabled={busy}>
            {busy ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={styles.primaryText}>Continue with Email</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.devBypass} onPress={bypassAuthForTesting}>
            <Text style={styles.devBypassText}>⚡ Skip Login (Dev Mode)</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  flex: { flex: 1, backgroundColor: BG },
  body: { padding: 24, paddingTop: 36, flexGrow: 1 },
  logoMark: {
    color: EMERALD,
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: 2,
  },
  brand: {
    color: WHITE,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 4,
    marginBottom: 28,
    lineHeight: 30,
  },
  title: {
    color: WHITE,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  banner: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  bannerError: { backgroundColor: ERROR_BG },
  bannerInfo: { backgroundColor: colors.input },
  bannerText: { fontSize: 13, lineHeight: 18 },
  bannerErrorText: { color: ERROR_TEXT },
  bannerInfoText: { color: EMERALD },
  appleButton: { width: '100%', height: 48 },
  hint: { color: MUTED, fontSize: 13, lineHeight: 19, marginBottom: 4 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 22 },
  line: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  or: { color: MUTED, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  toggleRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  toggleChip: {
    flex: 1,
    backgroundColor: SURFACE,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleChipActive: {
    borderColor: EMERALD,
  },
  toggleChipText: { color: MUTED, fontWeight: '600' },
  toggleChipTextActive: { color: WHITE },
  input: {
    backgroundColor: colors.input,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    color: WHITE,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 12,
    fontSize: 16,
  },
  primary: {
    backgroundColor: colors.accentDeep,
    borderColor: colors.glow,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryText: { color: colors.text, fontWeight: '800', fontSize: 16 },
  devBypass: {
    marginTop: 28,
    alignItems: 'center',
    paddingVertical: 12,
  },
  devBypassText: {
    color: colors.inactive,
    fontSize: 13,
    fontWeight: '600',
  },
});
