-- Migration 023: Multi-Role-System v1
-- Erweitert profiles.role um neue Mitarbeiter-Rollen
-- Setzt installateur@test.de auf super_employee

-- ── 1. Rollen-Constraint erweitern ────────────────────────────────────
DO $$
DECLARE
  constraint_name text;
BEGIN
  -- Bestehenden CHECK-Constraint für role finden und entfernen
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'public.profiles'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%role%';

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT %I', constraint_name);
  END IF;

  -- Neuen CHECK-Constraint mit allen Rollen erstellen
  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_role_check
    CHECK (role IN (
      'customer', 'installer', 'owner',
      'vertrieb', 'projektleiter', 'monteur', 'backoffice', 'super_employee'
    ));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Falls kein CHECK-Constraint existierte: einfach sicherstellen, dass role NOT NULL bleibt
ALTER TABLE public.profiles ALTER COLUMN role SET NOT NULL;

-- ── 2. Testnutzer auf super_employee setzen ───────────────────────────
DO $$
DECLARE
  installer_id uuid;
BEGIN
  SELECT id INTO installer_id
  FROM auth.users
  WHERE email = 'installateur@test.de'
  LIMIT 1;

  IF installer_id IS NOT NULL THEN
    UPDATE public.profiles
    SET role = 'super_employee'
    WHERE id = installer_id;
  END IF;
END $$;

-- ── 3. Inhaber als Owner bestätigen ───────────────────────────────────
DO $$
DECLARE
  v_owner_id uuid;
BEGIN
  SELECT id INTO v_owner_id
  FROM auth.users
  WHERE email = 'inhaber@test.de'
  LIMIT 1;

  IF v_owner_id IS NOT NULL THEN
    UPDATE public.profiles
    SET role = 'owner', owner_id = NULL
    WHERE id = v_owner_id;
  END IF;
END $$;
