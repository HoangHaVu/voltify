# Voltify — Resume Point
<!-- Zuletzt aktualisiert: 2026-06-25 — Installer-Lead-Attribution + White-Label-Embed + einstellbare ROI-Annahmen deployed; erster Test-Kunde (sunwinwin) onboardet -->

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

Session 2026-06-23 (Angebots-Konfigurator + Vorlagen + White-Label + PDF-Vorschau):
  - **Angebots-Konfigurator** ✅ — `OfferBuilderPage.tsx`, `offers.ts`, Drag-Drop Positionen, Rabatt, PDF & E-Mail aus Draft
  - **Default-Preise aus Einstellungen** ✅ — Kalkulations-Settings (Modul/WR/Montage/Elektro) → Draft-Übernahme
  - **ROI-Impact-Panel** ✅ — Live Amortisation / Jahresersparnis / Gewinn 20J. / Autarkie aus aktuellem Draft-Total (Ampel-Farben)
  - **Vorlagen-System** ✅ — Migration `048_offer_templates.sql`, Anschreiben/Zahlungsbedingungen/Folgekosten/Schlusstext + E-Mail-Vorlage, `{{Platzhalter}}`-Interpolation, AdminSettings Vorlagen-Tab
  - **DIN A4 PDF-Vorschau** ✅ — `PDFViewer` mit echtem `OfferPdfDocument` in Einstellungen, Mock-Positionen aus Kalkulations-Settings, Template-Texte sichtbar, automatische Seitenumbrüche
  - **White-Label WL1** ✅ — Migration `049_installer_branding.sql`, `installer_slug` + `branding` JSONB in profiles, `useTenantBranding` Hook, `?i=<slug>` URL-Param, Konfigurator in Installer-Farben + Logo + "Powered by Voltify"
  - **Preise angehoben** ✅ — Installer 179/379/799€, Agency 199/399/699€, White-Label Addon +79€/Mo (Vollpreise)
  - Migrationen 045–049 deployed · 0 TypeScript-Fehler · Commit `dfaf713` · Vercel-Deploy ausgelöst

