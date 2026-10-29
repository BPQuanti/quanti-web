import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

export type MockTelemetryProfile = 'high_stress' | 'peak_recovery' | 'balanced';

const HARDWARE_KEY = 'quanti_use_real_hardware';
const PROFILE_KEY = 'quanti_mock_telemetry_profile';

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function subscribeTelemetrySettings(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

async function storeAvailable() {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

function hardwareLooksAvailable() {
  const isDevice = Constants.isDevice !== false;
  const expoGo = Constants.appOwnership === 'expo';
  if (expoGo || Platform.OS === 'web') {
    return false;
  }
  return isDevice && Platform.OS === 'ios';
}

export function isMockProfile(value: string): value is MockTelemetryProfile {
  return value === 'high_stress' || value === 'peak_recovery' || value === 'balanced';
}

export async function getUseRealHardwarePreference(): Promise<boolean> {
  try {
    if (await storeAvailable()) {
      const stored = await SecureStore.getItemAsync(HARDWARE_KEY);
      if (stored === '1') {
        return true;
      }
      if (stored === '0') {
        return false;
      }
    }
  } catch {
    // Fall through to device default.
  }
  return hardwareLooksAvailable();
}

export async function isUseRealHardwareEnabled(): Promise<boolean> {
  const preferred = await getUseRealHardwarePreference();
  return preferred && hardwareLooksAvailable();
}

export async function setUseRealHardware(enabled: boolean): Promise<void> {
  try {
    if (await storeAvailable()) {
      await SecureStore.setItemAsync(HARDWARE_KEY, enabled ? '1' : '0');
    }
  } finally {
    notify();
  }
}

export async function getSelectedMockProfile(): Promise<MockTelemetryProfile> {
  try {
    if (await storeAvailable()) {
      const stored = await SecureStore.getItemAsync(PROFILE_KEY);
      if (stored && isMockProfile(stored)) {
        return stored;
      }
    }
  } catch {
    // Default profile.
  }
  return 'balanced';
}

export async function setSelectedMockProfile(profile: string): Promise<void> {
  const next: MockTelemetryProfile = isMockProfile(profile) ? profile : 'balanced';
  try {
    if (await storeAvailable()) {
      await SecureStore.setItemAsync(PROFILE_KEY, next);
    }
  } finally {
    notify();
  }
}
