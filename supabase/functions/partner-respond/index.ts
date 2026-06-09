// Supabase Edge Function — partner-respond
// Ein-Klick Annehmen/Ablehnen direkt aus der Partner-Email (kein Login nötig)
// Deploy: supabase functions deploy partner-respond

import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL            = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY    = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY          = Deno.env.get('RESEND_API_KEY');
const APP_URL                 = Deno.env.get('APP_URL') || 'https://voltify-app.vercel.app';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function htmlPage(title: string, icon: string, message: string, sub: string, color: string): Response {
  const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title} — Voltify</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;">
  <div style="background:#fff;border-radius:16px;padding:48px 40px;max-width:420px;width:90%;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="font-size:56px;margin-bottom:16px;">${icon}</div>
    <h1 style="color:#111827;font-size:22px;margin:0 0 10px;font-weight:700;">${title}</h1>
    <p style="color:#374151;font-size:15px;margin:0 0 8px;">${message}</p>
    <p style="color:#9ca3af;font-size:13px;margin:0 0 28px;">${sub}</p>
    <div style="display:inline-block;background:#1a3a5c;color:#f5a623;font-weight:800;font-size:18px;padding:8px 20px;border-radius:8px;">⚡ Voltify</div>
  </div>
</body>
</html>`;
  return new Response(html, { headers: { ...CORS, 'Content-Type': 'text/html; charset=utf-8' } });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  const url    = new URL(req.url);
  const aid    = url.searchParams.get('aid');    // assignment_id
  const token  = url.searchParams.get('token');  // partner access_token
  const action = url.searchParams.get('action'); // 'accepted' | 'rejected'

  // Validierung
  if (!aid || !token || !['accepted', 'rejected'].includes(action ?? '')) {
    return htmlPage('Ungültiger Link', '❌', 'Dieser Link ist ungültig oder abgelaufen.', 'Bitte wenden Sie sich an die Agentur.', '#dc2626');
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    // Assignment + Partner + Lead in einem Query verifizieren
    const { data: row, error: fetchErr } = await supabase
      .from('lead_assignments')
      .select(`
        id, status, agency_id, commission_amount,
        partner:partners!inner(id, company_name, email, access_token),
        lead:leads!inner(first_name, last_name)
      `)
      .eq('id', aid)
      .eq('partners.access_token', token)
      .maybeSingle();

    if (fetchErr || !row) {
      return htmlPage('Ungültiger Link', '❌', 'Dieser Link ist ungültig.', 'Bitte wenden Sie sich an die Agentur.', '#dc2626');
    }

    // Bereits beantwortet?
    if (row.status !== 'pending') {
      const already = row.status === 'accepted'
        ? 'Sie haben diesen Lead bereits angenommen.'
        : row.status === 'rejected'
          ? 'Sie haben diesen Lead bereits abgelehnt.'
          : 'Dieser Lead wurde bereits bearbeitet.';
      return htmlPage('Bereits beantwortet', 'ℹ️', already, 'Keine weitere Aktion erforderlich.', '#6b7280');
    }

    // Status aktualisieren
    const { error: updateErr } = await supabase
      .from('lead_assignments')
      .update({ status: action, responded_at: new Date().toISOString() })
      .eq('id', aid);

    if (updateErr) throw updateErr;

    // Agentur benachrichtigen (fire-and-forget)
    notifyAgency(supabase, row, action as 'accepted' | 'rejected').catch(() => {});

    // Erfolgsseite
    const isAccepted = action === 'accepted';
    return htmlPage(
      isAccepted ? 'Lead angenommen!' : 'Lead abgelehnt',
      isAccepted ? '✅' : '👋',
      isAccepted
        ? `Super! Sie haben den Lead von ${(row.lead as any)?.first_name} ${(row.lead as any)?.last_name} übernommen.`
        : `Verstanden. Der Lead wird an einen anderen Partner weitergeleitet.`,
      isAccepted
        ? 'Die Agentur wurde informiert. Nehmen Sie jetzt Kontakt auf.'
        : 'Vielen Dank für Ihre schnelle Rückmeldung.',
      isAccepted ? '#16a34a' : '#6b7280',
    );

  } catch (e) {
    console.error('partner-respond error:', e);
    return htmlPage('Fehler', '⚠️', 'Ein Fehler ist aufgetreten.', (e as Error).message, '#dc2626');
  }
});

async function notifyAgency(
  supabase: ReturnType<typeof createClient>,
  row: Record<string, unknown>,
  action: 'accepted' | 'rejected',
): Promise<void> {
  if (!RESEND_API_KEY) return;

  // Agentur-Email aus profiles holen
  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', row.agency_id)
    .single();

  if (!profile?.email) return;

  const partner   = row.partner as { company_name: string };
  const lead      = row.lead    as { first_name: string; last_name: string };
  const leadName  = `${lead.first_name} ${lead.last_name}`;
  const actionDe  = action === 'accepted' ? 'angenommen ✅' : 'abgelehnt ❌';

  const html = `
    <div style="font-family:-apple-system,sans-serif;max-width:500px;margin:0 auto;">
      <div style="background:#1a3a5c;padding:20px;border-radius:12px 12px 0 0;text-align:center;">
        <span style="color:#f5a623;font-size:22px;font-weight:800;">⚡ Voltify</span>
      </div>
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:0 0 12px 12px;padding:24px;">
        <h2 style="margin:0 0 12px;color:#111827;">Partner-Update</h2>
        <p style="color:#374151;font-size:15px;">
          <strong>${partner.company_name}</strong> hat den Lead
          <strong>${leadName}</strong> <strong>${actionDe}</strong>.
        </p>
        ${action === 'accepted' && (row.commission_amount as number) > 0 ? `
        <div style="background:#d1fae5;border-radius:8px;padding:12px 16px;margin:16px 0;">
          <strong style="color:#065f46;">Provision fällig: ${(row.commission_amount as number).toLocaleString('de-DE')} €</strong>
        </div>` : ''}
        ${action === 'rejected' ? `
        <div style="background:#fef2f2;border-radius:8px;padding:12px 16px;margin:16px 0;color:#991b1b;">
          Der Lead kann jetzt einem anderen Partner zugewiesen werden.
        </div>` : ''}
        <a href="${APP_URL}/admin/router"
          style="display:inline-block;background:#f5a623;color:#1a3a5c;font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:8px;">
          Zum Lead-Router →
        </a>
      </div>
    </div>`;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from:    'Voltify <noreply@vu-studio.de>',
      to:      profile.email,
      subject: `${partner.company_name} hat Lead ${leadName} ${action === 'accepted' ? 'angenommen ✅' : 'abgelehnt ❌'}`,
      html,
    }),
  });
}
