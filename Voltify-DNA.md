# Voltify - Architektur-DNA

> Quelle der Wahrheit fur lokale Weiterentwicklung in Kimi/Claude CLI.
> **HINWEIS:** Dieses Projekt verwendet die gleiche Supabase-Datenbank wie Solar Konfigurator (Projekt-Ref: ecsqbsgbfmvqaqnryvwf). Alle Backend-Services, Auth-System und Business-Logik werden von Solar Konfigurator portiert.

## Maps-Index

Alle detaillierten Maps liegen unter `docs/maps/`:

| Map | Datei | Enthaelt |
|-----|-------|---------|
| **Seitenbaum** | [`docs/maps/map-seitenbaum.md`](docs/maps/map-seitenbaum.md) | Alle 7 Routen mit vollstaendigem Sektionen-Baum und CTAs |
| **Komponenten** | [`docs/maps/map-komponenten.md`](docs/maps/map-komponenten.md) | Komponenten-Hierarchie, Props, Wiederverwendung pro Seite |
| **Datenfluss** | [`docs/maps/map-datenfluss.md`](docs/maps/map-datenfluss.md) | State-Flow, WizardData Interface, API-Integration (geplant) |
| **Farbschema** | [`docs/maps/map-farbschema.md`](docs/maps/map-farbschema.md) | Alle Farben (Hex), Tailwind-Klassen, Verwendung pro Seite |
| **Animationen** | [`docs/maps/map-animationen.md`](docs/maps/map-animationen.md) | Alle GSAP/CSS-Animationen mit Timing, Trigger, Easing |
| **Routing** | [`docs/maps/map-routing.md`](docs/maps/map-routing.md) | Alle Routen, Links, Auth, zukuenftige Routes |
| **Assets** | [`docs/maps/map-assets.md`](docs/maps/map-assets.md) | Alle Bilder, Icons, Fonts, SVGs mit Verwendung |

---

## 1. Brief

### Projektziel
Voltify ist eine Solar-Energie-Plattform mit zwei Zielgruppen:
- **Endkunden (Installateure)**: Landingpage + Dashboard zur Verwaltung von Solarprojekten
- **Kunden**: Solar-Konfigurator (9-Schritt-Wizard) zur Berechnung von Solaranlagen

### Vision
Voltify ist die SaaS-Plattform für den **unterversorgten Solo-Solarteur-Markt** (1–5-Mann-Betriebe in DACH). Während Reonic & Co. mittlere bis große Betriebe bedienen, setzt Voltify auf günstigen Preis (149 €/Mo), schlankes Onboarding und einen Endkunden-Konfigurator als Lead-Generator. Installateure verwalten Leads, Projekte und Angebote in einem CRM. Endkunden konfigurieren ihre Solaranlage in wenigen Minuten — der Lead landet vollständig vorbereitet beim Installateur.

> **Strategische Positionierung, Wettbewerbsanalyse, Flywheel-Modell und 90-Tage-Plan**: siehe Sektion 9 am Ende dieses Dokuments.

### Farbsystem
| Token | Hex | Nutzung |
|-------|-----|---------|
| Navy Primary | `#1A3A5C` | Header, Buttons, Aktive Zustande, Sidebar |
| Navy Dark | `#0F2440` | Hover-States, Gradient-Enden |
| Yellow Accent | `#F5A623` | CTA-Buttons, Highlights, Icons, Badges |
| Yellow Dark | `#E09000` | Yellow Hover |
| Background Dark | `#0F0F0F` | Dashboard-Hintergrunde |
| Card Dark | `#1A1A1A` | Dashboard-Cards |
| Card Inner | `#252525` | Verschachtelte Cards |
| Background Light | `#FFFFFF` | Landingpage |
| Gray Light | `#F8FAFB` | Landingpage-Alternate-Sections |
| Blue Accent | `#3B82F6` | Sekundare Charts (Consumption-Linie) |

---

## 2. Tech Stack

| Schicht | Technologie |
|---------|------------|
| Framework | React 19 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS v3 |
| UI-Komponenten | shadcn/ui (40+ Komponenten) |
| Animationen | GSAP + ScrollTrigger |
| Routing | react-router-dom v7 |
| Icons | Lucide React |

