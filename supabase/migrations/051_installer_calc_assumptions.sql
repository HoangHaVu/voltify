-- Migration 051: installer_calc_assumptions
-- Pro-Installateur einstellbare ROI-Annahmen für den Konfigurator (Stufe 1+2).
-- Felder im JSONB (alle optional, Fallback = globale Defaults in calculations.ts):
--   investPerKwp        €/kWp  (Stufe 1)
--   electricityPrice    €/kWh Default-Strompreis (Stufe 2)
--   feedInTariff        €/kWh Einspeisevergütung (Stufe 2)
--   maintenancePerYear  €/Jahr Wartung (Stufe 2)

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS calc_assumptions jsonb;

-- Anon-safe Auflösung ?i=<slug> → Annahmen (analog get_installer_branding).
CREATE OR REPLACE FUNCTION public.get_installer_calc_assumptions(p_slug text)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT calc_assumptions FROM profiles
  WHERE installer_slug = p_slug
    AND role IN ('owner', 'sales_agency')
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_installer_calc_assumptions(text) TO anon;
