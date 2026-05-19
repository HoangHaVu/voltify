## Seite: /dashboard

### Zweck
Kunden-Dashboard - Dunkles Theme mit Solar-Stats und Energie-Charts.

### Komponenten (seiten-spezifisch)

| # | Name | Beschreibung | Props |
|---|------|-------------|-------|
| 1 | Sidebar | 8 Nav-Punkte, Promo-Card, User (Alex Carter) | `activeTab` |
| 2 | TopBar | "Good morning Alex", Search, Bell, Calendar | Keine |
| 3 | HeroCard | Stats (16 Sites, 2.54 MWp) + Wetter-Widget | Keine |
| 4 | MetricCards | 4 Stats: Power, Energy, CO₂, Revenue | Keine |
| 5 | EnergyChart | SVG Area-Chart (Produziert/Verbraucht), Y: 0-350 kWh | Keine |
| 6 | Environmental | Trees (1.587), CO₂ (1.587t), Cars (1.587) | Keine |
| 7 | Performance | 3 Circular Gauges: Availability 92.1%, Efficiency 98.7%, Battery 95.2% | Keine |
| 8 | SiteTable | 4 Standorte mit Sparklines + Status-Badges | Keine |
| 9 | EnergyFlow | Haus-Diagramm (Solar/Grid/Consumption/Battery) | Keine |

### Zustände
- `activeTab`: string ('overview' default)

### Links
- Logo → `/`

### Daten
Alles statische Mock-Daten (keine API).
