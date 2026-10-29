import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { scopedAsyncKey, scopedSecureKey } from './sessionIsolation';

const CONSENT_KEY = 'quanti_ai_synthesis_consent';
export const TELEMETRY_CACHE_KEY = '@quanti_anon_telemetry_cache';
const GRANTED = 'granted';
const DENIED = 'denied';

async function secureAvailable() {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

export async function hasGivenAIConsent(): Promise<boolean> {
  try {
    if (!(await secureAvailable())) {
      return true;
    }
    const value = await SecureStore.getItemAsync(await scopedSecureKey(CONSENT_KEY));
    return value !== DENIED;
  } catch {
    return true;
  }
}

export async function setAIConsent(granted: boolean): Promise<void> {
  if (!(await secureAvailable())) {
    throw new Error('SecureStore is unavailable; AI consent cannot be stored.');
  }

  await SecureStore.setItemAsync(await scopedSecureKey(CONSENT_KEY), granted ? GRANTED : DENIED);
}

export async function revokeConsent(): Promise<void> {
  try {
    if (await secureAvailable()) {
      await SecureStore.deleteItemAsync(await scopedSecureKey(CONSENT_KEY));
    }
  } catch {
    // Consent key may already be absent.
  }

  try {
    await AsyncStorage.removeItem(await scopedAsyncKey(TELEMETRY_CACHE_KEY));
  } catch {
    // Cache wipe is best-effort.
  }
}

export async function cacheAnonymizedPayload(payload: string) {
  try {
    await AsyncStorage.setItem(await scopedAsyncKey(TELEMETRY_CACHE_KEY), payload);
  } catch {
    // Local cache is optional.
  }
}

export async function readTelemetryCache() {
  try {
    return await AsyncStorage.getItem(await scopedAsyncKey(TELEMETRY_CACHE_KEY));
  } catch {
    return null;
  }
}
