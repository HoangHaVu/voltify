## Seite: /login

### Zweck
Benutzeranmeldung - Split-Screen mit Login-Formular + Dashboard-Mockup.

### Sections / Komponenten

| # | Name | Beschreibung | Props |
|---|------|-------------|-------|
| 1 | LoginForm | Linke Spalte: Logo, Email, Password (show/hide), Remember Me, 2 Buttons | `email`, `password`, `showPassword`, `rememberMe` (useState) |
| 2 | DashboardMockup | Rechte Spalte: Navy-Gradient + Stats-Widgets + SVG Chart + Gauge | Keine |

### Zustände
- `email`: string
- `password`: string
- `showPassword`: boolean
- `rememberMe`: boolean

### Links
- "Log In" → `/dashboard` (HARDCODED, kein Auth)
- "Admin Login" → `/admin` (HARDCODED)
- "Register Now" → `/register`
- Logo → `/`

### Daten
Statische Mock-Daten für Dashboard-Mockup.
