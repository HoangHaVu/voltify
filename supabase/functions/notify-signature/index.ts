// Supabase Edge Function — notify-signature
// Sendet E-Mails nach digitaler Angebots-Unterschrift:
// 1. Bestätigung an Kunden
// 2. Benachrichtigung an Installateur
// Deploy: supabase functions deploy notify-signature
// Required secret: RESEND_API_KEY

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Payload {
  lead: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  installerEmail: string;
  companyName: string;
  offerNumber: string;
  signedAt: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  if (!RESEND_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'RESEND_API_KEY nicht konfiguriert.' }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }

  let payload: Payload;
  try {
    payload = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Ungültiger JSON-Body' }),
      { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }

  const { lead, installerEmail, companyName, offerNumber, signedAt } = payload;

  if (!lead?.email || !installerEmail) {
    return new Response(
      JSON.stringify({ error: 'Fehlende Felder: lead.email und installerEmail sind erforderlich.' }),
      { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }

  const from = `Voltify <noreply@vu-studio.de>`;
  const dateStr = new Date(signedAt).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // ── 1. Kunden-Bestätigung ─────────────────────────────────────────
  const customerSubject = `Ihr Angebot ${offerNumber} wurde erfolgreich angenommen`;
  const customerHtml = `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
      <h2 style="color: #1A3A5C;">Angebot angenommen ✓</h2>
      <p>Hallo ${lead.first_name},</p>
      <p>vielen Dank! Sie haben das Angebot <strong>${offerNumber}</strong> von <strong>${companyName}</strong> am <strong>${dateStr}</strong> digital unterschrieben.</p>
      <p>Wir werden uns in Kürze bei Ihnen melden, um die nächsten Schritte zu besprechen.</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
      <p style="font-size: 12px; color: #6b7280;">
        Dies ist eine automatische Nachricht von Voltify.<br/>
        Bei Fragen antworten Sie einfach auf diese E-Mail.
      </p>
    </div>
  `;

  // ── 2. Installateur-Benachrichtigung ──────────────────────────────
  const installerSubject = `🎉 Angebot ${offerNumber} angenommen — ${lead.first_name} ${lead.last_name}`;
  const installerHtml = `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
      <h2 style="color: #F5A623;">Angebot angenommen 🎉</h2>
      <p>Der Kunde hat das Angebot digital unterschrieben:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Kunde:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${lead.first_name} ${lead.last_name}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>E-Mail:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${lead.email}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Angebotsnr.:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${offerNumber}</td></tr>
        <tr><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Unterschrieben am:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${dateStr}</td></tr>
      </table>
      <p>Die unterschriebene Version des Angebots ist im Dashboard verfügbar.</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
      <p style="font-size: 12px; color: #6b7280;">Voltify — Automatische Benachrichtigung</p>
    </div>
  `;

  async function sendEmail(to: string, subject: string, html: string) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to: [to], subject, html }),
    });
    return res.ok;
  }

  const [customerOk, installerOk] = await Promise.all([
    sendEmail(lead.email, customerSubject, customerHtml),
    sendEmail(installerEmail, installerSubject, installerHtml),
  ]);

  return new Response(
    JSON.stringify({
      success: customerOk && installerOk,
      customerSent: customerOk,
      installerSent: installerOk,
    }),
    { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } }
  );
});
