-- Day-keyed move cache + mark machine. Marks stay client-authoritative;
-- these columns echo them when the daily card is upserted.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'miss_reason') THEN
    CREATE TYPE public.miss_reason AS ENUM ('too_big', 'wrong_move', 'exogenous', 'none');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mark_state') THEN
    CREATE TYPE public.mark_state AS ENUM ('executed', 'partial', 'shifted', 'unknown');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'capacity_window') THEN
    CREATE TYPE public.capacity_window AS ENUM ('contracted', 'baseline', 'expanded');
  END IF;
END $$;

ALTER TABLE public.focus_directives
  ADD COLUMN IF NOT EXISTS day_id TEXT,
  ADD COLUMN IF NOT EXISTS triplets JSONB,
  ADD COLUMN IF NOT EXISTS selected_window public.capacity_window,
  ADD COLUMN IF NOT EXISTS mark_state public.mark_state NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS miss_reason public.miss_reason NOT NULL DEFAULT 'none';

UPDATE public.focus_directives
SET day_id = to_char(directive_date, 'YYYY-MM-DD')
WHERE day_id IS NULL;

CREATE INDEX IF NOT EXISTS focus_directives_user_day_id_idx
  ON public.focus_directives (user_id, day_id);
