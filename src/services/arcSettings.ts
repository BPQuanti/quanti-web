import * as SecureStore from 'expo-secure-store';
import { setActiveArc, type ArcId } from '../lib/arcs';
import { supabase } from '../lib/supabase';
import type { AgencyArc } from '../types/telemetry';
import { currentUserId, scopedSecureKey } from './sessionIsolation';

export type { AgencyArc };

const ARC_KEY = 'quanti_agency_arc';
const listeners = new Set<() => void>();

const ARCS: AgencyArc[] = ['recovery', 'deep_work', 'capital', 'clarity', 'momentum', 'somatic'];

export const ARC_LABELS: Record<AgencyArc, string> = {
  recovery: 'Protect energy',
  deep_work: 'Think deeply',
  capital: 'Make money',
  clarity: 'Cut noise',
  momentum: 'Ship something',
  somatic: 'Move first',
};

export const ARC_CHIPS: { id: AgencyArc; label: string }[] = ARCS.map((id) => ({
  id,
  label: ARC_LABELS[id],
}));

function notify() {
  listeners.forEach((listener) => listener());
}

export function subscribeArcSettings(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function isAgencyArc(value: string): value is AgencyArc {
  return (ARCS as string[]).includes(value);
}

function toLegacyArc(arc: AgencyArc): ArcId {
  if (arc === 'recovery' || arc === 'somatic') {
    return 'RECOVERY';
  }
  if (arc === 'capital') {
    return 'CAPITAL';
  }
  if (arc === 'clarity') {
    return 'CLARITY';
  }
  if (arc === 'momentum') {
    return 'DEEP_WORK';
  }
  return 'DEEP_WORK';
}

async function storeAvailable() {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

async function readLocalArc(): Promise<AgencyArc | null> {
  try {
    if (!(await storeAvailable())) {
      return null;
    }
    const key = await scopedSecureKey(ARC_KEY);
    const stored = await SecureStore.getItemAsync(key);
    return stored && isAgencyArc(stored) ? stored : null;
  } catch {
    return null;
  }
}

async function readRemoteArc(userId: string): Promise<AgencyArc | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('agency_arc')
      .eq('id', userId)
      .maybeSingle();
    if (error) {
      console.warn('[Arc] profile arc fetch failed', error.message);
      return null;
    }
    const value = data && typeof data === 'object' ? (data as { agency_arc?: unknown }).agency_arc : null;
    return typeof value === 'string' && isAgencyArc(value) ? value : null;
  } catch (caught) {
    console.warn('[Arc] profile arc fetch failed', caught);
    return null;
  }
}

export async function getSelectedArc(): Promise<AgencyArc | null> {
  const local = await readLocalArc();
  if (local) {
    return local;
  }
  const userId = await currentUserId();
  if (!userId) {
    return null;
  }
  const remote = await readRemoteArc(userId);
  if (remote) {
    try {
      if (await storeAvailable()) {
        const key = await scopedSecureKey(ARC_KEY);
        await SecureStore.setItemAsync(key, remote);
      }
    } catch {
      // Cache is optional.
    }
  }
  return remote;
}

export async function clearSelectedArc(): Promise<void> {
  try {
    if (await storeAvailable()) {
      await SecureStore.deleteItemAsync(await scopedSecureKey(ARC_KEY));
    }
  } catch {
    // Local cache is optional.
  }

  const userId = await currentUserId();
  if (userId) {
    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      agency_arc: null,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      console.warn('[Arc] profile arc clear failed', error.message);
    }
  }

  notify();
}

export async function setSelectedArc(arc: AgencyArc): Promise<void> {
  const next: AgencyArc = isAgencyArc(arc) ? arc : 'deep_work';
  try {
    if (await storeAvailable()) {
      const key = await scopedSecureKey(ARC_KEY);
      await SecureStore.setItemAsync(key, next);
    }
  } catch {
    console.warn('[Arc] could not persist local arc');
  }

  const userId = await currentUserId();
  if (userId) {
    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      agency_arc: next,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      console.warn('[Arc] profile arc upsert failed', error.message);
    }
  }

  setActiveArc(toLegacyArc(next));
  notify();
}
