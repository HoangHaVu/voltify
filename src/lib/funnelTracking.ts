// PROJECT: Voltify | PURPOSE: Konfigurator-Funnel-Tracking (fire-and-forget, bricht nie die UX)
import { supabase } from './supabase';

type FunnelEvent = 'started' | 'step_reached' | 'email_captured' | 'skipped_gate' | 'completed';

interface SourceParams {
  sourceId: string | null;      // sl_lead (numerische ID) oder sl_email (E-Mail-Adresse)
  utmSource: string | null;
  utmCampaign: string | null;
  agencySlug: string | null;    // ?a=<slug> für Agentur-Attribution
  installerSlug: string | null; // ?i=<slug> für White-Label-Branding
}

const SESSION_KEY     = 'voltify_funnel_session';
const SOURCE_KEY      = 'voltify_funnel_source';

function getSessionId(): string {
  const stored = sessionStorage.getItem(SESSION_KEY);
  if (stored) return stored;
  const id = crypto.randomUUID();
  sessionStorage.setItem(SESSION_KEY, id);
  return id;
}

// Liest UTM-Params einmalig aus der URL und cached sie in sessionStorage.
// Beim nächsten Step-Wechsel (URL ändert sich nicht mehr) sind sie noch verfügbar.
function getSourceParams(): SourceParams {
  const cached = sessionStorage.getItem(SOURCE_KEY);
  if (cached) return JSON.parse(cached) as SourceParams;

  const p = new URLSearchParams(window.location.search);
  const params: SourceParams = {
    // sl_email (von Smartlead) hat Vorrang, sl_lead als Fallback für direkten Konfigurator-Link
    sourceId:      p.get('sl_email') ?? p.get('sl_lead'),
    utmSource:     p.get('utm_source'),
    utmCampaign:   p.get('utm_campaign'),
    agencySlug:    p.get('a'),
    installerSlug: p.get('i'),
  };
  sessionStorage.setItem(SOURCE_KEY, JSON.stringify(params));
  return params;
}

export function trackFunnelEvent(
  step: number,
  event: FunnelEvent,
  opts: { email?: string; demoMode?: boolean } = {},
) {
  const { sourceId, utmSource, utmCampaign } = getSourceParams();

  void Promise.resolve(
    supabase.from('funnel_events').insert({
      session_id:   getSessionId(),
      step,
      event,
      email:        opts.email ?? null,
      demo_mode:    opts.demoMode ?? false,
      source_id:    sourceId,
      utm_source:   utmSource,
      utm_campaign: utmCampaign,
    })
  ).catch(() => {});
}

// Gibt die Source-Params zurück — wird im Konfigurator für den Conversion-Webhook genutzt.
export function getFunnelSource(): SourceParams {
  return getSourceParams();
}

// Auf der Landingpage aufrufen: cached sl_lead + UTM aus der URL sofort in sessionStorage,
// damit sie beim späteren Konfigurator-Aufruf (nach Navigation über /) noch verfügbar sind.
export function cacheFunnelSourceFromUrl(): void {
  getSourceParams(); // liest URL + schreibt in sessionStorage — reicht aus
}
