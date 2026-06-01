-- Migration 033: Lead Sources
-- Trackt woher Leads kommen (Landingpage, Direkt, Empfehlung, etc.)

alter table leads
  add column if not exists source text default 'landingpage';

-- Index für schnelle Filterung
 create index if not exists idx_leads_source on leads(source);

-- Kommentar
 comment on column leads.source is 'Quelle des Leads: landingpage, direct, referral, social, google, other';