### Installierte Pakete
```
react react-dom react-router-dom
vite @vitejs/plugin-react typescript
tailwindcss postcss autoprefixer
gsap @gsap/react
lucide-react
clsx tailwind-merge class-variance-authority
```

---

## 3. Projektstruktur

```
/mnt/agents/output/app/
|   package.json
|   vite.config.ts
|   tailwind.config.js
|   tsconfig.json
|   index.css                  # Tailwind-Direktiven + CSS-Variablen
|
+---public/
|   +---images/
|   |       hero-bg.jpg        # Solarfarm-Panorama
|   |       solarnova-hero.jpg # Windturbinen fur Installateur-LP
|   |       configurator-bg.jpg # Solar-Dach Hintergrund
|   |       dashboard-bg.jpg   # Dashboard-Hintergrund
|   |       service-*.jpg      # 3 Service-Bilder
|   |       about-image.jpg    # Solararbeiter bei Sonnenuntergang
|   |       team-*.jpg         # 4 Team-Portraits
|   |       funfact-*.jpg      # 2 Bilder fur Fun-Fact-Sektion
|   |       blog-*.jpg         # 3 Blog-Bilder
|   |       faq-image.jpg      # Solar-Panels fur FAQ
|
+---src/
|   |   App.tsx                # Router-Konfiguration (8 Routes)
|   |   main.tsx               # Entry Point mit BrowserRouter
|   |   index.css              # Globale Styles, Font-Import, Keyframes
|
|   +---pages/                 # Page-Level Komponenten
|   |       LandingPage.tsx           # Haupt-Landingpage für Installateure (15 Sektionen)
|   |       CustomerLandingPage.tsx   # Kunden-Landingpage mit Solar-Konfigurator-Zugang
|   |       Login.tsx          # Split-Screen Login
|   |       Register.tsx       # Split-Screen Register
|   |       Configurator.tsx   # 9-Schritt Wizard mit Sidebar
|   |       AdminDashboard.tsx # Admin CRM (Leads + Pipeline)
|   |       LeadDetailsPage.tsx # Lead-Detail mit Angebots- & Rechnungs-PDF
|   |       TeamPage.tsx       # Team-Verwaltung (nur Inhaber)
|   |       SettingsPage.tsx   # Firmen-Einstellungen (nur Inhaber)
|   |       PreisePage.tsx     # SaaS Preis-Tabelle (oeffentlich)
|   |       AgbPage.tsx        # AGB (oeffentlich)
|
|   +---sections/              # Wiederverwendbare Sektionen
|   |   |   Header.tsx         # Fixed Header mit Scroll-Transition
|   |   |   Hero.tsx           # Full-viewport Hero mit Reviews-Card
|   |   |   Partners.tsx       # Logo-Bar mit Platzhaltern
|   |   |   ExcellentServices.tsx # Lime-Band (jetzt Navy-Gradient)
|   |   |   OurServices.tsx    # 3 Bildkarten mit Navigation
|   |   |   About.tsx          # Grosse "13" + rotierendes Badge
|   |   |   Experience.tsx     # Zentrierte Statement-Sektion
|   |   |   ServiceCards.tsx   # 3 Outline-Karten mit Toggle-Buttons
|   |   |   Team.tsx           # Info-Card + 4 Team-Mitglieder
|   |   |   ExploreSection.tsx # PLZ-Input + "Jetzt berechnen"
|   |   |   Marquee.tsx        # Zwei scrollende Textbander
|   |   |   FunFact.tsx        # Bilder + Service-Boxen + 10+ Badge
|   |   |   PartnersGrid.tsx   # 10er Partner-Logo-Grid
|   |   |   News.tsx           # 3 Blog-Karten
|   |   |   FAQ.tsx            # Akkordeon mit 4 Fragen
|   |   |   Footer.tsx         # Dunkler Footer mit Newsletter
|   |   |
|   |   +---configurator/      # Wizard-Schritte
|   |           Step1_Building.tsx    # Gebaudetyp + Eigentum
|   |           Step2_Roof.tsx        # Dachneigung + Ausrichtung + Flache
|   |           Step3_Consumption.tsx # Stromverbrauch (Upload/Manual/Preset)
|   |           Step4_Storage.tsx     # Speichergrosse wahlen
|   |           Step5_Options.tsx     # Wallbox / Notstrom / App
|   |           Step6_Subsidies.tsx   # BAFA / KfW / EEG Forderungen
|   |           Step7_Analysis.tsx    # Wirtschaftlichkeitsanalyse
|   |           Step8_Contact.tsx     # Kontaktdaten-Formular
|   |           Step9_ThankYou.tsx    # Dankeseite mit Next-Steps
|   |
|   +---components/ui/         # shadcn/ui Komponenten (40+)
|   +---hooks/                 # Custom Hooks (use-mobile)
|   +---lib/                   # Utils (cn() fuer Tailwind-Klassen)
```

