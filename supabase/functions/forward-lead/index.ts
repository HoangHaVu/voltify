// Supabase Edge Function — forward-lead
// Deploy: supabase functions deploy forward-lead
// Triggered by: supabase.functions.invoke('forward-lead', { body: { lead_id, installer_id } })

import { createClient } from 'jsr:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Payload {
  lead_id: string;
  installer_id: string;
}

async function hmacSign(secret: string, payload: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  return 'sha256=' + Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function postWithRetry(
  url: string,
  body: string,
  headers: Record<string, string>,
  maxAttempts = 3,
): Promise<boolean> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const res = await fetch(url, { method: 'POST', headers, body });
      if (res.ok) return true;
    } catch { /* retry */ }
    if (attempt < maxAttempts - 1) {
      await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
    }
  }
  return false;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { lead_id, installer_id } = (await req.json()) as Payload;

  const { data: lead, error: leadErr } = await supabase
    .from('leads').select('*').eq('id', lead_id).single();

  if (leadErr || !lead) {
    return new Response(JSON.stringify({ error: 'Lead not found' }), {
      status: 404, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  // Finde den Inhaber (Owner) des Unternehmens
  const { data: ownerProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'owner')
    .limit(1)
    .maybeSingle();

  const ownerId = ownerProfile?.id ?? installer_id;

  const { data: settings } = await supabase
    .from('company_webhook_settings')
    .select('webhook_url, webhook_secret, webhook_active')
    .eq('owner_id', ownerId)
    .maybeSingle();

  const score = lead.score ?? 0;
  const scoreTier = score >= 70 ? 'heiss' : score >= 40 ? 'warm' : 'kalt';

  const eventPayload = {
    event: 'lead.new',
    timestamp: new Date().toISOString(),
    lead: {
      id: lead.id,
      name: `${lead.first_name} ${lead.last_name}`,
      email: lead.email,
      phone: lead.phone,
      zip: lead.zip,
      kwp: lead.kwp,
      investment: lead.investment,
      annual_savings: lead.annual_savings,
      amortization: lead.amortization,
      autarky: lead.autarky,
      score,
      score_tier: scoreTier,
      created_at: lead.created_at,
    },
  };

  const bodyStr = JSON.stringify(eventPayload);
  let success = false;
  let method = 'no_webhook';

  if (settings?.webhook_active && settings?.webhook_url) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Voltify-Webhook/1.0',
    };
    if (settings.webhook_secret) {
      headers['X-Voltify-Signature'] = await hmacSign(settings.webhook_secret, bodyStr);
    }

    success = await postWithRetry(settings.webhook_url, bodyStr, headers);
    method = 'webhook';

    await supabase.from('webhook_logs').insert({
      installer_id,
      lead_id,
      webhook_url: settings.webhook_url,
      success,
      payload: eventPayload,
      created_at: new Date().toISOString(),
    });
  }

  return new Response(JSON.stringify({ success, method }), {
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
});
