-- 047_partner_limit_check.sql
-- Datenbankseitige Absicherung des Partner-Limits für Sales-Agency-Tiers.

CREATE OR REPLACE FUNCTION public.check_partner_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_limit int;
  v_count int;
BEGIN
  SELECT COALESCE(agency_partner_limit, 5) INTO v_limit
  FROM public.profiles
  WHERE id = NEW.agency_id;

  SELECT COUNT(*) INTO v_count
  FROM public.partners
  WHERE agency_id = NEW.agency_id AND is_active = true;

  IF v_count >= v_limit THEN
    RAISE EXCEPTION 'Partner-Limit erreicht. Upgrade auf Pro oder Scale erforderlich.'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bestehenden Trigger ggf. entfernen und neu anlegen
DROP TRIGGER IF EXISTS partner_limit_trigger ON public.partners;

CREATE TRIGGER partner_limit_trigger
BEFORE INSERT ON public.partners
FOR EACH ROW
EXECUTE FUNCTION public.check_partner_limit();
