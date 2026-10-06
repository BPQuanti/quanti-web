import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { isReviewDemoEmail, REVIEW_DEMO_EMAIL, syncReviewModeFromEmail } from '../src/lib/config/reviewMode';

const AuthContext = createContext(null);

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

  useEffect(() => {
    let mounted = true;

    const applySession = (nextSession) => {
      if (isDevBypassRef.current && !nextSession?.user) {
        return;
      }
      if (nextSession?.user) {
        isDevBypassRef.current = false;
        setIsDevBypass(false);
      }
      syncReviewModeFromEmail(nextSession?.user?.email);
      setSession(nextSession ?? null);
      setUser(nextSession?.user ?? null);
    };

    (async () => {
      try {
        if (!isSupabaseConfigured) {
          return;
        }
        const { data } = await supabase.auth.getSession();
        if (mounted) {
          applySession(data.session);
        }
      } catch (error) {
        console.log('Auth session restore failed', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      applySession(nextSession);
      if (mounted) {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const enterReviewDemo = useCallback(() => {
    syncReviewModeFromEmail(REVIEW_DEMO_EMAIL);
    isDevBypassRef.current = true;
    setIsDevBypass(true);
    setSession(null);
    setUser({ id: 'review-demo', email: REVIEW_DEMO_EMAIL });
    setLoading(false);
    return {
      data: { user: { id: 'review-demo', email: REVIEW_DEMO_EMAIL }, session: null },
      error: null,
    };
  }, []);

  const signInWithEmail = useCallback(async (email, password) => {
    if (isReviewDemoEmail(email) && String(password || '').length > 0) {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (!error) {
          syncReviewModeFromEmail(email);
          return { data, error: null };
        }
      }
      return enterReviewDemo();
    }
    if (!isSupabaseConfigured) {
      return { data: null, error: configError() };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  }, [enterReviewDemo]);

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
      return { data, error };
    } catch (error) {
      if (error?.code === 'ERR_REQUEST_CANCELED' || error?.code === 'ERR_CANCELED') {
        return { data: null, error: null };
      }
      return { data: null, error };
    }
  }, []);

  const bypassAuthForTesting = useCallback(() => {
    isDevBypassRef.current = true;
    setIsDevBypass(true);
    setUser({ id: 'dev-user-123', email: 'dev@quanti.app' });
    setSession(null);
    setLoading(false);
  }, []);

  const signOut = useCallback(async () => {
    isDevBypassRef.current = false;
    setIsDevBypass(false);
    syncReviewModeFromEmail(null);
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
      bypassAuthForTesting,
      signInWithEmail,
      signUpWithEmail,
      signInWithApple,
      signOut,
    }),
    [
      user,
      session,
      loading,
      isDevBypass,
      bypassAuthForTesting,
      signInWithEmail,
      signUpWithEmail,
      signInWithApple,
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
