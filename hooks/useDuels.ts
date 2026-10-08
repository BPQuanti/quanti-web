import { useCallback, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export type Duel = {
  id: string;
  challengerId: string;
  opponentId: string;
  status: 'pending' | 'active' | 'completed';
  startDate: string;
  endDate: string;
  winnerId: string | null;
  createdAt: string;
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

      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      const userId = authData.user?.id;
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

      const rows = ((data || []) as DuelRow[]).map((row) => ({
        id: row.id,
        challengerId: row.challenger_id,
        opponentId: row.opponent_id,
        status: asStatus(row.status),
        startDate: row.start_date,
        endDate: row.end_date,
        winnerId: row.winner_id,
        createdAt: row.created_at,
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
    if (!opponentId) throw new Error('Choose a friend to challenge.');
    if (durationDays !== 3 && durationDays !== 7 && durationDays !== 14) {
      throw new Error('Choose a 3, 7, or 14 day duel.');
    }
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) throw new Error(errorMessage(authError, 'Sign in to issue a challenge.'));
    const userId = authData.user?.id;
    if (!userId) throw new Error('Sign in to issue a challenge.');
    if (opponentId === userId) throw new Error('You cannot duel yourself.');

    const { data: friendshipRows, error: friendshipError } = await supabase
      .from('friendships')
      .select('id')
      .eq('status', 'accepted')
      .or(`and(user_id.eq.${userId},friend_id.eq.${opponentId}),and(user_id.eq.${opponentId},friend_id.eq.${userId})`)
      .limit(1);
    if (friendshipError) throw new Error(errorMessage(friendshipError, 'Could not confirm that friendship.'));
    if (!((friendshipRows || []) as { id: string }[]).length) {
      throw new Error('You can only challenge an accepted friend.');
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

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { duels, loading, error, refresh, createDuel };
}
