import { useCallback, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { DuelDay } from '../src/lib/momentum';

export type Duel = {
  id: string;
  challengerId: string;
  opponentId: string;
  challengerName: string | null;
  opponentName: string | null;
  challengerScore: number;
  opponentScore: number;
  challengerVerified: number;
  opponentVerified: number;
  challengerDays?: DuelDay[];
  opponentDays?: DuelDay[];
  status: 'pending' | 'active' | 'completed';
  startDate: string;
  endDate: string;
  durationDays: number;
  winnerId: string | null;
  createdAt: string;
  youAreOpponent: boolean;
  kind?: 'friend' | 'stranger';
};

type DuelRow = {
  id: string;
  challenger_id: string;
  opponent_id: string;
  status: string;
  start_date: string;
  end_date: string;
  winner_id: string | null;
  created_at: string;
};

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  if (error && typeof error === 'object' && 'message' in error && error.message) {
    return String(error.message);
  }
  return fallback;
}

function isMissingSession(error: unknown) {
  return errorMessage(error, '').toLowerCase().includes('session missing');
}

async function currentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    if (isMissingSession(error)) return null;
    throw error;
  }
  return data.user?.id ?? null;
}

function asStatus(value: string): Duel['status'] {
  if (value === 'active' || value === 'completed') return value;
  return 'pending';
}

export type DuelDuration = 3 | 7 | 14;

function isoDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function durationDays(start: string, end: string) {
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  const days = Math.round((endDate.getTime() - startDate.getTime()) / 86400000);
  return Number.isFinite(days) && days > 0 ? days : 0;
}

export function useDuels() {
  const [duels, setDuels] = useState<Duel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!isSupabaseConfigured) {
        setDuels([]);
        setError('Supabase is not configured.');
        return;
      }

      const userId = await currentUserId();
      if (!userId) {
        setDuels([]);
        return;
      }

      const { data, error: queryError } = await supabase
        .from('duels')
        .select('id, challenger_id, opponent_id, status, start_date, end_date, winner_id, created_at')
        .or(`challenger_id.eq.${userId},opponent_id.eq.${userId}`)
        .in('status', ['pending', 'active'])
        .order('created_at', { ascending: false });
      if (queryError) throw queryError;

      const rawRows = (data || []) as DuelRow[];
      const profileIds = [...new Set(rawRows.flatMap((row) => [row.challenger_id, row.opponent_id]))];
      const profilesById = new Map<string, { username: string | null; momentum_score: number | null }>();
      if (profileIds.length) {
        const { data: profileRows, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, momentum_score')
          .in('id', profileIds);
        if (profileError) throw profileError;
        for (const profile of (profileRows || []) as { id: string; username: string | null; momentum_score: number | null }[]) {
          profilesById.set(profile.id, profile);
        }
      }

      const rows = rawRows.map((row) => ({
        id: row.id,
        challengerId: row.challenger_id,
        opponentId: row.opponent_id,
        challengerName: profilesById.get(row.challenger_id)?.username ?? null,
        opponentName: profilesById.get(row.opponent_id)?.username ?? null,
        challengerScore: Number(profilesById.get(row.challenger_id)?.momentum_score) || 0,
        opponentScore: Number(profilesById.get(row.opponent_id)?.momentum_score) || 0,
        challengerVerified: 0,
        opponentVerified: 0,
        status: asStatus(row.status),
        startDate: row.start_date,
        endDate: row.end_date,
        durationDays: durationDays(row.start_date, row.end_date),
        winnerId: row.winner_id,
        createdAt: row.created_at,
        youAreOpponent: row.opponent_id === userId,
      }));
      setDuels(rows);
    } catch (err) {
      setDuels([]);
      setError(errorMessage(err, 'Could not load duels.'));
    } finally {
      setLoading(false);
    }
  }, []);

  const createDuel = useCallback(async (opponentId: string, durationDays: DuelDuration) => {
    if (!opponentId) throw new Error('Choose someone to challenge.');
    if (durationDays !== 3 && durationDays !== 7 && durationDays !== 14) {
      throw new Error('Choose a 3, 7, or 14 day duel.');
    }
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');

    const userId = await currentUserId();
    if (!userId) throw new Error('Sign in to issue a challenge.');
    if (opponentId === userId) throw new Error('You cannot duel yourself.');

    const { data: friendshipRows, error: friendshipError } = await supabase
      .from('friendships')
      .select('id, status')
      .or(`and(user_id.eq.${userId},friend_id.eq.${opponentId}),and(user_id.eq.${opponentId},friend_id.eq.${userId})`)
      .limit(1);
    if (friendshipError) throw new Error(errorMessage(friendshipError, 'Could not confirm that friendship.'));
    const friendship = ((friendshipRows || []) as { status: string }[])[0];
    if (friendship?.status === 'blocked') throw new Error('You cannot challenge this person.');
    if (friendship?.status !== 'accepted') {
      throw new Error('You can only challenge an accepted friend. Strangers join the queue.');
    }

    const start = new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + durationDays);

    const { error: insertError } = await supabase.from('duels').insert({
      challenger_id: userId,
      opponent_id: opponentId,
      status: 'pending',
      start_date: isoDate(start),
      end_date: isoDate(end),
    });
    if (insertError) throw new Error(errorMessage(insertError, 'Could not issue the challenge.'));
    await refresh();
  }, [refresh]);

  const updateDuelStatus = useCallback(async (duelId: string, status: 'active' | 'completed') => {
    if (!duelId) throw new Error('That duel could not be found.');
    if (status !== 'active' && status !== 'completed') throw new Error('Choose an active or completed duel.');
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
    const userId = await currentUserId();
    if (!userId) throw new Error('Sign in to update a duel.');

    const { data: rows, error: lookupError } = await supabase
      .from('duels')
      .select('id, challenger_id, opponent_id, status')
      .eq('id', duelId)
      .limit(1);
    if (lookupError) throw new Error(errorMessage(lookupError, 'Could not load that duel.'));
    const row = ((rows || []) as { challenger_id: string; opponent_id: string; status: string }[])[0];
    if (!row) throw new Error('That duel could not be found.');
    if (row.challenger_id !== userId && row.opponent_id !== userId) throw new Error('You are not in this duel.');
    if (status === 'active' && (row.status !== 'pending' || row.opponent_id !== userId)) {
      throw new Error('Only the opponent can accept a pending duel.');
    }

    const { error: updateError } = await supabase.from('duels').update({ status }).eq('id', duelId);
    if (updateError) throw new Error(errorMessage(updateError, 'Could not update that duel.'));
    await refresh();
  }, [refresh]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { duels, loading, error, refresh, createDuel, updateDuelStatus };
}
