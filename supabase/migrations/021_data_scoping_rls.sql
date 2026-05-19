-- Migration 021: RLS Policies für Data Scoping
-- Sichert, dass Installer nur eigene Daten sehen, Owner alle Daten seiner Firma

-- ── Leads ─────────────────────────────────────────────────────────────
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'leads'
      AND policyname = 'leads_scope_policy'
  ) THEN
    CREATE POLICY "leads_scope_policy" ON public.leads
      FOR ALL USING (
        installer_id = auth.uid()
        OR installer_id IN (SELECT id FROM public.profiles WHERE owner_id = auth.uid())
      )
      WITH CHECK (
        installer_id = auth.uid()
        OR installer_id IN (SELECT id FROM public.profiles WHERE owner_id = auth.uid())
      );
  END IF;
END $$;

-- ── Projects ──────────────────────────────────────────────────────────
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'projects'
      AND policyname = 'projects_scope_policy'
  ) THEN
    CREATE POLICY "projects_scope_policy" ON public.projects
      FOR ALL USING (
        installer_id = auth.uid()
        OR installer_id IN (SELECT id FROM public.profiles WHERE owner_id = auth.uid())
      )
      WITH CHECK (
        installer_id = auth.uid()
        OR installer_id IN (SELECT id FROM public.profiles WHERE owner_id = auth.uid())
      );
  END IF;
END $$;

-- ── Appointments ──────────────────────────────────────────────────────
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'appointments'
      AND policyname = 'appointments_scope_policy'
  ) THEN
    CREATE POLICY "appointments_scope_policy" ON public.appointments
      FOR ALL USING (
        installer_id = auth.uid()
        OR installer_id IN (SELECT id FROM public.profiles WHERE owner_id = auth.uid())
      )
      WITH CHECK (
        installer_id = auth.uid()
        OR installer_id IN (SELECT id FROM public.profiles WHERE owner_id = auth.uid())
      );
  END IF;
END $$;

-- ── Notes ─────────────────────────────────────────────────────────────
-- Bestehende Policy ersetzen durch umfassende Scope-Policy
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'notes'
      AND policyname = 'installers_manage_own_notes'
  ) THEN
    DROP POLICY "installers_manage_own_notes" ON public.notes;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'notes'
      AND policyname = 'notes_scope_policy'
  ) THEN
    CREATE POLICY "notes_scope_policy" ON public.notes
      FOR ALL USING (
        installer_id = auth.uid()
        OR installer_id IN (SELECT id FROM public.profiles WHERE owner_id = auth.uid())
      )
      WITH CHECK (
        installer_id = auth.uid()
        OR installer_id IN (SELECT id FROM public.profiles WHERE owner_id = auth.uid())
      );
  END IF;
END $$;

-- ── Profiles ──────────────────────────────────────────────────────────
-- Jeder Nutzer darf sein eigenes Profil lesen
-- Owner darf Profile seiner Mitarbeiter lesen
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles'
      AND policyname = 'profiles_read_scope'
  ) THEN
    CREATE POLICY "profiles_read_scope" ON public.profiles
      FOR SELECT USING (
        id = auth.uid()
        OR owner_id = auth.uid()
        OR id IN (SELECT id FROM public.profiles WHERE owner_id = auth.uid())
      );
  END IF;
END $$;
