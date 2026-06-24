# Voltify — Tasks & Roadmap
<!-- Zuletzt aktualisiert: 2026-06-25 — Installer-Lead-Attribution + White-Label-Embed + einstellbare ROI-Annahmen deployed; erster Test-Kunde onboardet -->

---

## 🤝 AGENCY-MODUL — Lukrativ-Machen [AKTIVER PLAN]

> **Zielgruppe:** PV-Vertriebsagenturen (`sales_agency`) — generieren Leads, verteilen an Installateur-Partner, kassieren Provision. Siehe DNA Sektion 10.
> **Geschäftsmodell entschieden (2026-06-08):** Reines **Subscription-Modell**, gestaffelt nach Value-Metric **„Anzahl aktiver Partner"**. KEINE Take-Rate (Grund: „converted" ist ein manueller Partner-Klick → manipulierbar; Take-Rate würde Inkasso/Finanzdienstleister-Nähe erzeugen, die DNA 9.6 ausschließt). Take-Rate frühestens, wenn Conversion fälschungssicher getrackt wird (digitale Unterschrift) → Backlog.

### 📋 Executor-Briefing (Kimi/Sonnet — vor dem Start lesen)
- **Stack:** React 19 + TS + Vite + Tailwind v3 + Supabase. Supabase-Ref: `ecsqbsgbfmvqaqnryvwf`.
- **Invarianten:** `npm test` muss grün bleiben (aktuell 121/121), `npm run build` = 0 TS-Fehler. **Vor jedem Commit beides laufen lassen.**
- **Schlüssel-Dateien:** `src/services/agency.ts` (Service-Layer), `src/pages/agency/*` (4 Pages), `supabase/migrations/039_partner_module.sql`, `supabase/functions/notify-partner|notify-agency`, `src/services/leads.ts` (`submitLead`), `src/lib/funnelTracking.ts` (sessionStorage-Muster).
- **⚠️ RLS-Falle (unbedingt verstehen):** Das Partner-Portal (`/partner/:token`) läuft **anonym** (kein Login) mit dem Anon-Key. Migration 039 hat aber nur Policies `USING (agency_id = auth.uid())`. Für einen anonymen Besucher ist `auth.uid()` = NULL → **alle Portal-Queries scheitern**. Niemals den anonymen Partner direkt auf die Tabellen lassen → immer über `SECURITY DEFINER`-Funktionen mit Token-Validierung (siehe A1).
- **Arbeitsweise:** Neue Migrationen immer fortlaufend nummerieren (aktuell 045–047 geschrieben, noch nicht deployed). Additive Migrationen bevorzugen, falls Schema schon manuell angepasst wurde. Vor Deploy `list_migrations` prüfen.
- **Nach jeder erledigten Task:** `[ ]` → `[x]` in dieser Datei.

---

### PHASE A — 🔴 KRITISCHE BLOCKER (zuerst! ohne diese funktioniert die Zielgruppe gar nicht)

#### A1 — Partner-Portal über `SECURITY DEFINER`-RPCs entsperren ✅ DONE (2026-06-08)
- **Problem:** `PartnerPortalPage.tsx` ruft `fetchPartnerByToken` / `fetchPartnerAssignments` / `updateAssignmentStatus` anonym auf → RLS blockt alles. Portal zeigt nichts, Annehmen/Ablehnen/Konvertieren tot.
- **Datei:** neue Migration `040_partner_portal_rpc.sql` + Refactor in `src/services/agency.ts`.
- **Was:** 3 RPCs anlegen (alle `SECURITY DEFINER`, `SET search_path = public`, Token als Argument, intern Token→Partner auflösen):
  - `get_partner_by_token(p_token uuid)` → gibt nur unkritische Partner-Felder zurück (id, company_name, commission_type, commission_value), **nicht** den access_token anderer.
  - `get_partner_assignments(p_token uuid)` → Assignments des Partners inkl. Lead-Join (Lead-PII nur für die ihm zugewiesenen Leads).
  - `partner_update_assignment(p_token uuid, p_assignment_id uuid, p_status text, p_notes text)` → validiert intern, dass das Assignment wirklich zu diesem Token-Partner gehört, und erlaubt **nur** Übergänge `pending→accepted|rejected` und `accepted→converted`. Setzt `responded_at`/`offer_accepted_at` serverseitig.
  - Skizze:
    ```sql
    create or replace function get_partner_assignments(p_token uuid)
    returns setof jsonb language plpgsql security definer set search_path = public as $$
    declare v_partner_id uuid;
    begin
      select id into v_partner_id from partners where access_token = p_token and is_active;
      if v_partner_id is null then raise exception 'invalid token'; end if;
      return query select to_jsonb(la) || jsonb_build_object('lead', to_jsonb(l))
        from lead_assignments la join leads l on l.id = la.lead_id
        where la.partner_id = v_partner_id order by la.assigned_at desc;
    end $$;
    grant execute on function get_partner_assignments(uuid) to anon;
    ```
