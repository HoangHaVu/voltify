-- Migration 026: Add email column to profiles
-- Emails werden aus auth.users synchronisiert, damit die Team-Verwaltung sie anzeigen kann.

-- 1. Spalte hinzufügen
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email text;

-- 2. Bestehende Emails aus auth.users übertragen
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id
  AND p.email IS NULL;

-- 3. Trigger-Funktion erweitern: email bei Erstellung/Bearbeitung synchronisieren
-- (Falls der handle_new_user Trigger existiert, erweitern wir ihn)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Auch bei Updates in auth.users die email syncen
CREATE OR REPLACE FUNCTION public.sync_user_email()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET email = NEW.email
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger erstellen (falls noch nicht vorhanden)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'on_auth_user_updated'
  ) THEN
    CREATE TRIGGER on_auth_user_updated
      AFTER UPDATE ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.sync_user_email();
  END IF;
END $$;
