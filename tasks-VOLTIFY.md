# Voltify — Tasks & TODOs
<!-- Zuletzt aktualisiert: 2026-05-29 — Wettbewerbsanalyse Reonic ergänzt -->

---

## 🔴 Kritisch — Nächster Schritt

### Vercel Deployment
- [ ] **Vercel-Projekt einrichten** — Git-Repo verbinden, Build-Settings
- [ ] **SPA-Redirect-Regeln** — `vercel.json` mit `rewrites` für React Router
- [ ] **Environment Variables** — Supabase URL + Anon Key in Vercel
- [ ] **DNS + Custom Domain** — Optional: voltify.de verbinden

---

## 🟠 Hoch — Diese Woche

### Lebenszykluskosten & Folgekosten (Kunden-Feedback)
> Ein potenzieller Kunde hat darauf hingewiesen, dass Wechselrichter-Austausch und Batterie-Ladezyklen die Amortisation massiv verändern. Transparente Darstellung = Vertrauensvorteil gegenüber Konkurrenz.
- [ ] **calculateROI erweitern** — Wechselrichter-Austausch (~2.000 € nach 12 Jahren), Batterie-Austausch (~6.000 € nach 12 Jahren, falls gewählt), jährliche Wartung (~200 €/Jahr)
- [ ] **Amortisationsgraph korrigieren** — Kurve zieht Folgekosten ab (nicht nur lineare Ersparnis)
- [ ] **Step 7 — Hinweisblock "Lebenszykluskosten"** — Transparenter Block unter dem Graph: "Diese Analyse rechnet ehrlich — die meisten Anbieter verschweigen Folgekosten"
- [ ] **Dashboard — Lead-Drawer Hinweis** — Installateur sieht realistische vs. optimistische Amortisation
- [ ] **Angebots-PDF — Disclaimer** — Absatz über Folgekosten im PDF

### Edge Functions & Automatisierung
- [ ] **Edge Functions deployen** — `supabase functions deploy` für alle Functions
- [ ] **Cron Jobs einrichten** — `notify-offer-expiry` + `notify-payment-due` täglich 08:00
- [ ] **Resend Domain-Verify** — `noreply@vu-studio.de` statt `onboarding@resend.dev`

### Reports-Seite ausbauen
- [ ] **Umsatz-Reports** — Einnahmen pro Monat, Conversion-Rate
- [ ] **Team-Performance** — Leads pro Mitarbeiter, Abschluss-Rate
- [ ] **Lead-Quellen** — Woher kommen die Leads (Landingpage, Direkt, etc.)

---

## 🟡 Normal — Nächste Woche

### SaaS-Subscription-System
- [ ] **Stripe-Integration** — Checkout für Setup-Fee + erstes Abo
- [ ] **Stripe-Webhook-Handler** — subscription.created, invoice.paid, subscription.cancelled
- [ ] **Abo-Verwaltung** — Upgrade/Downgrade zwischen Tiers
- [ ] **Feature-Gating** — `<FeatureGate>` Komponente für Tier-Limits
- [ ] **Max-Nutzer-Prüfung** — Bei Team-Einladung: Ist noch eine Lizenz frei?
- [ ] **Max-Leads-Prüfung** — Bei Lead-Eingang: Limit erreicht? (Starter = 30/Monat)

### Lizenz & Preisstrategie
- [ ] **Setup-Fee** — Einmalige Zahlung beim ersten Checkout
- [ ] **Jahresabo-Rabatt (-15%)** — Toggle Monatlich/Jährlich
- [ ] **Gründerrabatt (-20%)** — Flag in DB, Preis-Anpassung
- [ ] **Pilotphase-Preis** — Starter für 49 €/Mo (Phase 1)

---

## 🟢 Low — Backlog / Future Features

