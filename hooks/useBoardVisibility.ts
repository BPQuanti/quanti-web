import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

export type BoardVisibility = 'private' | 'friends' | 'public';

function isVisibility(value: string | undefined): value is BoardVisibility {
  return value === 'private' || value === 'friends' || value === 'public';
}

export function useBoardVisibility() {
  const { user } = useAuth() as { user?: { id?: string } | null };
  const [visibility, setVisibility] = useState<BoardVisibility>('friends');

  const load = useCallback(async () => {
    if (!user?.id || !isSupabaseConfigured) return;
    const { data } = await supabase.from('profiles').select('leaderboard_visibility').eq('id', user.id).limit(1);
    const next = (data?.[0] as { leaderboard_visibility?: string } | undefined)?.leaderboard_visibility;
    if (isVisibility(next)) setVisibility(next);
  }, [user?.id]);

  useFocusEffect(useCallback(() => {
    void load();
  }, [load]));

  const choose = useCallback(async (next: BoardVisibility) => {
    const previous = visibility;
    setVisibility(next);
    if (!user?.id || !isSupabaseConfigured) return;
    const { error } = await supabase.from('profiles').upsert({ id: user.id, leaderboard_visibility: next });
    if (error) {
      setVisibility(previous);
      Alert.alert('Could not update visibility', error.message || 'Try again in a moment.');
    }
  }, [user?.id, visibility]);

  return { visibility, choose };
}