- **Service-Refactor:** Die drei Funktionen in `agency.ts` auf `supabase.rpc(...)` umstellen (nur die anonym aufgerufenen — die Agency-seitigen Funktionen bleiben wie sie sind, da dort `auth.uid()` existiert).
- **Sicherheit:** access_token bleibt `gen_random_uuid()` (ok). Optional härten: Rate-Limit später (Backlog). Token NICHT loggen.
- **✅ Akzeptanz:** Im Inkognito-Fenster `/partner/<token>` öffnen → Leads sichtbar, Annehmen/Ablehnen/„Auftrag erteilt" funktioniert und persistiert. Ungültiger Token → saubere Fehlermeldung.

#### A2 — `agency_id` durch den Funnel verdrahten (Konfigurator → Lead → Router) ✅ DONE (2026-06-08)
- **Problem:** `leads.agency_id` existiert im Schema, wird aber nirgends gesetzt. `LeadRouterPage` hat `setLeads([])` mit TODO → Agentur hat keine Leads zum Verteilen. Kern-Wertversprechen nicht angeschlossen.
- **Mechanismus (Empfehlung):** Agentur identifiziert sich per **Slug** in der Konfigurator-URL: `…/konfigurator?a=<agency_slug>`. Spiegelt das bestehende `installer_id`-Muster in `submitLead`.
- **Schritte:**
  1. **Migration 040 (oder 041):** Spalte `profiles.agency_slug text UNIQUE` (nur für `sales_agency`-Accounts gesetzt). Optional Helfer-View/Funktion `resolve_agency_slug(slug)` → user_id.
  2. **`src/lib/funnelTracking.ts`:** Param `a` (agency_slug) in `cacheFunnelSourceFromUrl()` mit aufnehmen und in sessionStorage cachen (gleiches Muster wie `sl_email`/utm — überlebt Navigation Landing→/konfigurator).
  3. **`src/services/leads.ts` `submitLead`:** optionalen Parameter `agencyId?: string` ergänzen und analog zu `installerId` bedingt in den Insert (`...(agencyId ? { agency_id: agencyId } : {})`). Slug→agencyId-Auflösung vorher (RPC oder Query auf `agency_slug`).
  4. **`src/pages/Configurator.tsx`:** beim Submit den gecachten agency_slug auflösen und an `submitLead` geben. Quelle ggf. `source: 'agency'` setzen.
  5. **`src/pages/agency/LeadRouterPage.tsx`:** `setLeads([])`-TODO ersetzen durch `fetchAgencyLeads(user.id)`, gefiltert auf Leads ohne aktive Zuweisung (`pending`/`accepted`).
  6. **`LEAD_SELECT` in `data.ts`:** `agency_id` ergänzen (Konsistenz).
- **✅ Akzeptanz:** Konfigurator-Lead über `?a=<slug>` abschließen → Lead erscheint in `LeadRouterPage` der zugehörigen Agentur und kann einem Partner zugewiesen werden.

#### A3 — Commission-Automatik bei `converted` ✅ DONE (2026-06-08, im partner_update_assignment RPC)
- **Problem:** `updateAssignmentStatus('converted')` erzeugt **keine** Commission. `createCommission` wird nie aufgerufen → `CommissionsPage` bleibt für immer leer. Percentage-Provision wird bei Zuweisung als `0` gesetzt, nie nachberechnet.
- **Datei:** `src/services/agency.ts` → `updateAssignmentStatus` (oder besser serverseitig im A1-RPC `partner_update_assignment`, damit es nicht umgehbar ist).
- **Was:** Beim Übergang auf `converted`:
  - Commission anlegen (idempotent — nicht doppelt, falls erneut geklickt: vorher prüfen ob für dieses `lead_assignment_id` schon eine existiert).
  - Betrag: `commission_type === 'fixed'` → `commission_value`; `'percentage'` → `lead.investment * commission_value / 100`.
  - `lead_assignments.commission_amount` mit dem finalen Betrag updaten.
- **Empfehlung:** In den `partner_update_assignment`-RPC (A1) integrieren = serverseitig + transaktional + nicht manipulierbar. Dann ist A3 quasi „kostenlos" mit A1 erledigt.
- **✅ Akzeptanz:** Partner klickt „Auftrag erteilt" → Eintrag erscheint in `CommissionsPage` mit korrektem Betrag (fixed UND percentage getestet), Summen-Kacheln stimmen.

---

### PHASE B — 🟠 MONETARISIERUNG (Agency-Subscription, minimal-invasiv)

> Ziel: Agentur zahlt fixen Monatspreis, gestaffelt nach aktiver Partner-Anzahl. Volles Stripe-Schema (DNA Sektion 8) bleibt Phase 3 — hier nur das Nötigste fürs Gating.

#### B1 — Minimal-Schema für Agency-Tier ✅ DONE (2026-06-18)
- **Migration:** `profiles.agency_tier text CHECK (agency_tier IN ('start','pro','scale'))` + `profiles.agency_partner_limit int`. Default für neue `sales_agency`: `start` / Limit 5.
- **✅ Akzeptanz:** Tier + Limit pro Agentur in DB hinterlegbar.

