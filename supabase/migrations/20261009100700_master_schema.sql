-- Idempotent master schema. Safe to run after the earlier migrations.
-- CREATE TABLE IF NOT EXISTS does not add columns to an existing table,
-- so expanded telemetry columns are applied with ALTER TABLE as well.
-- Policies use IF NOT EXISTS checks because CREATE POLICY cannot be repeated.

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS momentum_score INT DEFAULT 0 CHECK (momentum_score BETWEEN 0 AND 100),
ADD COLUMN IF NOT EXISTS current_streak INT DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'blocked')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, friend_id)
);

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
  location_stability_score NUMERIC(3,2) DEFAULT 1.00 CHECK (location_stability_score BETWEEN 0.00 AND 1.00),
  transit_minutes INT DEFAULT 0,
  headphone_minutes INT DEFAULT 0,
  plugged_in_timestamp TIMESTAMP WITH TIME ZONE,
  unplugged_timestamp TIMESTAMP WITH TIME ZONE,
  low_battery_events INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, log_date)
);

ALTER TABLE public.device_habit_logs
ADD COLUMN IF NOT EXISTS location_stability_score NUMERIC(3,2) DEFAULT 1.00 CHECK (location_stability_score BETWEEN 0.00 AND 1.00),
ADD COLUMN IF NOT EXISTS transit_minutes INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS headphone_minutes INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS plugged_in_timestamp TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS unplugged_timestamp TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS low_battery_events INT DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.focus_directives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  directive_date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT NOT NULL,
  rationale TEXT NOT NULL,
  primary_domain TEXT NOT NULL,
  status TEXT CHECK (status IN ('active', 'verified', 'missed')) DEFAULT 'active',
  verification_note TEXT,
  momentum_impact INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, directive_date)
);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_directives ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'friendships' AND policyname = 'Users manage friendships'
  ) THEN
    CREATE POLICY "Users manage friendships" ON public.friendships
      FOR ALL
      USING (auth.uid() = user_id OR auth.uid() = friend_id)
      WITH CHECK (auth.uid() = user_id OR auth.uid() = friend_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'duels' AND policyname = 'Users manage duels'
  ) THEN
    CREATE POLICY "Users manage duels" ON public.duels
      FOR ALL
      USING (auth.uid() = challenger_id OR auth.uid() = opponent_id)
      WITH CHECK (auth.uid() = challenger_id OR auth.uid() = opponent_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'device_habit_logs' AND policyname = 'Users manage device logs'
  ) THEN
    CREATE POLICY "Users manage device logs" ON public.device_habit_logs
      FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'focus_directives' AND policyname = 'Users manage directives'
  ) THEN
    CREATE POLICY "Users manage directives" ON public.focus_directives
      FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
