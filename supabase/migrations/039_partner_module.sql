-- Migration 037: Partner-Modul für PV-Vertriebsagenturen
-- Neue Tabellen: partners, lead_assignments, commissions

-- 1. partners: Agentur-Partner-Installateure
CREATE TABLE IF NOT EXISTS partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  contact_name text,
  email text NOT NULL,
  phone text,
  zip_regions text[] DEFAULT '{}',
  commission_type text NOT NULL DEFAULT 'fixed' CHECK (commission_type IN ('fixed','percentage')),
  commission_value numeric NOT NULL DEFAULT 200,
  kwh_price numeric,
  is_active boolean DEFAULT true,
  notes text,
  access_token uuid DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_partners_agency ON partners(agency_id);
CREATE INDEX IF NOT EXISTS idx_partners_active ON partners(agency_id, is_active);

-- 2. lead_assignments: Zuweisung von Leads an Partner
CREATE TABLE IF NOT EXISTS lead_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  partner_id uuid NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  agency_id uuid NOT NULL REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','converted','expired')),
  partner_notes text,
  offer_sent_at timestamptz,
  offer_accepted_at timestamptz,
  commission_amount numeric,
  commission_status text DEFAULT 'pending' CHECK (commission_status IN ('pending','invoiced','paid')),
  assigned_at timestamptz DEFAULT now(),
  responded_at timestamptz,
  UNIQUE(lead_id, partner_id)
);

CREATE INDEX IF NOT EXISTS idx_lead_assignments_agency ON lead_assignments(agency_id, status);
CREATE INDEX IF NOT EXISTS idx_lead_assignments_partner ON lead_assignments(partner_id, status);
CREATE INDEX IF NOT EXISTS idx_lead_assignments_lead ON lead_assignments(lead_id);

-- 3. commissions: Provisionen (separat für Reporting)
CREATE TABLE IF NOT EXISTS commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES auth.users(id),
  partner_id uuid NOT NULL REFERENCES partners(id),
  lead_id uuid NOT NULL REFERENCES leads(id),
  lead_assignment_id uuid REFERENCES lead_assignments(id),
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','invoiced','paid','cancelled')),
  invoice_number text,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_commissions_agency ON commissions(agency_id, status);
CREATE INDEX IF NOT EXISTS idx_commissions_partner ON commissions(partner_id, status);

-- 4. RLS: Agency sieht nur eigene Partners/Assignments/Commissions
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;

-- Partners
CREATE POLICY "Agenturen können eigene Partner sehen"
  ON partners FOR SELECT
  USING (agency_id = auth.uid());

CREATE POLICY "Agenturen können Partner erstellen"
  ON partners FOR INSERT
  WITH CHECK (agency_id = auth.uid());

CREATE POLICY "Agenturen können eigene Partner aktualisieren"
  ON partners FOR UPDATE
  USING (agency_id = auth.uid());

CREATE POLICY "Agenturen können eigene Partner löschen"
  ON partners FOR DELETE
  USING (agency_id = auth.uid());

-- Lead Assignments
CREATE POLICY "Agenturen können eigene Zuweisungen sehen"
  ON lead_assignments FOR SELECT
  USING (agency_id = auth.uid());

CREATE POLICY "Agenturen können Zuweisungen erstellen"
  ON lead_assignments FOR INSERT
  WITH CHECK (agency_id = auth.uid());

CREATE POLICY "Agenturen können eigene Zuweisungen aktualisieren"
  ON lead_assignments FOR UPDATE
  USING (agency_id = auth.uid());

-- Commissions
CREATE POLICY "Agenturen können eigene Provisionen sehen"
  ON commissions FOR SELECT
  USING (agency_id = auth.uid());

CREATE POLICY "Agenturen können Provisionen erstellen"
  ON commissions FOR INSERT
  WITH CHECK (agency_id = auth.uid());

CREATE POLICY "Agenturen können eigene Provisionen aktualisieren"
  ON commissions FOR UPDATE
  USING (agency_id = auth.uid());

-- 5. Erweitere profiles.role um 'sales_agency'
-- Hinweis: Der CHECK-Constraint auf profiles.role muss ggf. angepasst werden,
-- falls die DB einen expliziten CHECK hat. Wir nutzen eine Warnung statt ALTER,
-- da der App-Code den Wert validiert.

-- Kompatibilität: leads-Tabelle erweitern für agency_id
ALTER TABLE leads ADD COLUMN IF NOT EXISTS agency_id uuid REFERENCES auth.users(id);
CREATE INDEX IF NOT EXISTS idx_leads_agency ON leads(agency_id);
