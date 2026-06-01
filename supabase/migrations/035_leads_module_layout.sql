-- PROJECT: Voltify | PURPOSE: Store installer solar planning layout per lead
alter table public.leads
  add column if not exists module_layout jsonb default null;
