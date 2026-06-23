-- Migration 045: Angebots-Konfigurator (Offer Drafts + Line Items)
-- Neue Tabellen für flexiblen Angebotsaufbau durch Installateur/Inhaber.

-- 1. offer_drafts: Ein Angebotsentwurf pro Lead
CREATE TABLE IF NOT EXISTS public.offer_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','accepted','rejected')),
  subtotal numeric NOT NULL DEFAULT 0,
  discount_amount numeric NOT NULL DEFAULT 0,
  discount_percentage numeric NOT NULL DEFAULT 0,
  discount_code text,
  discount_note text,
  vat_rate numeric NOT NULL DEFAULT 0,
  vat_amount numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  notes text,
  offer_number text,
  sent_at timestamptz,
  accepted_at timestamptz,
  rejected_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_offer_drafts_lead ON public.offer_drafts(lead_id);
CREATE INDEX IF NOT EXISTS idx_offer_drafts_status ON public.offer_drafts(lead_id, status);

-- 2. offer_line_items: Einzelne Angebotspositionen
CREATE TABLE IF NOT EXISTS public.offer_line_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_draft_id uuid NOT NULL REFERENCES public.offer_drafts(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('module','inverter','storage','mounting','electrical','scaffolding','travel','other')),
  description text NOT NULL,
  quantity numeric NOT NULL DEFAULT 1,
  unit text NOT NULL DEFAULT 'Stk',
  unit_price numeric NOT NULL DEFAULT 0,
  total_price numeric NOT NULL DEFAULT 0,
  is_optional boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_offer_line_items_draft ON public.offer_line_items(offer_draft_id);

-- 3. RLS: Gleiches Scoping wie leads (Migration 021)
ALTER TABLE public.offer_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_line_items ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'offer_drafts'
      AND policyname = 'offer_drafts_scope_policy'
  ) THEN
    CREATE POLICY "offer_drafts_scope_policy" ON public.offer_drafts
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.leads
          WHERE leads.id = offer_drafts.lead_id
            AND (
              leads.installer_id = auth.uid()
              OR leads.installer_id IN (SELECT id FROM public.profiles WHERE owner_id = auth.uid())
            )
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.leads
          WHERE leads.id = offer_drafts.lead_id
            AND (
              leads.installer_id = auth.uid()
              OR leads.installer_id IN (SELECT id FROM public.profiles WHERE owner_id = auth.uid())
            )
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'offer_line_items'
      AND policyname = 'offer_line_items_scope_policy'
  ) THEN
    CREATE POLICY "offer_line_items_scope_policy" ON public.offer_line_items
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.offer_drafts od
          JOIN public.leads l ON l.id = od.lead_id
          WHERE od.id = offer_line_items.offer_draft_id
            AND (
              l.installer_id = auth.uid()
              OR l.installer_id IN (SELECT id FROM public.profiles WHERE owner_id = auth.uid())
            )
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.offer_drafts od
          JOIN public.leads l ON l.id = od.lead_id
          WHERE od.id = offer_line_items.offer_draft_id
            AND (
              l.installer_id = auth.uid()
              OR l.installer_id IN (SELECT id FROM public.profiles WHERE owner_id = auth.uid())
            )
        )
      );
  END IF;
END $$;