Session 2026-06-25 (Embed-Go-Live + Installer-Attribution + einstellbare ROI):
  - **Erster Test-Kunde onboardet** ✅ — `ag@sunwinwin.de` (Ali Galioglu, Firma sunwinwin), Rolle `owner`, `installer_slug = sunwinwin`. Login: https://voltify-app.vercel.app/login (PW `Voltify2026!`, sollte geändert werden)
  - **Installer-Lead-Attribution** ✅ — RPC `resolve_installer_slug` (Migration `050`); `Configurator.tsx` übergibt echte `installerId` statt `undefined`. `?i=sunwinwin`-Leads landen automatisch in Alis CRM (E2E gegen DB getestet)
  - **White-Label-Embed (iframe)** ✅ — `useEmbedAutoResize` postet Inhaltshöhe per `postMessage`; `min-h-screen` nur im Vollbild (kein Loop im iframe). Snippet: `docs/embed/voltify-embed.md`
  - **Konfigurator-ROI-Annahmen pro Installateur (Stufe 1+2)** ✅ — Spalte `profiles.calc_assumptions` + RPC `get_installer_calc_assumptions` (Migration `051`). `calculateROI(data, assumptions={})` rückwärtskompatibel: Richtpreis €/kWp, Strompreis-Default, Einspeisevergütung, Wartung einstellbar. Hook `useInstallerCalcAssumptions`, in Step7 + Submit verdrahtet, AdminSettings-Tab „Konfigurator-Annahmen (ROI)"
  - 2 Commits gepusht (`344a3ed`, `d6a2e66`) → `main` → Vercel-Deploy ausgelöst · 121/121 Tests · 0 TS-Fehler
  - **E2E-Browser-Smoke-Test** ✅ — Konfigurator `?i=sunwinwin` komplett durchgeklickt (Playwright), Lead landete mit `installer_id` in Alis CRM (danach aufgeräumt). Branding-Test: grünes Test-Branding gesetzt → Header zeigte „sunwinwin Solar" + grüne Seitenleiste → bestätigt, danach zurückgesetzt.
  - **WL2 — Company-Settings in DB** ✅ — Migration `052` (`profiles.company_settings`), `src/services/companySettings.ts`, `AuthContext` hydratisiert localStorage-Cache bei Login aus DB, `AdminSettings`+`AdminDashboard` lesen/schreiben Settings in DB. Behebt Multi-Device-Überschreib-Bug. Commit `08ad08d`.
  - **Geführter Lösungs-Check (B2B-Funnel)** ✅ — `/check`: Schmerz-Diagnose (Installateur-Pfad) → Hero-Modul (Priorität) + ehrliche Begründung + Zeitersparnis + passende Demo + Calendly-Call. `src/lib/solutionCheck.ts` (Logik), `src/pages/SolutionCheck.tsx` (Funnel), Migration `053` (`solution_check_responses` = Founder-Learning + Pipeline, anon-insert). LandingPage-Hero: Check = primärer CTA, Live-Demo = Fluchtweg. E2E-Browser-Test bestanden (Flow + Auswertung + DB-Persistenz). Commit `bbefb85`. **Strategie-Entscheidung: Voltify = eine Plattform (kein Einzelprodukt-Verkauf); Module = Schmerz-Einstiegsrampen; Agentur-Pfad später.**
  - **DSGVO-Löschung (Art. 17)** ✅ — Migration `054`: `erase_lead(p_lead_id)` RPC (SECURITY DEFINER + Autorisierung). Löscht PII über ALLE Tabellen (appointments, webhook_logs, funnel_events per E-Mail + Lead-Cascade); `commissions` werden anonymisiert (Aufbewahrungspflicht § 147 AO → `lead_id` nullable). `eraseLead`-Service + Bestätigungs-Modal in `LeadDetailsPage`. **Doppelt verifiziert:** SQL-Dry-Run (alle PII=0, Provision erhalten) + echter UI-Auth-Pfad (Login → Löschen → Lead weg). Commit `1fe3ae8`. **OFFEN (kein Code): AVV/Auftragsverarbeitungsvertrag + Datenschutzerklärung für Kunden; Datenexport Art. 20.**
  - ⚠️ **Code/DB-Drift entdeckt:** Migrationen 042–044, 048, 049 sind in der DB aktiv, fehlen aber als Datei im Repo (deshalb war `get_installer_branding` lokal nicht findbar). Sollten als Migrations-Dateien nachgezogen werden, damit ein frisches `db push` reproduzierbar ist.

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

## Nächster Schritt (Stand 2026-06-25)

### ← JETZT DRAN: sunwinwin live bringen
1. **Vercel-Deploy abwarten/prüfen** — Commit `d6a2e66` deployt gerade; danach ist Embed + ROI-Annahmen scharf.
2. **Ali Zugang geben** — Login-Daten weitergeben, Passwort-Wechsel empfehlen.
3. **Branding + ROI-Annahmen mit Ali befüllen** — AdminSettings → Profil & Branding (Logo/Farben) + Tab „Konfigurator-Annahmen (ROI)" (Richtpreis €/kWp nahe seiner realen Kalkulation).
4. **Embed-Snippet übergeben** — `docs/embed/voltify-embed.md` (sunwinwin-Variante), in „Custom HTML"-Block seiner Seite.
5. **Browser-Smoke-Test** — `?i=sunwinwin` live durchklicken → Lead muss in Alis CRM erscheinen (noch ausstehend).

### ← WEITERE CODE-SCHRITTE (nach Wahl)
- **E2E-Smoke-Test Agency** — Lead via `?a=solar-vertrieb-gmbh` → Zuweisen → Portal (Inkognito) → annehmen → converted → Commission prüfen.
- **C2 — Annahme-Frist + Auto-Reassignment** — 24h-Timeout für `pending` Assignments (Cron-Job oder Edge Function).
- **C3 — Partner-Self-Onboarding** — Einladungs-Link für Partner-Registrierung.
- **C5 — Partner-Scorecard** — Conversion-Rate & Reaktionszeit pro Partner.
- **Cron Jobs** — `notify-offer-expiry` + `notify-payment-due` täglich 08:00.
- ~~**WL2** — Company-Settings in DB~~ ✅ erledigt (2026-06-25, Commit `08ad08d`)

