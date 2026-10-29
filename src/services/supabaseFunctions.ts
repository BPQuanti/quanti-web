import { isSupabaseConfigured } from '../lib/supabase';

export function edgeFunctionUrl(name: string) {
  const base = process.env.EXPO_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!base || !anon || !isSupabaseConfigured) {
    return null;
  }
  return { url: `${base}/functions/v1/${name}`, anon };
}