### Kundenportal (Magic-Link)
> **PROMOTED → Tier 1 (Wettbewerbsanalyse)** — Aus Backlog in aktive Roadmap übernommen.
> Nicht im MVP — Kunde bekommt alles per E-Mail. Später: Magic-Link statt Login.
- [ ] ~~**Magic-Link-System**~~ → Siehe Tier 1: "Magic-Link Kunden-Portal hochziehen"
- [ ] ~~**Status-Seite**~~ → Siehe Tier 1: "Magic-Link Kunden-Portal hochziehen"
- [ ] ~~**Angebots-PDF Download**~~ → Siehe Tier 1: "Magic-Link Kunden-Portal hochziehen"
- [ ] ~~**Rechnungen einsehen**~~ → Siehe Tier 1: "Magic-Link Kunden-Portal hochziehen"

### Echtzeit-Monitoring
> Hoher Aufwand — jeder Wechselrichter-Hersteller hat eigene API.
- [ ] **SMA Integration** — Sunny Portal API
- [ ] **Fronius Integration** — Solar.web API
- [ ] **Huawei Integration** — FusionSolar API
- [ ] **Alternative:** Schätzung basierend auf kWp/PLZ/Ausrichtung

### API & Enterprise-Features
- [ ] **REST API** — Dokumentation, Auth via API-Key
- [ ] **Zapier-Integration** — Trigger für neue Leads
- [ ] **HubSpot/Pipedrive-Connector** — Zwei-Wege-Sync
- [ ] **Kalender-Sync** — Google Calendar / Outlook

### Mobile App
> **PROMOTED → Tier 2 (Wettbewerbsanalyse)** — Aus Backlog in aktive Roadmap übernommen.
- [ ] ~~**React Native oder PWA**~~ → Siehe Tier 2: "PWA für Monteure (Mobile-First)"

---

## 🎯 Wettbewerbsanalyse Reonic — Feature-Roadmap (2026-05-29)
> Basierend auf Konkurrenz-Analyse vs. reonic.com. Sortiert nach ROI: Tier 1 = Quick-Wins (1–2 Wochen), Tier 2 = strategisch wichtig (2–6 Wochen), Tier 3 = Differenzierung (selektiv). Meeting-/Call-Notizen mit Whisper bewusst ausgeklammert.

### Tier 1 — Quick-Wins

#### Digitale Unterschrift im Angebot
- [ ] **Tabelle `offer_signatures`** — Migration: `offer_id`, `signed_at`, `signature_png`, `ip_hash`
- [ ] **Canvas-Signatur-Komponente** — `<SignaturePad>` mit Touch + Mouse Support
- [ ] **Magic-Link-Route** — `/sign/:token` öffentlich, ohne Login
- [ ] **PDF-Embed** — Signatur als Image in Angebots-PDF
- [ ] **E-Mail-Trigger** — Nach Signing: Confirmation an Kunde + Notification an Installateur

#### Angebots-Varianten (A/B/C-Pakete)
- [ ] **Schema-Erweiterung `offers`** — `variant_label` (text), `is_primary` (bool)
- [ ] **UI: Variant-Switcher** — Im Angebots-Management drei Pakete (Basic / Plus / Premium)
- [ ] **Live-Preisvorschau pro Variant** — ROI-Berechnung mit/ohne Speicher/Wallbox
- [ ] **PDF mit Vergleichstabelle** — Mehrseitiges PDF aller Varianten

#### Magic-Link Kunden-Portal hochziehen
> Vorhandene Tasks in 🟢 Low → Kundenportal sollen aus dem Backlog in die aktive Roadmap promoten.
- [ ] **Token-Generator** — UUID + 30-Tage-Expiry pro Lead
- [ ] **Öffentliche Routes** — `/k/:token` (Status), `/k/:token/angebot` (Download), `/k/:token/rechnungen`
- [ ] **Status-Komponenten** — Lead-Phase visualisieren (Kontaktiert → Vor Ort → Angebot → Auftrag → Montage)
- [ ] **Bestehende Backlog-Tasks abhaken** — Synchronisieren mit 🟢 Low Sektion