#### B2 — Feature-Gating: Partner-Limit ✅ DONE (2026-06-18)
- **Datei:** `src/services/agency.ts` `createPartner` + UI in `PartnersPage.tsx`.
- **Was:** Vor Insert `COUNT(*) FROM partners WHERE agency_id = … AND is_active` gegen `agency_partner_limit` prüfen. Bei Erreichen: freundlicher Upgrade-Hinweis statt Insert.
- **✅ Akzeptanz:** Agentur im `start`-Tier kann keinen 6. aktiven Partner anlegen, sieht Upgrade-CTA.

#### B3 — PricingPage: Agency-Sektion ✅ DONE (2026-06-18)
- **Datei:** `src/pages/PricingPage.tsx`.
- **Was:** Eigener Block „Für Vertriebsagenturen" mit 3 Tiers (Richtwerte, final mit Hoang abstimmen):
  | Tier | Richtpreis | Partner | Kern |
  |------|-----------|---------|------|
  | Agency Start | ~199 €/Mo | bis 5 | Routing manuell, Portale, Provisions-Tracking |
  | Agency Pro | ~399 €/Mo | bis 25 | + Reporting/Scorecard |
  | Agency Scale | ~799 €/Mo | unbegrenzt | + **PLZ-Auto-Routing** (C1) als Lockmittel |
- **✅ Akzeptanz:** Agency-Tiers auf der Pricing-Seite sichtbar, Auto-Routing klar als Scale-Feature markiert.

#### B4 — Stripe-Anbindung Agency [später, mit Phase 3]
- **Hinweis:** Erst bauen, wenn erster zahlender Agentur-Pilot da ist. Hängt am noch nicht existierenden Subscription-Schema. **Nicht** Blocker für Pilot — Pilot kann manuell/Rechnung laufen.

---

### PHASE C — 🟢 SKALIERUNGS-FEATURES (machen die Zielgruppe lukrativ)

> Reihenfolge = Impact × Aufwand. C1 zuerst (höchster Hebel + Scale-Tier-Lockmittel).

#### C1 — PLZ-basiertes Auto-Routing  ⭐ höchster Hebel ✅ DONE (2026-06-18)
- **Warum:** `partners.zip_regions` ist im Schema da, ungenutzt. Unterschied zwischen „5 Leads manuell" und „500 Leads/Monat automatisch". = Scale-Tier-Feature (B3).
- **Was:** Bei neuem Agency-Lead passenden Partner per PLZ-Match vorschlagen (`zip_regions @> lead.zip-Präfix`), bei mehreren Round-Robin (fairste Verteilung). UI in `LeadRouterPage`: „Auto-Zuweisen"-Button + Vorschlag-Badge. Optional vollautomatisch bei Lead-Eingang (Edge Function / DB-Trigger).
- **✅ Akzeptanz:** Lead mit PLZ X wird automatisch dem Partner mit passender Region vorgeschlagen/zugewiesen; bei mehreren rotiert die Zuweisung.

#### C2 — Annahme-Frist + Auto-Reassignment
- **Warum:** Status `expired` existiert, wird nie gesetzt → Leads bleiben liegen. Garantie „kein Lead verfällt" ist starkes Verkaufsargument.
- **Was:** Cron (passt zu den geplanten `notify-*`-Crons): Assignments `pending` älter als z. B. 24 h → `expired` + automatisch an nächsten Partner (C1-Logik) reassignen + Agentur benachrichtigen.
- **✅ Akzeptanz:** Unbeantworteter Lead nach Frist wird automatisch umverteilt, Agentur sieht das.

#### C3 — Partner-Self-Onboarding (Einladungs-Link)
- **Warum:** Aktuell nur manuelles CRUD. Für Agenturen mit 50+ Partnern unbrauchbar.
- **Was:** Agentur generiert Einladungs-Link → Partner trägt Stammdaten + `zip_regions` selbst ein → landet als `is_active=false` zur Freigabe. (RPC `SECURITY DEFINER`, anon, analog A1.)
- **✅ Akzeptanz:** Partner registriert sich selbst über Link, Agentur gibt frei.

#### C4 — Lead-Exklusivität vs. Parallelverteilung (Geschäftsregel)
- **Warum:** `UNIQUE(lead_id, partner_id)` erlaubt aktuell ungeplant denselben Lead an mehrere Partner. Exklusiv vs. „an N Partner parallel, first-come" ist ein monetarisierbares Feature (Exklusiv-Leads teurer).
- **Was:** Einstellung pro Agentur/Lead: `exclusive` (1 Partner) oder `broadcast` (an N, erster der annimmt gewinnt, Rest auto-expired). Datenmodell + Router-Logik + Portal-Verhalten.
- **✅ Akzeptanz:** Agentur kann Lead exklusiv oder als Broadcast verteilen; bei Broadcast gewinnt der erste Annehmer, Rest wird `expired`.

