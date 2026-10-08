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

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { duels, loading, error, refresh };
}