---

## 4. Routing

| Route | Seite | Zielgruppe |
|-------|-------|-----------|
| `/` | **LandingPage** (Root) | Installateure |
| `/kunde` | Home (Kunden-Landingpage) | Endkunden |
| `/login` | Login + Admin Login Button | Beide |
| `/register` | Registrierung | Beide |
| `/konfigurator` | 9-Schritt Solar-Wizard | Kunden |
| `/admin` | Admin CRM-Dashboard | Installateure |

### Future Features (nicht im MVP)

| Feature | Beschreibung | Prioritaet |
|---------|-------------|------------|
| **Kunden-Dashboard** | Echtzeit-Monitoring der Solaranlage (Wechselrichter-Integration), Projekt-Status, Angebots-PDF Download, Termine, Rechnungen. | Niedrig — Kunde bekommt alles per E-Mail. Spaeter: Magic-Link fuer Status/Angebot ohne Login. |
| **Echtzeit-Monitoring** | Live-Daten aus SMA/Fronius/Huawei Wechselrichtern. Aufwand: Hoch (jeder Hersteller eigene API). Alternative: Schätzung basierend auf kWp/PLZ/Ausrichtung. | Niedrig |
| **Mobile App** | Native App fuer iOS/Android. | Niedrig |

### Link-Struktur
- `/` (Installateur-LP) -> `/kunde` ("Check out Demo")
- `/` -> `/login` (Nav-Login)
- `/login` -> `/admin` (Admin-Login-Button) + `/konfigurator` (Kunden-Weiterleitung)
- `/kunde` -> `#explore` (Scroll, Header + Hero)
- `/kunde` -> `/konfigurator` ("Jetzt berechnen")
- `/konfigurator` -> `/login` (Step 9 "Zum Login")

---

## 5. Komponenten-Architektur

### State-Management
- **Kein Global State** (kein Redux/Zustand)
- **Lokaler State** mit `useState` pro Komponente
- **Configurator**: WizardData-Interface wird von Parent (Configurator.tsx) an alle Steps per Props weitergereicht

### Configurator State-Flow
```
Configurator.tsx (WizardData state)
  |-- Step1_Building (buildingType, ownership)
  |-- Step2_Roof (roofTilt, roofOrientation, roofArea, shading)
  |-- Step3_Consumption (consumption, consumptionMethod)
  |-- Step4_Storage (storageSize)
  |-- Step5_Options (wallbox, backupPower, energyApp)
  |-- Step6_Subsidies (read-only)
  |-- Step7_Analysis (read-only, berechnet aus Steps 1-5)
  |-- Step8_Contact (firstName, lastName, email, phone, zipCode, city, company, privacyConsent)
  |-- Step9_ThankYou (read-only)
```

### Animations-System
- **GSAP ScrollTrigger** fur alle Scroll-Animationen
- Klasse `.reveal` auf Elementen -> automatisches fade-up bei Scroll
- CSS Keyframes fur Marquee (kein JS)
- CSS Keyframes fur rotierendes Badge

---

## 6. Styling-System

### Tailwind-Konfiguration
- Custom Colors uber CSS-Variablen in `index.css`
- Path alias `@/` auf `src/` konfiguriert
- Font: Inter (Google Fonts CDN)