#### C5 — Agentur-Reporting / Partner-Scorecard
- **Warum:** `CommissionsPage` zeigt nur Summen. Agentur will Conversion-Rate **pro Partner**, Reaktionszeit, Pipeline-Wert. Rechtfertigt Pro-Tier-Preis, erhöht Stickiness.
- **Was:** Neues Dashboard/Tab: pro Partner Annahmequote, Conversion-Rate, Ø Reaktionszeit, offene vs. konvertierte Provision. Aggregat-Query oder DB-View.
- **✅ Akzeptanz:** Agentur sieht pro Partner aussagekräftige KPIs.

---

### PHASE D — DEPLOY & VERIFY (nach A, spätestens vor Pilot)

- [x] **Migrationen deployen** — 039 ✅ + 040 ✅ (2026-06-08)
- [x] **`sales_agency`-Rolle absichern** — CHECK-Constraint in Migration 040 korrigiert ✅
- [x] **Edge Functions deployen** — `notify-partner` ✅ + `notify-agency` ✅ ACTIVE (2026-06-08)
- [x] **`npm test` + `npm run build`** — 121/121 ✅, 0 TS-Fehler ✅
- [x] **Migrationen 045–047 deployen** — `offer_drafts` (Angebots-Konfigurator), `agency_tier` + `agency_partner_limit`, Partner-Limit-Trigger. ✅ DONE (2026-06-19)
- [ ] **E2E-Smoke-Test** — Agency-Account anlegen → `agency_slug` setzen → Partner anlegen → Konfigurator-Lead via `?a=slug` → Zuweisen → Portal annehmen → „Auftrag erteilt" → Commission erscheint.

---

### ✅ Erledigt (Session 2026-06-09 — Agentur-Rollensystem + Kalender + Einstellungen + Team-Filter)
- [x] **`agency_agent`-Rolle (Vertriebler)** — `UserRole` erweitert, `EMPLOYEE_ROLES`, `isSalesAgency()`, `isAgencyAdmin()`, `isAgencyAgent()`, `resolveAgencyId()`
- [x] **`AgencyCalendarPage`** — Separater Kalender für Agenturen: 2 Typen (Beratung mit Lead, Partner-Meeting), ohne Installateur-Typen
- [x] **`AgencyTeamPage`** — Vertriebler einladen (Supabase Auth + Profil-Update), Zugangsdaten mit Blur-Passwort + Copy-Buttons
- [x] **`AgencySettingsPage`** — Firmenprofil, Standard-Provision (Festbetrag/Prozentsatz), Benachrichtigungs-Toggle, Team-Shortcut
- [x] **Team-Filter im Dashboard** — Agentur-Inhaber kann in "Meine Leads" nach Vertriebler filtern (`assigned_by`-Feld)
- [x] **Team-Filter in CommissionsPage** — Provisionen nach Vertriebler filtern
- [x] **Vertriebler-Test-Account** — `vertriebler@test.de` / `Test123456`, `agency_agent`-Rolle, `owner_id = agentur@test.de`
- [x] **`partnermeeting`-Typ** — `Appointment['type']`, `TYPE_CONFIG` in CalendarPage, `TYPE_MAP` in CalendarGrid
- [x] **`assigned_by`-Feld** — `lead_assignments.assigned_by` (uuid, nullable, FK → profiles) für Audit-Trail
- [x] **Migrationen 042–044** — `agency_agent`-Role-Constraint, Vertriebler-Account, `assigned_by`-Spalte, Agency-Settings-Spalten
- [x] **Sidebar + Routing** — `AGENCY_AGENT_NAV`, `getNavForRole('agency_agent')`, `AGENCY_ROLES`-Schutz in `App.tsx`

### ✅ Erledigt (Session 2026-06-08 — vollständig deployed)
- [x] **Test-Agentur-Account** — `agentur@test.de` / `Test123456`, Solar Vertrieb GmbH, slug `solar-vertrieb-gmbh`, 2 Partner, 1 Test-Lead in Supabase
- [x] **Login-Toggle Installateur/Agentur** — Segment-Control + „Test Agentur"-Schnell-Login-Button mit Badge
- [x] **Login-Tests repariert** — 113/113 grün nach Toggle-Einbau

### ✅ Erledigt (Vorarbeit, 2026-06-08)
- [x] Migration 039 deployed (`partners`, `lead_assignments`, `commissions` + RLS) ✅
- [x] Service-Layer `src/services/agency.ts` (CRUD, Assignments, Commissions)
- [x] 4 Agency-Pages (`PartnersPage`, `LeadRouterPage`, `CommissionsPage`, `PartnerPortalPage`)
- [x] Rolle `sales_agency` in `auth.ts` + `AuthContext` + `App.tsx`-Routen + `AdminSidebar`
- [x] Edge Functions `notify-partner` + `notify-agency` (geschrieben, nicht deployed)

> **Abhängigkeits-Reihenfolge:** A1+A2+A3 (Blocker, parallelisierbar) → D (deploy/verify) → B (Monetarisierung) → C1 → C2/C3/C4/C5 (in beliebiger Reihenfolge nach Bedarf).

