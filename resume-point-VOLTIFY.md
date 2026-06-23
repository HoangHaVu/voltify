# Voltify — Resume Point
<!-- Zuletzt aktualisiert: 2026-06-08 — Agency-Blocker A1/A2/A3 implementiert + deployed, 039+040 live -->

## Status: MVP-INFRASTRUKTUR KOMPLETT ✅

Letzter Stand (Code): 121/121 Tests, 0 TypeScript-Fehler
Session 2026-05-31: Batteriekosten-Fix, Step-7-Verbesserungen, 8-Schritt-Konfigurator, PLZ in Step 1
Session 2026-06-01:
  - Step 3 gesplittet → 9-Schritt-Konfigurator (Step 3=Stromverbrauch, Step 4=Ausstattung & Pläne)
  - Google Maps API Key live (Vercel + .env.local, Quota 200/Tag, Budget-Alert €20)
  - Migrationen 030+032+033+034a+034b+035 in Supabase deployed
  - Edge Functions: notify-signature deployed, send-offer + notify-signature auf noreply@vu-studio.de
Session 2026-06-05 (Teil 1):
  - **Digitale Unterschrift komplett** ✅ (signing_token in LEAD_SELECT + Link in E-Mail)
  - **Calendly-Integration** ✅ Beta-Formular → Demo-Call-Modal (contact-vu-studio/30min)
  - **Funnel-Umbau (Demo-as-Trojan-Horse)** ✅ — betaConfig.ts, Step9 demoMode, DemoBanner, ExitIntentModal, FloatingBetaCTA
  - CRM-Kachel → /login (Demo-Accounts für Prospects) · 113/113 Tests grün

Session 2026-06-05 (Teil 2):
  - **Funnel-Tracking** ✅ — `funnel_events` Tabelle (Migrationen 036–038), fire-and-forget Events
  - **Step0_EmailGate** ✅ — E-Mail-Capture vor Konfigurator (nur Live-Modus, Skip-Option)
  - **Demo-Modus via ?demo=1** ✅ — URL-Param trennt Demo (Banner, kein Gate) von Live (Gate, kein Banner)
  - **UTM-Persistenz** ✅ — `cacheFunnelSourceFromUrl()` auf Landing; sl_email + utm_* überleben Navigation
  - **Scoutly-Integration** ✅ — VoltifyPanel in Scoutly IntegrationsPage, funnel_events_public View
  - **Smartlead P.S.-Link** ✅ — `?sl_email={{email}}&utm_source=scoutly&utm_campaign=...`
  - **Vercel Build-Fix** ✅ — Promise.resolve() wrapper + CalculationPdfDocument.tsx committed
  - Letzter Commit: `543decf` · 113/113 Tests grün · 0 TypeScript-Fehler

Session 2026-06-09 (Agency-Rollensystem + Kalender + Einstellungen):
  - **`agency_agent`-Rolle (Vertriebler)** ✅ — `resolveAgencyId`, `isAgencyAdmin/Agent`, Sidebar-Nav, App-Routing
  - **`AgencyCalendarPage`** ✅ — 2 Typen (Beratung mit Lead, Partner-Meeting), eigener Kalender für Agenturen
  - **`AgencyTeamPage`** ✅ — Vertriebler einladen, Blur-Passwort, Copy-Buttons
  - **`AgencySettingsPage`** ✅ — Firmenprofil, Standard-Provision, Benachrichtigungs-Toggle, Team-Shortcut
  - **Team-Filter** ✅ — Dashboard (Meine Leads) + CommissionsPage nach Vertriebler filterbar
  - **`vertriebler@test.de`** ✅ — Migration 042 + Login-Seite 2-Button-Grid
  - **Migrationen 042–044** ✅ deployed — agency_agent CHECK-Constraint, assigned_by, Agency-Settings-Spalten
  - 2 Commits gepusht + Vercel deployed: https://voltify-app.vercel.app