#### Lead-Scoring AI ausbauen
- [ ] **Score-Algorithmus erweitern** — Gewichtete Faktoren: PLZ-Strompreis, Eigentum, kWp, Antwortzeit, Verbrauch
- [ ] **Trainings-Daten sammeln** — `lead_outcomes` Tabelle: won/lost/no-response → Feedback-Loop
- [ ] **Score-Erklärung im UI** — Tooltip warum Lead "heiß" ist (Top-3 Faktoren mit Gewichtung)

### Tier 2 — Strategisch wichtig

#### Solar-Planer: Satelliten-Luftbild + interaktive Module
> Pivot von 3D → 2D Satellite View (2026-05-29). Begründung: Realer Wow-Faktor (Kunde sieht sein Haus), ~50 % weniger Aufwand, mobile-stabil, PDF-Export trivial. Map-Provider: **Google Maps**. Adresse wird **erst in Step 8** abgefragt → Visualizer erscheint am Ende des Konfigurators (Step 9 Thank-You / Lead-Bestätigung).

**Phase 1 — Auto-Visualisierung im Konfigurator (3–5 Tage)**
- [ ] **Google Cloud Project + Maps API** — Projekt anlegen, Maps Static API + Geocoding API aktivieren, API-Key restriktiv konfigurieren (Domain-Restriction)
- [ ] **Billing-Alert setzen** — Google Cloud Budget-Alert bei 80 % des Free-Credits ($200/Monat)
- [ ] **Env-Var `VITE_GOOGLE_MAPS_API_KEY`** — in Vercel + `.env.local` + `.env.example`
- [ ] **Module-Layout-Lib** — `src/lib/moduleLayout.ts` rein-funktional: `calculateGrid(kwp, roofAreaM2, orientation)` → returns `{rows, cols, modulesPx: [{x, y, rotation}]}`
- [ ] **Vitest-Tests moduleLayout** — 8+ Tests: Edge-Cases kleine/große Dächer, Süd-Optimum, Ost-West-Aufteilung
- [ ] **Geocoding-Service** — `src/services/geocoding.ts` mit Caching (Supabase-Tabelle `address_cache`: `address_hash` → `lat/lng`)
- [ ] **`SatelliteView.tsx`** — Maps Static API URL builder: zoom 20, size 640×640, maptype=satellite, center=lat,lng
- [ ] **`ModuleOverlay.tsx`** — HTML5 Canvas Layer absolut über Bild, zeichnet blaue Rechtecke mit weißem Center-Dot (Reonic-Style)
- [ ] **`SolarPlanner.tsx`** — Container: lädt Tile, rendert Overlay, zeigt Badge "X Module · Y kWp"
- [ ] **Step 9 Integration** — Read-only Display auf Thank-You-Page: "So könnte Ihre Solaranlage aussehen"
- [ ] **Loading-State** — Skeleton mit Pulse-Animation während Tile geladen wird
- [ ] **Fallback bei fehlgeschlagenem Geocoding** — Generic-Roof-Illustration + Hinweis "Bild wird vom Installateur nach Vor-Ort-Termin ergänzt"

**Phase 2 — Installateur-Editor im Lead-Drawer (5–7 Tage)**
- [ ] **Schema-Erweiterung `leads`** — `module_layout` (JSONB): `{outline: number[][], modules: [{x, y, rotation, stringId}], inverters: [{id, name, capacity}]}`
- [ ] **`InstallerPlanner.tsx`** — Vollbild-Modal aus Lead-Drawer-Button "Solar-Planung öffnen"
- [ ] **Dach-Outline-Tool** — Polygon-Zeichner: Click setzt Punkte, Doppelklick schließt, Escape bricht ab
- [ ] **Modul Drag-&-Drop** — Click-to-add neues Modul, Drag-to-move, Right-click/Delete-Taste = entfernen
- [ ] **Wechselrichter-String-Zuordnung** — Sidebar mit String A/B/C (verschiedene Farben), Klick auf Modul wechselt String
- [ ] **Live-kWp-Anzeige** — Header-Badge: Modulanzahl × 0,4 kWp → effektive Anlagengröße
- [ ] **Verschattungs-Ausschluss-Tool** — Schornstein/Gaube als Polygon markieren → Module dort visuell ausgegraut
- [ ] **Auto-Save in `lead.module_layout`** — Debounced 500ms nach letzter Änderung
- [ ] **Reset-Button** — "Zurück zur Auto-Platzierung" → übernimmt Konfigurator-Layout
- [ ] **Recalc-Trigger** — Bei Save: `recalculateLead()` mit neuer Modulanzahl aufrufen (vorhandene Funktion in `calculations.ts:154`)