---

## 🔴 MVP — Muss vor Go-Live

> **MVP = Installateur kann Leads erfassen, Angebote erstellen, Rechnungen schreiben.**
> Alles andere (Digitale Unterschrift, Kundenportal, Stripe, WhatsApp, Monitoring…) ist Phase 2.

### Deployment & Infrastruktur
- [x] **Vercel-Projekt** — https://voltify-app.vercel.app
- [x] **SPA-Redirect-Regeln** — `vercel.json`
- [x] **Environment Variables** — Supabase URL + Anon Key in Vercel
- [x] **Google Maps API Key** — `VITE_GOOGLE_MAPS_API_KEY` in Vercel + `.env.local`, Quota 200/Tag, Budget-Alert €20
- [x] **Edge Functions deployen** — `send-offer` (v1) + `notify-signature` (v1) + alle anderen ACTIVE
- [ ] **Cron Jobs einrichten** — `notify-offer-expiry` + `notify-payment-due` täglich 08:00
- [x] **Resend Domain-Verify** — `noreply@vu-studio.de` aktiv (geteilt mit Solar Konfigurator, selbes Supabase-Projekt)
- [x] **Migrationen pushen** — 030–035 (Signatures, Variants, Sources, Activities, Address Cache, Module Layout)
- [x] **Migration 036** — `funnel_events` Tabelle (Tracking) mit anon-Insert-Policy
- [x] **Migration 037** — `source_id`, `utm_source`, `utm_campaign` Spalten in `funnel_events`
- [x] **Migration 038** — `funnel_events_public` View (anon lesbar, E-Mail ausgeblendet)
- [x] **Migration 039** — `partners`, `lead_assignments`, `commissions` + `sales_agency` Rolle ✅ deployed
- [x] **Edge Functions deployen** — `notify-partner` + `notify-agency` ✅ ACTIVE

### Core Features (bereits implementiert)
- [x] Auth-System — Supabase Auth, 8 Rollen, AuthContext + ProtectedRoute
- [x] Configurator — 9-Schritt Wizard mit ROI-Berechnung (Step 3=Stromverbrauch, Step 4=Ausstattung & Pläne, PLZ in Step 1)
- [x] Admin CRM — Kanban-Pipelines, Lead-/Projekt-Details, Kalender, Nachrichten
- [x] Landingpage + Beta-Programm — `/beta` mit Formular
- [x] Angebots-PDF — Dynamisches Branding, 0% MwSt, Angebotsnummer
- [x] Rechnungs-PDFs — 3 Zahlungsstufen (30/60/10%), Paid-Stamp
- [x] E-Mail-Versand — `send-offer` Edge Function mit PDF-Anhang via Resend
- [x] Multi-Role-System — Owner/Installer/Sales, Data Scoping, RLS
- [x] Firmen-Einstellungen — Logo, Farben, IBAN, Zahlungsziel
- [x] Rechtliche Seiten — Datenschutz, Impressum, AGB

### Wirtschaftlichkeit & Transparenz
- [x] **calculateROI erweitert** — PLZ-basierte Einstrahlung, Eigenverbrauchsrate nach Gebäudetyp
- [x] **Lebenszykluskosten** — Wechselrichter-Austausch, Batterie, Wartung
- [x] **Amortisationsgraph** — 20-Jahres-Verlauf mit Folgekosten, Zero-Line, neg. Balken
- [x] **Verbraucherzentrale-Links** — Step 5 (Förderungen) + Step 6 (Mini-FAQ)
- [x] **Step-6-Toggle** — Vergleich ROI mit/ohne Speicher
- [x] **Batteriekosten proportional** — 500€/kWh + 2.000€ Basis (war flat 6.000€)
- [x] **Gewinn-20J-Kachel** — ersetzt Systemleistungs-Kachel in Analyse-Step
- [x] **Optimierungshinweis** — erscheint bei Amortisation > 16 J., personalisiert nach E-Auto/WP

### Dashboard & Reports
- [x] **Umsatz-Reports** — Pipeline-Wert, Conversion-Rate, monatliche Leads, Top Deals
- [x] **Team-Performance** — Leads/Conversion/Umsatz pro Mitarbeiter
- [x] **Lead-Quellen** — Filter + Balkendiagramm im Reports-Tab
- [x] **Lead-Score Erklärung** — 6 Faktoren als Mini-Balken mit Punkte-Aufschlüsselung
- [x] **Realistische Amortisation** — Badge im Lead-Drawer

### Solar-Planer (von Claude erledigt)
- [x] **Module-Layout-Lib** — `src/lib/moduleLayout.ts` + 11 Tests
- [x] **Geocoding-Service** — `src/services/geocoding.ts` + `034_address_cache.sql`
- [x] **InstallerPlanner** — Vollbild-Modal mit Satellitenbild + Modul-Overlay
- [x] **SolarPlanningSection** — Lead- + Projekt-Detail Integration
- [x] **PDF-Embed** — Optionale Planungs-PNG-Seite im Angebot

