-- 020_owner_webhook.sql — Zentrale Webhook-Einstellungen für den Inhaber

create table if not exists public.company_webhook_settings (
  id             uuid        primary key default gen_random_uuid(),
  owner_id       uuid        not null references auth.users(id) on delete cascade,
  webhook_url    text,
  webhook_secret text,
  webhook_active boolean     default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (owner_id)
);

alter table public.company_webhook_settings enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'company_webhook_settings'
      and policyname = 'owner_manage_own_webhook'
  ) then
    create policy "owner_manage_own_webhook" on public.company_webhook_settings
      for all
      using  (owner_id = auth.uid())
      with check (owner_id = auth.uid());
  end if;
end
$$;

create index if not exists idx_company_webhook_owner on public.company_webhook_settings (owner_id);
