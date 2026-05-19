// Supabase Edge Function — send-offer
// Versendet Angebots-PDF per E-Mail via Resend API
// Deploy: supabase functions deploy send-offer
// Required secret: RESEND_API_KEY

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Payload {
  to: string;
  subject: string;
  html: string;
  pdfBase64: string;
  filename: string;
  from_name?: string;
  from_email?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  if (!RESEND_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'RESEND_API_KEY nicht konfiguriert. Bitte in Supabase Secrets hinterlegen.' }),
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

  const { to, subject, html, pdfBase64, filename, from_name, from_email } = payload;

  if (!to || !subject || !pdfBase64 || !filename) {
    return new Response(
      JSON.stringify({ error: 'Fehlende Felder: to, subject, pdfBase64, filename sind erforderlich.' }),
      { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }

  // Resend API call
  const from = from_email
    ? `${from_name || 'Voltify'} <${from_email}>`
    : 'onboarding@resend.dev'; // Resend default für unverifizierte Domains

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
        attachments: [
          {
            filename,
            content: pdfBase64,
          },
        ],
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: data.message || 'Resend API Fehler', details: data }),
        { status: 502, headers: { ...CORS, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, messageId: data.id }),
      { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unbekannter Fehler' }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }
});