### Wiederverwendbare Muster
```
# Card (dunkel, Dashboard)
bg-[#1A1A1A] rounded-2xl border border-white/5

# Card (hell, Landingpage)  
bg-white rounded-2xl border border-gray-100

# Button Primary
text-sm font-medium px-6 py-3 rounded-full

# Input
border border-gray-200 rounded-xl px-4 py-3
focus:outline-none focus:border-[#1A3A5C]

# Badge (Status)
text-[10px] px-2.5 py-0.5 rounded-full

# Sidebar Button Aktiv
bg-[#1A3A5C] text-white font-medium

# Sidebar Button Inaktiv
text-gray-500 hover:text-white hover:bg-white/5
```

---

## 7. Assets

### Generierte Bilder (public/images/)
| Datei | Nutzung |
|-------|---------|
| `hero-bg.jpg` | Kunden-Landingpage Hero, About, Projects |
| `solarnova-hero.jpg` | Installateur-Landingpage Hero + CTA |
| `configurator-bg.jpg` | Wizard-Hintergrund, ExploreSection |
| `dashboard-bg.jpg` | Dashboard-Hintergrund |
| `service-*.jpg` | 3 Service-Karten |
| `about-image.jpg` | About-Sektion |
| `team-*.jpg` | 4 Team-Portraits |
| `funfact-*.jpg` | Fun-Fact-Sektion |
| `blog-*.jpg` | News/Blog-Sektion |
| `faq-image.jpg` | FAQ-Sektion |

---

## 8. Preisstrategie & Business-Modell

> Stand: 2026-05-15 — Drei-Phasen-Strategie mit Nutzer-basierten Tiers

### Phasen-Plan

| Phase | Zeitraum | Preis | Ziel |
|-------|----------|-------|------|
| **Validierung** | Monat 1–3 | 0 € (kostenlos) | 3–5 Pilotbetriebe onboarden, Testimonials, Feedback |
| **Gründerphase** | Monat 4–12 | 99–499 €/Monat | 20–30 zahlende Betriebe, ohne Setup-Fee, Bestandsschutz |
| **Vollpreis** | Ab Monat 13 | 179–799 €/Monat | Vollpreise + Setup-Fee, Jahresabo, Upsell White-Label |

### SaaS-Tiers Installer (aktualisiert 2026-06-19)

| Tier | Vollpreis/Mo | Gründerpreis/Mo | Setup-Fee | Kern-Unterschiede |
|------|-------------|-----------------|-----------|-------------------|
| **Starter** | 179 € | 99 € | 299 € | 1 Nutzer, 30 Leads/Mo, kein CRM-Webhook |
| **Professional** | 379 € | 179 € | 499 € | 5 Nutzer, unbegrenzte Leads, Kalender, Webhooks |
| **Enterprise** | 799 € | 399 € | 1.200–2.000 € | Unbegrenzt, API, White-Label, dedizierter Manager |

### Agency-Tiers (aktualisiert 2026-06-19)

| Tier | Vollpreis/Mo | Gründerpreis/Mo | Partner | Kern |
|------|-------------|-----------------|---------|------|
| **Agency Start** | 199 € | 99 € | bis 5 | Routing manuell, Portale, Provisions-Tracking |
| **Agency Pro** | 399 € | 199 € | bis 20 | + PLZ-Vorschläge, Scorecard |
| **Agency Scale** | 699 € | 349 € | unbegrenzt | + Vollautomatisches PLZ-Routing (Auto-Routing) |

### Monetarisierungsdetails

- **Setup-Fee** = „Onboarding-Paket" — erst ab Vollpreis-Phase, nicht in Gründerphase
- **Jahresabo** = 15% Rabatt bei jährlicher Zahlung — verbessert Cash-Flow, senkt Churn
- **Gründerrabatt** = Bestandsschutz: wer in Gründerphase kauft, bleibt dauerhaft auf Gründerpreis
- **White-Label Addon** = +79 €/Mo für Professional-Kunden (kein Enterprise-Zwang)
- **ROI-Argument** = 1 zusätzlicher Abschluss/Monat = ~100× Monatsbeitrag (für Solarteure mit ∅ 15.000 € Auftragswert)

