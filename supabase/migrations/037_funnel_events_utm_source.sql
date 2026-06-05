-- PROJECT: Voltify | PURPOSE: UTM + Scoutly-Lead-ID Spalten für Cross-App Tracking
ALTER TABLE public.funnel_events
  ADD COLUMN IF NOT EXISTS source_id    text,
  ADD COLUMN IF NOT EXISTS utm_source   text,
  ADD COLUMN IF NOT EXISTS utm_campaign text;

CREATE INDEX IF NOT EXISTS idx_funnel_events_source_id ON public.funnel_events (source_id)
  WHERE source_id IS NOT NULL;