---

## 🟠 MVP-Polish — Vor Go-Live, aber nicht blocker

> Kleinere UX-Verbesserungen, die den ersten Eindruck verbessern.

- [x] **Lead manuell hinzufügen** — Installateur kann Telefon-Leads direkt im Dashboard erfassen
- [x] **Kalender-Sync** — `.ics` Export für Google Calendar / Outlook
- [x] **Activity-Log pro Lead** — Automatisch bei Status/Angebots-Änderungen, manuelle Notizen möglich
- [ ] **Mobile-Optimierung Dashboard** — Installateure sind unterwegs. Aktuell sehr Desktop-lastig
- [ ] **DNS + Custom Domain** — Optional: voltify.de verbinden

---

## 🟢 Funnel & Wachstum — Erledigt (2026-06-05)

### Demo-as-Trojan-Horse Funnel
- [x] **betaConfig.ts** — Single Source of Truth (5 Plätze / 3 Mo / 30% / Calendly)
- [x] **Step9 demoMode-Pivot** — Beta-CTA statt Endkunden-Sackgasse
- [x] **DemoBanner** — Konfigurator signalisiert Installateur die Kundensicht
- [x] **FloatingBetaCTA** — /demo Seite, erscheint nach 600px Scroll
- [x] **ExitIntentModal** — Landing, 1×/Session bei Maus-Verlassen oben
- [x] **Demo-Modus via ?demo=1** — URL-Param trennt Demo (kein Gate, Banner) von Live (Gate, kein Banner)

### Lead-Capture & Tracking
- [x] **Step0_EmailGate** — E-Mail + Vorname vor dem Konfigurator (nur Live-Modus, Skip-Option)
- [x] **funnelTracking.ts** — fire-and-forget Events in `funnel_events` (started / step_reached / email_captured / skipped_gate / completed)
- [x] **UTM-Persistenz** — `cacheFunnelSourceFromUrl()` auf Landingpage; Params überleben Navigation zu /konfigurator
- [x] **Scoutly-Attribution** — `sl_email` + `utm_source` + `utm_campaign` in allen Events; Conversion-Webhook vorbereitet (`VITE_SCOUTLY_WEBHOOK_URL`)
- [ ] **Conversion-Webhook aktivieren** — `VITE_SCOUTLY_WEBHOOK_URL` in Vercel eintragen sobald Make.com/n8n-Endpoint existiert
- [ ] **Cron Jobs einrichten** — `notify-offer-expiry` + `notify-payment-due` täglich 08:00

### Nützliche SQL-Abfragen (Supabase Dashboard)
```sql
-- Abbruchrate pro Step (nur echte Leads, kein Demo)
SELECT step, COUNT(DISTINCT session_id) FROM funnel_events
WHERE event='step_reached' AND demo_mode=false GROUP BY step ORDER BY step;

-- Nicht abgeschlossene Leads mit E-Mail
SELECT DISTINCT source_id AS email, MAX(step) AS letzter_step FROM funnel_events
WHERE utm_source='scoutly' AND demo_mode=false
AND session_id NOT IN (SELECT session_id FROM funnel_events WHERE event='completed')
GROUP BY source_id;
```

---

## 🟡 Phase 2 — Nach erstem Beta-Test

> Erst relevant, wenn echte Installateure das Tool nutzen und Feedback geben.

