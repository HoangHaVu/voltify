# Seitenbaum - Voltify

```
voltify.local/
|
+-- /                              [INSTALLATEUR-LANDINGPAGE]
|   |
|   +-- Hero                       "Powering Tomorrow With Solar Energy"
|   |                               + CTA: "Check out Demo" -> /kunde
|   |                               + CTA: "Learn More" -> #about (scroll)
|   |
|   +-- Partner Bar                6 Logo-Platzhalter
|   |
|   +-- About                      Mission / Vision / Values (3 Cards)
|   |
|   +-- Impact Stats               4 Zahlen (Installations, MW, %, Clients)
|   |
|   +-- Dashboard Preview          Features + Dashboard-Bild
|   |                               + Link: "Learn More" -> /kunde
|   |
|   +-- Process                    4 Schritte (Savings -> Calculator -> Design -> Installation)
|   |
|   +-- Services                   3 Cards (Installation, Smart Energy, Maintenance)
|   |
|   +-- Clean Power                Checkliste (6 Punkte) + CTA -> /kunde
|   |
|   +-- Projects                   3 Projekt-Karten mit Overlay
|   |
|   +-- Pricing                    3 Plane (Basic/Standard/Premium) + CTA -> /kunde
|   |
|   +-- Testimonials               4 Kundenbewertungen
|   |
|   +-- Blog                       4 Blog-Eintrage (Listenform)
|   |
|   +-- CTA Section                "Ready to Switch?" + CTA -> /kunde
|   |
|   +-- Footer                     Links + Newsletter-Formular
|   |                               + Pages: Home, About, Contact
|   |                               + Company: Projects, Blogs
|   |                               + Inner: Pricing, Login
|   |                               + Legal: Privacy Policy, Terms
|
+-- /kunde                         [KUNDEN-LANDINGPAGE]
|   |
|   +-- Header (fixed)             Logo + Nav + "Explore now" -> #explore
|   |                               + Scroll: transparent -> weiss
|   |
|   +-- Hero                       "Solar energy that moves the world forward"
|   |                               + Reviews-Card (100+ reviews, 4.96/5)
|   |                               + Marquee-Strip
|   |
|   +-- Partners Bar               "Supported by VC's" + 6 Logos
|   |
|   +-- Excellent Services         Navy-Gradient Band + 3 Services
|   |                               + CTA: "Get started now"
|   |
|   +-- Our Services               3 Bildkarten (Rooftop, Maintenance, Offgrid)
|   |                               + Nav-Pfeile
|   |
|   +-- About                      Grosse "13" + rotierendes Badge + Checkliste
|   |                               + CTA: "About us"
|   |
|   +-- Experience                 "10+ years of experience" (zentriert)
|   |
|   +-- Service Cards              3 Outline-Karten (Maintenance, Wind, Rooftop)
|   |
|   +-- Team                       Info-Card + 4 Team-Portraits
|   |
|   +-- Explore Section    <<<<<   PLZ-Input + "Jetzt berechnen" -> /konfigurator
|   |                               + Badge: "TUV geprufte Qualitat"
|   |                               + Badge: "Bis zu 80% sparen"
|   |
|   +-- Marquee                    Zwei scrollende Textbander (entgegengesetzt)
|   |
|   +-- Fun Fact                   Bilder + 3 Service-Boxen (Navy) + 10+ Badge
|   |
|   +-- Partners Grid              10 Partner-Logo-Karten
|   |
|   +-- News                       3 Blog-Karten + "More news"
|   |
|   +-- FAQ                        Bild + 4-Fragen-Akkordeon
|   |
|   +-- Footer (dunkel)            Logo + 3 Kontakt-Boxen + 4 Spalten
|   |                               + Newsletter + Social Icons + Copyright
|
+-- /login                         [LOGIN]
|   |
|   +-- Linke Spalte (40%)         Voltify-Logo
|   |                               + "Welcome Back"
|   |                               + Email / Password / Remember Me
|   |                               + "Log In" Button -> /dashboard
|   |                               + "Admin Login" Button -> /admin
|   |                               + Google / Apple Social Login
|   |                               + "Register Now" -> /register
|   |
|   +-- Rechte Spalte (60%)        Navy-Gradient + Dashboard-Mockup
|                                   + Stats (Savings, Energy, CO2)
|                                   + Chart + Efficiency Gauge
|
+-- /register                      [REGISTRIERUNG]
|   |
|   +-- Linke Spalte (40%)         Voltify-Logo
|   |                               + "Create Account"
|   |                               + Full Name / Email / Password / Confirm
|   |                               + Terms Checkbox
|   |                               + "Create Account" Button
|   |                               + Google / Apple
|   |                               + "Login Now" -> /login
|   |
|   +-- Rechte Spalte (60%)        Navy-Gradient + ROI-Dashboard
|                                   + ROI Potential, Panel Efficiency, Payback
|                                   + Savings Chart
|
+-- /konfigurator                  [9-SCHRITT SOLAR-WIZARD]
|   |
|   +-- Sidebar (320px)            Voltify-Logo + 9 Schritte als Timeline
|   |                               + Fortschrittsbalken (0-100%)
|   |                               + Schritte klickbar (ruckwarts)
|   |
|   +-- Content Area               Solar-Dach Hintergrund + weisser Gradient
|   |                               |
|   |   +-- Schritt 1              Gebaudetyp (EFH/ZFH/MFH/Gewerbe/Sonstiges)
|   |   |                           + Eigentumsform (Mieter/Eigentumer)
|   |   |
|   |   +-- Schritt 2              Dachneigung (Slider 0-60 deg)
|   |   |                           + Ausrichtung (Kompass-Kreisel)
|   |   |                           + Geschatzte Dachflache (m2 Input)
|   |   |                           + Verschattung (Keine/Teilweise/Stark)
|   |   |
|   |   +-- Schritt 3              Stromverbrauch (Drag & Drop Upload)
|   |   |                           + Haushaltsgrosse Presets (1-2 / 3-4 / 5+)
|   |   |                           + Manueller Slider (1000-15000 kWh)
|   |   |
|   |   +-- Schritt 4              Speicher wahlen (5/10/15/20 kWh Karten)
|   |   |                           + "Empfohlen"-Badge auf 10kWh
|   |   |                           + Feinjustierung-Slider
|   |   |
|   |   +-- Schritt 5              Optionen (Wallbox / Notstrom / Energy-App)
|   |   |                           + Toggle-Buttons mit Preis
|   |   |
|   |   +-- Schritt 6              Forderungen (BAFA / KfW / EEG)
|   |   |                           + Automatisch ermittelt
|   |   |                           + Gesamtforderungs-Box (bis 15.000 EUR)
|   |   |
|   |   +-- Schritt 7              Wirtschaftlichkeitsanalyse
|   |   |                           + 4 Key Metrics (Systemleistung, Investition,
|   |   |                             Ersparnis/Jahr, Amortisation)
|   |   |                           + 20-Jahres-Amortisations-Chart
|   |   |                           + CO2-Einsparung
|   |   |                           + CTA: "Individuelles Angebot anfordern" -> Schritt 8
|   |   |
|   |   +-- Schritt 8              Kontaktdaten (Formular)
|   |   |                           + Vorname / Nachname / Email / Telefon
|   |   |                           + PLZ / Ort / Firma (optional)
|   |   |                           + Datenschutz-Checkbox
|   |   |                           + "Angebot anfordern" -> Schritt 9
|   |   |
|   |   +-- Schritt 9              Dankeseite
|   |                               + Erfolgs-Animation
|   |                               + 3 Next-Steps (Prufung/Angebot/Installation)
|   |                               + CTA: "Zum Login" -> /login
|   |                               + CTA: "Neue Konfiguration"
|   |
|   +-- Navigation (bottom)        "Zuruck" / "Weiter" (oder "Angebot anfordern")
|
+-- /dashboard                     [KUNDEN-DASHBOARD]
|   |
|   +-- Sidebar (220px)            Voltify-Logo + 8 Nav-Punkte
|   |                               + Promo-Card + User-Profil (Alex Carter)
|   |
|   +-- Top Bar                    "Good morning, Alex" + Search + Bell + Calendar
|   |
|   +-- Hero Card                  Stats (16 Sites, 2.54 MWp) + Weather Widget
|   |
|   +-- 4 Metric Cards             Power / Energy / CO2 Offset / Revenue
|   |
|   +-- Energy Chart               Full-width SVG (Produziert Gelb / Verbraucht Blau)
|   |                               + Y-Achse 0-350 kWh
|   |
|   +-- Environmental Impact       Trees / CO2 / Cars
|   |
|   +-- Performance                3 Circular Gauges (Availability/Efficiency/Battery)
|   |
|   +-- Site Table                 4 Standorte mit Status + Sparklines
|   |
|   +-- Energy Flow                Haus-Diagramm (Solar/Grid/Consumption/Battery)
|
+-- /admin                         [ADMIN CRM-DASHBOARD]
    |
    +-- Sidebar (220px)            Voltify-Logo + 4 Nav-Punkte
    |                               + Settings + Help + User (Voltify Admin)
    |
    +-- Sekundar-Topbar            Leads / Pipeline / Source Tracking /
    |                               Performance / Tasks
    |
    +-- VIEW: Dashboard            4 Top-Stats (Leads/Deals/Pipeline/Conversion)
    |                               + Pipeline Flow Funnel
    |                               + Recent Activity Timeline
    |                               + Recent Deals Tabelle
    |
    +-- VIEW: Leads                Suchfeld + Filter + Import
    |                               + Vollstandige Lead-Tabelle (Checkboxen)
    |                               + Multi-Select Toolbar (Email/Tag/Assign/Delete)
    |                               + Edit/Delete pro Zeile
    |
    +-- VIEW: Pipeline             4-Spalten Kanban-Board
                                   + Interested / Applications / In Process / Closed
                                   + Drag-fahige Karten mit Firmen/Preis/Avatar
                                   + "Add Card" / "Add Deal" Buttons
```

### Schnittstellen zwischen Seiten

```
/  ------------------->  /kunde          ("Check out Demo")
/  ------------------->  /login          (Nav "Log In")
/kunde --------------->  #explore        (Scroll: Header + Hero "Explore now")
/kunde --------------->  /konfigurator   ("Jetzt berechnen")
/login --------------->  /dashboard      ("Log In" Button)
/login --------------->  /admin          ("Admin Login" Button)
/login --------------->  /register       ("Register Now" Link)
/register ----------->  /login          ("Login Now" Link)
/konfigurator -------->  /login          (Step 9 "Zum Login")
```
