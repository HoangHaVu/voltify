# Voltify — Tasks & Roadmap
<!-- Zuletzt aktualisiert: 2026-05-29 — MVP-Grenze gezogen -->

---

## 🔴 MVP — Muss vor Go-Live

> **MVP = Installateur kann Leads erfassen, Angebote erstellen, Rechnungen schreiben.**
> Alles andere (Digitale Unterschrift, Kundenportal, Stripe, WhatsApp, Monitoring…) ist Phase 2.

### Deployment & Infrastruktur
- [x] **Vercel-Projekt** — https://voltify-app.vercel.app
- [x] **SPA-Redirect-Regeln** — `vercel.json`
- [x] **Environment Variables** — Supabase URL + Anon Key in Vercel
- [ ] **Edge Functions deployen** — `supabase functions deploy` für `send-offer`, `notify-signature`
- [ ] **Cron Jobs einrichten** — `notify-offer-expiry` + `notify-payment-due` täglich 08:00
- [ ] **Resend Domain-Verify** — `noreply@vu-studio.de` statt `onboarding@resend.dev`
- [ ] **Migrationen pushen** — 030 (Signatures), 032 (Variants), 033 (Sources), 034 (Lead Activities), 035 (Module Layout)

### Core Features (bereits implementiert)
- [x] Auth-System — Supabase Auth, 8 Rollen, AuthContext + ProtectedRoute
- [x] Configurator — 8-Schritt Wizard mit ROI-Berechnung (Step 3+5 gemergt, PLZ in Step 1)
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

## 🟡 Phase 2 — Nach erstem Beta-Test

> Erst relevant, wenn echte Installateure das Tool nutzen und Feedback geben.

### Angebots-Varianten (A/B/C)
- [x] **Schema + Auto-Generator** — Migration `032_offer_variants.sql`, `generateStorageVariants()`
- [x] **UI: Toggle + Karten** — Lead-Drawer mit 3 Speicher-Optionen
- [x] **PDF-Vergleichstabelle** — Seite 2 im Angebot
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
- **Tests:** 113/113 passing
- **Testnutzer:** `installateur@test.de` = super_employee / `inhaber@test.de` = owner
- **Kunde hat kein Login** — Alles per E-Mail (Angebot, Rechnungen)
