import AsyncStorage from '@react-native-async-storage/async-storage';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { asCapacityWindow, asDirectiveTriplets } from './capacityWindow';
import type { DailyDirective } from '../types/telemetry';
import { localDateStamp, rememberDirectiveCard } from './directiveHistory';
import { currentUserId, scopedAsyncKey } from './sessionIsolation';

const STORAGE_KEY = '@quanti_daily_directive';

export type StoredDailyDirective = DailyDirective & {
  date: string;
  agency_arc: string;
  voice_transcript?: string;
  destination_id?: string;
};

function isSource(value: unknown): value is DailyDirective['source'] {
  return value === 'edge' || value === 'local_fallback';
}

function asStored(value: unknown): StoredDailyDirective | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = value as Partial<StoredDailyDirective>;
  if (typeof record.primary_directive !== 'string' || !record.primary_directive.trim()) {
    return null;
  }
  if (typeof record.date !== 'string' || !record.date) {
    return null;
  }
  return {
    date: record.date.slice(0, 10),
    agency_arc: typeof record.agency_arc === 'string' ? record.agency_arc : '',
    primary_directive: record.primary_directive.trim(),
    recovery_actions: Array.isArray(record.recovery_actions) ? record.recovery_actions.map(String) : [],
    focus_blocks: Array.isArray(record.focus_blocks) ? record.focus_blocks.map(String) : [],
    voice_prompt: typeof record.voice_prompt === 'string' ? record.voice_prompt : '',
    source: isSource(record.source) ? record.source : 'edge',
    why_today: typeof record.why_today === 'string' ? record.why_today.trim() : undefined,
    aborted: record.aborted === true || record.crisis_intercept === true,
    crisis_intercept: record.crisis_intercept === true,
    triplets: asDirectiveTriplets(record.triplets) ?? undefined,
    selected_window: asCapacityWindow(record.selected_window) ?? undefined,
    voice_transcript: typeof record.voice_transcript === 'string' ? record.voice_transcript : undefined,
    destination_id: typeof record.destination_id === 'string' ? record.destination_id : undefined,
  };
}

async function readLocal(): Promise<StoredDailyDirective | null> {
  try {
    const raw = await AsyncStorage.getItem(await scopedAsyncKey(STORAGE_KEY));
    return raw ? asStored(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

async function writeLocal(entry: StoredDailyDirective) {
  await AsyncStorage.setItem(await scopedAsyncKey(STORAGE_KEY), JSON.stringify(entry));
}

async function readRemote(date: string): Promise<StoredDailyDirective | null> {
  if (!isSupabaseConfigured) {
    return null;
  }
  const userId = await currentUserId();
  if (!userId) {
    return null;
  }
  try {
    const { data, error } = await supabase
      .from('focus_directives')
      .select('directive_date, title, rationale, primary_domain, verification_note')
      .eq('user_id', userId)
      .eq('directive_date', date)
      .maybeSingle();
    if (error || !data) {
      return null;
    }
    const title = String(data.title || '').trim();
    if (!title) {
      return null;
    }
    return {
      date: String(data.directive_date).slice(0, 10),
      agency_arc: '',
      primary_directive: title,
      recovery_actions: [],
      focus_blocks: String(data.rationale || '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      voice_prompt: '',
      source: 'edge',
    };
  } catch {
    return null;
  }
}

async function writeRemote(entry: StoredDailyDirective) {
  if (!isSupabaseConfigured) {
    return;
  }
  const userId = await currentUserId();
  if (!userId) {
    return;
  }
  const { error } = await supabase.from('focus_directives').upsert(
    {
      user_id: userId,
      directive_date: entry.date,
      title: entry.primary_directive.slice(0, 500),
      rationale: entry.focus_blocks.join('\n') || entry.primary_directive,
      primary_domain: 'focus',
      status: 'active',
      verification_note: entry.voice_transcript
        ? 'Refined with morning voice context.'
        : 'Saved from Today.',
      momentum_impact: 0,
      day_id: entry.date,
      triplets: entry.triplets ?? null,
      selected_window: entry.selected_window ?? null,
      mark_state: 'unknown',
      miss_reason: 'none',
    },
    { onConflict: 'user_id,directive_date' },
  );
  if (error) {
    console.warn('[Directive] cloud persist failed', error.message);
  }
}

export async function loadStoredDirective(date = localDateStamp()): Promise<StoredDailyDirective | null> {
  const local = await readLocal();
  if (local?.date === date) {
    return local;
  }
  if (local && local.date < date) {
    await rememberDirectiveCard({
      date: local.date,
      primary_directive: local.primary_directive,
      agency_arc: local.agency_arc,
      destination_id: local.destination_id,
    }).catch(() => {});
  }
  const remote = await readRemote(date);
  if (remote?.date === date) {
    await writeLocal(remote).catch(() => {});
    return remote;
  }
  return null;
}

export async function saveStoredDirective(entry: StoredDailyDirective): Promise<void> {
  const next = {
    ...entry,
    date: entry.date.slice(0, 10),
  };
  await writeLocal(next);
  await rememberDirectiveCard({
    date: next.date,
    primary_directive: next.primary_directive,
    agency_arc: next.agency_arc,
    destination_id: next.destination_id,
  }).catch(() => {});
  await writeRemote(next).catch((caught) => {
    console.warn('[Directive] cloud persist failed', caught);
  });
}

export async function clearStoredDirective(): Promise<void> {
  try {
    await AsyncStorage.removeItem(await scopedAsyncKey(STORAGE_KEY));
  } catch {
    // Local cache is optional.
  }
}
