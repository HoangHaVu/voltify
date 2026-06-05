-- PROJECT: Voltify | PURPOSE: Konfigurator-Funnel-Tracking (Abbruchraten per Step)
CREATE TABLE IF NOT EXISTS public.funnel_events (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id  text        NOT NULL,
  step        integer     NOT NULL,
  event       text        NOT NULL,  -- 'started' | 'step_reached' | 'email_captured' | 'completed' | 'skipped_gate'
  email       text,                  -- nur bei 'email_captured'
  demo_mode   boolean     DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;

-- Anon darf Events einlegen (Tracking ohne Login)
CREATE POLICY "anon_insert_funnel_events"
  ON public.funnel_events FOR INSERT TO anon WITH CHECK (true);

-- Eingeloggte Nutzer dürfen lesen (Admin-Auswertung)
CREATE POLICY "auth_read_funnel_events"
  ON public.funnel_events FOR SELECT TO authenticated USING (true);

-- Index für häufige Abfragen
CREATE INDEX IF NOT EXISTS idx_funnel_events_session ON public.funnel_events (session_id);
CREATE INDEX IF NOT EXISTS idx_funnel_events_event   ON public.funnel_events (event);