Session 2026-06-08 (Teil 2 — Agency-Blocker):
  - **Migration 039** ✅ DEPLOYED — `partners`, `lead_assignments`, `commissions` + RLS live
  - **Migration 040** ✅ DEPLOYED — 3 SECURITY DEFINER RPCs (`get_partner_by_token`, `get_partner_assignments`, `partner_update_assignment`), `sales_agency` im Role-CHECK-Constraint, `profiles.agency_slug`, Leads-RLS für Agenturen, `resolve_agency_slug`
  - **A1 — Portal-RLS-Fix** ✅ — Portal läuft jetzt über RPCs (anon-safe), Commission-Automatik bei `converted` ist transaktional im RPC
  - **A2 — Funnel-Verdrahtung** ✅ — `?a=<slug>` → sessionStorage → `resolve_agency_slug` → `agency_id` im Lead-Insert; `LeadRouterPage` lädt echte Agency-Leads
  - **A3 — Commission-Automatik** ✅ — im `partner_update_assignment` RPC integriert (idempotent, fixed + percentage)
  - **Edge Functions** ✅ DEPLOYED — `notify-partner` + `notify-agency` ACTIVE
  - 113/113 Tests grün · 0 TypeScript-Fehler

---

## Was ist neu? (2026-05-29) — Strategie-Pivot

### Wettbewerbsanalyse vs. Reonic durchgeführt
- **Niche-Positionierung** klar festgelegt: **Solo-Solarteure + 1–5-Mann-Familienbetriebe in DACH** — bewusst NICHT die Reonic-Klientel (5+ Mitarbeiter)
- **Flywheel-Modell** dokumentiert: Scoutly (CAC-Maschine) → Voltify (LTV-Maschine) → AI-Dev (Velocity-Multiplikator)
- **DNA-Sektion 9** ergänzt: Buyer-Persona, Wettbewerbsmatrix, 90-Tage-Plan, "Wir-tun-das-NICHT"-Liste, Risiken, KPIs, Stop-Loss-Bedingungen
- **Realistische Erfolgs-Szenarien**: €300k–800k ARR-Pfad realistisch (~35–45 %), "Reonic-Killer" unrealistisch (<15 %)

### Feature-Roadmap aus Reonic-Analyse (in tasks-VOLTIFY.md)
- **Tier 1** Quick-Wins (1–2 Wochen): Digitale Unterschrift, Angebots-Varianten A/B/C, Magic-Link-Portal hochziehen, Lead-Scoring AI ausbauen
- **Tier 2** Strategisch (2–6 Wochen): **Solar-Planer (2D-Satellit Google Maps)** statt 3D, PWA für Monteure
- **Tier 3** Differenzierung (selektiv): WhatsApp-Integration, Förder-Datenbank, Netzanmeldungs-Pre-Fill-PDF
- **Meeting-/Call-Notizen mit Whisper bewusst ausgeklammert**

### Solar-Planer: 3D → 2D-Pivot
- **Vorher**: React Three Fiber, generische 3D-Box, ~2–3 Wochen Aufwand
- **Jetzt**: Google Maps Satellite + Canvas-Modul-Overlay (à la Reonic), ~1–2 Wochen Aufwand
- **Begründung**: Realer Wow-Faktor (Kunde sieht **sein** Haus), mobile-stabil (kein WebGL), trivialer PDF-Export
- **Map-Provider entschieden**: Google Maps (beste DE-Qualität, Domain-Restriction Pflicht)
- **Adress-Eingabe bleibt in Step 8** → Visualizer erscheint in Step 9 (Thank-You)

---

## Was ist drin? (MVP-Stand vor Pivot)

### Live & Deployed
- Live auf Vercel ✅
- 94/94 Tests grün ✅
- 9-Schritt-Konfigurator mit ROI-Berechnung
- Admin-CRM mit Kanban-Pipelines (Leads + Projekte)
- Angebots-PDF + 3 Rechnungs-PDFs mit dynamischem Branding
- Rabatt-System mit Codes + Live-Vorschau
- Pipeline-Spalte "Vor Ort" + Site-Visit-Termine
- Lead-Scoring (Heiß/Warm/Kalt — statisch)
- E-Mail-Versand via Resend (`send-offer` Edge Function)
- Multi-Role-System (8 Rollen) + Team-Verwaltung

---

## Was ist neu? (2026-05-31) — Konfigurator-Polish

