ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS north_star_now TEXT,
  ADD COLUMN IF NOT EXISTS north_star_next TEXT,
  ADD COLUMN IF NOT EXISTS north_star_outcomes JSONB DEFAULT '[]'::jsonb;
