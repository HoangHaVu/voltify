// Supabase Edge Function — notify-agency
// Sendet E-Mail an Agentur bei Partner-Antwort (accept/reject/convert)
// Deploy: supabase functions deploy notify-agency

import { createClient } from 'jsr:@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: CORS });

  try {
    const { agency_email, partner_name, lead_name, status, notes } = await req.json();
    if (!agency_email || !status) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } });
    }

    const statusLabels: Record<string, string> = {
      accepted: 'angenommen',
      rejected: 'abgelehnt',
      converted: 'in Auftrag umgewandelt',
    };

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Voltify <noreply@vu-studio.de>',
        to: agency_email,
        subject: `Partner-Update: ${lead_name || 'Lead'} ${statusLabels[status] || status}`,
        html: `
          <h2>Partner-Update</h2>
          <p><strong>${partner_name || 'Partner'}</strong> hat den Lead <strong>${lead_name || '—'}</strong> ${statusLabels[status] || status}.</p>
          ${notes ? `<p><strong>Notiz:</strong> ${notes}</p>` : ''}
          <p><a href="https://voltify-app.vercel.app/admin/router" style="background:#F5A623;color:#1A3A5C;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;">Zum Lead-Router</a></p>
        `,
      }),
    });

    if (!res.ok) throw new Error(await res.text());
    return new Response(JSON.stringify({ success: true }), { headers: { ...CORS, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } });
  }
});