### Wirtschaftlichkeitsanalyse (Step 6, war Step 7)
- **Batteriekosten proportional**: `500 * kWh + 2.000€` statt flat 6.000€ — passt zu Step-4-Preisen
- **Batterie-Ersatz** ebenfalls skaliert: `500 * kWh + 1.000€` (gibt 6.000€ für 10 kWh = stabil)
- **Gewinn-20J-Kachel** ersetzt Systemleistung — wichtigste Zahl prominent sichtbar (grün/rot)
- **Optimierungshinweis** bei Amortisation > 16 J. — personalisiert (kein E-Auto/WP → konkreter Tipp)
- **analysisKey** war definiert aber nie als `key`-Prop gesetzt — jetzt korrekt angewendet

### Konfigurator-Flow (9 → 8 Schritte)
- **Step 3 + Step 5 gemergt** → "Stromverbrauch & Zukunftspläne" (Verbrauch + E-Auto/WP/Wallbox/Notstrom)
- **PLZ in Step 1** → Analyse ab Step 6 vollständig PLZ-personalisiert (Einstrahlung + Förderungen)
- **PLZ aus Step 8 entfernt** (Kontakt) — nur Ort bleibt dort
- Alle `/9`-Referenzen auf `/8` aktualisiert, Step-7/8/9-Buttons auf Step-6/7/8 gesetzt

---

## Was ist neu? (2026-06-18) — Angebots-Konfigurator

### Angebots-Erstellung komplett überarbeitet
- **Neue Seite** `/lead/:id/offer` (`OfferBuilderPage.tsx`) — Installateur/Inhaber kann Angebotspositionen frei definieren, Preise ändern und Dienstleistungen hinzufügen.
- **Neue Tabellen** `offer_drafts` + `offer_line_items` (Migration `045_offer_drafts.sql`) — echte Persistenz, trennt Kunden-Konfigurator-Ergebnis vom finalen Angebot.
- **Vorausfüllung aus Lead-Daten** — Module, Wechselrichter, Speicher, Montage, Elektro werden automatisch aus `lead.kwp` / `lead.has_battery` generiert.
- **Flexible Preisgestaltung** — Menge, Einheit, Einzelpreis pro Position editierbar; Rabatt-Code oder manueller Rabatt; Live-Zwischensumme/Gesamtsumme.
- **LeadDetailsPage umgebaut** — Boxen „Angebots-Management" und „Rabatt & Preis" ersetzt durch einfachen CTA „Angebot erstellen / bearbeiten".
- **PDF & E-Mail** — `OfferPdfDocument` rendert jetzt detaillierte Angebotspositionen aus dem Draft; E-Mail-Versand komplett aus dem Builder heraus.
- **Status-Workflow** — Entwurf → Gesendet → Angenommen/Abgelehnt, synchronisiert mit `leads.offer_status`.
- **Default-Preise aus Einstellungen** — `AdminSettings` → Tab „Kalkulation" → Standard-Angebotspreise (Module, Wechselrichter, Speicher, Montage, Elektro, Gerüst, Anfahrt, MwSt) werden in `localStorage` gespeichert und beim Erstellen eines Drafts übernommen.

### Qualität
- `npm run build`: 0 TypeScript-Fehler ✅
- `npm test`: 121/121 Tests grün (113 bestehende + 8 neue `tests/lib/offers.test.ts`) ✅

## Was ist neu? (2026-06-18, Teil 2) — Agency Phase B + C1

### B1 — Agency-Tier-Schema
- **Migration `046_agency_tiers.sql`** — `profiles.agency_tier` (`start`/`pro`/`scale`) + `profiles.agency_partner_limit` int, Default `start`/5 für `sales_agency`.
- **TypeScript-Typen** — `Profile` in `src/services/auth.ts` und `AuthUser` in `src/contexts/AuthContext.tsx` um `agencyTier` und `agencyPartnerLimit` erweitert.

### B2 — Partner-Limit-Gating
- **`src/services/agency.ts`** — `countActivePartners()` + Limit-Check in `createPartner()`; eigener Fehler-Code `PARTNER_LIMIT_REACHED`.
- **`src/pages/agency/PartnersPage.tsx`** — Limit-Banner, deaktivierter „Partner hinzufügen"-Button, Upgrade-CTA zu `/pricing`.
- **Migration `047_partner_limit_check.sql`** — Datenbank-Trigger `partner_limit_trigger` + `check_partner_limit()` als harte Absicherung.

