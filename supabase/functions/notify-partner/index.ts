// Supabase Edge Function — notify-partner
// Sendet vollständige Lead-Daten + Ein-Klick-Annehmen/Ablehnen an Partner
// Deploy: supabase functions deploy notify-partner

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL   = Deno.env.get('SUPABASE_URL') || '';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PLANNING: Record<string, string> = {
  sofort:    'Sofort bereit',
  '3monate':  'In 3 Monaten',
  '12monate': 'In 12 Monaten',
};

function fmt(n: number | null | undefined, suffix = ''): string {
  if (n == null) return '—';
  return n.toLocaleString('de-DE') + (suffix ? ' ' + suffix : '');
}

function row(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:8px 12px;color:#6b7280;font-size:14px;white-space:nowrap;">${label}</td>
      <td style="padding:8px 12px;color:#111827;font-size:14px;font-weight:600;">${value}</td>
    </tr>`;
}

function kachel(label: string, value: string, color = '#1a3a5c'): string {
  return `
    <td style="width:50%;padding:6px;">
      <div style="background:#f9fafb;border-radius:8px;padding:14px;text-align:center;">
        <div style="color:${color};font-size:20px;font-weight:700;line-height:1.2;">${value}</div>
        <div style="color:#9ca3af;font-size:11px;margin-top:4px;">${label}</div>
      </div>
    </td>`;
}

function chip(text: string): string {
  return `<span style="display:inline-block;background:#e0f2fe;color:#0369a1;font-size:12px;font-weight:600;padding:4px 10px;border-radius:20px;margin:3px;">${text}</span>`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: CORS });

  try {
    const {
      partner_email, partner_name, assignment_id, partner_token,
      lead_name, lead_email, lead_phone, lead_zip,
      lead_kwp, lead_investment, lead_savings, lead_autarky,
      lead_amortization, lead_consumption,
      lead_battery, lead_ecar, lead_heatpump, lead_orientation, lead_horizon,
      commission_value, commission_type,
    } = await req.json();

    if (!partner_email || !assignment_id || !partner_token) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } });
    }

    const fnBase   = `${SUPABASE_URL}/functions/v1/partner-respond`;
    const acceptUrl = `${fnBase}?aid=${assignment_id}&token=${partner_token}&action=accepted`;
    const rejectUrl = `${fnBase}?aid=${assignment_id}&token=${partner_token}&action=rejected`;

    const commissionLabel = commission_value
      ? `${commission_value}${commission_type === 'fixed' ? ' €' : ' %'} Provision`
      : '';

    const extras: string[] = [];
    if (lead_battery)  extras.push(chip('🔋 Batteriespeicher'));
    if (lead_ecar)     extras.push(chip('🚗 E-Auto / Wallbox'));
    if (lead_heatpump) extras.push(chip('♨️ Wärmepumpe'));

    const html = `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
  <tr><td align="center">
  <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:560px;width:100%;">

    <!-- Header -->
    <tr>
      <td style="background:#1a3a5c;padding:24px 32px;text-align:center;">
        <span style="color:#f5a623;font-size:28px;font-weight:800;letter-spacing:-0.5px;">⚡ Voltify</span>
        <div style="color:#93c5fd;font-size:13px;margin-top:4px;">Neuer Lead für Sie</div>
      </td>
    </tr>

    <!-- Lead Name + Provision -->
    <tr>
      <td style="padding:28px 32px 0;">
        <h1 style="margin:0 0 6px;font-size:22px;color:#111827;font-weight:700;">
          ${lead_name || 'Neue Solaranfrage'}
        </h1>
        ${lead_horizon ? `<div style="display:inline-block;background:#fef3c7;color:#92400e;font-size:12px;font-weight:600;padding:4px 10px;border-radius:20px;">${PLANNING[lead_horizon] || lead_horizon}</div>` : ''}
        ${commissionLabel ? `<div style="display:inline-block;background:#d1fae5;color:#065f46;font-size:12px;font-weight:600;padding:4px 10px;border-radius:20px;margin-left:6px;">${commissionLabel}</div>` : ''}
      </td>
    </tr>

    <!-- Kontaktdaten -->
    <tr>
      <td style="padding:20px 32px 0;">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;margin-bottom:8px;">Kontaktdaten</div>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:10px;overflow:hidden;">
          ${lead_email ? row('📧 E-Mail', `<a href="mailto:${lead_email}" style="color:#1a3a5c;">${lead_email}</a>`) : ''}
          ${lead_phone ? row('📱 Telefon', `<a href="tel:${lead_phone}" style="color:#1a3a5c;">${lead_phone}</a>`) : ''}
          ${lead_zip   ? row('📍 PLZ',     lead_zip) : ''}
          ${lead_orientation ? row('🏠 Dach', lead_orientation) : ''}
        </table>
      </td>
    </tr>

    <!-- Wirtschaftsanalyse -->
    <tr>
      <td style="padding:20px 32px 0;">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;margin-bottom:10px;">Wirtschaftsanalyse</div>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            ${lead_kwp        != null ? kachel('Anlagenleistung', fmt(lead_kwp, 'kWp'),  '#f5a623') : ''}
            ${lead_investment != null ? kachel('Investition',     fmt(lead_investment, '€'), '#1a3a5c') : ''}
          </tr>
          <tr>
            ${lead_savings    != null ? kachel('Ersparnis / Jahr', fmt(lead_savings, '€'), '#059669') : ''}
            ${lead_autarky    != null ? kachel('Autarkie',          fmt(lead_autarky, '%'),  '#2563eb') : ''}
          </tr>
          <tr>
            ${lead_amortization != null ? kachel('Amortisation', '~' + fmt(lead_amortization, 'Jahre'), '#6b7280') : ''}
            ${lead_consumption  != null ? kachel('Jahresverbrauch', fmt(lead_consumption, 'kWh'), '#6b7280') : ''}
          </tr>
        </table>
      </td>
    </tr>

    <!-- Extras -->
    ${extras.length > 0 ? `
    <tr>
      <td style="padding:16px 32px 0;">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;margin-bottom:8px;">Gewünschte Extras</div>
        ${extras.join('')}
      </td>
    </tr>` : ''}

    <!-- Divider -->
    <tr><td style="padding:24px 32px 0;"><div style="border-top:1px solid #e5e7eb;"></div></td></tr>

    <!-- CTA Buttons -->
    <tr>
      <td style="padding:24px 32px;text-align:center;">
        <p style="margin:0 0 20px;color:#374151;font-size:15px;font-weight:500;">
          Möchten Sie diesen Lead übernehmen?
        </p>
        <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
          <tr>
            <td style="padding:0 8px;">
              <a href="${acceptUrl}"
                style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;border-radius:10px;letter-spacing:0.2px;">
                ✅ Annehmen
              </a>
            </td>
            <td style="padding:0 8px;">
              <a href="${rejectUrl}"
                style="display:inline-block;background:#dc2626;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;border-radius:10px;letter-spacing:0.2px;">
                ❌ Ablehnen
              </a>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;color:#9ca3af;font-size:12px;">
          Kein Login erforderlich — dieser Link ist persönlich für Sie.
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background:#f9fafb;padding:16px 32px;text-align:center;border-top:1px solid #e5e7eb;">
        <span style="color:#d1d5db;font-size:12px;">Powered by ⚡ Voltify · Solar-Vertrieb</span>
      </td>
    </tr>

  </table>
  </td></tr>
</table>
</body>
</html>`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from:    'Voltify Partner <noreply@vu-studio.de>',
        to:      partner_email,
        subject: `Neuer Lead: ${lead_name || 'Solaranfrage'}${lead_zip ? ' · PLZ ' + lead_zip : ''}`,
        html,
      }),
    });

    if (!res.ok) throw new Error(await res.text());
    return new Response(JSON.stringify({ success: true }), { headers: { ...CORS, 'Content-Type': 'application/json' } });

  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } });
  }
});
