-- PROJECT: Voltify | PURPOSE: Geocoding cache to avoid duplicate Google API calls
create table if not exists public.address_cache (
  id            uuid primary key default gen_random_uuid(),
  address_hash  text unique not null,
  address_raw   text not null,
  lat           double precision not null,
  lng           double precision not null,
  created_at    timestamptz default now()
);

alter table public.address_cache enable row level security;

-- Anon-Clients dürfen lesen (Konfigurator läuft unauthentifiziert)
create policy "address_cache_select" on public.address_cache
  for select using (true);

-- Nur authentifizierte Clients dürfen einfügen
create policy "address_cache_insert" on public.address_cache
  for insert with check (true);
