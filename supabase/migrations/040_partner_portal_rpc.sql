-- Migration 040: Partner-Portal RPCs + Agency-Slug + Role-Constraint Fix
-- Löst drei Probleme:
--   1. Partner-Portal (anon) war durch RLS komplett ausgesperrt → SECURITY DEFINER RPCs
--   2. profiles.role CHECK-Constraint enthielt 'sales_agency' nicht → Insert-Fehler bei Registrierung
--   3. agency_slug für Konfigurator-Funnel-Verdrahtung (?a=slug → agency_id im Lead)

-- ── 1. Role-Constraint: 'sales_agency' ergänzen ───────────────────────

DO $$
DECLARE
  constraint_name text;
BEGIN
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'public.profiles'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%role%';

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT %I', constraint_name);
  END IF;

  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_role_check
    CHECK (role IN (
      'customer', 'installer', 'owner',
      'vertrieb', 'projektleiter', 'monteur', 'backoffice', 'super_employee',
      'sales_agency'
    ));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ── 2. agency_slug auf profiles ───────────────────────────────────────

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS agency_slug text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_agency_slug
  ON public.profiles(agency_slug)
  WHERE agency_slug IS NOT NULL;

-- ── 3. RLS: Agentur kann eigene Leads lesen (agency_id = auth.uid()) ──

-- Leads-Policy für Agenturen (SELECT)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='leads' AND policyname='Agenturen können eigene Leads sehen'
  ) THEN
    CREATE POLICY "Agenturen können eigene Leads sehen"
      ON public.leads FOR SELECT
      USING (agency_id = auth.uid());
  END IF;
END $$;

-- ── 4. SECURITY DEFINER RPCs für anonymes Partner-Portal ──────────────

-- 4a. get_partner_by_token: gibt unkritische Partner-Felder zurück (kein access_token anderer)
CREATE OR REPLACE FUNCTION public.get_partner_by_token(p_token uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'id',               p.id,
    'company_name',     p.company_name,
    'contact_name',     p.contact_name,
    'commission_type',  p.commission_type,
    'commission_value', p.commission_value,
    'is_active',        p.is_active
  ) INTO v_result
  FROM partners p
  WHERE p.access_token = p_token
    AND p.is_active = true;

  RETURN v_result; -- NULL wenn nicht gefunden
END $$;

GRANT EXECUTE ON FUNCTION public.get_partner_by_token(uuid) TO anon;

