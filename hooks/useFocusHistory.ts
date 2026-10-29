import { useCallback, useEffect, useState } from 'react';
import { isReviewDemoActive, subscribeReviewDemo } from '../lib/config/demoMode';
import { replayMomentum, type MomentumDay } from '../src/lib/momentum';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export type FocusDomain = 'screen_time' | 'sleep' | 'finance' | 'focus';

export type FocusDirective = {
  id: string;
  directive_date: string;
  title: string;
  rationale: string;
  primary_domain: FocusDomain;
  status: 'active' | 'verified' | 'missed';
  verification_note?: string;
  momentum_impact: number;
};

export type FocusHistoryStats = {
  totalVerified: number;
  currentStreak: number;
  totalMomentumGained: number;
  nextPoints: number;
  tierName: string;
  tierFloor: number;
  tierCeiling: number | null;
  consecutiveMisses: number;
};

type DirectiveRow = {
  id: string;
  directive_date: string;
  title: string;
  rationale: string;
  primary_domain: string;
  status: string;
  verification_note: string | null;
  momentum_impact: number | null;
};

const EMPTY_STATS: FocusHistoryStats = {
  totalVerified: 0,
  currentStreak: 0,
  totalMomentumGained: 0,
  nextPoints: 11,
  tierName: 'Ignition',
  tierFloor: 0,
  tierCeiling: 250,
  consecutiveMisses: 0,
};

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  if (error && typeof error === 'object' && 'message' in error && error.message) {
    return String(error.message);
  }
  return fallback;
}

function asStatus(value: string): FocusDirective['status'] {
  if (value === 'verified' || value === 'missed') return value;
  return 'active';
}

function asDomain(value: string): FocusDomain {
  const key = value.toLowerCase();
  if (key === 'screen_time' || key.includes('screen')) return 'screen_time';
  if (key === 'sleep' || key.includes('sleep') || key.includes('health')) return 'sleep';
  if (key === 'finance' || key.includes('plaid') || key.includes('finance') || key.includes('wealth')) return 'finance';
  return 'focus';
}

function domainLabel(domain: FocusDomain) {
  if (domain === 'screen_time') return 'Screen Time';
  if (domain === 'sleep') return 'HealthKit';
  if (domain === 'finance') return 'Plaid';
  return 'Focus';
}

function dateKey(offsetDays: number) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

const DEMO_DAYS: { offset: number; status: MomentumDay['status']; title: string; rationale: string; domain: FocusDomain }[] = [
  ...Array.from({ length: 10 }, (_, index) => {
    const offset = -17 + index;
    return {
      offset,
      status: 'verified' as const,
      title: index % 2 === 0 ? 'Finish the focus card' : 'Keep the night under 15',
      rationale: 'The card was verified, so the streak rate stepped up and the payout grew.',
      domain: 'screen_time' as const,
    };
  }),
  {
    offset: -7,
    status: 'missed',
    title: 'The late scroll ran long',
    rationale: 'One miss takes a cut of the score and halves the streak rate. It does not wipe it.',
    domain: 'screen_time',
  },
  ...Array.from({ length: 6 }, (_, index) => ({
    offset: -6 + index,
    status: 'verified' as const,
    title: index === 5 ? 'Hold the night under 15' : 'Build the rate back',
    rationale: 'Verified again. The rate kept the half that survived the miss, then climbed.',
    domain: 'screen_time' as const,
  })),
  {
    offset: 0,
    status: 'active',
    title: 'Close the late-night window',
    rationale: 'Today’s screen time and spend are paired. Verify this card to cross into the next tier.',
    domain: 'screen_time',
  },
];

function buildReviewFlightLog(): FocusDirective[] {
  const played = replayMomentum(DEMO_DAYS.map((day) => day.status));
  return DEMO_DAYS.map((day, index) => ({
    id: `sample-flight-${day.offset}`,
    directive_date: dateKey(day.offset),
    title: day.title,
    rationale: day.rationale,
    primary_domain: day.domain,
    status: day.status,
    verification_note: played.days[index]?.note,
    momentum_impact: played.days[index]?.impact ?? 0,
  })).reverse();
}

