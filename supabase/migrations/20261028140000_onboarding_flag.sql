ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN NOT NULL DEFAULT FALSE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, agency_arc, has_completed_onboarding)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NULL,
    NULL,
    FALSE
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
