-- Profiles, friendships, and duels already ship in
-- 20261008110600_add_friends_and_duels.sql.
-- Those statements stay idempotent here. Policies are created only when missing
-- so this file can run after that migration. Device habit logs are new.

-- 1. Ensure profiles table has core fields
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS momentum_score INT DEFAULT 0 CHECK (momentum_score BETWEEN 0 AND 100),
ADD COLUMN IF NOT EXISTS current_streak INT DEFAULT 0;

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

-- 4. Device & Habit Metrics Table (Screen Time, Pickups, Environmental & Circadian)
CREATE TABLE IF NOT EXISTS public.device_habit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_screen_minutes INT DEFAULT 0,
  social_minutes INT DEFAULT 0,
  shopping_minutes INT DEFAULT 0,
  entertainment_minutes INT DEFAULT 0,
  late_night_screen_minutes INT DEFAULT 0,
  phone_pickups INT DEFAULT 0,
  notifications_received INT DEFAULT 0,
  daylight_minutes INT DEFAULT 0,
  avg_noise_exposure_db NUMERIC(5,2) DEFAULT 0,
  focus_mode_minutes INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, log_date)
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_habit_logs ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for Friendships
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'friendships' AND policyname = 'Users can view their own friendships'
  ) THEN
    CREATE POLICY "Users can view their own friendships" ON public.friendships
      FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'friendships' AND policyname = 'Users can create friend requests'
  ) THEN
    CREATE POLICY "Users can create friend requests" ON public.friendships
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'friendships' AND policyname = 'Users can update their friendship status'
  ) THEN
    CREATE POLICY "Users can update their friendship status" ON public.friendships
      FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = friend_id);
  END IF;
END $$;

-- 7. RLS Policies for Duels
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'duels' AND policyname = 'Users can view duels they participate in'
  ) THEN
    CREATE POLICY "Users can view duels they participate in" ON public.duels
      FOR SELECT USING (auth.uid() = challenger_id OR auth.uid() = opponent_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'duels' AND policyname = 'Users can create duels'
  ) THEN
    CREATE POLICY "Users can create duels" ON public.duels
      FOR INSERT WITH CHECK (auth.uid() = challenger_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'duels' AND policyname = 'Users can update their active duels'
  ) THEN
    CREATE POLICY "Users can update their active duels" ON public.duels
      FOR UPDATE USING (auth.uid() = challenger_id OR auth.uid() = opponent_id);
  END IF;
END $$;

-- 8. RLS Policies for Device Habit Logs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'device_habit_logs' AND policyname = 'Users can manage their own device habit logs'
  ) THEN
    CREATE POLICY "Users can manage their own device habit logs" ON public.device_habit_logs
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;