### Feature-Matrix pro Tier

| Feature | Starter | Professional | Enterprise |
|---------|:-------:|:------------:|:----------:|
| Solar-Konfigurator | ✅ | ✅ | ✅ |
| Lead-Pipeline (Kanban) | ✅ | ✅ | ✅ |
| Projekt-Management | ✅ | ✅ | ✅ |
| Angebots-PDF | ✅ | ✅ | ✅ |
| Rechnungs-PDF | ✅ | ✅ | ✅ |
| Nachrichten/Notizen | ✅ | ✅ | ✅ |
| Kalender | ❌ | ✅ | ✅ |
| CRM-Webhook (Zapier/HubSpot) | ❌ | ✅ | ✅ |
| Lead-Scoring AI | ❌ | ✅ | ✅ |
| Eigene Domain/White-Label | ❌ | ❌ | ✅ |
| API-Zugriff | ❌ | ❌ | ✅ |
| Multi-Standort | ❌ | ❌ | ✅ |
| Dedizierter Manager | ❌ | ❌ | ✅ |
| Max. Leads/Monat | 30 | ∞ | ∞ |
| Max. Nutzer | 1 | 5 | ∞ |

### Rollen-System innerhalb der Nutzer-Lizenzen

Die Rollen sind **keine separaten Preis-Tiers**, sondern freie Konfiguration innerhalb der verfügbaren Lizenzen:

| Rolle | Berechtigungen | Verfügbar ab |
|-------|---------------|--------------|
| **Inhaber** | Alle Daten, Team-Verwaltung, Einstellungen, Abo-Verwaltung | Alle Tiers |
| **Vertrieb** | Eigene Leads + Projekte, Kalender, Notizen | Professional+ |
| **Projektleiter** | Alle Projekte (nur lesend), eigene Termine, Notizen | Professional+ |
| **Monteur** | Zugewiesene Projekte (Status ändern), Montage-Termine | Professional+ |
| **Backoffice** | Alle Leads + Projekte (nur lesend), Rechnungen, Zahlungen | Professional+ |

**Beispiel Professional (5 Lizenzen):**
- 1× Inhaber + 2× Vertrieb + 1× Monteur + 1× Backoffice = 5 Nutzer ✅
- 1× Inhaber + 4× Vertrieb = 5 Nutzer ✅

### Datenmodell für Subscriptions

```
profiles
├── subscription_tier (enum: starter | professional | enterprise)
├── subscription_status (enum: active | trial | cancelled | past_due)
├── subscription_started_at (timestamptz)
├── subscription_ends_at (timestamptz)
├── setup_fee_paid (boolean)
├── founder_discount_applied (boolean)
├── stripe_customer_id (text)
├── stripe_subscription_id (text)
└── max_team_members (int — 1/5/null)

company_subscriptions (neu)
├── owner_id → auth.users(id)
├── tier (enum)
├── status
├── current_period_start/end
├── billing_interval (monthly | yearly)
├── stripe_subscription_id
└── trial_ends_at

team_invitations (neu)
├── company_id → profiles(id) des Inhabers
├── email
├── role (enum)
├── token (uuid)
├── expires_at
└── accepted_at
```

### Payment-Provider
- **Stripe** für wiederkehrende Abonnements (SEPA-Lastschrift + Karte)
- **Stripe Checkout** für Setup-Fee + erste Zahlung
- **Stripe Customer Portal** für Selbstverwaltung (Upgrade, Kündigung) |

---

## 9. Strategie & Wettbewerbspositionierung

> Stand: 2026-05-29 — basierend auf Konkurrenzanalyse vs. Reonic + ehrlicher Markt-Einschätzung. Diese Sektion ist die strategische Quelle der Wahrheit. Bei Konflikten mit anderen Sektionen gewinnt diese.

### 9.1 Positionierung — Was Voltify ist und was es NICHT ist

