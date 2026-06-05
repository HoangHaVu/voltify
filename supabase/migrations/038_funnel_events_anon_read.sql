-- PROJECT: Voltify | PURPOSE: Öffentliche View für Scoutly-Sync (E-Mail bewusst ausgelassen)
CREATE OR REPLACE VIEW public.funnel_events_public AS
  SELECT
    session_id,
    step,
    event,
    demo_mode,
    source_id,
    utm_source,
    utm_campaign,
    created_at
  FROM public.funnel_events;

GRANT SELECT ON public.funnel_events_public TO anon;
ALTER VIEW public.funnel_events_public OWNER TO postgres;
