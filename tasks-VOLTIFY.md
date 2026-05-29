# Voltify — Tasks & TODOs
<!-- Zuletzt aktualisiert: 2026-05-13 — MVP fertig -->

---

## 🔴 Kritisch — Nächster Schritt

### Vercel Deployment
- [ ] **Vercel-Projekt einrichten** — Git-Repo verbinden, Build-Settings
- [ ] **SPA-Redirect-Regeln** — `vercel.json` mit `rewrites` für React Router
- [ ] **Environment Variables** — Supabase URL + Anon Key in Vercel
- [ ] **DNS + Custom Domain** — Optional: voltify.de verbinden

---

## 🟠 Hoch — Diese Woche

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
> Nicht im MVP — Kunde bekommt alles per E-Mail. Später: Magic-Link statt Login.
- [ ] **Magic-Link-System** — Link per E-Mail, keine Registrierung nötig
- [ ] **Status-Seite** — Lead-Status, Projekt-Fortschritt, Termine
- [ ] **Angebots-PDF Download** — Ohne Login, nur mit Token
- [ ] **Rechnungen einsehen** — Alle Rechnungen mit Zahlungsstatus

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
- [ ] **React Native oder PWA** — Für Monteur unterwegs

---

## ✅ Abgeschlossen — MVP

### Bugfixes & Tests (2026-05-27)
- [x] **Amortisationsgraph repariert** — `items-end` verhinderte Balkenanzeige (Flexbox-Height-Bug), `justify-end` + `h-full` fix
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