**Phase 3 — Photo-Upload + PDF-Integration (2–3 Tage)**
- [ ] **Supabase Storage Bucket `roof-photos`** — Migration + RLS: Owner+Sales nur eigene Company
- [ ] **Photo-Upload im InstallerPlanner** — Drag-&-Drop + Datei-Picker, ersetzt Satellite-Tile
- [ ] **Image-Calibration-Tool** — User klickt 2 Punkte auf Foto + gibt reale Distanz in Meter an → Pixel-zu-Meter-Skalierung berechnen
- [ ] **`lead.roof_photo_url` + `lead.roof_photo_scale`** — Schema-Felder
- [ ] **Final-Snapshot Generator** — Canvas-Composite (Tile/Foto + Module + Outline) → PNG → `lead.roof_planner_snapshot`
- [ ] **Angebots-PDF Embed** — Snapshot als `<Image>` in OfferPDF (`src/components/pdf/`) unter ROI-Sektion
- [ ] **Vergleichs-View "Vorher / Nachher"** — Optional: Toggle im PDF-Preview ohne/mit Modulen für Verkaufsargument

#### PWA für Monteure (Mobile-First)
- [ ] **`vite-plugin-pwa` einbinden** — Manifest + Service Worker
- [ ] **Add-to-Homescreen Prompt** — Erst nach 2. Session anzeigen (nicht aufdringlich)
- [ ] **Offline-Indicator** — Banner wenn keine Verbindung
- [ ] **Foto-Upload via Kamera-API** — `<input type="file" accept="image/*" capture="environment">`
- [ ] **Mobile-Optimierte Projekt-Detail-Ansicht** — Großbutton Status, Checkliste, Notizen
- [ ] **Push-Notifications (optional)** — Neuer Lead, Termin-Reminder
- [ ] **Web App Manifest Icons** — 192px + 512px + maskable

### Tier 3 — Differenzierung

#### WhatsApp-Integration via Twilio
- [ ] **Twilio Account + Sandbox** — WhatsApp Business API
- [ ] **Edge Function `whatsapp-notify`** — Lead-Status-Updates pushen
- [ ] **Settings: WhatsApp-Nummer pro User** — Opt-In im Einstellungen-Tab
- [ ] **Notification-Templates** — Neuer Lead, Termin morgen, Angebot signiert, Rechnung fällig
- [ ] **Quiet-Hours Setting** — Keine Nachrichten 20–08 Uhr

#### Förder-Datenbank statt -Service
> **Hinweis:** Förder-System existiert bereits (Step 6, `src/data/grants.ts`). Diese Tasks erweitern das System von statisch → dynamisch (DB-gestützt + tagesaktuell).
- [ ] **Schema `grants_database`** — `grant_type`, `valid_from`, `valid_to`, `zip_prefix`, `amount_eur`, `percentage`
- [ ] **Initial-Seed** — BAFA/KfW-Sätze für Solar + Speicher (aktueller Stand)
- [ ] **Wöchentlicher Cron-Update** — Manuell oder via Scraping (gesetzliche Quellen)
- [ ] **UI: Förder-Übersicht pro Lead** — Auto-Eingerechnete Förderungen anzeigen, Quelle verlinkt
- [ ] **USP-Marketing** — "Tagesaktuelle Fördersätze inkl." auf Landingpage + Preis-Seite

