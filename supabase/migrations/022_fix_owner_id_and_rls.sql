-- Migration 022: Fix owner_id + RLS Policies
-- NOTFALL: leads hat RLS aktiviert aber keine Policy → App ist kaputt
-- Diese Migration fügt owner_id zu profiles hinzu und erstellt ALLE RLS-Policies korrekt

-- ── 1. owner_id zu profiles hinzufügen ────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_owner_id ON public.profiles (owner_id);

-- ── 2. RLS für Leads (NOTFALL-FIX) ───────────────────────────────────
-- Zuerst eine temporäre "allow all" Policy, damit die App sofort wieder funktioniert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'leads'
  ) THEN
    -- Temporär: alle authentifizierten Nutzer dürfen lesen, bis richtige Policy aktiv ist
    CREATE POLICY "leads_temp_allow_all" ON public.leads
      FOR ALL USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- Richtige Policy erstellen (ersetzt temporäre falls vorhanden)
DO $$
BEGIN
  -- Alte Policies löschen (inkl. fehlerhafte/teilweise erstellte)
  DROP POLICY IF EXISTS "leads_scope_policy" ON public.leads;
  DROP POLICY IF EXISTS "leads_temp_allow_all" ON public.leads;

  -- Richtige Policy: eigene Daten OR Daten von Mitarbeitern des Owners
  CREATE POLICY "leads_scope_policy" ON public.leads
    FOR ALL USING (
      installer_id = auth.uid()
      OR installer_id IN (SELECT id FROM public.profiles WHERE owner_id = auth.uid())
    )
    WITH CHECK (
      installer_id = auth.uid()
      OR installer_id IN (SELECT id FROM public.profiles WHERE owner_id = auth.uid())
    );
END $$;

-- ── 3. RLS für Projects ──────────────────────────────────────────────
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "projects_scope_policy" ON public.projects;

  CREATE POLICY "projects_scope_policy" ON public.projects
    FOR ALL USING (
      installer_id = auth.uid()
      OR installer_id IN (SELECT id FROM public.profiles WHERE owner_id = auth.uid())
    )
    WITH CHECK (
      installer_id = auth.uid()
      OR installer_id IN (SELECT id FROM public.profiles WHERE owner_id = auth.uid())
    );
END $$;

-- ── 4. RLS für Appointments ──────────────────────────────────────────
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "appointments_scope_policy" ON public.appointments;

  CREATE POLICY "appointments_scope_policy" ON public.appointments
    FOR ALL USING (
      installer_id = auth.uid()
      OR installer_id IN (SELECT id FROM public.profiles WHERE owner_id = auth.uid())
    )
    WITH CHECK (
      installer_id = auth.uid()
      OR installer_id IN (SELECT id FROM public.profiles WHERE owner_id = auth.uid())
    );
END $$;

-- ── 5. RLS für Notes ─────────────────────────────────────────────────
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "installers_manage_own_notes" ON public.notes;
  DROP POLICY IF EXISTS "notes_scope_policy" ON public.notes;

  CREATE POLICY "notes_scope_policy" ON public.notes
    FOR ALL USING (
      installer_id = auth.uid()
      OR installer_id IN (SELECT id FROM public.profiles WHERE owner_id = auth.uid())
    )
    WITH CHECK (
      installer_id = auth.uid()
      OR installer_id IN (SELECT id FROM public.profiles WHERE owner_id = auth.uid())
    );
END $$;

-- ── 6. RLS für Profiles ──────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "profiles_read_scope" ON public.profiles;

  CREATE POLICY "profiles_read_scope" ON public.profiles
    FOR SELECT USING (
      id = auth.uid()
      OR owner_id = auth.uid()
      OR id IN (SELECT id FROM public.profiles WHERE owner_id = auth.uid())
    );
END $$;