function statsFrom(entries: FocusDirective[], played: ReturnType<typeof replayMomentum>): FocusHistoryStats {
  return {
    totalVerified: entries.filter((entry) => entry.status === 'verified').length,
    currentStreak: played.streakRate,
    totalMomentumGained: played.score,
    nextPoints: played.nextPoints,
    tierName: played.tier.name,
    tierFloor: played.tier.floor,
    tierCeiling: played.tier.ceiling,
    consecutiveMisses: played.consecutiveMisses,
  };
}

function withEngine(entries: FocusDirective[]) {
  const chronological = [...entries].reverse();
  const played = replayMomentum(chronological.map((entry) => entry.status));
  const stamped = chronological.map((entry, index) => ({
    ...entry,
    momentum_impact: played.days[index]?.impact ?? entry.momentum_impact,
    verification_note: played.days[index]?.note || entry.verification_note,
  }));
  return { entries: stamped.reverse(), stats: statsFrom(stamped, played) };
}

async function currentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.id) return null;
  return data.user.id;
}

export function useFocusHistory() {
  const [entries, setEntries] = useState<FocusDirective[]>([]);
  const [stats, setStats] = useState<FocusHistoryStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (isReviewDemoActive()) {
        const engine = withEngine(buildReviewFlightLog());
        setEntries(engine.entries);
        setStats(engine.stats);
        return;
      }
      if (!isSupabaseConfigured) {
        setEntries([]);
        setStats(EMPTY_STATS);
        setError('Supabase is not configured.');
        return;
      }
      const userId = await currentUserId();
      if (!userId) {
        setEntries([]);
        setStats(EMPTY_STATS);
        return;
      }
      const { data, error: queryError } = await supabase
        .from('focus_directives')
        .select('id, directive_date, title, rationale, primary_domain, status, verification_note, momentum_impact')
        .eq('user_id', userId)
        .order('directive_date', { ascending: false });
      if (queryError) throw queryError;
      const next = ((data || []) as DirectiveRow[]).map((row) => ({
        id: row.id,
        directive_date: row.directive_date,
        title: row.title,
        rationale: row.rationale,
        primary_domain: asDomain(row.primary_domain),
        status: asStatus(row.status),
        verification_note: row.verification_note ?? undefined,
        momentum_impact: Number(row.momentum_impact) || 0,
      }));
      const engine = withEngine(next);
      setEntries(engine.entries);
      setStats(engine.stats);
    } catch (err) {
      setEntries([]);
      setStats(EMPTY_STATS);
      setError(errorMessage(err, 'Could not load directive history.'));
    } finally {
      setLoading(false);
    }
  }, []);

  const recordToday = useCallback(
    async (input: { title: string; rationale: string; primaryDomain: string; yesterdayLateNight: number | null }) => {
      if (isReviewDemoActive()) return;
      if (!isSupabaseConfigured) return;
      const userId = await currentUserId();
      if (!userId) return;
      const today = dateKey(0);
      const domain = asDomain(input.primaryDomain);
      const { error: upsertError } = await supabase.from('focus_directives').upsert(
        {
          user_id: userId,
          directive_date: today,
          title: input.title,
          rationale: input.rationale,
          primary_domain: domain,
          status: 'active',
          verification_note: `Verified tomorrow morning via ${domainLabel(domain)}.`,
          momentum_impact: 0,
        },
        { onConflict: 'user_id,directive_date' },
      );
      if (upsertError) throw upsertError;

      if (input.yesterdayLateNight == null) return;
      const verified = input.yesterdayLateNight <= 15;
      const { error: updateError } = await supabase
        .from('focus_directives')
        .update({
          status: verified ? 'verified' : 'missed',
          verification_note: verified
            ? 'Nice work! Late-night screen time stayed under 15m.'
            : `${Math.round(input.yesterdayLateNight)} min of late-night screen time. Course correcting.`,
          momentum_impact: verified ? 15 : 0,
        })
        .eq('user_id', userId)
        .eq('directive_date', dateKey(-1))
        .eq('status', 'active');
      if (updateError) throw updateError;
    },
    [],
  );

  useEffect(() => subscribeReviewDemo(() => {
    void refresh();
  }), [refresh]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { entries, stats, loading, error, refetch: refresh, refresh, recordToday };
}
