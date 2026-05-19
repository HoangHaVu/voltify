# Voltify Edge Functions

## Übersicht

| Function | Zweck | Trigger |
|----------|-------|---------|
| `forward-lead` | Leitet neue Leads an Installateur-Webhook weiter | `supabase.functions.invoke('forward-lead', { body: { lead_id, installer_id } })` |
| `notify-beta` | Sendet Beta-Anfrage-E-Mail an Admin | `supabase.functions.invoke('notify-beta', { body: { company_name, contact_name, email, ... } })` |
| `notify-offer-expiry` | Cron: Täglich 08:00 — Erinnert an ablaufende Angebote | Supabase Cron Job |
| `notify-payment-due` | Cron: Täglich 08:00 — Zahlungserinnerungen an Kunden | Supabase Cron Job |
| `send-offer` | Sendet Angebots-PDF per E-Mail an Kunden | `supabase.functions.invoke('send-offer', { body: { to, subject, html, pdfBase64, filename } })` |

## Setup

### 1. Resend API Key (für E-Mails)
```bash
supabase secrets set RESEND_API_KEY=re_xxxxxxxx --project-ref ecsqbsgbfmvqaqnryvwf
```

### 2. Edge Functions deployen
```bash
# Einzeln deployen
supabase functions deploy forward-lead --project-ref ecsqbsgbfmvqaqnryvwf
supabase functions deploy notify-beta --project-ref ecsqbsgbfmvqaqnryvwf
supabase functions deploy notify-offer-expiry --project-ref ecsqbsgbfmvqaqnryvwf
supabase functions deploy notify-payment-due --project-ref ecsqbsgbfmvqaqnryvwf
supabase functions deploy send-offer --project-ref ecsqbsgbfmvqaqnryvwf

# Oder alle auf einmal
supabase functions deploy --project-ref ecsqbsgbfmvqaqnryvwf
```

### 3. Cron Jobs einrichten (nur für notify-offer-expiry + notify-payment-due)
Im Supabase Dashboard:
1. Database → Cron Jobs
2. New Cron Job
3. `notify-offer-expiry`: `0 8 * * *` (täglich 08:00)
4. `notify-payment-due`: `0 8 * * *` (täglich 08:00)

## Konfiguration

### Webhook-Einstellungen (für forward-lead)
Installateure können ihre Webhook-URL in der `installer_webhook_settings` Tabelle hinterlegen:
- `installer_id` — UUID des Installateurs
- `webhook_url` — Ziel-URL für Lead-Weiterleitung
- `webhook_secret` — Optional, für HMAC-SHA256 Signatur

### E-Mail-Versand
Alle E-Mails werden über Resend versendet. Die Absender-Adresse ist:
- `noreply@vu-studio.de` (muss in Resend als verified domain hinterlegt sein)

Admin-E-Mail für Beta-Benachrichtigungen:
- `contact@vu-studio.de`

## Testen

### forward-lead
```bash
curl -X POST https://ecsqbsgbfmvqaqnryvwf.supabase.co/functions/v1/forward-lead \
  -H "Authorization: Bearer <ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"lead_id": "...", "installer_id": "..."}'
```

### notify-beta
```bash
curl -X POST https://ecsqbsgbfmvqaqnryvwf.supabase.co/functions/v1/notify-beta \
  -H "Authorization: Bearer <ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"company_name": "Test GmbH", "contact_name": "Max Mustermann", "email": "test@example.de"}'
```
