-- ============================================================-- Voltify — Vor-Ort-Termin, gemessene Daten & Rabatt-System-- ============================================================

-- ── 1. Vor-Ort-Termin Felder ──
alter table leads
  add column if not exists site_visit_date    timestamptz,
  add column if not exists site_visit_notes   text,
  add column if not exists site_visit_done    boolean default false;

-- ── 2. Gemessene Daten Felder ──
alter table leads
  add column if not exists roof_area_measured numeric,
  add column if not exists roof_angle         numeric,
  add column if not exists shading_issues     boolean default false;

-- ── 3. Angebots-Status & Zahlungen ──
alter table leads
  add column if not exists offer_status     text default 'created',
  add column if not exists offer_sent_at    timestamptz,
  add column if not exists offer_viewed_at  timestamptz,
  add column if not exists payment_1_paid   boolean default false,
  add column if not exists payment_2_paid   boolean default false,
  add column if not exists payment_3_paid   boolean default false;

-- ── 4. Rabatt-Felder ──
alter table leads
  add column if not exists discount_code         text,
  add column if not exists discount_percentage   numeric,
  add column if not exists discount_status       text default 'none',
  add column if not exists final_price           numeric,
  add column if not exists discount_note         text,
  add column if not exists discount_requested_at timestamptz,
  add column if not exists discount_resolved_at  timestamptz;

-- ── 5. Discount-Codes Tabelle ──
create table if not exists discount_codes (
  id            uuid primary key default gen_random_uuid(),
  created_by    uuid not null references auth.users(id) on delete cascade,
  code          text not null,
  label         text,
  percentage    numeric not null,
  active        boolean default true,
  min_investment numeric,
  max_uses      integer,
  uses_count    integer default 0,
  valid_until   timestamptz,
  created_at    timestamptz default now(),
  unique(code, created_by)
);

-- RLS für discount_codes
alter table discount_codes enable row level security;

-- Owner darf eigene Codes verwalten
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'discount_codes'
      and policyname = 'discount_codes_owner_policy'
  ) then
    create policy "discount_codes_owner_policy"
      on discount_codes
      for all
      using (created_by = auth.uid())
      with check (created_by = auth.uid());
  end if;
end
$$;

-- Installateure sehen Codes ihres Owners
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'discount_codes'
      and policyname = 'discount_codes_installer_policy'
  ) then
    create policy "discount_codes_installer_policy"
      on discount_codes
      for select
      using (
        created_by in (
          select owner_id from profiles where id = auth.uid()
        )
      );
  end if;
end
$$;

-- ── 6. RPC: Rabattcode einlösen ──
create or replace function redeem_discount_code(
  p_installer_id uuid,
  p_code text,
  p_investment numeric
)
returns table (success boolean, percentage numeric, reason text)
language plpgsql
security definer
as $$
declare
  v_code record;
  v_owner_id uuid;
begin
  -- Owner des Installateurs ermitteln
  select owner_id into v_owner_id
  from profiles
  where id = p_installer_id;

  -- Code suchen (Owner oder direkt Installer)
  select * into v_code
  from discount_codes
  where code = upper(trim(p_code))
    and active = true
    and (created_by = p_installer_id or created_by = v_owner_id)
    and (valid_until is null or valid_until > now())
  limit 1;

  if v_code is null then
    return query select false, null::numeric, 'Code nicht gefunden'::text;
    return;
  end if;

  if v_code.max_uses is not null and v_code.uses_count >= v_code.max_uses then
    return query select false, null::numeric, 'Code maximale Nutzung erreicht'::text;
    return;
  end if;

  if v_code.min_investment is not null and p_investment < v_code.min_investment then
    return query select false, null::numeric, 'Mindestinvestition nicht erreicht'::text;
    return;
  end if;

  -- Nutzung zählen
  update discount_codes
  set uses_count = uses_count + 1
  where id = v_code.id;

  return query select true, v_code.percentage, 'Code erfolgreich eingelöst'::text;
end;
$$;