#### Netzanmeldungs-Pre-Fill-PDF
- [ ] **Netzbetreiber-Mapping** — `network_operators` Tabelle: `zip_prefix` → Operator + Form-Template
- [ ] **Seed: Top-20-Netzbetreiber** — DE-weit Mehrheit der Postleitzahlen abdecken
- [ ] **PDF-Generator** — `@react-pdf/renderer` mit ausgefülltem Formular pro Operator
- [ ] **Button im Projekt-Detail** — "Netzanmeldung vorbereiten" → Download
- [ ] **Disclaimer im UI** — "Manuelle Einreichung bleibt beim Installateur" prominent

---

## ✅ Abgeschlossen — MVP

### Bugfixes & Tests (2026-05-27)
- [x] **Amortisationsgraph repariert** — CSS `@keyframes barGrow` mit `var(--target-height)` war zu fragil bei Re-Mounting. Fix: Inline-Style `height: ${finalHeight}%`, keine Animation. Zusätzlich: `chartData` direkt in Step7 berechnen statt aus `calc.chartData`.
- [x] **Negative Eingaben blockiert** — Dachfläche, Stromverbrauch, Strompreis: onChange-Guard + `min="0"`
- [x] **calculateROI Clamping** — `Math.max(0, ...)` in calculations.ts als Defense-in-Depth
- [x] **Tests erweitert** — 94 Tests (war 65): +14 Wirtschaftlichkeitsanalyse/Chart, +6 Step2_Roof, +8 Step3_Consumption

### Core Features
- [x] Auth-System — Supabase Auth, 8 Rollen, AuthContext + ProtectedRoute
- [x] Configurator — 9-Schritt Wizard mit Sidebar, ROI-Berechnung
- [x] Admin CRM — Kanban-Pipelines, Lead-/Projekt-Details, Kalender, Nachrichten
- [x] Landingpage — Hero, Produkte, Features, CTA → `/beta`
- [x] Kunden-Demo (`/kunde`) — 15 Sektionen, Solar-Konfigurator
- [x] Rechtliche Seiten — Datenschutz (DSGVO), Impressum, AGB

### PDF & Dokumente
- [x] Angebots-PDF — Dynamisches Branding, 0% MwSt, Angebotsnummer
- [x] Rechnungs-PDFs — 3 Zahlungsstufen (30/60/10%), Paid-Stamp, Fälligkeitsdatum
- [x] E-Mail-Versand — `send-offer` Edge Function mit PDF-Anhang via Resend

### Team & Rollen
- [x] Multi-Role-System — 8 Rollen
- [x] Team-Verwaltung — Owner erstellt Accounts mit zufälligem Passwort
- [x] Rollen-basierte Navigation — Sidebar zeigt nur erlaubte Menüpunkte
- [x] Data Scoping — Installer sieht nur eigene Daten, Owner sieht alles
- [x] RLS-Policies — Migration 028, keine Rekursion

### Preise & Marketing
- [x] Preis-Seite — `/preise` mit 3 Tiers (149€/299€/599€)
- [x] Beta-Programm — `/beta` mit Formular, DB-Tabelle, Edge Function
- [x] Landingpage CTAs — Alle führen zu `/beta`

### Settings & Branding
- [x] Firmen-Einstellungen — Logo, Farben, IBAN, Zahlungsziel
- [x] Webhook-Settings — Owner kann Lead-Weiterleitung konfigurieren
- [x] Email-Spalte in profiles — Migration 026 + Sync-Trigger

### Entfernt aus MVP
- [x] **Kunden-Dashboard** — Route aus App.tsx entfernt, Login-Redirect geändert
- [x] **Testkunde-Login** — Aus Login-Seite entfernt
- [x] **Testimonials & Blog** — Von Landingpage entfernt (kein echter Content)

---

## Wichtige Hinweise

- **Datenbank:** Voltify verwendet die gleiche Supabase-DB wie Solar Konfigurator (`ecsqbsgbfmvqaqnryvwf`)
- **Build:** 0 TypeScript-Fehler
- **Tailwind:** v3
- **React Router:** v7
- **State Management:** Kein Redux/Zustand — useState pro Komponente
- **Testnutzer:** `installateur@test.de` = super_employee / `inhaber@test.de` = owner
- **Kunde hat kein Login** — Alles per E-Mail (Angebot, Rechnungen, Status)
