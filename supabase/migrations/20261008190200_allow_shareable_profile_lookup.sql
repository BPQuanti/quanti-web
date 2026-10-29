-- Friend search and leaderboard names need to read another member's public card.
-- Private profiles stay hidden. Existing own-row policies are left in place.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'Signed-in users can view shareable profiles'
  ) THEN
    CREATE POLICY "Signed-in users can view shareable profiles" ON public.profiles
      FOR SELECT USING (
        auth.uid() IS NOT NULL
        AND COALESCE(leaderboard_visibility, 'friends') <> 'private'
      );
  END IF;
END $$;
