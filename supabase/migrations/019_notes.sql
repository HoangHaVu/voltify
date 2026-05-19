-- 019_notes.sql — Interne Installer-Notizen pro Lead

create table if not exists public.notes (
  id           uuid        primary key default gen_random_uuid(),
  installer_id uuid        not null references auth.users(id) on delete cascade,
  lead_id      uuid        references public.leads(id) on delete set null,
  project_id   uuid        null,
  content      text        not null check (char_length(content) > 0),
  created_at   timestamptz not null default now()
);

alter table public.notes enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'notes'
      and policyname = 'installers_manage_own_notes'
  ) then
    create policy "installers_manage_own_notes" on public.notes
      for all
      using  (installer_id = auth.uid())
      with check (installer_id = auth.uid());
  end if;
end
$$;

create index if not exists notes_lead_id_idx    on public.notes (lead_id)    where lead_id    is not null;
create index if not exists notes_installer_idx  on public.notes (installer_id, created_at desc);
