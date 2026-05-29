# Voltify — Resume Point
<!-- Zuletzt aktualisiert: 2026-05-29 — Strategie-Pivot + Reonic-Wettbewerbsanalyse -->

## Status: STRATEGIE-PIVOT DOKUMENTIERT ✅

Letzter Commit (Code): `4b56ad7` — Tests erweitert (94/94), Amortisationsgraph, negative Eingaben blockiert
Letzter Update (Strategie): DNA Sektion 9 + tasks-VOLTIFY.md "🎯 Wettbewerbsanalyse Reonic" + Solar-Planer-Pivot (3D → 2D-Satellit)

---

## Was ist neu? (2026-05-29) — Strategie-Pivot

### Wettbewerbsanalyse vs. Reonic durchgeführt
- **Niche-Positionierung** klar festgelegt: **Solo-Solarteure + 1–5-Mann-Familienbetriebe in DACH** — bewusst NICHT die Reonic-Klientel (5+ Mitarbeiter)
- **Flywheel-Modell** dokumentiert: Scoutly (CAC-Maschine) → Voltify (LTV-Maschine) → AI-Dev (Velocity-Multiplikator)
- **DNA-Sektion 9** ergänzt: Buyer-Persona, Wettbewerbsmatrix, 90-Tage-Plan, "Wir-tun-das-NICHT"-Liste, Risiken, KPIs, Stop-Loss-Bedingungen
- **Realistische Erfolgs-Szenarien**: €300k–800k ARR-Pfad realistisch (~35–45 %), "Reonic-Killer" unrealistisch (<15 %)

### Feature-Roadmap aus Reonic-Analyse (in tasks-VOLTIFY.md)
- **Tier 1** Quick-Wins (1–2 Wochen): Digitale Unterschrift, Angebots-Varianten A/B/C, Magic-Link-Portal hochziehen, Lead-Scoring AI ausbauen
- **Tier 2** Strategisch (2–6 Wochen): **Solar-Planer (2D-Satellit Google Maps)** statt 3D, PWA für Monteure
- **Tier 3** Differenzierung (selektiv): WhatsApp-Integration, Förder-Datenbank, Netzanmeldungs-Pre-Fill-PDF
- **Meeting-/Call-Notizen mit Whisper bewusst ausgeklammert**

### Solar-Planer: 3D → 2D-Pivot
- **Vorher**: React Three Fiber, generische 3D-Box, ~2–3 Wochen Aufwand
- **Jetzt**: Google Maps Satellite + Canvas-Modul-Overlay (à la Reonic), ~1–2 Wochen Aufwand
- **Begründung**: Realer Wow-Faktor (Kunde sieht **sein** Haus), mobile-stabil (kein WebGL), trivialer PDF-Export
- **Map-Provider entschieden**: Google Maps (beste DE-Qualität, Domain-Restriction Pflicht)
- **Adress-Eingabe bleibt in Step 8** → Visualizer erscheint in Step 9 (Thank-You)

---

## Was ist drin? (MVP-Stand vor Pivot)

### Live & Deployed
- Live auf Vercel ✅
- 94/94 Tests grün ✅
- 9-Schritt-Konfigurator mit ROI-Berechnung
- Admin-CRM mit Kanban-Pipelines (Leads + Projekte)
- Angebots-PDF + 3 Rechnungs-PDFs mit dynamischem Branding
- Rabatt-System mit Codes + Live-Vorschau
- Pipeline-Spalte "Vor Ort" + Site-Visit-Termine
- Lead-Scoring (Heiß/Warm/Kalt — statisch)
- E-Mail-Versand via Resend (`send-offer` Edge Function)
- Multi-Role-System (8 Rollen) + Team-Verwaltung

---

## Nächster Schritt — Sales-Ready Sprint 1 (Tag 0–30)

### Code-Prioritäten
1. **Solar-Planer Phase 1** — `moduleLayout.ts` → Google Maps Setup → `SatelliteView.tsx` → `ModuleOverlay.tsx` → Step 9 Integration
   → Ziel: Demo-Asset für Code-Calls in ~5 Tagen
2. **Digitale Unterschrift** — Canvas-Pad + Magic-Link-Route + PDF-Embed → zweiter Tier-1-Quick-Win nach Solar-Planer

### Vertriebs-Prioritäten (kritisch!)
3. **3 Beta-Tester onboarden** mit **Pricing-Conversation in Woche 2** (Conversion-Risiko früh adressieren)
4. **Scoutly-Kampagne 1** für Voltify: 200 Solo-Solarteure DE, klare A/B-Test-Hypothese, Tracking
5. **Erfolgs-KPI**: 50 Discovery-Calls in 60 Tagen, 1 zahlender Kunde vor Tag 60

---

## Wichtige Pfade & Befehle

- Dev-Server: `npm run dev` (Port 5173)
- Build: `npm run build` (0 TypeScript-Fehler)
- Tests: `npm test` (94/94 passing)
- Strategie: `Voltify-DNA.md` → Sektion 9
- Feature-Roadmap: `tasks-VOLTIFY.md` → "🎯 Wettbewerbsanalyse Reonic"
- Auth: `src/contexts/AuthContext.tsx`
- Services: `src/services/`
- PDF: `src/components/pdf/`
- Edge Functions: `supabase/functions/`

---

## Datenbank
- **Supabase Projekt-Ref:** `ecsqbsgbfmvqaqnryvwf`
- **Migrationen 018–029:** ✅ Alle ausgeführt

## Test-Accounts
| E-Mail | Rolle | Passwort |
|--------|-------|----------|
| installateur@test.de | super_employee | Test123456 |
| inhaber@test.de | owner | Test123456 |

---

## Stop-Loss-Datum: 2026-11-25 (Tag 180)

Wenn dann: < 3 zahlende Kunden ODER Beta-zu-Paid < 10 % ODER Scoutly-Response < 1 %
→ Ehrliche Retro + Pivot-Entscheidung (Konfigurator-als-Service, adjacent Vertikale, oder Pause).

---

## Aktive Map
`docs/maps/map-seitenbaum.md`
