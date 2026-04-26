-- Fix handle_new_user trigger: SECURITY DEFINER functions need an explicit
-- search_path or they can't resolve table names like 'profiles'.
-- Also use COALESCE in case email is briefly null during confirmation flow.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, COALESCE(NEW.email, ''));
  RETURN NEW;
END;
$$;