**Voltify ist NICHT der "Reonic-Killer"** — das ist ein verlorener Kampf gegen 3.000 Bestandskunden, VC-Kapital und 50+ Devs. Voltify ist:

> **"Solar-Konfigurator + CRM für Solo-Solarteure. Bekomm 3× mehr qualifizierte Leads — ohne Marketing-Agentur."**

### 9.2 Buyer-Persona (scharf)

- **Wer**: Solo-Solarteur oder 2–5-Mann-Familienbetrieb in DACH (DE/AT/CH)
- **Schmerz**: 3–8 Leads/Monat, viele Zeitverschwender, kein eigenes Marketing-Budget, Angebot-Erstellung dauert 2 Tage
- **Budget**: 100–250 €/Monat für Software, kein Setup über 500 €
- **Sprache**: kWp, Eigenverbrauch, BAFA, Einspeisetarif — keine Marketing-Buzzwords
- **Kein Buyer für Voltify**:
  - Betriebe mit 10+ Mitarbeitern (gehören Reonic)
  - Quereinsteiger ohne Solar-Erfahrung (gehören Plansoft / Excel)
  - Reine Lead-Vermarkter ohne eigene Montage (anderes Geschäftsmodell)

### 9.3 Wettbewerbsmatrix (vs. Reonic)

| Aspekt | Reonic | Voltify | Wer gewinnt? |
|--------|--------|---------|--------------|
| Zielgruppe | 5–50-Mann-Betriebe | 1–5-Mann-Betriebe | ✅ Voltify (underserved) |
| Preis | ~500–800 €/Mo (geschätzt) | 149 €/Mo | ✅ Voltify (3–5× günstiger) |
| Setup-Fee | 1.500–2.500 € | 999 € (Beta: 0 €) | ✅ Voltify (niedrige Eintrittsbarriere) |
| Lead-Generation | Nicht im Fokus | Konfigurator als Killer-Feature | ✅ Voltify (echtes Differenzial) |
| Workflow-Tiefe | 360°-All-in-One | Solar-fokussiert, schlanker | ⚖️ Reonic, aber Voltify schneller einsetzbar |
| Vertikal-Services (Förder, Netzanmeldung, Factoring) | ✅ | ❌ (bewusst out-of-scope) | ❌ Reonic — bewusst akzeptiert |
| Dach-Visualisierung | 2D + 3D | 2D-Satellit (geplant) | ⚖️ Funktionale Parität |
| Customer-Support | Account-Manager-Bürokratie | Direkt-Founder (für erste 50 Kunden) | ✅ Voltify (intimer Touch) |
| Mobile App | Native iOS/Android | PWA (geplant) | ⚖️ Vergleichbar |
| Vertriebsgeschwindigkeit | Enterprise-Sales-Zyklen | Self-Service + Code-Calls | ✅ Voltify |

### 9.4 Das Voltify-Flywheel (strategischer Kern)

```
   ┌─────────────────────────────────────────────────────────┐
   │                                                         │
   │   Scoutly (Eigenproduct = CAC-Maschine)                 │
   │   ├─ Lead-Listen-Scraping (HWK + Google Maps)           │
   │   ├─ Cold E-Mail mit Personalisierung                   │
   │   └─ E-Mail-Warmup + Sequencing                         │
   │              │                                          │
   │              ▼  Ziel: ~5–10 % Response-Rate             │
   │   Discovery-Call (Founder-led, persönlich)              │
   │              │                                          │
   │              ▼  Ziel: ~30 % Beta-Anmelderate            │
   │   Voltify Beta (30 Tage kostenlos, Pricing-Conv. ab W2) │
   │              │                                          │
   │              ▼  Ziel: ~20 % Beta-zu-Paid                │
   │   Zahlender Kunde (149 €/Mo + Founding-Lock-In 50 %)    │
   │              │                                          │
   │              ▼                                          │
   │   Referral + Case-Study + Testimonial-Video             │
   │              │                                          │
   │              └─── feeds back into Scoutly ──────────────┤
   │                                                         │
   └─────────────────────────────────────────────────────────┘
```

