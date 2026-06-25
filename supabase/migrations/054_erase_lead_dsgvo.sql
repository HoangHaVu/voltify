-- Migration 054: erase_lead (DSGVO Art. 17 — Recht auf Löschung)
-- Löscht einen Lead vollständig über alle PII-haltigen Tabellen.
-- Hard-Delete der personenbezogenen Daten; commissions werden anonymisiert
-- (steuerliche Aufbewahrungspflicht § 147 AO: Betrag/Beleg bleibt, Personenbezug raus).
-- Autorisierung: nur Firma/Agentur, zu der der Lead gehört (SECURITY DEFINER umgeht RLS).

-- commissions.lead_id muss nullable sein, damit eine anonymisierte Provision (Aufbewahrungspflicht)
-- nach der Lead-Löschung ohne Personenbezug bestehen bleiben kann.
ALTER TABLE public.commissions ALTER COLUMN lead_id DROP NOT NULL;

CREATE OR REPLACE FUNCTION public.erase_lead(p_lead_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller         uuid := auth.uid();
  v_caller_owner   uuid;
  v_lead_installer uuid;
  v_lead_agency    uuid;
  v_email          text;
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT COALESCE(owner_id, id) INTO v_caller_owner FROM profiles WHERE id = v_caller;

  SELECT installer_id, agency_id, email
    INTO v_lead_installer, v_lead_agency, v_email
  FROM leads WHERE id = p_lead_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead not found';
  END IF;

  IF NOT (
       v_lead_installer = v_caller
    OR v_lead_installer = v_caller_owner
    OR v_lead_installer IN (SELECT id FROM profiles WHERE COALESCE(owner_id, id) = v_caller_owner)
    OR v_lead_agency = v_caller
    OR v_lead_agency = v_caller_owner
  ) THEN
    RAISE EXCEPTION 'Not authorized to erase this lead';
  END IF;

  -- 1) commissions anonymisieren (Buchhaltung bleibt, Personenbezug raus)
  UPDATE commissions
     SET lead_id = NULL,
         lead_assignment_id = NULL
   WHERE lead_id = p_lead_id
      OR lead_assignment_id IN (SELECT id FROM lead_assignments WHERE lead_id = p_lead_id);

  -- 2) projects: PII-Freitext entfernen, Kennzahlen bleiben
  UPDATE projects SET notes = NULL, zip = NULL WHERE lead_id = p_lead_id;

  -- 3) PII-haltige Nebentabellen hart löschen
  DELETE FROM appointments WHERE lead_id = p_lead_id;
  DELETE FROM webhook_logs WHERE lead_id = p_lead_id;
  IF v_email IS NOT NULL THEN
    DELETE FROM funnel_events WHERE email = v_email;
  END IF;

  -- 4) Lead löschen → CASCADE: notes, offer_drafts(+line_items), offer_signatures,
  --    offer_variants, lead_activities, lead_assignments
  DELETE FROM leads WHERE id = p_lead_id;

  RETURN jsonb_build_object('erased', true, 'lead_id', p_lead_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.erase_lead(uuid) TO authenticated;
