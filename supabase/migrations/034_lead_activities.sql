-- Migration 034: Lead Activity Log
-- Timeline für jeden Lead: Status-Änderungen, Anrufe, Notizen, Termine

create table if not exists lead_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  type text not null check (type in (
    'status_change',      -- Lead-Status geändert
    'offer_sent',         -- Angebot versendet
    'offer_viewed',       -- Angebot angesehen
    'offer_accepted',     -- Angebot angenommen
    'offer_rejected',     -- Angebot abgelehnt
    'call_made',          -- Kunde angerufen
    'email_sent',         -- E-Mail versendet
    'appointment_scheduled', -- Termin vereinbart
    'note_added',         -- Manuelle Notiz
    'site_visit_done',    -- Vor-Ort-Termin durchgeführt
    'payment_received',   -- Zahlung eingegangen
    'discount_requested', -- Rabatt angefragt
    'discount_approved'   -- Rabatt genehmigt
  )),
  description text not null,  -- "Status geändert: Neu → Kontaktiert"
  user_id uuid references auth.users(id),  -- Wer hat die Aktion ausgeführt
  user_name text,           -- Name des Users (für schnelle Anzeige)
  created_at timestamptz default now()
);

-- Index für schnelle Lookups
 create index if not exists idx_lead_activities_lead on lead_activities(lead_id, created_at desc);

 -- RLS: Installateur darf nur Aktivitäten seiner Leads sehen
 alter table lead_activities enable row level security;

 create policy "Installateurs können Aktivitäten ihrer Leads sehen"
   on lead_activities for select
   using (exists (
     select 1 from leads where leads.id = lead_activities.lead_id
     and leads.installer_id = auth.uid()
   ));

 create policy "Installateurs können Aktivitäten erstellen"
   on lead_activities for insert
   with check (exists (
     select 1 from leads where leads.id = lead_activities.lead_id
     and leads.installer_id = auth.uid()
   ));

 create policy "Installateurs können eigene Aktivitäten löschen"
   on lead_activities for delete
   using (user_id = auth.uid());