**Strategischer Strukturvorteil**: VC-Konkurrenten wie Reonic müssen CAC mit Geld kaufen (Google-Ads, SDR-Team). Voltify hat über Scoutly **0 € Marginalkosten pro Lead**. Skaliert ohne Personalwachstum.

**Velocity-Vorteil**: AI-augmentierte Solo-Dev-Geschwindigkeit ≈ 2,5× klassischer Solo-Dev. Damit ist effektiver Velocity-Rückstand zu Reonic ~12× (nicht 50×) — aufholbar in Nische.

### 9.5 90-Tage-Plan (operativ)

#### Sprint 1 — Tag 0–30: "Sales-Ready"
- [ ] Solar-Planer Phase 1 fertigstellen → Demo-Asset für Code-Calls
- [ ] Digitale Unterschrift im Angebot → schließt offensichtliche Lücke
- [ ] 3 echte Beta-Tester onboarden, **Pricing-Conversation in Woche 2**
- [ ] Scoutly-Kampagne 1: 200 Solo-Solarteure DE, klare A/B-Hypothese

#### Sprint 2 — Tag 31–60: "Conversion-Beweis"
- [ ] **Erster zahlender Kunde** vor Tag 60
- [ ] Angebots-Varianten (A/B/C) + Magic-Link-Portal als Conversion-Booster
- [ ] Stripe-Integration scharfschalten (Self-Service-Subscription)
- [ ] Scoutly-Kampagne 2 mit gelernten A/B-Erkenntnissen

#### Sprint 3 — Tag 61–90: "Repeatability"
- [ ] 5 zahlende Kunden → 1 Case-Study mit harten Zahlen
- [ ] Solar-Planer Phase 2 (Installateur-Editor) auf Basis Kundenfeedback
- [ ] Landingpage-Rework — Niche-Positioning klar herausarbeiten
- [ ] Testimonial-Video mit 1–2 Beta-Partnern für Social-Proof

### 9.6 Bewusste "Wir tun das NICHT"-Entscheidungen

| Was wir nicht bauen | Warum |
|---------------------|-------|
| Wärmepumpen-Modul (DIN EN 12831) | Andere Vertikale, Reonic-Heimspiel, lenkt von Solar-Fokus ab |
| Drohnen-Photogrammetrie-Service | Hardware-Aufwand + Schulungen + Versicherung |
| Factoring / Finanzierung | Finanzdienstleister-Lizenz erforderlich |
| Native iOS/Android-Apps (zunächst) | PWA deckt 80 % ab, native erst ab €500k ARR |
| Custom-Webdesign-Service | Template + Branding = OK; Sonderwünsche = Distraktion |
| Mehrsprachige Plattform (zunächst) | DACH-Markt zuerst, dann skalieren |
| Voll-Whitelabel / Embedded-iframe (zunächst) | Enterprise-Feature, erst ab Reonic-Reife |
| Meeting-/Call-Notizen mit Whisper | Zu viel Aufwand für unklaren Voltify-Use-Case |

### 9.7 Risiken & Counter-Strategien

| Risiko | Wahrscheinlichkeit | Counter |
|--------|-------------------|---------|
| Scoutly-Reply-Rate < 2 % | Mittel | Subject-Lines A/B-testen, Lead-Listen-Qualität optimieren |
| Beta-zu-Paid < 10 % | Hoch | Pricing-Conversation in Woche 2, Founding-Lock-In-Angebot |
| Reonic senkt Preise & startet Starter-Tier | Niedrig–Mittel | Konfigurator-First-Story als Moat ausbauen |
| Solar-Markt-Konsolidierung 2027 | Hoch | EU-Expansion (AT, CH, NL) vorbereiten als Wachstumsfeld |
| AI-Velocity-Vorteil schwindet (alle nutzen Claude) | Hoch | Vorsprung in Vertrieb + Brand jetzt aufbauen, nicht später |
| UX-Lücke zu Reonic wird sichtbar | Mittel | Ab Tag 90: 2–4 Wochen Design-Sprint mit Freelancer |

### 9.8 Erfolgs-KPIs (monatlich messen)

