// Edge Function — notify-payment-due
// Cron: täglich 08:00 — informiert Kunden 3 Tage vor fälliger Zahlung

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
  if (!resendKey) {
    return new Response(JSON.stringify({ sent: 0, reason: 'no_api_key' }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  // Projekte in Phase "installation" oder "abnahme" mit offenen Zahlungen
  const { data: leads, error } = await supabase
    .from('leads')
    .select('id, first_name, last_name, customer_id, final_price, payment_1_paid, payment_2_paid, payment_3_paid, installer_id')
    .in('status', ['installation', 'abnahme'])
    .eq('offer_status', 'accepted')
    .not('customer_id', 'is', null);

  if (error || !leads?.length) {
    return new Response(JSON.stringify({ sent: 0 }), { headers: CORS });
  }

  let sent = 0;
  for (const lead of leads) {
    const price = lead.final_price ?? 0;
    const rate1 = Math.round(price * 0.30);
    const rate2 = Math.round(price * 0.60);
    const rate3 = price - rate1 - rate2;

    const nextUnpaid =
      !lead.payment_1_paid ? { nr: 1, amount: rate1, label: 'Anzahlung (30%)' } :
      !lead.payment_2_paid ? { nr: 2, amount: rate2, label: 'Montagerechnung (60%)' } :
      !lead.payment_3_paid ? { nr: 3, amount: rate3, label: 'Schlussrechnung (10%)' } :
      null;

    if (!nextUnpaid) continue;

    const { data: customerData } = await supabase.auth.admin.getUserById(lead.customer_id);
    const customerEmail = customerData?.user?.email;
    if (!customerEmail) continue;

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Voltify <noreply@vu-studio.de>',
        to: customerEmail,
        subject: `Zahlungserinnerung — ${nextUnpaid.label}`,
        html: `
          <div style="font-family: sans-serif; max-width: 500px;">
            <div style="background: #1A3A5C; color: white; padding: 20px; border-radius: 12px 12px 0 0;">
              <h2 style="margin: 0; font-size: 18px;">💳 Zahlungserinnerung</h2>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px; padding: 20px;">
              <p>Hallo ${lead.first_name},</p>
              <p>die nächste Zahlung für deine Solaranlage ist fällig:</p>
              <div style="margin: 16px 0; padding: 16px; background: #fef3c7; border-radius: 8px; text-align: center;">
                <p style="margin: 0; font-size: 14px; color: #64748b;">${nextUnpaid.label}</p>
                <p style="margin: 4px 0 0; font-size: 24px; font-weight: bold; color: #1A3A5C;">${nextUnpaid.amount.toLocaleString('de-DE')} €</p>
              </div>
              <p>Bitte überweise den Betrag an deinen Installateur.</p>
              <p style="margin-top: 16px; font-size: 12px; color: #94a3b8;">
                Bei Fragen erreichst du uns unter <a href="mailto:kontakt@voltify.de" style="color: #F5A623;">kontakt@voltify.de</a>
              </p>
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
