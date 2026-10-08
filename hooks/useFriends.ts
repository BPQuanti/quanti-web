import { useCallback, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export type Friend = {
  friendshipId: string;
  userId: string;
  username: string | null;
  avatarUrl: string | null;
  momentumScore: number;
  currentStreak: number;
};

type FriendshipRow = {
  id: string;
  user_id: string;
  friend_id: string;
  status: string;
};

type ProfileRow = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  momentum_score: number | null;
  current_streak: number | null;
};

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  if (error && typeof error === 'object' && 'message' in error && error.message) {
    return String(error.message);
  }
  return fallback;
}

export function useFriends() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!isSupabaseConfigured) {
        setFriends([]);
        setError('Supabase is not configured.');
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      const userId = authData.user?.id;
      if (!userId) {
        setFriends([]);
        return;
      }

      const { data, error: queryError } = await supabase
        .from('friendships')
        .select('id, user_id, friend_id, status')
        .eq('status', 'accepted')
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`);
      if (queryError) throw queryError;

      const rows = (data || []) as FriendshipRow[];
      const friendIds = rows.map((row) => (row.user_id === userId ? row.friend_id : row.user_id));
      const profilesById = new Map<string, ProfileRow>();

      if (friendIds.length) {
        const { data: profileRows, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, momentum_score, current_streak')
          .in('id', friendIds);
        if (profileError) throw profileError;
        for (const profile of (profileRows || []) as ProfileRow[]) {
          profilesById.set(profile.id, profile);
        }
      }

      const ranked = rows
        .map((row) => {
          const id = row.user_id === userId ? row.friend_id : row.user_id;
          const profile = profilesById.get(id);
          return {
            friendshipId: row.id,
            userId: id,
            username: profile?.username ?? null,
            avatarUrl: profile?.avatar_url ?? null,
            momentumScore: Number(profile?.momentum_score) || 0,
            currentStreak: Number(profile?.current_streak) || 0,
          };
        })
        .sort((a, b) => b.momentumScore - a.momentumScore || a.userId.localeCompare(b.userId));

      setFriends(ranked);
    } catch (err) {
      setFriends([]);
      setError(errorMessage(err, 'Could not load friends.'));
    } finally {
      setLoading(false);
    }
  }, []);

  const sendFriendRequest = useCallback(async (rawUsername: string) => {
    const username = rawUsername.trim().replace(/^@+/, '');
    if (!username) throw new Error('Enter a username.');
    if (!/^[A-Za-z0-9._]+$/.test(username)) throw new Error('Usernames can use letters, numbers, dots, and underscores.');
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) throw new Error(errorMessage(authError, 'Sign in to send a request.'));
    const userId = authData.user?.id;
    if (!userId) throw new Error('Sign in to send a request.');

    const { data: matches, error: profileError } = await supabase
      .from('profiles')
      .select('id, username')
      .ilike('username', username)
      .limit(1);
    if (profileError) throw new Error(errorMessage(profileError, 'Could not look up that username.'));

    const match = ((matches || []) as { id: string }[])[0];
    if (!match?.id) throw new Error('No one with that username was found.');
    if (match.id === userId) throw new Error('You cannot add yourself.');

    const { data: existingRows, error: existingError } = await supabase
      .from('friendships')
      .select('id, status')
      .or(`and(user_id.eq.${userId},friend_id.eq.${match.id}),and(user_id.eq.${match.id},friend_id.eq.${userId})`);
    if (existingError) throw new Error(errorMessage(existingError, 'Could not check existing requests.'));

    const existing = ((existingRows || []) as { status: string }[])[0];
    if (existing?.status === 'accepted') throw new Error('You are already friends.');
    if (existing?.status === 'pending') throw new Error('A request is already pending.');
    if (existing?.status === 'blocked') throw new Error('This person cannot be added.');

    const { error: insertError } = await supabase.from('friendships').insert({
      user_id: userId,
      friend_id: match.id,
      status: 'pending',
    });
    if (insertError) {
      const code = typeof insertError === 'object' && insertError && 'code' in insertError ? String(insertError.code) : '';
      if (code === '23505') throw new Error('A request is already pending.');
      throw new Error(errorMessage(insertError, 'Could not send the request.'));
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { friends, loading, error, refresh, sendFriendRequest };
}
