import * as SecureStore from 'expo-secure-store';
import { supabase } from '../lib/supabase';
import { clearSelectedArc } from './arcSettings';
import { clearNorthStar, getNorthStar } from './northStar';
import { setAIConsent } from './privacyConsent';
import { currentUserId, ONBOARDING_FLAG_KEY, scopedSecureKey } from './sessionIsolation';

const gateListeners = new Set<() => void>();

export function subscribeOnboardingGate(listener: () => void) {
  gateListeners.add(listener);
  return () => {
    gateListeners.delete(listener);
  };
}

function notifyOnboardingGate() {
  gateListeners.forEach((listener) => listener());
}

export type PendingOnboardingVoice = {
  transcript: string;
  durationSeconds: number;
};

let pendingVoice: PendingOnboardingVoice | null = null;

export function setPendingOnboardingVoice(next: PendingOnboardingVoice | null) {
  pendingVoice = next;
}

export function consumePendingOnboardingVoice() {
  const next = pendingVoice;
  pendingVoice = null;
  return next;
}

async function storeAvailable() {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

export async function readLocalOnboardingComplete(): Promise<boolean | null> {
  try {
    if (!(await storeAvailable())) {
      return null;
    }
    const value = await SecureStore.getItemAsync(await scopedSecureKey(ONBOARDING_FLAG_KEY));
    if (value === '1') {
      return true;
    }
    if (value === '0') {
      return false;
    }
    return null;
  } catch {
    return null;
  }
}

export async function writeLocalOnboardingComplete(done: boolean) {
  if (!(await storeAvailable())) {
    return;
  }
  await SecureStore.setItemAsync(await scopedSecureKey(ONBOARDING_FLAG_KEY), done ? '1' : '0');
}

export async function fetchRemoteOnboardingComplete(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('has_completed_onboarding, north_star_now, north_star_next')
      .eq('id', userId)
      .maybeSingle();
    if (error) {
      console.warn('[Onboarding] profile flag fetch failed', error.message);
      return false;
    }
    const row = data as {
      has_completed_onboarding?: boolean;
      north_star_now?: string | null;
      north_star_next?: string | null;
    } | null;
    return Boolean(
      row?.has_completed_onboarding && (row.north_star_now?.trim() || row.north_star_next?.trim()),
    );
  } catch (caught) {
    console.warn('[Onboarding] profile flag fetch failed', caught);
    return false;
  }
}

export async function resolveOnboardingComplete(userId: string | null): Promise<boolean> {
  if (!userId) {
    return true;
  }
  const local = await readLocalOnboardingComplete();
  const star = await getNorthStar();
  const hasDestination = Boolean(star?.now?.trim() || star?.next?.trim());
  if (local === true && hasDestination) {
    console.log('[Onboarding] local flag complete', userId);
    return true;
  }
  const remote = await fetchRemoteOnboardingComplete(userId);
  if (remote) {
    await writeLocalOnboardingComplete(true);
    console.log('[Onboarding] restored complete flag from profiles', userId);
    return true;
  }
  return false;
}

export async function markOnboardingComplete() {
  const userId = await currentUserId();
  await setAIConsent(true).catch(() => {});
  await writeLocalOnboardingComplete(true);
  if (!userId) {
    return;
  }
  const { error } = await supabase.from('profiles').upsert({
    id: userId,
    has_completed_onboarding: true,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    console.error('[Onboarding] failed to persist profiles.has_completed_onboarding', error.message);
    throw error;
  }
  console.log('[Onboarding] marked complete for', userId);
}

export async function resetOnboardingProgress() {
  const userId = await currentUserId();
  await writeLocalOnboardingComplete(false);
  await clearSelectedArc();
  await clearNorthStar();
  if (userId) {
    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      has_completed_onboarding: false,
      agency_arc: null,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      console.error('[Onboarding] failed to reset profiles flags', error.message);
      throw error;
    }
  }
  console.log('[Onboarding] reset for', userId);
  notifyOnboardingGate();
}
