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
Eine digitale All-in-One-Plattform fur Solarteure und Endkunden. Installateure verwalten Leads, Projekte und Anfragen uber ein CRM-Dashboard. Kunden konfigurieren ihre Solaranlage in wenigen Minuten und erhalten ein individuelles Angebot.

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
| **Validierung** | Monat 1–3 | 0–49 €/Monat | 3–5 Pilotbetriebe onboarden, Testimonials, Feedback |
| **Markteintritt** | Monat 4–9 | 119–239 €/Monat | 20–30 zahlende Betriebe, Gründerrabatt (-20%), Setup-Fee |
| **Skalierung** | Ab Monat 10 | 149–599 €/Monat | Vollpreise, Upsell-Features (API, Analytics), Jahresabo |

### SaaS-Tiers (endgültig)

| Tier | Preis/Mo | Nutzer | Setup-Fee | Kern-Unterschiede |
|------|----------|--------|-----------|-------------------|
| **Starter** | 149 € | **1 Nutzer** | 299 € | Max 30 Leads/Monat, kein Kalender-Sync, kein CRM-Webhook |
| **Professional** | 299 € | **5 Nutzer** | 599 € | Unbegrenzte Leads, Kalender, CRM-Webhook, Lead-Scoring, eigene Domain |
| **Enterprise** | 599 € | **Unbegrenzt** | 1.200–2.500 € | Multi-Standort, API, White-Label, dedizierter Kundenmanager |

### Monetarisierungsdetails

- **Setup-Fee** = „Onboarding-Paket" (nicht Verwaltungsgebühr) — Datenmigration, Schulung, Einrichtung
- **Jahresabo** = 15% Rabatt bei jährlicher Zahlung — verbessert Cash-Flow, senkt Churn
- **Gründerrabatt** = -20% für alle Kunden vor Phase 3, mit Bestandsschutz (Preis bleibt auf Rabatt-Niveau)
- **ROI-Argument** = 1 zusätzlicher Abschluss/Monat = 50× Monatspreis (für Solarteure)

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