### ← NÄCHSTER VERTRIEBS-SCHRITT
- 3 Beta-Tester onboarden → White-Label-Slug vergeben + eigenes Branding testen
- Scoutly-Kampagne 1: 200 Solo-Solarteure DE, A/B-Hypothese mit `?i=<slug>` Tracking

### Alles Erledigte (Code, 2026-06-23)
1. ~~Google Maps API Key~~ ✅
2. ~~Migrationen 030–049~~ ✅
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
17. ~~Angebots-Konfigurator~~ ✅ — `OfferBuilderPage`, `offers.ts`, Drag-Drop, Rabatt, PDF & E-Mail aus Draft
18. ~~Vorlagen-System~~ ✅ — Anschreiben/AGB/E-Mail-Vorlage mit `{{Platzhalter}}`-Interpolation
19. ~~ROI-Impact-Panel im Konfigurator~~ ✅ — Live-Amortisation aus Draft-Total
20. ~~DIN A4 PDF-Vorschau in Einstellungen~~ ✅ — `PDFViewer` mit echtem Dokument + Template-Texten
21. ~~White-Label WL1~~ ✅ — `?i=<slug>`, branding JSONB, `useTenantBranding`, Konfigurator branded
22. ~~Preisanhebung~~ ✅ — Installer 179/379/799€, Agency 199/399/699€
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
- **Migrationen 045–054:** ✅ Ausgeführt (alle live)
  - 045: `offer_drafts` + `offer_line_items` — Angebots-Konfigurator
  - 046: `profiles.agency_tier` + `profiles.agency_partner_limit` — Agency-Tiers
  - 047: `partner_limit_trigger` — harte Partner-Limit-Absicherung
  - 048: `offer_templates` — Vorlagen (nur in DB, Datei fehlt im Repo → Drift)
  - 049: `installer_branding` (`installer_slug` + `branding`, `get_installer_branding`) — nur in DB, Datei fehlt im Repo → Drift
  - 050: `resolve_installer_slug` — `?i=<slug>` → installer_id (Datei im Repo ✅)
  - 051: `installer_calc_assumptions` (`profiles.calc_assumptions` + `get_installer_calc_assumptions`) (Datei im Repo ✅)
  - 052: `company_settings_db` (`profiles.company_settings`) — WL2 (Datei im Repo ✅)
  - 053: `solution_check_responses` (Lösungs-Check-Antworten, anon-insert RLS) (Datei im Repo ✅)
  - 054: `erase_lead` RPC (DSGVO Art. 17) + `commissions.lead_id` nullable (Datei im Repo ✅)
- **⚠️ Drift:** 042–044, 048, 049 sind in der DB aktiv, aber **nicht** als Migrations-Datei im Repo. Bei Gelegenheit nachziehen.

## Test-Accounts
| E-Mail | Rolle | Passwort | Hinweis |
|--------|-------|----------|---------|
| installateur@test.de | super_employee | Test123456 | |
| inhaber@test.de | owner | Test123456 | |
| agentur@test.de | sales_agency | Test123456 | Solar Vertrieb GmbH, slug `solar-vertrieb-gmbh` |
| vertriebler@test.de | agency_agent | Test123456 | owner_id = agentur@test.de |
| ag@sunwinwin.de | owner | Voltify2026! | **ERSTER ECHTER TEST-KUNDE** — Ali Galioglu, Firma sunwinwin, `installer_slug = sunwinwin` |

---

## Stop-Loss-Datum: 2026-11-25 (Tag 180)

Wenn dann: < 3 zahlende Kunden ODER Beta-zu-Paid < 10 % ODER Scoutly-Response < 1 %
→ Ehrliche Retro + Pivot-Entscheidung (Konfigurator-als-Service, adjacent Vertikale, oder Pause).

---

## Aktive Map
`docs/maps/map-seitenbaum.md`