- **MRR-Wachstum** — Ziel: +500 € Monat-zu-Monat ab Monat 3
- **Beta-zu-Paid-Rate** — Ziel: ≥ 20 %
- **Scoutly-Reply-Rate** — Ziel: ≥ 5 %
- **Time-to-First-Konfigurator-Lead nach Onboarding** — Ziel: ≤ 14 Tage
- **Churn nach Monat 3** — Ziel: ≤ 5 %
- **NPS unter Beta-Testern** — Ziel: ≥ 40

### 9.9 Stop-Loss-Bedingungen (ehrlich)

Bei **Tag 180** (sechs Monate ab Strategie-Pivot 2026-05-29 → **Tag 180 = 2026-11-25**):

Pivot-Trigger wenn:
- < 3 zahlende Kunden ODER
- Beta-zu-Paid-Rate < 10 % über 20+ Beta-Tester ODER
- Scoutly-Response-Rate konstant < 1 %

Pivot-Optionen:
1. **Konfigurator-als-Service** — verkaufe nur den Solar-Konfigurator white-label an Solar-Werbeagenturen
2. **Adjacent-Vertikale** — Voltify-Pattern für andere Handwerksbranchen (Bedachung, Wärmepumpe-only)
3. **Voltify pausieren** — Fokus auf MediScrip / Scoutly bündeln

### 9.10 Realistische Erfolgs-Szenarien

| Szenario | Wahrscheinlichkeit (Stand 2026-05-29) | Voraussetzungen |
|----------|---------------------------------------|-----------------|
| Voltify wird der "Reonic der Solo-Solarteure" (€500k+ ARR) | ~12–15 % | Flywheel funktioniert, EU-Expansion gelingt |
| Voltify wird solides €300k–800k ARR-Business | ~35–45 % | Fokus + Scoutly-Conversion + Beta-zu-Paid ≥ 20 % |
| Voltify wird €80k–200k Solo-Side-Business | ~30–40 % | Realistischer Default-Pfad |
| 0 zahlende Kunden in 18 Monaten | ~8–12 % | Nur wenn Vertrieb stagniert |

---

## 10. Partner-Modul (Sales-Agency-Erweiterung)

> Stand: 2026-06-08 — PV-Vertriebsagenturen können Leads an Installateur-Partner weitergeben.

### 10.1 Architektur
- **Eine App, eine Codebase** — Neue Rolle `sales_agency`, kein separates System
- **Top-Level-Rolle** (wie `owner`) — Agentur hat eigenen Account, kein Owner nötig
- **Shared:** Konfigurator, Auth, PDF-Engine, E-Mail-Versand
- **Neu:** Partner-Management, Lead-Routing, Commission-Tracking, Partner-Portal

### 10.2 Neue Tabellen
| Tabelle | Zweck |
|---------|-------|
| `partners` | Installateur-Partner mit PLZ-Gebiet, Provisionssatz |
| `lead_assignments` | Zuweisung Lead → Partner mit Status-Tracking |
| `commissions` | Provisionen: pending → invoiced → paid |

### 10.3 Neue Routen
| Route | Auth | Zweck |
|-------|------|-------|
| `/admin/partners` | sales_agency | Partner-CRUD |
| `/admin/router` | sales_agency | Lead-Zuweisung |
| `/admin/commissions` | sales_agency | Provisionen-Tracking |
| `/partner/:token` | public | Partner-Portal (Magic-Link) |

### 10.4 Provisionssystem
- **Global pro Partner** (nicht pro Lead) — einfacher, weniger Verwaltung
- **Typen:** `fixed` (€) oder `percentage` (%)
- **Trigger:** Partner markiert Lead als `converted` → Commission wird erstellt

### 10.5 Partner-Portal (Magic-Link)
- Kein Login nötig — Zugriff über `access_token`
- Partner sieht nur seine zugewiesenen Leads
- Aktionen: Annehmen, Ablehnen, Auftrag-erteilt

### 10.6 Offene Phase-2-Features
- Automatische Lead-Verteilung (PLZ, Round-Robin)
- Multi-Angebots-Vergleich
- White-Label Konfigurator

---