### B3 — Agency-Tiers auf PricingPage
- **`src/pages/PricingPage.tsx`** — Neuer Block „Für Vertriebsagenturen" mit Start (5 Partner), Pro (20 Partner), Scale (unbegrenzt + Auto-Routing).

### C1 — PLZ-basiertes Auto-Routing
- **`src/pages/agency/LeadRouterPage.tsx`** — „Auto-Routing"-Button nur für `scale`-Tier; weist alle offenen Leads automatisch an passende Partner zu (PLZ-Match + fairste Verteilung nach letzter Zuweisung).

### Bugfix: AdminDashboard-Drawer
- **`src/pages/AdminDashboard.tsx`** — Der Lead-Drawer zeigte noch das alte „Angebots-Management" + „Rabatt & Preis". Beide Boxen wurden durch eine einzige „Angebot"-Karte ersetzt: lädt den Entwurf, zeigt Status + Summe und leitet mit „Angebot konfigurieren / bearbeiten / ansehen" zu `/lead/:id/offer` weiter (statt direkt PDF zu generieren).

### Qualität
- `npm run build`: 0 TypeScript-Fehler ✅
- `npm test`: 121/121 Tests grün ✅

## Aktueller Blocker (Stand 2026-06-18)

### 🟡 Migrationen 045–047 müssen deployed werden
- **Fehler auf `/lead/:id/offer`:** `Could not find the table 'public.offer_drafts' in the schema cache`
- **Ursache:** Migration 045 (`offer_drafts` + `offer_line_items`) ist lokal vorhanden, aber noch nicht auf Supabase ausgeführt.
- **Fix:** `npx supabase link --project-ref ecsqbsgbfmvqaqnryvwf` → DB-Passwort eingeben → `npx supabase db push`
- **Mit einem Push werden gleich 045, 046 und 047 deployed.**

## Nächster Schritt (Stand 2026-06-18)

### ← NÄCHSTE CODE-SCHRITTE (nach Wahl)
- **Migrationen 045–047 auf Supabase deployen** (aktuell blockierend für Angebots-Konfigurator).
- **E2E-Smoke-Test Agency** — Test-Agentur anlegen → Partner-Limit testen → Lead via `?a=slug` → Auto-Routing/ Manuelles Zuweisen → Portal annehmen → converted → Commission.
- **C2 — Annahme-Frist + Auto-Reassignment** — 24h-Timeout für `pending` Assignments.
- **C3 — Partner-Self-Onboarding** — Einladungs-Link für Partner-Registrierung.
- **C5 — Partner-Scorecard** — Conversion-Rate & Reaktionszeit pro Partner.

### ← NÄCHSTER VERTRIEBS-SCHRITT
- 3 Beta-Tester onboarden + Pricing-Conversation Woche 2
- Scoutly-Kampagne 1: 200 Solo-Solarteure DE, A/B-Hypothese

### Alles Erledigte (Code, 2026-06-09)
1. ~~Google Maps API Key~~ ✅
2. ~~Migrationen 030–041~~ ✅
3. ~~Edge Functions + Resend~~ ✅
4. ~~Digitale Unterschrift~~ ✅
5. ~~Funnel-Tracking + Lead-Gate + Scoutly-Integration~~ ✅
6. ~~Partner-Modul MVP (Rolle, CRUD, Portal, E-Mail)~~ ✅
7. ~~Agency-Modul Blocker A1/A2/A3~~ ✅ — RLS-RPCs, Funnel-Verdrahtung, Commission-Automatik
8. ~~Migrationen 039+040 deployed~~ ✅ — Role-Constraint, agency_slug, RPCs, Leads-RLS
9. ~~notify-partner + notify-agency ACTIVE~~ ✅
10. ~~Test-Account `agentur@test.de`~~ ✅ — Solar Vertrieb GmbH, slug `solar-vertrieb-gmbh`, 2 Partner, 1 Lead
11. ~~Login-Toggle Installateur/Agentur + Test-Agentur-Button~~ ✅
12. ~~`agency_agent`-Rolle + `resolveAgencyId`~~ ✅ — Vertriebler-Hierarchie analog zu Installateur/Inhaber
13. ~~`AgencyCalendarPage`~~ ✅ — Beratung mit Lead + Partner-Meeting, ohne Installateur-Typen
14. ~~`AgencyTeamPage`~~ ✅ — Vertriebler einladen, Zugangsdaten anzeigen
15. ~~`AgencySettingsPage`~~ ✅ — Firmenprofil, Standard-Provision, Benachrichtigungs-Toggle
16. ~~Team-Filter in Dashboard + CommissionsPage~~ ✅ — `assigned_by`-Feld + Dropdown für Agentur-Inhaber
17. ~~Vertriebler-Test-Account `vertriebler@test.de`~~ ✅ — Migration 042
18. ~~Migrationen 042–044 deployed~~ ✅ — agency_agent-Constraint, assigned_by, Agency-Settings-Spalten

