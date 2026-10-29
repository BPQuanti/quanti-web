import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as AppleAuthentication from 'expo-apple-authentication';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { syncReviewModeFromEmail } from '../src/lib/config/reviewMode';
import { isolateSession } from '../src/services/sessionIsolation';

const AuthContext = createContext(null);

function isExpoGo() {
  const ownership = Constants.appOwnership;
  return (
    ownership === 'expo' ||
    ownership === Constants.AppOwnership?.Expo ||
    (Constants.executionEnvironment === ExecutionEnvironment.StoreClient && ownership === 'expo')
  );
}

function configError() {
  return new Error(
    'Add your real EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env, then reload Expo.'
  );
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDevBypass, setIsDevBypass] = useState(false);
  const isDevBypassRef = useRef(false);
  const clearExpoGoSession = useRef(isExpoGo());
  const appliedUserId = useRef(undefined);

  useEffect(() => {
    let mounted = true;

    const applySession = async (nextSession) => {
      if (clearExpoGoSession.current) {
        await isolateSession(null);
        syncReviewModeFromEmail(null);
        if (mounted) {
          setSession(null);
          setUser(null);
        }
        return;
      }
      if (isDevBypassRef.current && !nextSession?.user) {
        return;
      }
      const nextId = nextSession?.user?.id ?? null;
      if (appliedUserId.current !== nextId) {
        await isolateSession(nextId);
        appliedUserId.current = nextId;
      }
      if (nextSession?.user) {
        isDevBypassRef.current = false;
        setIsDevBypass(false);
      }
      syncReviewModeFromEmail(nextSession?.user?.email);
      if (mounted) {
        setSession(nextSession ?? null);
        setUser(nextSession?.user ?? null);
      }
    };

    (async () => {
      try {
        if (!isSupabaseConfigured) {
          return;
        }
        if (clearExpoGoSession.current) {
          await supabase.auth.signOut();
          clearExpoGoSession.current = false;
        }
        const { data } = await supabase.auth.getSession();
        if (mounted) {
          await applySession(data.session);
        }
      } catch (error) {
        console.log('Auth session restore failed', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (isExpoGo() && event === 'INITIAL_SESSION') {
        return;
      }
      applySession(nextSession)
        .catch((error) => console.log('Auth session apply failed', error))
        .finally(() => {
          if (mounted) {
            setLoading(false);
          }
        });
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const signInWithEmail = useCallback(async (email, password) => {
    if (!isSupabaseConfigured) {
      return { data: null, error: configError() };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) {
      syncReviewModeFromEmail(email);
    }
    return { data, error };
  }, []);

  const signUpWithEmail = useCallback(async (email, password) => {
    if (!isSupabaseConfigured) {
      return { data: null, error: configError() };
    }
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { data, error };
  }, []);

  const signInWithApple = useCallback(async () => {
    if (!isSupabaseConfigured) {
      return { data: null, error: configError() };
    }
    if (Platform.OS !== 'ios') {
      return { data: null, error: new Error('Sign in with Apple is only available on iOS.') };
    }
    try {
      const available = await AppleAuthentication.isAvailableAsync();
      if (!available) {
        return {
          data: null,
          error: new Error('Sign in with Apple is not supported on this simulator or device. Use email instead.'),
        };
      }
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const identityToken = credential?.identityToken;
      if (!identityToken) {
        return { data: null, error: new Error('Apple did not return an identity token.') };
      }
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: identityToken,
      });
      if (!error && data?.user?.id) {
        await isolateSession(data.user.id);
        const name = [credential.fullName?.givenName, credential.fullName?.familyName]
          .filter(Boolean)
          .join(' ')
          .trim();
        if (name) {
          const { error: profileError } = await supabase.from('profiles').upsert({
            id: data.user.id,
            full_name: name,
            updated_at: new Date().toISOString(),
          });
          if (profileError) {
            console.warn('[Auth] Apple profile name upsert failed', profileError.message);
          }
        }
      }
      return { data, error };
    } catch (error) {
      if (error?.code === 'ERR_REQUEST_CANCELED' || error?.code === 'ERR_CANCELED') {
        return { data: null, error: null };
      }
      return { data: null, error };
    }
  }, []);

  const continueAsGuest = useCallback(() => {
    isDevBypassRef.current = true;
    setIsDevBypass(true);
    syncReviewModeFromEmail(null);
    isolateSession(null).catch(() => {});
    appliedUserId.current = null;
    setSession(null);
    setUser(null);
  }, []);

  const signOut = useCallback(async () => {
    isDevBypassRef.current = false;
    setIsDevBypass(false);
    syncReviewModeFromEmail(null);
    await isolateSession(null);
    appliedUserId.current = null;
    setUser(null);
    setSession(null);
    if (!isSupabaseConfigured) {
      return { error: null };
    }
    const { error } = await supabase.auth.signOut();
    return { error };
  }, []);

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      isLoading: loading,
      isDevBypass,
      signInWithEmail,
      signUpWithEmail,
      signInWithApple,
      continueAsGuest,
      signOut,
    }),
    [
      user,
      session,
      loading,
      isDevBypass,
      signInWithEmail,
      signUpWithEmail,
      signInWithApple,
      continueAsGuest,
      signOut,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return value;
}

export { AuthContext };
