import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { resetArcRuntimeState } from '../lib/arcs';
import { supabase } from '../lib/supabase';

export const ONBOARDING_FLAG_KEY = 'quanti_has_completed_onboarding';

const LAST_USER_KEY = 'quanti_last_session_user';

export const LEGACY_ASYNC_KEYS = [
  '@quanti_profile',
  '@quanti_health_data',
  '@quanti_location_data',
  '@quanti_plaid_data',
  '@quanti_recaps',
  '@quanti_saved_stats',
  '@quanti_directive_history',
  '@quanti_anon_telemetry_cache',
  '@quanti_permission_prefs',
  '@quanti_today_perm_sandbox',
];

export const LEGACY_SECURE_KEYS = ['quanti_agency_arc', 'quanti_ai_synthesis_consent'];

export async function currentUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user?.id ?? null;
  } catch {
    return null;
  }
}

export async function scopedAsyncKey(base: string) {
  const id = await currentUserId();
  return id ? `${base}:${id}` : `${base}:local`;
}

/** Expo SecureStore keys may only use letters, numbers, `.`, `-`, and `_`. */
export function toSecureStoreKey(base: string, scope: string) {
  const prefix = base.replace(/[^A-Za-z0-9._-]/g, '_');
  const suffix = scope.replace(/[^A-Za-z0-9._-]/g, '');
  return `${prefix}.${suffix || 'local'}`;
}

export async function scopedSecureKey(base: string) {
  const id = await currentUserId();
  return toSecureStoreKey(base, id ?? 'local');
}

async function wipeLegacyDeviceCaches() {
  const asyncKeys = [...LEGACY_ASYNC_KEYS, ...LEGACY_ASYNC_KEYS.map((key) => `${key}:local`)];
  await Promise.all(
    asyncKeys.map(async (key) => {
      try {
        await AsyncStorage.removeItem(key);
      } catch {
        // Best-effort device wipe.
      }
    }),
  );

  for (const key of [...LEGACY_SECURE_KEYS, ...LEGACY_SECURE_KEYS.map((item) => toSecureStoreKey(item, 'local'))]) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // Best-effort device wipe.
    }
  }

  resetArcRuntimeState();
}

export async function isolateSession(nextUserId: string | null) {
  let last: string | null = null;
  try {
    last = (await SecureStore.getItemAsync(LAST_USER_KEY)) || null;
  } catch {
    last = null;
  }

  const next = nextUserId || '';
  if (last === next) {
    console.log('[Session] same account, keeping scoped caches', next || 'signed-out');
    return;
  }

  console.log('[Session] isolating device state', { from: last || 'none', to: next || 'signed-out' });
  await wipeLegacyDeviceCaches();
  if (!nextUserId && last) {
    try {
      await SecureStore.deleteItemAsync(toSecureStoreKey(ONBOARDING_FLAG_KEY, last));
    } catch {
      // Returning users still skip onboarding via profiles.has_completed_onboarding.
    }
  }

  try {
    if (nextUserId) {
      await SecureStore.setItemAsync(LAST_USER_KEY, nextUserId);
    } else {
      await SecureStore.deleteItemAsync(LAST_USER_KEY);
    }
  } catch {
    // Last-user marker is best-effort.
  }
}
