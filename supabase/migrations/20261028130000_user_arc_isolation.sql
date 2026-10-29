-- Per-user Agency Arc on profiles. New users get a blank profile with no default Arc.

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS agency_arc TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_agency_arc_check'
  ) THEN
    ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_agency_arc_check
    CHECK (
      agency_arc IS NULL
      OR agency_arc IN ('recovery', 'deep_work', 'capital', 'clarity', 'momentum', 'somatic')
    );
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, agency_arc)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NULL,
    NULL
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();
