// Edge Function — notify-beta
// Deploy: SUPABASE_ACCESS_TOKEN=... supabase functions deploy notify-beta --use-api
// Setup:  SUPABASE_ACCESS_TOKEN=... supabase secrets set RESEND_API_KEY=re_... --project-ref ecsqbsgbfmvqaqnryvwf

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ADMIN_EMAIL = 'contact@vu-studio.de'; // verified domain

interface BetaRequest {
  company_name: string;
  contact_name: string;
  email: string;
  phone?: string;
  zip?: string;
  message?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  const data = (await req.json()) as BetaRequest;
  const resendKey = Deno.env.get('RESEND_API_KEY');

  if (!resendKey) {
    return new Response(JSON.stringify({ sent: false, reason: 'no_api_key' }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1A3A5C; color: white; padding: 24px; border-radius: 12px 12px 0 0;">
        <h1 style="margin: 0; font-size: 20px;">⚡ Neue Voltify-Beta-Anfrage</h1>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px; padding: 24px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 13px; width: 140px;">Firma</td>
            <td style="padding: 8px 0; font-weight: bold; color: #1A3A5C;">${data.company_name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Ansprechpartner</td>
            <td style="padding: 8px 0; font-weight: bold; color: #1A3A5C;">${data.contact_name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 13px;">E-Mail</td>
            <td style="padding: 8px 0;"><a href="mailto:${data.email}" style="color: #F5A623;">${data.email}</a></td>
          </tr>
          ${data.phone ? `
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 13px;">📞 Handy</td>
            <td style="padding: 8px 0; font-weight: bold; color: #1A3A5C; font-size: 16px;">
              <a href="tel:${data.phone}" style="color: #1A3A5C;">${data.phone}</a>
            </td>
          </tr>` : ''}
          ${data.zip ? `
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 13px;">PLZ / Region</td>
            <td style="padding: 8px 0; color: #1A3A5C;">${data.zip}</td>
          </tr>` : ''}
          ${data.message ? `
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 13px; vertical-align: top;">Nachricht</td>
            <td style="padding: 8px 0; color: #1A3A5C;">${data.message}</td>
          </tr>` : ''}
        </table>
        <div style="margin-top: 20px; padding: 12px; background: #fef3c7; border-radius: 8px; font-size: 13px; color: #92400e;">
          ${data.phone
            ? `👆 Jetzt zurückrufen: <strong>${data.phone}</strong>`
            : `📧 Per E-Mail antworten: <strong>${data.email}</strong>`
          }
        </div>
      </div>
    </div>
  `;

  // Versuche mit eigener Domain, fallback auf Resend-Standard
  let fromAddress = 'Voltify Beta <noreply@vu-studio.de>';
  let res = await sendEmail(resendKey, fromAddress, ADMIN_EMAIL, data, html);

  if (!res.ok && (res.status === 403 || res.status === 422)) {
    fromAddress = 'Voltify Beta <onboarding@resend.dev>';
    res = await sendEmail(resendKey, fromAddress, ADMIN_EMAIL, data, html);
  }

  return new Response(JSON.stringify({ sent: res.ok, status: res.status }), {
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });

  async function sendEmail(key: string, from: string, to: string, data: BetaRequest, htmlBody: string) {
    return fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        subject: `⚡ Voltify Beta-Anfrage: ${data.company_name} (${data.phone ?? data.email})`,
        html: htmlBody,
      }),
    });
  }
});
