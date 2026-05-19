## Seite: /register

### Zweck
Neues Konto erstellen - Split-Screen mit Registrierungsformular + ROI-Mockup.

### Sections / Komponenten

| # | Name | Beschreibung | Props |
|---|------|-------------|-------|
| 1 | RegisterForm | Linke Spalte: Logo, Name, Email, Password (show/hide), Confirm, Terms, Button | `fullName`, `email`, `password`, `confirmPassword`, `showPassword`, `showConfirm`, `agreeTerms` (useState) |
| 2 | ROIMockup | Rechte Spalte: Navy-Gradient + ROI-Stats + Chart + Gauge | Keine |

### Zustände
- `fullName`: string
- `email`: string
- `password`: string
- `confirmPassword`: string
- `showPassword`: boolean
- `showConfirm`: boolean
- `agreeTerms`: boolean

### Links
- "Create Account" → `/dashboard` (HARDCODED)
- "Login Now" → `/login`
- Logo → `/`

### Daten
Statische Mock-Daten für ROI-Mockup.
