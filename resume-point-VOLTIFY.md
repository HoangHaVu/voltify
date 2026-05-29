# Voltify — Resume Point
<!-- Zuletzt aktualisiert: 2026-05-27 — Bugfixes + Tests deployed -->

## Status: BUGFIXES + TESTS DEPLOYED ✅

Letzter Commit: `4b56ad7` — Tests erweitert (94/94), Amortisationsgraph, negative Eingaben blockiert

---

## Was ist neu? (2026-05-27)

### Bugfixes
- **Amortisationsgraph** — Balken wurden nicht angezeigt (`items-end` Flexbox-Bug). Fix: `justify-end` + `h-full` auf Spalten-Wrapper
- **Negative Eingaben** — Dachfläche, Stromverbrauch, Strompreis: `onChange`-Guard blockt Werte < 0, leerer String bleibt erlaubt
- **calculateROI Clamping** — `Math.max(0, ...)` in `calculations.ts` als Defense-in-Depth

### Tests
- `tests/lib/calculations.test.ts` — +14 Tests: chartData (21 Punkte), profit20Years, gridFeedIn, effectiveInvestment, Clamping-Fallbacks
- `tests/sections/Step2_Roof.test.tsx` — 6 Tests: negative Dachfläche geblockt ✓
- `tests/sections/Step3_Consumption.test.tsx` — 8 Tests: negativer Verbrauch + Strompreis geblockt ✓
- **Gesamtergebnis: 94/94 Tests grün** (vorher: 65)

---

## Was ist neu? (Mai 2026)

### Pipeline-Spalte "Vor Ort"
- Neue lila Spalte zwischen "Kontaktiert" und "Angebot versendet"
- Status `vorort` zum Lead-Typ hinzugefügt

### Vor-Ort-Termin
- Date-Picker + Notizen + Durchgeführt-Toggle im Drawer
- Automatische Kalender-Synchronisation via `upsertSiteVisitAppointment()`

### Gemessene Daten
- `roof_area_measured`, `roof_angle`, `shading_issues` editierbar im Bearbeiten-Modal

### Konfiguration bearbeiten Modal
- "Details sehen" entfernt — Daten werden immer angezeigt
- "Bearbeiten" Button öffnet Modal mit allen Feldern
- "Konfiguration neu berechnen" mit Live-Vorschau
- Speichern persistiert ROI-Werte + Score

### Rabatt-System
- Installateur sieht Dropdown mit Owner-Codes (via `ownerId`)
- Code anwenden → Preis aktualisiert
- Individuellen Rabatt anfragen (Slider + Begründung)
- Rabatt löschen
- Rabatt-Hinweis im Angebots-Management (Code, %, Endpreis)

### Angebot als PDF
- Button im Angebots-Management → PDF generieren + Download
- PDF berücksichtigt Rabatt automatisch

### Lead-Scoring Fix
- Score wird dynamisch aus Lead-Daten berechnet (nicht mehr statisch aus DB)
- Heiß ≥ 80, Warm ≥ 50, Kalt < 50

### Supabase Migration 029
- Alle neuen Felder in `leads` (site_visit, gemessene Daten, Rabatt, Angebots-Status)
- Neue Tabelle `discount_codes` mit RLS
- RPC `redeem_discount_code` mit Owner-Lookup

---

## Was ist drin? (MVP)

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
- **Admin CRM:** Kanban-Pipelines (5 Lead + 4 Projekt Spalten), Lead-/Projekt-Details, Kalender, Nachrichten
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
1. **Vercel Deployment prüfen** — Ist der aktuelle Build live?

---

## Wichtige Pfade & Befehle
- Dev-Server: `npm run dev` (Port 5173)
- Build: `npm run build` (0 TypeScript-Fehler)
- Tests: `npm test` (94/94 passing)
- Auth: `src/contexts/AuthContext.tsx`
- Services: `src/services/`
- PDF: `src/components/pdf/`
- Edge Functions: `supabase/functions/`
- DNA: `Voltify-DNA.md`
- Tasks: `tasks-VOLTIFY.md`

---

## Datenbank
- **Supabase Projekt-Ref:** `ecsqbsgbfmvqaqnryvwf`
- **Migrationen 018–029:** ✅ Alle ausgeführt

## Test-Accounts
| E-Mail | Rolle | Passwort |
|--------|-------|----------|
| installateur@test.de | super_employee | Test123456 |
| inhaber@test.de | owner | Test123456 |

---

## Aktive Map
`docs/maps/map-seitenbaum.md`
