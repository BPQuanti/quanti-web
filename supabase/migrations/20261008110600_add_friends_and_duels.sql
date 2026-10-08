-- Friendships, momentum duels, and leaderboard privacy.
-- Additive only: new columns use IF NOT EXISTS, and existing profile policies are left unchanged.

-- 1. Ensure profiles table has username, momentum_score, streak, and leaderboard privacy columns
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS momentum_score INT DEFAULT 0 CHECK (momentum_score BETWEEN 0 AND 100),
ADD COLUMN IF NOT EXISTS current_streak INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS leaderboard_visibility TEXT DEFAULT 'friends';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_leaderboard_visibility_check'
  ) THEN
    ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_leaderboard_visibility_check
    CHECK (leaderboard_visibility IN ('private', 'friends', 'public'));
  END IF;
END $$;

-- 2. Friendships Table
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'blocked')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, friend_id)
);

-- 3. Momentum Duels Table
CREATE TABLE IF NOT EXISTS public.duels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenger_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opponent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'active', 'completed')) DEFAULT 'pending',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  winner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duels ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for Friendships
CREATE POLICY "Users can view their own friendships" ON public.friendships
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);
CREATE POLICY "Users can create friend requests" ON public.friendships
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their friendship status" ON public.friendships
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- 6. RLS Policies for Duels
CREATE POLICY "Users can view duels they participate in" ON public.duels
  FOR SELECT USING (auth.uid() = challenger_id OR auth.uid() = opponent_id);
CREATE POLICY "Users can create duels" ON public.duels
  FOR INSERT WITH CHECK (auth.uid() = challenger_id);
CREATE POLICY "Users can update their active duels" ON public.duels
  FOR UPDATE USING (auth.uid() = challenger_id OR auth.uid() = opponent_id);

CREATE INDEX IF NOT EXISTS friendships_user_id_idx ON public.friendships (user_id);
CREATE INDEX IF NOT EXISTS friendships_friend_id_idx ON public.friendships (friend_id);
CREATE INDEX IF NOT EXISTS duels_challenger_id_idx ON public.duels (challenger_id);
CREATE INDEX IF NOT EXISTS duels_opponent_id_idx ON public.duels (opponent_id);
CREATE INDEX IF NOT EXISTS profiles_momentum_score_idx ON public.profiles (momentum_score DESC);
