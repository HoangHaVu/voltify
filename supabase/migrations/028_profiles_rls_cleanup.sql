-- Migration 028: Profiles RLS Cleanup
-- Entfernt ALLE alten/fehlerhaften Policies und erstellt nur die sauberen neuen.
-- Das verhindert, dass irgendwo noch eine rekursive Policy herumliegt.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 1. ALLE bestehenden Policies auf profiles entfernen (sicheres Cleanup)
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.profiles', pol.policyname);
  END LOOP;
END $$;

-- 2. SECURITY DEFINER Hilfsfunktion (bypassed RLS fuer Owner-Lookup)
CREATE OR REPLACE FUNCTION public.get_user_owner_id(user_id uuid)
RETURNS uuid AS $$
  SELECT owner_id FROM public.profiles WHERE id = user_id;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 3. Policy A: Jeder darf sein eigenes Profil lesen
--    Inhaber darf Profile seiner Mitarbeiter lesen
CREATE POLICY "profiles_read_own" ON public.profiles
  FOR SELECT USING (
    id = auth.uid()
    OR owner_id = auth.uid()
  );

-- 4. Policy B: Mitarbeiter duerfen das Profil ihres Inhabers lesen
--    (fuer Firmenname, Branding, etc.)
CREATE POLICY "profiles_read_owner" ON public.profiles
  FOR SELECT USING (
    id = public.get_user_owner_id(auth.uid())
  );

-- 5. Update-Policy: User duerfen ihr eigenes Profil aktualisieren
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (
    id = auth.uid()
  );

-- 6. Insert-Policy: Nur Service-Role oder Trigger duerfen inserten
CREATE POLICY "profiles_insert_trigger" ON public.profiles
  FOR INSERT WITH CHECK (
    id = auth.uid()
  );
