-- Daily directive history. One row per user per day.

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
  UNIQUE (user_id, directive_date)
);

ALTER TABLE public.focus_directives ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'focus_directives'
      AND policyname = 'Users can manage their own focus directives'
  ) THEN
    CREATE POLICY "Users can manage their own focus directives" ON public.focus_directives
      FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS focus_directives_user_date_idx
  ON public.focus_directives (user_id, directive_date DESC);
