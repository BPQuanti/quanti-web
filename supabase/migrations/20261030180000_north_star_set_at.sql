ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS north_star_set_at TIMESTAMPTZ;
