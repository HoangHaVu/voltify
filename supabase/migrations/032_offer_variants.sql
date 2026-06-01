-- Migration 032: Offer Variants — Speicher-Optionen pro Lead
-- Solar-spezifisch: Einstieg (ohne Speicher) / Optimal (10 kWh) / Zukunftssicher (15 kWh + Wallbox)

create table if not exists offer_variants (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  variant_key text not null check (variant_key in ('einstieg', 'optimal', 'zukunftssicher')),
  label text not null,              -- "Einstieg", "Optimal", "Zukunftssicher"
  description text,                 -- "Ohne Speicher, ideal für Eigenverbrauch"
  storage_kwh numeric default 0,    -- Speichergröße in kWh
  has_wallbox boolean default false,
  has_backup boolean default false,
  kwp numeric,
  investment numeric,
  annual_savings numeric,
  amortization numeric,
  autarky numeric,
  profit_20_years numeric,
  price_eur numeric,
  is_primary boolean default false,
  is_recommended boolean default false,  -- Decoy-Badge auf mittlerer Variante
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(lead_id, variant_key)
);

-- Index für schnelle Lookups
 create index if not exists idx_offer_variants_lead on offer_variants(lead_id);

 -- RLS: Installateur darf nur eigene Varianten sehen
 alter table offer_variants enable row level security;

 create policy "Installateurs können Varianten ihrer Leads sehen"
   on offer_variants for select
   using (exists (
     select 1 from leads where leads.id = offer_variants.lead_id
     and leads.installer_id = auth.uid()
   ));

 create policy "Installateurs können Varianten erstellen"
   on offer_variants for insert
   with check (exists (
     select 1 from leads where leads.id = offer_variants.lead_id
     and leads.installer_id = auth.uid()
   ));

 create policy "Installateurs können Varianten aktualisieren"
   on offer_variants for update
   using (exists (
     select 1 from leads where leads.id = offer_variants.lead_id
     and leads.installer_id = auth.uid()
   ));

 create policy "Installateurs können Varianten löschen"
   on offer_variants for delete
   using (exists (
     select 1 from leads where leads.id = offer_variants.lead_id
     and leads.installer_id = auth.uid()
   ));

-- Trigger für updated_at
 create or replace function update_offer_variants_updated_at()
 returns trigger as $$
 begin
   new.updated_at = now();
   return new;
 end;
 $$ language plpgsql;

 create trigger trg_offer_variants_updated_at
   before update on offer_variants
   for each row
   execute function update_offer_variants_updated_at();
