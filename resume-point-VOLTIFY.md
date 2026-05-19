# Voltify — Resume Point
<!-- Zuletzt aktualisiert: 2026-05-13 — MVP fertig, bereit für Arbeit/Deployment -->

## Status: MVP FERTIG ✅

Alle Kern-Features sind implementiert, getestet und der Build läuft ohne Fehler.

---

## Was ist drin?

### Landingpage (`/`)
- Hero mit Solar-Panel-Hintergrund, Stats-Bar
- 3 Produkt-Kachelen (CRM, Konfigurator, Digitaler Auftritt)
- CRM-Vorschau, Prozess-Workflow, 6 Feature-Cards
- CTA → `/beta` (Beta-Programm)

### Kunden-Demo (`/kunde`)
- 15 Sektionen: Hero, Partner, Services, USP, Team, News, FAQ, Footer
- Solar-Konfigurator-Einstieg (PLZ-Eingabe)
- "Demo verlassen" → zurück zur Landingpage

### Interne App (`/login` → Dashboard)
- **Auth:** 8 Rollen, ProtectedRoute, AuthContext
- **Configurator:** 9-Schritt Wizard mit ROI-Berechnung
- **Admin CRM:** Kanban-Pipelines, Lead-/Projekt-Details, Kalender, Nachrichten
- **PDF-System:** Angebots-PDF + 3 Rechnungs-PDFs mit dynamischem Branding
- **E-Mail-Versand:** `send-offer` Edge Function (Resend) mit PDF-Anhang
- **Team-Verwaltung:** Owner erstellt Accounts mit zufälligem Passwort
- **Einstellungen:** Firmen-Branding (Logo, Farben, IBAN, Zahlungsziel)

### Rechtliche Seiten
- `/preise` — 3 Tiers (149€/299€/599€)
- `/beta` — Beta-Programm-Anmeldung
- `/agb`, `/datenschutz`, `/impressum`

---

## Nächster Schritt (wenn gewünscht)
1. **Vercel Deployment** — Git-Repo verbinden, Build-Settings, Env-Vars

---

## Wichtige Pfade & Befehle
- Dev-Server: `npm run dev` (Port 5173)
- Build: `npm run build`
- Auth: `src/contexts/AuthContext.tsx`
- Services: `src/services/`
- PDF: `src/components/pdf/`
- Edge Functions: `supabase/functions/`
- DNA: `Voltify-DNA.md`
- Tasks: `tasks-VOLTIFY.md`

---

## Datenbank
- **Supabase Projekt-Ref:** `ecsqbsgbfmvqaqnryvwf`
- **Migrationen 018–028:** ✅ Alle ausgeführt

## Test-Accounts
| E-Mail | Rolle | Passwort |
|--------|-------|----------|
| installateur@test.de | super_employee | Test123456 |
| inhaber@test.de | owner | Test123456 |

---

## Aktive Map
`docs/maps/map-seitenbaum.md`
