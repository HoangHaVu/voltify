## Seite: /konfigurator

### Zweck
9-Schritt Solar-Wizard mit Sidebar und Step-Navigation.

### Komponenten (seiten-spezifisch)

| # | Name | Beschreibung | Props |
|---|------|-------------|-------|
| 1 | Sidebar | Navy, 9 Steps Timeline, Fortschrittsbalken | `currentStep`, `goToStep` |
| 2 | Step1_Building | 5 Gebäudetyp-Karten + 2 Eigentum-Karten | `data.buildingType`, `data.ownership`, `updateData` |
| 3 | Step2_Roof | Neigungs-Slider, Kompass, Fläche, Verschattung | `data.roofTilt`, `data.roofOrientation`, `data.roofArea`, `data.shading`, `updateData` |
| 4 | Step3_Consumption | Upload-Zone, 3 Presets, Manueller Slider | `data.consumption`, `data.consumptionMethod`, `updateData` |
| 5 | Step4_Storage | 4 Speicher-Karten (5-20 kWh), Slider | `data.storageSize`, `updateData` |
| 6 | Step5_Options | 3 Toggle-Cards (Wallbox, Notstrom, App) | `data.wallbox`, `data.backupPower`, `data.energyApp`, `updateData` |
| 7 | Step6_Subsidies | Statische Förderungs-Anzeige (BAFA/KfW/EEG) | Keine (read-only) |
| 8 | Step7_Analysis | 4 Key Metrics, 20-Jahre Chart, CO₂, CTA | `data` (read-only, berechnet) |
| 9 | Step8_Contact | Formular: Name, Email, Telefon, PLZ, DSGVO | `data.firstName...`, `updateData` |
| 10 | Step9_ThankYou | Erfolgs-Animation, 3 Next-Steps, Buttons | Keine |

### Zustände (global pro Seite)
- `currentStep`: number (1-9)
- `data`: WizardData (Interface mit 18 Feldern)

### Links
- Logo → `/`
- "Zum Login" → `/login` (Step 9)
- "Neue Konfiguration" → reload (Step 9)

### Daten
- Steps 1-5: User-Eingaben (useState)
- Step 6-7: Statisch / Berechnet aus Steps 1-5
- Step 8: Formular-Eingaben
- Step 9: Keine Daten