-- 4b. get_partner_assignments: Assignments + Lead-Daten für diesen Partner
CREATE OR REPLACE FUNCTION public.get_partner_assignments(p_token uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_partner_id uuid;
  v_result     jsonb;
BEGIN
  SELECT id INTO v_partner_id
  FROM partners
  WHERE access_token = p_token AND is_active = true;

  IF v_partner_id IS NULL THEN
    RAISE EXCEPTION 'invalid_token';
  END IF;

  SELECT jsonb_agg(
    jsonb_build_object(
      'id',                 la.id,
      'lead_id',            la.lead_id,
      'partner_id',         la.partner_id,
      'agency_id',          la.agency_id,
      'status',             la.status,
      'partner_notes',      la.partner_notes,
      'offer_sent_at',      la.offer_sent_at,
      'offer_accepted_at',  la.offer_accepted_at,
      'commission_amount',  la.commission_amount,
      'commission_status',  la.commission_status,
      'assigned_at',        la.assigned_at,
      'responded_at',       la.responded_at,
      'lead', jsonb_build_object(
        'first_name',  l.first_name,
        'last_name',   l.last_name,
        'email',       l.email,
        'phone',       l.phone,
        'zip',         l.zip,
        'kwp',         l.kwp,
        'investment',  l.investment,
        'status',      l.status
      )
    ) ORDER BY la.assigned_at DESC
  ) INTO v_result
  FROM lead_assignments la
  JOIN leads l ON l.id = la.lead_id
  WHERE la.partner_id = v_partner_id;

  RETURN COALESCE(v_result, '[]'::jsonb);
END $$;

GRANT EXECUTE ON FUNCTION public.get_partner_assignments(uuid) TO anon;

-- 4c. partner_update_assignment: Status-Übergang + Commission-Auto-Erstellung
CREATE OR REPLACE FUNCTION public.partner_update_assignment(
  p_token         uuid,
  p_assignment_id uuid,
  p_status        text,
  p_notes         text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_partner_id      uuid;
  v_assignment      lead_assignments%ROWTYPE;
  v_lead            leads%ROWTYPE;
  v_partner         partners%ROWTYPE;
  v_commission_amount numeric;
  v_commission_exists boolean;
BEGIN
  -- Erlaubte Status-Übergänge
  IF p_status NOT IN ('accepted', 'rejected', 'converted') THEN
    RAISE EXCEPTION 'invalid_status: %', p_status;
  END IF;

  -- Token → Partner auflösen
  SELECT id INTO v_partner_id
  FROM partners
  WHERE access_token = p_token AND is_active = true;

  IF v_partner_id IS NULL THEN
    RAISE EXCEPTION 'invalid_token';
  END IF;

  -- Assignment laden + Ownership prüfen
  SELECT * INTO v_assignment
  FROM lead_assignments
  WHERE id = p_assignment_id AND partner_id = v_partner_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'assignment_not_found';
  END IF;

  -- Übergänge validieren: pending→accepted|rejected, accepted→converted
  IF v_assignment.status = 'pending' AND p_status NOT IN ('accepted','rejected') THEN
    RAISE EXCEPTION 'invalid_transition: pending → %', p_status;
  END IF;
  IF v_assignment.status = 'accepted' AND p_status != 'converted' THEN
    RAISE EXCEPTION 'invalid_transition: accepted → %', p_status;
  END IF;
  IF v_assignment.status NOT IN ('pending','accepted') THEN
    RAISE EXCEPTION 'already_final: %', v_assignment.status;
  END IF;

  -- Update durchführen
  UPDATE lead_assignments
  SET
    status       = p_status,
    partner_notes = COALESCE(p_notes, partner_notes),
    responded_at = CASE WHEN p_status IN ('accepted','rejected') THEN now() ELSE responded_at END,
    offer_accepted_at = CASE WHEN p_status = 'converted' THEN now() ELSE offer_accepted_at END
  WHERE id = p_assignment_id;

  -- Bei 'converted': Commission erstellen (idempotent)
  IF p_status = 'converted' THEN
    -- Prüfen ob bereits eine Commission für dieses Assignment existiert
    SELECT EXISTS(
      SELECT 1 FROM commissions WHERE lead_assignment_id = p_assignment_id
    ) INTO v_commission_exists;

    IF NOT v_commission_exists THEN
      SELECT * INTO v_partner FROM partners WHERE id = v_partner_id;
      SELECT * INTO v_lead FROM leads WHERE id = v_assignment.lead_id;

      -- Betrag berechnen
      IF v_partner.commission_type = 'percentage' THEN
        v_commission_amount := COALESCE(v_lead.investment, 0) * v_partner.commission_value / 100.0;
      ELSE
        v_commission_amount := v_partner.commission_value;
      END IF;

      INSERT INTO commissions (agency_id, partner_id, lead_id, lead_assignment_id, amount)
      VALUES (v_assignment.agency_id, v_partner_id, v_assignment.lead_id, p_assignment_id, v_commission_amount);

      -- commission_amount im Assignment nachziehen
      UPDATE lead_assignments
      SET commission_amount = v_commission_amount,
          commission_status = 'pending'
      WHERE id = p_assignment_id;
    END IF;
  END IF;

  RETURN jsonb_build_object('success', true, 'status', p_status);
END $$;

GRANT EXECUTE ON FUNCTION public.partner_update_assignment(uuid, uuid, text, text) TO anon;

-- ── 5. resolve_agency_slug: anon-safe Slug → user_id ─────────────────

CREATE OR REPLACE FUNCTION public.resolve_agency_slug(p_slug text)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM profiles WHERE agency_slug = p_slug AND role = 'sales_agency' LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.resolve_agency_slug(text) TO anon;
