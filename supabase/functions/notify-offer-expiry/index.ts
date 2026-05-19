// Edge Function — notify-offer-expiry
// Cron: täglich 08:00 — warnt Installateure bei Angeboten die in 3 Tagen ablaufen

import { createClient } from 'jsr:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
  const resendKey = Deno.env.get('RESEND_API_KEY');

  // Angebote die in ≤3 Tagen ablaufen, noch nicht angenommen/abgelehnt
  const in3Days = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
  const now = new Date().toISOString();

  const { data: expiring, error } = await supabase
    .from('leads')
    .select('id, first_name, last_name, installer_id, sent_at, offer_valid_until')
    .eq('offer_status', 'sent')
    .lte('offer_valid_until', in3Days)
    .gte('offer_valid_until', now);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: CORS });
  }

  if (!resendKey || !expiring?.length) {
    return new Response(JSON.stringify({ sent: 0, reason: resendKey ? 'no_expiring' : 'no_api_key' }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  let sent = 0;
  for (const lead of expiring) {
    const { data: userData } = await supabase.auth.admin.getUserById(lead.installer_id);
    const installerEmail = userData?.user?.email;
    if (!installerEmail) continue;

    const daysLeft = Math.ceil(
      (new Date(lead.offer_valid_until).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Voltify <noreply@vu-studio.de>',
        to: installerEmail,
        subject: `⚠️ Angebot läuft in ${daysLeft} Tag${daysLeft === 1 ? '' : 'en'} ab`,
        html: `
          <div style="font-family: sans-serif; max-width: 500px;">
            <div style="background: #1A3A5C; color: white; padding: 20px; border-radius: 12px 12px 0 0;">
              <h2 style="margin: 0; font-size: 18px;">⚠️ Angebot läuft bald ab</h2>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px; padding: 20px;">
              <p>Hallo,</p>
              <p>dein Angebot an <strong>${lead.first_name} ${lead.last_name}</strong> läuft in <strong>${daysLeft} Tag${daysLeft === 1 ? '' : 'en'}</strong> ab.</p>
              <p>Melde dich jetzt bei deinem Kunden, um das Angebot zu verlängern oder abzuschließen.</p>
              <div style="margin-top: 16px; padding: 12px; background: #fef3c7; border-radius: 8px; font-size: 13px;">
                <a href="https://voltify.de/admin" style="color: #1A3A5C; font-weight: bold;">→ Zum Admin-Dashboard</a>
              </div>
            </div>
          </div>
        `,
      }),
    });
    sent++;
  }

  return new Response(JSON.stringify({ sent }), {
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
});