### Angebots-Varianten (A/B/C) + Angebots-Konfigurator
- [x] **Schema + Auto-Generator** — Migration `032_offer_variants.sql`, `generateStorageVariants()`
- [x] **UI: Toggle + Karten** — Lead-Drawer mit 3 Speicher-Optionen
- [x] **PDF-Vergleichstabelle** — Seite 2 im Angebot
- [x] **Partner-Modul MVP** — Rolle `sales_agency`, Partner-CRUD, Lead-Routing, Commission-Tracking, Partner-Portal (Magic-Link), E-Mail-Trigger
- [x] **AdminDashboard für sales_agency** — Tabs Partner/Lead-Router/Provisionen via Sidebar ✅ (Phase A erledigt)
- [x] **Leads mit agency_id verknüpfen** — Konfigurator → `?a=slug` → `agency_id` im Lead-Insert ✅ (Phase A2 erledigt)
- [x] **Angebots-Konfigurator** — Migration `045_offer_drafts.sql`, `OfferBuilderPage.tsx`, freie Positionen/Preise, Rabatt, PDF & E-Mail aus Draft
- [x] **Default-Preise aus Einstellungen** — AdminSettings speichert Standard-Angebotspreise + MwSt in `localStorage`, Draft übernimmt sie
- [x] **Vorlagen-System** — Migration `048_offer_templates.sql`, Anschreiben/AGB/E-Mail-Vorlage in DB, Interpolation mit `{{Platzhalter}}`, AdminSettings Vorlagen-Tab ✅ (2026-06-19)
- [x] **ROI-Impact im Angebots-Konfigurator** — Live Amortisation/Ersparnis/Gewinn 20J. aus aktuellem Draft-Total, Ampel-Farben ✅ (2026-06-19)
- [x] **DIN A4 Vorschau in Einstellungen** — `PDFViewer` mit echtem `OfferPdfDocument`, Mock-Positionen aus Kalkulations-Einstellungen, inkl. Vorlagen-Texte ✅ (2026-06-23)
- [x] **White-Label WL1** — Migration `049_installer_branding.sql`, `installer_slug` + `branding` JSONB in profiles, `useTenantBranding` Hook, `?i=<slug>` URL-Param, Konfigurator zeigt Installer-Branding ✅ (2026-06-23)
- [x] **Preisanpassung** — Vollpreise angehoben: Starter 179€, Pro 379€, Enterprise 799€, Agency 199/399/699€ ✅ (2026-06-23)
- [x] **Installer-Lead-Attribution (WL1b)** — RPC `resolve_installer_slug` (Migration `050`), Configurator übergibt echte `installerId` statt `undefined`; `?i=<slug>`-Leads landen automatisch im CRM des Installateurs. E2E gegen DB getestet ✅ (2026-06-25)
- [x] **White-Label-Embed (iframe + Auto-Resize)** — `useEmbedAutoResize` (postMessage), `min-h-screen` nur im Vollbild, Copy-&-Paste-Snippet `docs/embed/voltify-embed.md` ✅ (2026-06-25)
- [x] **Konfigurator-ROI-Annahmen pro Installateur (Stufe 1+2)** — Spalte `profiles.calc_assumptions` + RPC `get_installer_calc_assumptions` (Migration `051`); `calculateROI` nimmt optionale Annahmen (Richtpreis €/kWp, Strompreis-Default, Einspeisevergütung, Wartung); `useInstallerCalcAssumptions` lädt sie im Funnel; AdminSettings-Tab „Konfigurator-Annahmen (ROI)" ✅ (2026-06-25)
- [x] **Erster Test-Kunde onboardet** — `ag@sunwinwin.de` (Ali Galioglu, Firma sunwinwin), Rolle `owner`, `installer_slug = sunwinwin` ✅ (2026-06-25)
- [ ] **ROI-Annahmen Stufe 3 (optional)** — Annahmen pro Lead mitspeichern, damit `LeadDetailsPage`-Neuberechnung exakt zur gespeicherten ROI passt
- [ ] **Angebots-E-Mail mit Varianten** — Kunde wählt im E-Mail-Link → Tracking

### Digitale Unterschrift
> **Nicht MVP** — Kunde druckt PDF, unterschreibt, scannt ein. Das reicht für 95% der Fälle.
- [ ] ~~**Tabelle `offer_signatures`**~~ → Phase 2 (wenn Kunden digitale Unterschrift wünschen)
- [ ] ~~**Canvas-Signatur + Public Route**~~ → Phase 2
- [ ] ~~**E-Mail-Trigger nach Signing**~~ → Phase 2

### Kundenportal (Magic-Link)
> **Nicht MVP** — Kunde bekommt alles per E-Mail. Portal = Nice-to-Have für Phase 2.
- [ ] ~~**Token-Generator + Public Routes**~~ → Phase 2
- [ ] ~~**Status-Seite + Angebots-Download**~~ → Phase 2
- [ ] ~~**Rechnungen einsehen**~~ → Phase 2

---

## 🔵 White-Label — Hochpreissegment (Installateure + Stadtwerke)

> **Warum:** White-Label ist der stärkste Grund für Installateure NICHT zu kündigen — das Tool trägt ihren Namen, nicht "Voltify". Für Stadtwerke ist es Kaufbedingung.
> **Geschäftsmodell:** White-Label = eigenes Tier (+X €/Mo auf Basis-Abo). Setup-Fee für Custom-Domain.
> **Priorität:** WL1 zuerst (Branding-Cleanup) — das ist fast kostenlos und entfernt sofort die Hürde. WL2–WL4 sind schrittweise.

#### WL1 — Branding-Cleanup (kein "Voltify" für Endkunden sichtbar)
- **Was:** Alle public-facing Seiten (`/konfigurator`, `/angebot/:token`, `/partner/:token`) zeigen ausschließlich das Branding des Installateuers/der Agentur. "Voltify" verschwindet für Endkunden komplett.
- **Konkret:**
  - Konfigurator-Header: Installateur-Logo + Firmenname aus `profiles` statt "Voltify Solar"
  - `<title>` + Favicon per Tenant dynamisch setzen
  - PDF + E-Mails: bereits fertig (nutzen `company.firmenname`)
  - Footer-Zeile „Powered by Voltify" optional ein/ausblendbar (Toggle in Einstellungen)
- **Aufwand:** Klein — hauptsächlich Props durchreichen
- **✅ Akzeptanz:** Endkunde sieht nirgendwo "Voltify" — nur den Firmennamen des Installateuers.

