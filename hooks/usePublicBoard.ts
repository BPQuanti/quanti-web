import { useCallback, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export type PublicPlayer = {
  userId: string;
  username: string | null;
  momentumScore: number;
  memberSince?: string | null;
  wins?: number | null;
};

type ProfileRow = {
  id: string;
  username: string | null;
  momentum_score: number | null;
};

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  if (error && typeof error === 'object' && 'message' in error && error.message) {
    return String(error.message);
  }
  return fallback;
}

export function usePublicBoard() {
  const [players, setPlayers] = useState<PublicPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!isSupabaseConfigured) {
        setPlayers([]);
        setError('Supabase is not configured.');
        return;
      }

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        setPlayers([]);
        return;
      }

      const { data, error: queryError } = await supabase
        .from('profiles')
        .select('id, username, momentum_score')
        .eq('leaderboard_visibility', 'public')
        .order('momentum_score', { ascending: false })
        .limit(40);
      if (queryError) throw queryError;

      setPlayers(
        ((data || []) as ProfileRow[])
          .filter((row) => row.id !== userData.user.id)
          .map((row) => ({
            userId: row.id,
            username: row.username,
            momentumScore: Number(row.momentum_score) || 0,
          })),
      );
    } catch (err) {
      setPlayers([]);
      setError(errorMessage(err, 'Could not load the public board.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { players, loading, error, refresh };
}
