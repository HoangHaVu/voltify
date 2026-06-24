-- Migration 050: resolve_installer_slug
-- Anon-safe Auflösung ?i=<slug> → installer user_id für Lead-Attribution im Konfigurator.
-- Spiegelt resolve_agency_slug (Migration 040); Rollen-Logik analog zu get_installer_branding.

CREATE OR REPLACE FUNCTION public.resolve_installer_slug(p_slug text)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM profiles
  WHERE installer_slug = p_slug
    AND role IN ('owner', 'sales_agency')
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.resolve_installer_slug(text) TO anon;