#### WL2 — Multi-Tenant Settings in DB (statt localStorage)
- **Was:** `localStorage` funktioniert nur auf einem Browser. Team-Mitglieder und Mobile haben andere Daten. Settings → in `profiles` (bereits für `offer_text_template` / `email_template` begonnen).
- **Konkret:**
  - `profiles`-Spalten für alle Settings: `company_settings jsonb` (logo, Farben, IBAN, Preise, etc.)
  - `loadCompanySettings()` in OfferBuilderPage + PDF: statt localStorage → DB-Query
  - Migration: `052_company_settings_db.sql` (⚠️ 050/051 sind seit 2026-06-25 belegt: resolve_installer_slug + installer_calc_assumptions)
  - **Hinweis:** `calc_assumptions` liegt bereits in der DB — WL2 sollte die übrigen `localStorage`-Settings (Logo, Farben, IBAN, Angebotspreise) demselben Muster folgend in `profiles` migrieren.
- **Aufwand:** Mittel
- **✅ Akzeptanz:** Vertriebler auf mobilem Gerät sieht dieselben Firmenfarben wie Inhaber am Desktop.

#### WL3 — Custom Domain / Subdomain für Konfigurator
- **Was:** Installateur bekommt `solar.firma.de` statt `voltify-app.vercel.app/konfigurator`.
- **Konkret:**
  - Vercel: Custom Domains pro Deployment möglich (über Vercel MCP/API)
  - Tenant-Auflösung: `Host`-Header → `agency_slug` → Profile laden
  - DNS-Anleitung für Kunden + Setup-Flow in Einstellungen
- **Aufwand:** Groß (Infra)
- **Hinweis:** Für Stadtwerke Kaufbedingung. Für Installateure Nice-to-Have.
- **✅ Akzeptanz:** `solar.muster-gmbh.de` öffnet Konfigurator mit Muster GmbH-Branding.

#### WL4 — Branded E-Mail-Domain
- **Was:** E-Mails kommen von `angebot@firma.de` statt `noreply@vu-studio.de`.
- **Konkret:**
  - Resend: Custom-Domain pro Installateur (DNS-Verify durch Kunden)
  - `profiles.resend_domain` + `profiles.resend_api_key` (verschlüsselt speichern)
  - `send-offer` Edge Function: dynamisch von Tenant-Domain senden
- **Aufwand:** Mittel
- **✅ Akzeptanz:** Kunde erhält E-Mail von `angebot@muster-solar.de`, Absender = Firma.

---

## 🟢 Phase 3 — Monetarisierung & Scale

> Erst relevant, wenn das Produkt marktreif ist und Kunden zahlen sollen.

### SaaS-Subscription
- [ ] **Stripe-Integration** — Checkout für Setup-Fee + erstes Abo
- [ ] **Stripe-Webhook-Handler** — subscription.created, invoice.paid, subscription.cancelled
- [ ] **Feature-Gating** — `<FeatureGate>` Komponente für Tier-Limits
- [ ] **Max-Leads-Prüfung** — Starter = 30/Monat, Business = 100/Monat
- [ ] **Abo-Verwaltung** — Upgrade/Downgrade zwischen Tiers
- [ ] **Jahresabo-Rabatt (-15%)** — Toggle Monatlich/Jährlich

### PWA für Monteure
- [ ] **vite-plugin-pwa** — Manifest + Service Worker
- [ ] **Kamera-Upload** — `<input capture="environment">` für Dachfotos
- [ ] **Offline-Indicator** — Banner wenn keine Verbindung
- [ ] **Push-Notifications** — Neuer Lead, Termin-Reminder

### Erweiterte Solar-Planer-Features
- [ ] **Dach-Outline-Tool** — Polygon-Zeichner im InstallerPlanner
- [ ] **Modul Drag-&-Drop** — Interaktiver Editor
- [ ] **Wechselrichter-String-Zuordnung** — String A/B/C
- [ ] **Photo-Upload statt Satellit** — Drag-&-Drop + Bildkalibrierung

---

## ⚪ Backlog / Irgendwann mal

> Selektiv umsetzen — nur wenn Kunden danach fragen oder Wettbewerbsdruck besteht.

- [ ] **WhatsApp/Twilio** — Status-Updates an Kunden
- [ ] **Förder-DB** — Tagesaktuelle Sätze statt statischer Daten
- [ ] **Netzbetreiber-Voranmeldung** — Auto-ausgefüllte PDFs pro Operator
- [ ] **Echtzeit-Monitoring** — SMA, Fronius, Huawei APIs
- [ ] **REST API / Zapier** — Für Enterprise-Kunden
- [ ] **Kalender-Sync** — Google Calendar / Outlook
- [ ] **Trainings-Daten sammeln** — `lead_outcomes` für ML-basiertes Lead-Scoring

---

## Wichtige Hinweise

- **Datenbank:** `ecsqbsgbfmvqaqnryvwf` (Supabase)
- **Build:** 0 TypeScript-Fehler
- **Tests:** 121/121 passing
- **Testnutzer:** `installateur@test.de` = super_employee / `inhaber@test.de` = owner
- **Kunde hat kein Login** — Alles per E-Mail (Angebot, Rechnungen)
