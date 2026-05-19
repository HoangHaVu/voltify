## Seite: /admin

### Zweck
CRM-Dashboard für Solarteure - Leads, Pipeline, Stats.

### Komponenten (seiten-spezifisch)

| # | Name | Beschreibung | Props |
|---|------|-------------|-------|
| 1 | Sidebar | 4 Nav (Dashboard/Leads/Pipeline/Reports), Settings, Help | `activeTab`, `setActiveTab` |
| 2 | SecondaryTopbar | 5 Tabs: Leads, Pipeline, Source Tracking, Performance, Tasks | `activeView` |
| 3 | DashboardView | 4 Top-Stats, Pipeline-Funnel, Recent Activity, Deals Table | Keine |
| 4 | LeadsView | Suchfeld, Filter, Import, 8-Spalten-Tabelle, Multi-Select | `searchQuery`, `selectedLeads` (useState) |
| 5 | PipelineView | 4-Spalten Kanban: Interested/Applications/In Process/Closed | Keine |

### Zustände
- `activeTab`: string ('dashboard' default)
- `activeView`: string (sekundärer Nav)
- `searchQuery`: string (Leads-Suche)
- `selectedLeads`: number[] (Multi-Select)

### Links
- Logo → `/`

### Daten
Alles statische Mock-Daten:
- 8 Leads (Theresa Webb, Savannah Nguyen, etc.)
- 4 Pipeline-Spalten mit je 3-4 Karten
- 4 Top-Stats (247 Leads, 86 Deals, €2.3M, 18.5%)
