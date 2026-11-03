-- Single Active Destination board + static North Star pointer.
-- Exactly one status = 'active' row per user.

CREATE TABLE IF NOT EXISTS public.user_destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  stale_pattern TEXT,
  status TEXT NOT NULL DEFAULT 'queued'
    CHECK (status IN ('active', 'queued', 'archived')),
  last_question_angle TEXT NOT NULL DEFAULT 'BOTTLENECK'
    CHECK (last_question_angle IN ('ARTIFACT', 'WINDOW', 'PERSON', 'LEFTOVER', 'BOTTLENECK')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_destination_per_user
  ON public.user_destinations (user_id)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_user_destinations_user_status
  ON public.user_destinations (user_id, status);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS north_star TEXT,
  ADD COLUMN IF NOT EXISTS active_destination_id UUID,
  ADD COLUMN IF NOT EXISTS next_morning_question TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_active_destination_id_fkey'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_active_destination_id_fkey
      FOREIGN KEY (active_destination_id)
      REFERENCES public.user_destinations(id)
      ON DELETE SET NULL;
  END IF;
END $$;

ALTER TABLE public.user_destinations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own destinations" ON public.user_destinations;
CREATE POLICY "Users can manage their own destinations"
  ON public.user_destinations
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Backfill: existing Active Target (north_star_next) becomes the one active destination.
INSERT INTO public.user_destinations (user_id, title, stale_pattern, status)
SELECT
  p.id,
  left(trim(p.north_star_next), 280),
  NULL,
  'active'
FROM public.profiles p
WHERE coalesce(trim(p.north_star_next), '') <> ''
  AND NOT EXISTS (
    SELECT 1
    FROM public.user_destinations d
    WHERE d.user_id = p.id
      AND d.status = 'active'
  );

UPDATE public.profiles p
SET active_destination_id = d.id
FROM public.user_destinations d
WHERE d.user_id = p.id
  AND d.status = 'active'
  AND p.active_destination_id IS NULL;

UPDATE public.profiles
SET north_star = left(trim(north_star_now), 280)
WHERE coalesce(trim(north_star), '') = ''
  AND coalesce(trim(north_star_now), '') <> ''
  AND trim(north_star_now) IS DISTINCT FROM trim(north_star_next);

CREATE OR REPLACE FUNCTION public.swap_active_destination(p_destination_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.user_destinations
    WHERE id = p_destination_id
      AND user_id = auth.uid()
      AND status <> 'archived'
  ) THEN
    RAISE EXCEPTION 'destination not found';
  END IF;

  UPDATE public.user_destinations
  SET status = 'queued',
      updated_at = now()
  WHERE user_id = auth.uid()
    AND status = 'active'
    AND id <> p_destination_id;

  UPDATE public.user_destinations
  SET status = 'active',
      updated_at = now()
  WHERE id = p_destination_id
    AND user_id = auth.uid();

  UPDATE public.profiles
  SET active_destination_id = p_destination_id,
      updated_at = now()
  WHERE id = auth.uid();
END;
$$;

REVOKE ALL ON FUNCTION public.swap_active_destination(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.swap_active_destination(UUID) TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_destinations TO authenticated;
