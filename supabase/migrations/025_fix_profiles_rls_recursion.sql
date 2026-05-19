-- Migration 025: Fix infinite recursion in profiles RLS policy
-- Die Subquery "id IN (SELECT id FROM profiles WHERE owner_id = auth.uid())" 
-- verursacht infinite recursion, weil die Subquery SELBST wieder die Policy prueft

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Alte Policy loeschen
DROP POLICY IF EXISTS "profiles_read_scope" ON public.profiles;

-- Neue Policy OHNE rekursive Subquery:
-- 1. Jeder darf sein EIGENES Profil lesen (id = auth.uid())
-- 2. Inhaber darf Profile seiner Mitarbeiter lesen (owner_id = auth.uid())
-- 3. Mitarbeiter duerfen ihr eigenes Profil + Inhaber-Profil lesen
CREATE POLICY "profiles_read_own" ON public.profiles
  FOR SELECT USING (
    id = auth.uid()
    OR owner_id = auth.uid()
  );

-- Zusaetzliche Policy: Mitarbeiter duerfen das Profil ihres Inhabers lesen
-- (damit sie den Firmennamen etc. sehen koennen)
DROP POLICY IF EXISTS "profiles_read_owner" ON public.profiles;
CREATE POLICY "profiles_read_owner" ON public.profiles
  FOR SELECT USING (
    id = (SELECT owner_id FROM public.profiles WHERE id = auth.uid() LIMIT 1)
  );
