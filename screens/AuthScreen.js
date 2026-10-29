import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Constants from 'expo-constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuth } from '../context/AuthContext';

import { fonts } from './theme';

async function openLegal(url) {
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

const SPACE = '#050508';
const SURFACE = '#101014';
const LINE = 'rgba(30, 30, 36, 0.5)';
const INK = '#F4F4F5';
const MUTED = '#71717A';
const PLACEHOLDER = '#52525B';
const CYAN = '#00F0FF';
const ERROR_BG = '#3F1D1D';
const ERROR_TEXT = '#FECACA';

export default function AuthScreen() {
  const { signInWithEmail, signUpWithEmail, signInWithApple } = useAuth();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const build = Constants.expoConfig?.ios?.buildNumber ?? '1';

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
          <Text style={styles.wordmark}>QUANTI</Text>
          <Text style={styles.subtitle}>Your daily execution compass.</Text>
          <View style={styles.accentTrack}>
            <View style={styles.accentCyan} />
            <View style={styles.accentEmerald} />
          </View>

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
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE_OUTLINE}
              cornerRadius={12}
              style={styles.appleButton}
              onPress={apple}
            />
          ) : (
            <TouchableOpacity style={styles.appleFallback} onPress={apple} disabled={busy}>
              <Text style={styles.appleFallbackText}>Sign in with Apple</Text>
            </TouchableOpacity>
          )}

          <View style={styles.form}>
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
            placeholderTextColor={PLACEHOLDER}
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            secureTextEntry
            textContentType={mode === 'signup' ? 'newPassword' : 'password'}
            placeholder="Password"
            placeholderTextColor={PLACEHOLDER}
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.primary} onPress={submit} disabled={busy}>
            {busy ? (
              <ActivityIndicator color={INK} />
            ) : (
              <Text style={styles.primaryText}>{mode === 'signup' ? 'Create Account' : 'Continue with Email'}</Text>
            )}
          </TouchableOpacity>
          </View>

          <View style={styles.spacer} />
          <View style={styles.legalRow}>
            <TouchableOpacity onPress={() => openLegal('https://quanti-app.com/privacy')}>
              <Text style={styles.legalLink}>Privacy Policy</Text>
            </TouchableOpacity>
            <Text style={styles.legalDot}>·</Text>
            <TouchableOpacity onPress={() => openLegal('https://quanti-app.com/terms')}>
              <Text style={styles.legalLink}>Terms of Service</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.version}>Quanti v{version} (Build {build})</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: SPACE },
  flex: { flex: 1, backgroundColor: SPACE },
  body: { padding: 24, paddingTop: 48, paddingBottom: 20, flexGrow: 1 },
  wordmark: { color: INK, fontFamily: fonts.bold, fontSize: 28, letterSpacing: 1.5 },
  subtitle: {
    color: MUTED,
    fontFamily: fonts.medium,
    fontSize: 15,
    letterSpacing: 0.2,
    marginTop: 8,
  },
  accentTrack: {
    flexDirection: 'row',
    width: 72,
    height: 2,
    marginTop: 16,
    marginBottom: 28,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: CYAN,
  },
  accentCyan: { flex: 1, backgroundColor: CYAN },
  accentEmerald: { flex: 1, backgroundColor: '#10B981' },
  banner: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: LINE,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  bannerError: { backgroundColor: ERROR_BG },
  bannerInfo: { backgroundColor: SURFACE },
  bannerText: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18 },
  bannerErrorText: { color: ERROR_TEXT },
  bannerInfoText: { color: CYAN },
  appleButton: { width: '100%', height: 48 },
  appleFallback: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: INK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appleFallbackText: { color: INK, fontFamily: fonts.semibold, fontSize: 16, letterSpacing: 0.3 },
  guest: {
    marginTop: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    backgroundColor: SURFACE,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: CYAN,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  guestText: { color: CYAN, fontFamily: fonts.semibold, fontSize: 15, letterSpacing: 0.3 },
  guestNote: { color: MUTED, fontFamily: fonts.medium, fontSize: 12, letterSpacing: 0.3, textAlign: 'center', marginTop: 8 },
  form: {
    marginTop: 22,
    backgroundColor: SURFACE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: LINE,
    padding: 14,
  },
  spacer: { flex: 1, minHeight: 28 },
  legalRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  legalLink: { color: MUTED, fontFamily: fonts.medium, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase' },
  legalDot: { color: MUTED, fontSize: 11 },
  version: { color: MUTED, fontFamily: fonts.medium, fontSize: 12, letterSpacing: 0.3, textAlign: 'center', marginTop: 12 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  line: { flex: 1, height: 1, backgroundColor: LINE },
  or: { color: MUTED, fontFamily: fonts.medium, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase' },
  toggleRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  toggleChip: {
    flex: 1,
    backgroundColor: SPACE,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: LINE,
  },
  toggleChipActive: { borderColor: 'rgba(0, 240, 255, 0.45)' },
  toggleChipText: { color: MUTED, fontFamily: fonts.semibold, fontSize: 13 },
  toggleChipTextActive: { color: INK },
  input: {
    backgroundColor: SURFACE,
    borderColor: LINE,
    borderWidth: 1,
    borderRadius: 12,
    color: INK,
    fontFamily: fonts.regular,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 12,
  },
  primary: {
    backgroundColor: SPACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: LINE,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 2,
  },
  primaryText: { color: INK, fontFamily: fonts.semibold, fontSize: 16, letterSpacing: 0.3 },
});