### Optional offen
- E2E-Smoke-Test manuell: Login → Router → zuweisen → Portal (Inkognito) → annehmen → converted → Commission
- Conversion-Webhook: `VITE_SCOUTLY_WEBHOOK_URL` in Vercel (Make.com)

### Vertriebs-Prioritäten (kritisch!)
3. **3 Beta-Tester onboarden** mit **Pricing-Conversation in Woche 2** (Conversion-Risiko früh adressieren)
4. **Scoutly-Kampagne 1** für Voltify: 200 Solo-Solarteure DE, klare A/B-Test-Hypothese, Tracking
5. **Erfolgs-KPI**: 50 Discovery-Calls in 60 Tagen, 1 zahlender Kunde vor Tag 60

---

## Wichtige Pfade & Befehle

- Dev-Server: `npm run dev` (Port 5173)
- Build: `npm run build` (0 TypeScript-Fehler)
- Tests: `npm test` (121/121 passing)
- Strategie: `Voltify-DNA.md` → Sektion 9 + 10
- Feature-Roadmap: `tasks-VOLTIFY.md` → "🎯 Wettbewerbsanalyse Reonic"
- Partner-Modul: `src/pages/agency/`, `src/services/agency.ts`, `supabase/migrations/039_partner_module.sql`
- Auth: `src/contexts/AuthContext.tsx`
- Services: `src/services/`
- PDF: `src/components/pdf/`
- Edge Functions: `supabase/functions/`

---

## Datenbank
- **Supabase Projekt-Ref:** `ecsqbsgbfmvqaqnryvwf`
- **Migrationen 018–044:** ✅ Ausgeführt
  - 039: `partners`, `lead_assignments`, `commissions` + RLS
  - 040: SECURITY DEFINER RPCs, `agency_slug`, Sales-Agency Role-Constraint
  - 041: (vorherige Session)
  - 042: `agency_agent` Role-Constraint + Vertriebler-Test-Account
  - 043: `lead_assignments.assigned_by` (uuid, nullable, FK → profiles)
  - 044: `profiles.agency_default_commission_type/value`, `agency_notify_on_response`, `agency_website`
- **Migrationen 045–047:** 🟡 Geschrieben, **noch nicht deployed**
  - 045: `offer_drafts` + `offer_line_items` — Angebots-Konfigurator
  - 046: `profiles.agency_tier` + `profiles.agency_partner_limit` — Agency-Tiers
  - 047: `partner_limit_trigger` — harte Partner-Limit-Absicherung

## Test-Accounts
| E-Mail | Rolle | Passwort | Hinweis |
|--------|-------|----------|---------|
| installateur@test.de | super_employee | Test123456 | |
| inhaber@test.de | owner | Test123456 | |
| agentur@test.de | sales_agency | Test123456 | Solar Vertrieb GmbH, slug `solar-vertrieb-gmbh` |
| vertriebler@test.de | agency_agent | Test123456 | owner_id = agentur@test.de |

---

## Stop-Loss-Datum: 2026-11-25 (Tag 180)

Wenn dann: < 3 zahlende Kunden ODER Beta-zu-Paid < 10 % ODER Scoutly-Response < 1 %
→ Ehrliche Retro + Pivot-Entscheidung (Konfigurator-als-Service, adjacent Vertikale, oder Pause).

---

## Aktive Map
`docs/maps/map-seitenbaum.md`
