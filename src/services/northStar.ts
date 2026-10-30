import * as SecureStore from 'expo-secure-store';
import { supabase } from '../lib/supabase';
import { currentUserId, scopedSecureKey } from './sessionIsolation';

const NORTH_STAR_KEY = 'quanti_north_star';

export type NorthStar = {
  now: string;
  next: string;
  outcomes: string[];
  setAt?: string;
};

export const TARGET_STALE_DAYS = 14;

const listeners = new Set<() => void>();

export function subscribeNorthStar(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notify() {
  listeners.forEach((listener) => listener());
}

export const DESTINATION_PLACEHOLDER = 'e.g., Ship TestFlight alpha to 10 testers';

function clipStar(value: string, max = 280) {
  return value.replace(/\s+/g, ' ').trim().replace(/^[.,;:\s]+/, '').replace(/[.,;:]+$/, '').slice(0, max);
}

export function parseNorthStarFromSpeech(text: string): NorthStar {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) {
    return { now: '', next: '', outcomes: [] };
  }
  const spoken = cleaned
    .replace(/\b(um+|uh+|like|you know|i guess|so yeah|basically|kind of|sort of)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const split = spoken.split(
    /\b(?:want to|wanted to|trying to|going to|gonna|hoping to|so i can|so that|in order to|my goal is|the goal is|next is|working toward|working towards)\b/i,
  );
  let now = '';
  let next = '';
  if (split.length >= 2) {
    now = clipStar(split[0]);
    next = clipStar(split.slice(1).join(' '));
  } else {
    const sentences = spoken.split(/[.!?]+/).map((part) => part.trim()).filter(Boolean);
    next = clipStar(sentences[sentences.length - 1] || spoken);
    now = sentences.length > 1 ? clipStar(sentences.slice(0, -1).join('. ')) : 'here';
  }
  if (!next) {
    next = clipStar(spoken);
  }
  const outcomes = next
    .split(/\band\b|,| then /i)
    .map((part) => clipStar(part, 120))
    .filter((part) => part.length > 4)
    .slice(0, 2);
  return {
    now: now.slice(0, 280) || 'here',
    next: next.slice(0, 280),
    outcomes: outcomes.length ? outcomes : next ? [next.slice(0, 120)] : [],
    setAt: new Date().toISOString(),
  };
}

export function activeTargetFromText(text: string, previous?: NorthStar | null): NorthStar {
  const next = clipStar(text);
  const same = previous?.next?.trim().toLowerCase() === next.toLowerCase();
  return {
    now: same && previous?.now ? previous.now : 'here',
    next,
    outcomes: next ? [next.slice(0, 120)] : [],
    setAt: same && previous?.setAt ? previous.setAt : new Date().toISOString(),
  };
}

export function daysOnTarget(star: NorthStar | null): number | null {
  if (!star?.setAt) {
    return null;
  }
  const start = new Date(star.setAt).getTime();
  if (!Number.isFinite(start)) {
    return null;
  }
  return Math.max(0, Math.floor((Date.now() - start) / 86_400_000));
}

export function isTargetStale(star: NorthStar | null) {
  const days = daysOnTarget(star);
  return days != null && days >= TARGET_STALE_DAYS;
}

export function asNorthStar(value: unknown): NorthStar | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = value as Partial<NorthStar>;
  const now = typeof record.now === 'string' ? record.now.trim() : '';
  const next = typeof record.next === 'string' ? record.next.trim() : '';
  if (!now && !next) {
    return null;
  }
  const outcomes = Array.isArray(record.outcomes)
    ? record.outcomes.map(String).map((item) => item.trim()).filter(Boolean).slice(0, 2)
    : [];
  const setAt = typeof record.setAt === 'string' && record.setAt.trim() ? record.setAt.trim() : undefined;
  return {
    now: now.slice(0, 280),
    next: (next || now).slice(0, 280),
    outcomes,
    setAt,
  };
}

export function formatToward(star: NorthStar | null) {
  if (!star?.next) {
    return null;
  }
  const short = star.next.replace(/\s+/g, ' ').trim();
  if (short.length <= 72) {
    return short;
  }
  return `${short.slice(0, 69).trim()}…`;
}

async function storeAvailable() {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

export async function getNorthStar(): Promise<NorthStar | null> {
  try {
    if (await storeAvailable()) {
      const raw = await SecureStore.getItemAsync(await scopedSecureKey(NORTH_STAR_KEY));
      const local = raw ? asNorthStar(JSON.parse(raw)) : null;
      if (local) {
        return local;
      }
    }
  } catch {
    // Fall through to profile.
  }
  const userId = await currentUserId();
  if (!userId) {
    return null;
  }
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('north_star_now, north_star_next, north_star_outcomes, north_star_set_at')
      .eq('id', userId)
      .maybeSingle();
    if (error || !data) {
      return null;
    }
    const row = data as {
      north_star_now?: string | null;
      north_star_next?: string | null;
      north_star_outcomes?: unknown;
      north_star_set_at?: string | null;
    };
    return asNorthStar({
      now: row.north_star_now,
      next: row.north_star_next,
      outcomes: row.north_star_outcomes,
      setAt: row.north_star_set_at,
    });
  } catch {
    return null;
  }
}

export async function saveNorthStar(star: NorthStar): Promise<void> {
  const next = asNorthStar(star);
  if (!next) {
    return;
  }
  try {
    if (await storeAvailable()) {
      await SecureStore.setItemAsync(await scopedSecureKey(NORTH_STAR_KEY), JSON.stringify(next));
    }
  } catch {
    console.warn('[NorthStar] local persist failed');
  }
  const userId = await currentUserId();
  if (userId) {
    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      north_star_now: next.now || null,
      north_star_next: next.next || null,
      north_star_outcomes: next.outcomes,
      north_star_set_at: next.setAt || null,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      console.warn('[NorthStar] profile persist failed', error.message);
      if (/north_star_set_at/i.test(error.message)) {
        await supabase.from('profiles').upsert({
          id: userId,
          north_star_now: next.now || null,
          north_star_next: next.next || null,
          north_star_outcomes: next.outcomes,
          updated_at: new Date().toISOString(),
        });
      }
    }
  }
  notify();
}

export async function clearNorthStar(): Promise<void> {
  try {
    if (await storeAvailable()) {
      await SecureStore.deleteItemAsync(await scopedSecureKey(NORTH_STAR_KEY));
    }
  } catch {
    // Best-effort.
  }
  const userId = await currentUserId();
  if (userId) {
    await supabase
      .from('profiles')
      .upsert({
        id: userId,
        north_star_now: null,
        north_star_next: null,
        north_star_outcomes: [],
        north_star_set_at: null,
        updated_at: new Date().toISOString(),
      })
      .then(({ error }) => {
        if (error) {
          console.warn('[NorthStar] profile clear failed', error.message);
        }
      });
  }
  notify();
}
