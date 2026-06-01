-- Migration 030: Digitale Unterschrift für Angebote
-- Tabelle: offer_signatures — speichert Signatur-PNG + Meta-Daten

begin;

-- Tabelle für digitale Unterschriften
create table if not exists offer_signatures (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  signed_at timestamptz not null default now(),
  signature_png text not null, -- base64 data URL (max ~50KB pro PNG)
  ip_hash text, -- SHA-256 Hash der IP-Adresse (DSGVO-konform)
  created_at timestamptz not null default now()
);

-- Index für Lead-Lookup
create index if not exists idx_offer_signatures_lead_id on offer_signatures(lead_id);

-- Eindeutigkeit: Pro Lead nur eine Unterschrift
create unique index if not exists idx_offer_signatures_lead_id_unique on offer_signatures(lead_id);

-- Signing-Token für Magic-Links (zur Lead-Tabelle hinzufügen)
alter table leads
  add column if not exists signing_token uuid default gen_random_uuid();

create unique index if not exists idx_leads_signing_token on leads(signing_token)
  where signing_token is not null;

-- RLS aktivieren
alter table offer_signatures enable row level security;

-- Policy: Installateur/Owner/Sales sehen Unterschriften ihrer Leads
create policy "offer_signatures_select_installer"
  on offer_signatures for select
  using (
    exists (
      select 1 from leads l
      where l.id = offer_signatures.lead_id
      and (l.installer_id = auth.uid() or exists (
        select 1 from profiles p where p.id = auth.uid() and p.role in ('owner','super_employee','sales')
      ))
    )
  );

-- Policy: Öffentliches Einfügen über Token (Edge Function/Service Role)
create policy "offer_signatures_insert_public"
  on offer_signatures for insert
  with check (true); -- Service Role oder Edge Function validiert Token

commit;
