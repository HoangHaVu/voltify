// PROJECT: Voltify | PURPOSE: Demo-Berechnungsnachweis als statische PDF generieren
// Ausführen: npx tsx scripts/gen-demo-pdf.tsx

import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import CalculationPdfDocument from '../src/components/pdf/CalculationPdfDocument.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Demo-Kundendaten (realistisches Bayern-Beispiel) ──────────────────
const demoLead = {
  id: 'demo',
  first_name: 'Max',
  last_name: 'Mustermann',
  email: 'max.mustermann@example.de',
  phone: '+49 89 123456',
  zip: '80331',
  building_type: 'einfamilienhaus',
  ownership: 'eigentümer',
  roof_orientation: 'S',
  roof_tilt: 35,
  roof_area: 55,
  shading: 'none',
  construction_year: '1995',
  consumption: 4200,
  has_e_car: false,
  has_heat_pump: false,
  has_battery: true,
  electricity_price: 0.31,
  kwp: 9.9,
  investment: 25870,
  annual_savings: 1842,
  amortization: 14,
  autarky: 68,
  profit_20_years: 10970,
  score: 82,
  status: 'angebot' as const,
  offer_status: 'sent' as const,
  installer_id: 'demo',
  planning_horizon: null,
  needs_financing: false,
  wants_zoom_call: false,
  offer_sent_at: null,
  offer_viewed_at: null,
  payment_1_paid: false,
  payment_2_paid: false,
  payment_3_paid: false,
  discount_code: null,
  discount_percentage: null,
  discount_status: null,
  final_price: null,
  discount_note: null,
  discount_requested_at: null,
  discount_resolved_at: null,
  site_visit_date: null,
  site_visit_notes: null,
  site_visit_done: false,
  roof_area_measured: null,
  roof_angle: null,
  shading_issues: false,
  source: null,
  module_layout: null,
  created_at: new Date().toISOString(),
  offer_signatures: [],
  offer_variants: [],
  lead_activities: [],
};

// ── Demo-Firmendaten ──────────────────────────────────────────────────
const demoCompany = {
  firmenname: 'Sonnenkraft Solar GmbH',
  slogan: 'Ihre Experten für Photovoltaik in Bayern',
  logoDataUrl: '',
  primaryColor: '#1A3A5C',
  accentColor: '#F5A623',
  iban: 'DE12 3456 7890 1234 5678 90',
  zahlungsziel: '14',
  steuernummer: '123/456/78901',
  adresse: 'Sonnenstraße 12',
  ort: '80331 München',
  geschaeftsfuehrer: 'Hans Meier',
  rechnungskreis: 'SK',
  panelHersteller: 'SunPower, JA Solar',
  wechselrichterHersteller: 'SMA Solar Technology',
};

// ── PDF generieren & speichern ────────────────────────────────────────
async function main() {
  console.log('Berechnungsnachweis-Demo wird generiert…');

  const element = React.createElement(CalculationPdfDocument, {
    lead: demoLead as never,
    company: demoCompany,
  });

  const blob = await pdf(element).toBlob();
  const buffer = Buffer.from(await blob.arrayBuffer());

  const outputPath = resolve(__dirname, '..', 'Berechnungsnachweis-Demo.pdf');
  writeFileSync(outputPath, buffer);

  console.log(`✓ PDF gespeichert: ${outputPath}`);
  console.log(`  Demo-Kunde: ${demoLead.first_name} ${demoLead.last_name}`);
  console.log(`  PLZ: ${demoLead.zip} (München)`);
  console.log(`  Dachfläche: ${demoLead.roof_area} m² · Ausrichtung: Süd · Neigung: ${demoLead.roof_tilt}°`);
  console.log(`  Speicher: 10 kWh · Verbrauch: ${demoLead.consumption} kWh/Jahr`);
}

main().catch((err) => {
  console.error('Fehler beim PDF-Generieren:', err);
  process.exit(1);
});
