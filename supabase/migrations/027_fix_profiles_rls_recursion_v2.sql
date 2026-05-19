-- Migration 027: Fix remaining infinite recursion in profiles RLS
-- Die Policy "profiles_read_owner" nutzte eine Subquery auf profiles,
-- was ebenfalls infinite recursion verursacht.
-- Loesung: SECURITY DEFINER Funktion, die RLS bypassed.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 1. Hilfsfunktion: Gibt die owner_id eines Users zurueck (bypassed RLS)
CREATE OR REPLACE FUNCTION public.get_user_owner_id(user_id uuid)
RETURNS uuid AS $$
  SELECT owner_id FROM public.profiles WHERE id = user_id;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 2. Rekursive Policy entfernen
DROP POLICY IF EXISTS "profiles_read_owner" ON public.profiles;

-- 3. Neue Policy OHNE rekursive Subquery:
--    Mitarbeiter duerfen das Profil ihres Inhabers lesen
CREATE POLICY "profiles_read_owner_v2" ON public.profiles
  FOR SELECT USING (
    id = public.get_user_owner_id(auth.uid())
  );

-- 4. Sicherstellen: profiles_read_own existiert und ist korrekt
DROP POLICY IF EXISTS "profiles_read_scope" ON public.profiles;
DROP POLICY IF EXISTS "profiles_read_scope_v2" ON public.profiles;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles'
      AND policyname = 'profiles_read_own'
  ) THEN
    CREATE POLICY "profiles_read_own" ON public.profiles
      FOR SELECT USING (
        id = auth.uid()
        OR owner_id = auth.uid()
      );
  END IF;
END $$;
