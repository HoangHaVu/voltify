-- Migration 024: Test-Mitarbeiter mit Inhaber verlinken
-- Sorgt dafuer, dass installateur@test.de als Mitarbeiter von inhaber@test.de markiert ist

DO $$
DECLARE
  v_owner_id uuid;
  v_installer_id uuid;
BEGIN
  -- Inhaber-UUID finden
  SELECT id INTO v_owner_id
  FROM auth.users
  WHERE email = 'inhaber@test.de'
  LIMIT 1;

  -- Installateur-UUID finden
  SELECT id INTO v_installer_id
  FROM auth.users
  WHERE email = 'installateur@test.de'
  LIMIT 1;

  -- Verlinken, falls beide gefunden
  IF v_owner_id IS NOT NULL AND v_installer_id IS NOT NULL THEN
    UPDATE public.profiles
    SET owner_id = v_owner_id
    WHERE id = v_installer_id
      AND (owner_id IS NULL OR owner_id != v_owner_id);
  END IF;
END $$;
