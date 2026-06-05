// PROJECT: Voltify | PURPOSE: Berechnungsnachweis-PDF für Kunden
import React from 'react';
import {
  Document, Page, View, Text, StyleSheet,
} from '@react-pdf/renderer';
import type { Lead } from '../../services/data';
import type { CompanySettings } from './OfferPdfDocument';
import { getIrradiationByZip } from '../../data/plzIrradiation';
import { getGrantSubsidyTotal } from '../../data/grants';

// ── Konstanten (identisch zu calculations.ts) ──────────────────────────
const PERFORMANCE_RATIO = 0.80;
const FEED_IN_TARIFF = 0.082;
const INVEST_PER_KWP = 1800;
const CONSTRUCTION_ADDON = 2000;
const MAINTENANCE_PER_YEAR = 200;
const INVERTER_REPLACEMENT_COST = 2000;
const INVERTER_REPLACEMENT_YEAR = 12;

const ORIENTATION_FACTOR: Record<string, number> = {
  S: 1.0, SO: 0.95, SW: 0.95, O: 0.85, W: 0.85, NO: 0.88, NW: 0.88, N: 0.65,
};
const ORIENTATION_LABEL: Record<string, string> = {
  S: 'Süd', SO: 'Südost', SW: 'Südwest', O: 'Ost', W: 'West', NO: 'Nordost', NW: 'Nordwest', N: 'Nord',
};

function getRoofAngleFactor(angle: number): number {
  const diff = Math.abs(angle - 32);
  return Math.max(0.80, 1.0 - (diff * diff) / 5000);
}
function getShadingFactor(shading: string): number {
  if (shading === 'strong' || shading === 'stark') return 0.85;
  if (shading === 'partial' || shading === 'teilweise') return 0.93;
  return 1.0;
}
function getShadingLabel(shading: string): string {
  if (shading === 'strong' || shading === 'stark') return 'Stark';
  if (shading === 'partial' || shading === 'teilweise') return 'Teilweise';
  return 'Keine';
}

// ── Formatierungshelfer ────────────────────────────────────────────────
function fmtEUR(n: number): string {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
}
function fmtDec(n: number, digits = 2): string {
  return n.toLocaleString('de-DE', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}
function fmtNum(n: number, suffix = ''): string {
  return n.toLocaleString('de-DE') + suffix;
}

// ── Styles ─────────────────────────────────────────────────────────────
function getStyles(primary: string, accent: string) {
  const slate50 = '#F8FAFC';
  const slate100 = '#F1F5F9';
  const slate200 = '#E2E8F0';
  const slate400 = '#94A3B8';
  const slate500 = '#64748B';
  const slate600 = '#475569';
  const slate700 = '#334155';
  const white = '#FFFFFF';
  const green = '#16A34A';
  const greenLight = '#DCFCE7';

  return StyleSheet.create({
    page: { fontFamily: 'Helvetica', fontSize: 9, color: slate700, padding: 32 },

    // Header
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
    companyName: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: primary },
    companySlogan: { fontSize: 8, color: slate400, marginTop: 2 },
    docTitle: { fontSize: 8, color: slate500, textAlign: 'right', lineHeight: 1.5 },
    docTitleBold: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: primary, textAlign: 'right' },
    accentBar: { height: 3, backgroundColor: accent, marginBottom: 18 },

    // Intro
    introBox: { backgroundColor: slate50, borderRadius: 4, padding: 10, marginBottom: 18, border: `1 solid ${slate200}` },
    introText: { fontSize: 8.5, color: slate600, lineHeight: 1.5 },

    // Sections
    section: { marginBottom: 14 },
    sectionTitle: { fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: white, backgroundColor: primary, padding: '5 10', borderRadius: '3 3 0 0' },
    sectionBody: { border: `1 solid ${slate200}`, borderTop: 'none', borderRadius: '0 0 3 3', padding: 10 },

    // Input-Grid
    inputGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    inputItem: { width: '31%', backgroundColor: slate50, border: `1 solid ${slate200}`, borderRadius: 3, padding: 7 },
    inputLabel: { fontSize: 7, color: slate400, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
    inputValue: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: slate700 },
    inputNote: { fontSize: 7, color: slate500, marginTop: 1 },

    // Berechnungsschritte
    calcRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 5 },
    calcLabel: { fontSize: 8, color: slate500, width: 180 },
    calcOperator: { fontSize: 8, color: slate400, width: 20, textAlign: 'center' },
    calcValue: { fontSize: 8, color: slate700, flex: 1 },
    calcResult: { flexDirection: 'row', alignItems: 'center', marginTop: 6, paddingTop: 6, borderTop: `1 solid ${slate200}` },
    calcResultLabel: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: primary, flex: 1 },
    calcResultValue: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: accent },

    formula: { backgroundColor: '#EEF2FF', borderRadius: 3, padding: '6 10', marginBottom: 6, border: `1 solid #C7D2FE` },
    formulaText: { fontSize: 8, color: '#3730A3', fontFamily: 'Helvetica', lineHeight: 1.6 },

    // Tabellen
    table: { width: '100%' },
    tRow: { flexDirection: 'row', borderBottom: `1 solid ${slate100}`, paddingVertical: 5 },
    tRowAlt: { flexDirection: 'row', borderBottom: `1 solid ${slate100}`, paddingVertical: 5, backgroundColor: slate50 },
    tRowTotal: { flexDirection: 'row', paddingVertical: 7, backgroundColor: primary, paddingHorizontal: 8, borderRadius: 3, marginTop: 4 },
    tRowSubTotal: { flexDirection: 'row', paddingVertical: 6, backgroundColor: greenLight, paddingHorizontal: 8, borderRadius: 3, marginTop: 2 },
    tLabel: { flex: 1, fontSize: 8, color: slate600 },
    tNote: { flex: 1, fontSize: 7.5, color: slate500 },
    tValue: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: slate700, textAlign: 'right', width: 90 },
    tValueTotal: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: white, textAlign: 'right', width: 90 },
    tValueGreen: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: green, textAlign: 'right', width: 90 },
    tLabelTotal: { flex: 1, fontSize: 9, fontFamily: 'Helvetica-Bold', color: white },

    // Ergebnis-Kacheln
    kpiGrid: { flexDirection: 'row', gap: 8, marginTop: 4 },
    kpiBox: { flex: 1, border: `1 solid ${slate200}`, borderRadius: 4, padding: 8, backgroundColor: slate50 },
    kpiBoxGreen: { flex: 1, border: `1 solid #BBF7D0`, borderRadius: 4, padding: 8, backgroundColor: greenLight },
    kpiLabel: { fontSize: 7, color: slate400, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
    kpiValue: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: primary },
    kpiValueGreen: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: green },
    kpiNote: { fontSize: 7, color: slate500, marginTop: 2 },

    // Disclaimer
    disclaimer: { marginTop: 12, padding: 10, backgroundColor: '#FFFBEB', borderRadius: 4, border: `1 solid #FDE68A` },
    disclaimerTitle: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#92400E', marginBottom: 4 },
    disclaimerText: { fontSize: 7.5, color: slate600, lineHeight: 1.5 },

    // Footer
    footer: { position: 'absolute', bottom: 24, left: 32, right: 32, borderTop: `1 solid ${slate200}`, paddingTop: 7 },
    footerRow: { flexDirection: 'row', justifyContent: 'space-between' },
    footerText: { fontSize: 7, color: slate400 },
  });
}

// ── Dokument ───────────────────────────────────────────────────────────
interface Props {
  lead: Lead;
  company: CompanySettings;
}

export default function CalculationPdfDocument({ lead, company }: Props) {
  const today = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });
  const primary = company.primaryColor || '#1A3A5C';
  const accent = company.accentColor || '#F5A623';
  const s = getStyles(primary, accent);

  // ── Eingabewerte ─────────────────────────────────────────────────────
  const roofArea = lead.roof_area_measured ?? lead.roof_area ?? 50;
  const orientation = lead.roof_orientation || 'S';
  const roofTilt = lead.roof_tilt ?? 30;
  const shading = lead.shading || 'none';
  const consumption = lead.consumption ?? 4000;
  const electricityPrice = lead.electricity_price ?? 0.32;
  const hasBattery = lead.has_battery ?? false;
  const storageKwh = hasBattery ? 10 : 0;
  const isPreConstruction = lead.construction_year === 'pre1980';

  // ── Faktoren ─────────────────────────────────────────────────────────
  const orientationFactor = ORIENTATION_FACTOR[orientation] ?? 1.0;
  const roofAngleFactor = getRoofAngleFactor(roofTilt);
  const shadingFactor = getShadingFactor(shading);
  const irradiation = getIrradiationByZip(lead.zip || '');

  // ── Berechnungen ─────────────────────────────────────────────────────
  const kwp = Math.round(roofArea * 0.18 * orientationFactor * shadingFactor * 10) / 10;
  const annualYield = Math.round(kwp * irradiation * PERFORMANCE_RATIO * roofAngleFactor);

  const adjustedConsumption = consumption
    + (lead.has_e_car ? 2500 : 0)
    + (lead.has_heat_pump ? 3000 : 0);
  const isCommercial = lead.building_type === 'gewerbe' || lead.building_type === 'firmengebaeude';
  const selfConsumptionRate = isCommercial
    ? (hasBattery ? 0.80 : 0.60)
    : (hasBattery ? 0.65 : 0.30);
  const selfConsumedEnergy = Math.min(Math.round(annualYield * selfConsumptionRate), adjustedConsumption);
  const gridFeedIn = annualYield - selfConsumedEnergy;

  const pvCost = Math.round(kwp * INVEST_PER_KWP);
  const batteryCost = hasBattery ? Math.round(500 * storageKwh + 2000) : 0;
  const batteryReplacementCost = hasBattery ? Math.round(500 * storageKwh + 1000) : 0;
  const constructionCost = isPreConstruction ? CONSTRUCTION_ADDON : 0;
  const grossInvestment = pvCost + batteryCost + constructionCost;
  const grantSavings = getGrantSubsidyTotal(lead.zip || '');
  const effectiveInvestment = Math.max(0, grossInvestment - grantSavings);

  const savingsFromSelfUse = Math.round(selfConsumedEnergy * electricityPrice);
  const savingsFromFeedIn = Math.round(gridFeedIn * FEED_IN_TARIFF);
  const annualSavings = savingsFromSelfUse + savingsFromFeedIn;

  const amortization = annualSavings > 0 ? Math.round(effectiveInvestment / annualSavings) : 0;
  const profit20Years = Math.round(annualSavings * 20 - effectiveInvestment);

  // Realistisch (mit Folgekosten)
  const totalFollowUpCosts = MAINTENANCE_PER_YEAR * 20 + INVERTER_REPLACEMENT_COST + batteryReplacementCost;
  const annualSavingsRealistic = annualSavings - MAINTENANCE_PER_YEAR;
  const profit20Realistic = Math.round(annualSavingsRealistic * 20 - effectiveInvestment
    - INVERTER_REPLACEMENT_COST - batteryReplacementCost);

  return (
    <Document
      title={`Berechnungsnachweis — ${lead.first_name} ${lead.last_name}`}
      author={company.firmenname}
    >
      <Page size="A4" style={s.page}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.companyName}>{company.firmenname}</Text>
            {company.slogan && <Text style={s.companySlogan}>{company.slogan}</Text>}
            {company.adresse && (
              <Text style={{ fontSize: 7.5, color: '#94A3B8', marginTop: 3 }}>
                {company.adresse} · {company.ort}
              </Text>
            )}
          </View>
          <View>
            <Text style={s.docTitleBold}>Berechnungsnachweis</Text>
            <Text style={s.docTitle}>
              Solaranlage für {lead.first_name} {lead.last_name}{'\n'}
              PLZ {lead.zip ?? '—'} · {today}
            </Text>
          </View>
        </View>
        <View style={s.accentBar} />

        {/* Intro */}
        <View style={s.introBox}>
          <Text style={s.introText}>
            Dieses Dokument zeigt transparent, wie Ihr Angebotspreis und Ihre Wirtschaftlichkeitswerte berechnet werden —
            Schritt für Schritt, auf Basis Ihrer persönlichen Angaben. Alle Werte sind Prognosen auf Grundlage von
            Einstrahlungsdaten und Marktpreisen (Stand {today}).
          </Text>
        </View>

        {/* Abschnitt 1: Eingabewerte */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Ihre Eingabewerte</Text>
          <View style={s.sectionBody}>
            <View style={s.inputGrid}>
              <View style={s.inputItem}>
                <Text style={s.inputLabel}>Dachfläche</Text>
                <Text style={s.inputValue}>{fmtNum(roofArea)} m²</Text>
                {lead.roof_area_measured != null && (
                  <Text style={s.inputNote}>Gemessen vor Ort</Text>
                )}
              </View>
              <View style={s.inputItem}>
                <Text style={s.inputLabel}>Ausrichtung</Text>
                <Text style={s.inputValue}>{ORIENTATION_LABEL[orientation] ?? orientation}</Text>
                <Text style={s.inputNote}>Faktor: {fmtDec(orientationFactor)}</Text>
              </View>
              <View style={s.inputItem}>
                <Text style={s.inputLabel}>Dachneigung</Text>
                <Text style={s.inputValue}>{roofTilt}°</Text>
                <Text style={s.inputNote}>Faktor: {fmtDec(roofAngleFactor)} (Optimum: 32°)</Text>
              </View>
              <View style={s.inputItem}>
                <Text style={s.inputLabel}>Verschattung</Text>
                <Text style={s.inputValue}>{getShadingLabel(shading)}</Text>
                <Text style={s.inputNote}>Faktor: {fmtDec(shadingFactor)}</Text>
              </View>
              <View style={s.inputItem}>
                <Text style={s.inputLabel}>Sonneneinstrahlung</Text>
                <Text style={s.inputValue}>{fmtNum(irradiation)} kWh/m²</Text>
                <Text style={s.inputNote}>PLZ {lead.zip ?? '—'} · Jahr</Text>
              </View>
              <View style={s.inputItem}>
                <Text style={s.inputLabel}>Jahresverbrauch</Text>
                <Text style={s.inputValue}>{fmtNum(consumption)} kWh</Text>
                {(lead.has_e_car || lead.has_heat_pump) && (
                  <Text style={s.inputNote}>
                    Angepasst: {fmtNum(adjustedConsumption)} kWh{'\n'}
                    {lead.has_e_car ? '+2.500 E-Auto ' : ''}{lead.has_heat_pump ? '+3.000 WP' : ''}
                  </Text>
                )}
              </View>
              <View style={s.inputItem}>
                <Text style={s.inputLabel}>Strompreis</Text>
                <Text style={s.inputValue}>{fmtDec(electricityPrice)} €/kWh</Text>
              </View>
              <View style={s.inputItem}>
                <Text style={s.inputLabel}>Speicher</Text>
                <Text style={s.inputValue}>{hasBattery ? `${storageKwh} kWh` : 'Keiner'}</Text>
                <Text style={s.inputNote}>Eigenverbrauchsrate: {Math.round(selfConsumptionRate * 100)} %</Text>
              </View>
              <View style={s.inputItem}>
                <Text style={s.inputLabel}>Baujahr</Text>
                <Text style={s.inputValue}>{isPreConstruction ? 'Vor 1980' : 'Ab 1980'}</Text>
                {isPreConstruction && <Text style={s.inputNote}>+ 2.000 € Sanierungszuschlag</Text>}
              </View>
            </View>
          </View>
        </View>

        {/* Abschnitt 2: Systemleistung */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Schritt 1 — Systemleistung (kWp)</Text>
          <View style={s.sectionBody}>
            <View style={s.formula}>
              <Text style={s.formulaText}>
                kWp = Dachfläche × 0,18 (Moduleffizienz) × Ausrichtungsfaktor × Verschattungsfaktor{'\n'}
                kWp = {fmtNum(roofArea)} m² × 0,18 × {fmtDec(orientationFactor)} × {fmtDec(shadingFactor)} = {fmtDec(kwp, 1)} kWp
              </Text>
            </View>
            <View style={s.calcResult}>
              <Text style={s.calcResultLabel}>Systemleistung Ihrer Anlage:</Text>
              <Text style={s.calcResultValue}>{fmtDec(kwp, 1)} kWp</Text>
            </View>
          </View>
        </View>

        {/* Abschnitt 3: Jahresertrag */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Schritt 2 — Jährlicher Solarertrag</Text>
          <View style={s.sectionBody}>
            <View style={s.formula}>
              <Text style={s.formulaText}>
                Jahresertrag = kWp × Einstrahlung (PLZ) × Systemwirkungsgrad × Neigungsfaktor{'\n'}
                Jahresertrag = {fmtDec(kwp, 1)} kWp × {fmtNum(irradiation)} kWh/m²·J × 0,80 × {fmtDec(roofAngleFactor)} = {fmtNum(annualYield)} kWh/Jahr
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
              <View style={s.inputItem}>
                <Text style={s.inputLabel}>Eigenverbrauch ({Math.round(selfConsumptionRate * 100)} %)</Text>
                <Text style={s.inputValue}>{fmtNum(selfConsumedEnergy)} kWh</Text>
                <Text style={s.inputNote}>Wird direkt genutzt</Text>
              </View>
              <View style={s.inputItem}>
                <Text style={s.inputLabel}>Netzeinspeisung</Text>
                <Text style={s.inputValue}>{fmtNum(gridFeedIn)} kWh</Text>
                <Text style={s.inputNote}>EEG-Vergütung: 0,082 €/kWh</Text>
              </View>
              <View style={s.inputItem}>
                <Text style={s.inputLabel}>Gesamt Jahresertrag</Text>
                <Text style={s.inputValue}>{fmtNum(annualYield)} kWh</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Abschnitt 4: Investition */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Schritt 3 — Investitionsaufschlüsselung</Text>
          <View style={s.sectionBody}>
            <View style={s.table}>
              <View style={s.tRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.tLabel}>Photovoltaikanlage</Text>
                  <Text style={s.tNote}>{fmtDec(kwp, 1)} kWp × 1.800 €/kWp</Text>
                </View>
                <Text style={s.tValue}>{fmtEUR(pvCost)}</Text>
              </View>
              {hasBattery && (
                <View style={s.tRowAlt}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.tLabel}>Batteriespeicher ({storageKwh} kWh)</Text>
                    <Text style={s.tNote}>500 € × {storageKwh} kWh + 2.000 € Basis</Text>
                  </View>
                  <Text style={s.tValue}>{fmtEUR(batteryCost)}</Text>
                </View>
              )}
              {isPreConstruction && (
                <View style={s.tRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.tLabel}>Altbau-Sanierungszuschlag</Text>
                    <Text style={s.tNote}>Baujahr vor 1980</Text>
                  </View>
                  <Text style={s.tValue}>{fmtEUR(CONSTRUCTION_ADDON)}</Text>
                </View>
              )}
              <View style={{ flexDirection: 'row', paddingVertical: 6, borderTop: `1 solid #E2E8F0`, marginTop: 2 }}>
                <Text style={[s.tLabel, { fontFamily: 'Helvetica-Bold' }]}>Bruttoinvestition gesamt</Text>
                <Text style={[s.tValue, { fontSize: 9 }]}>{fmtEUR(grossInvestment)}</Text>
              </View>
              {grantSavings > 0 && (
                <View style={s.tRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.tLabel, { color: '#16A34A' }]}>Abzgl. Förderungen (PLZ {lead.zip ?? '—'})</Text>
                    <Text style={s.tNote}>Lokale Förderprogramme, KfW, Bundesförderung</Text>
                  </View>
                  <Text style={[s.tValue, { color: '#16A34A' }]}>− {fmtEUR(grantSavings)}</Text>
                </View>
              )}
              <View style={s.tRowTotal}>
                <Text style={s.tLabelTotal}>Effektive Investition (nach Förderung)</Text>
                <Text style={s.tValueTotal}>{fmtEUR(effectiveInvestment)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Abschnitt 5: Jährliche Ersparnis */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Schritt 4 — Jährliche Ersparnis</Text>
          <View style={s.sectionBody}>
            <View style={s.formula}>
              <Text style={s.formulaText}>
                Ersparnis = Eigenverbrauch × Strompreis  +  Einspeisung × EEG-Vergütung{'\n'}
                Ersparnis = {fmtNum(selfConsumedEnergy)} kWh × {fmtDec(electricityPrice)} €  +  {fmtNum(gridFeedIn)} kWh × 0,082 €
              </Text>
            </View>
            <View style={s.table}>
              <View style={s.tRow}>
                <Text style={s.tLabel}>Eigenverbrauch ({fmtNum(selfConsumedEnergy)} kWh × {fmtDec(electricityPrice)} €/kWh)</Text>
                <Text style={s.tValue}>{fmtEUR(savingsFromSelfUse)}</Text>
              </View>
              <View style={s.tRowAlt}>
                <Text style={s.tLabel}>Einspeisung ({fmtNum(gridFeedIn)} kWh × 0,082 €/kWh EEG)</Text>
                <Text style={s.tValue}>{fmtEUR(savingsFromFeedIn)}</Text>
              </View>
              <View style={s.tRowTotal}>
                <Text style={s.tLabelTotal}>Jährliche Gesamtersparnis</Text>
                <Text style={s.tValueTotal}>{fmtEUR(annualSavings)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Abschnitt 6: Wirtschaftlichkeit */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Schritt 5 — Wirtschaftlichkeit auf 20 Jahre</Text>
          <View style={s.sectionBody}>
            <View style={s.formula}>
              <Text style={s.formulaText}>
                Amortisation = Effektive Investition ÷ Jährliche Ersparnis  =  {fmtEUR(effectiveInvestment)} ÷ {fmtEUR(annualSavings)}/Jahr{'\n'}
                Gewinn 20 J. = Ersparnis × 20 − Investition  =  {fmtEUR(annualSavings)} × 20 − {fmtEUR(effectiveInvestment)}
              </Text>
            </View>

            {/* KPI-Kacheln: Optimistisch */}
            <Text style={{ fontSize: 7.5, color: '#64748B', marginBottom: 5, marginTop: 4 }}>
              Optimistisch (ohne Folgekosten):
            </Text>
            <View style={s.kpiGrid}>
              <View style={s.kpiBox}>
                <Text style={s.kpiLabel}>Amortisation</Text>
                <Text style={s.kpiValue}>~ {amortization} Jahre</Text>
              </View>
              <View style={s.kpiBoxGreen}>
                <Text style={s.kpiLabel}>Gewinn nach 20 Jahren</Text>
                <Text style={s.kpiValueGreen}>{fmtEUR(profit20Years)}</Text>
              </View>
              <View style={s.kpiBox}>
                <Text style={s.kpiLabel}>Autarkiegrad</Text>
                <Text style={s.kpiValue}>{lead.autarky ?? Math.min(100, Math.round((selfConsumedEnergy / adjustedConsumption) * 100))} %</Text>
              </View>
              <View style={s.kpiBox}>
                <Text style={s.kpiLabel}>Ersparnis / Jahr</Text>
                <Text style={s.kpiValue}>{fmtEUR(annualSavings)}</Text>
              </View>
            </View>

            {/* KPI-Kacheln: Realistisch */}
            <Text style={{ fontSize: 7.5, color: '#64748B', marginBottom: 5, marginTop: 10 }}>
              Realistisch (inkl. Wartung {fmtEUR(MAINTENANCE_PER_YEAR)}/Jahr, WR-Tausch Jahr {INVERTER_REPLACEMENT_YEAR} {fmtEUR(INVERTER_REPLACEMENT_COST)}{hasBattery ? `, Speicher-Tausch ${fmtEUR(batteryReplacementCost)}` : ''}):
            </Text>
            <View style={s.kpiGrid}>
              <View style={s.kpiBox}>
                <Text style={s.kpiLabel}>Folgekosten gesamt</Text>
                <Text style={s.kpiValue}>{fmtEUR(totalFollowUpCosts)}</Text>
                <Text style={s.kpiNote}>Über 20 Jahre</Text>
              </View>
              <View style={s.kpiBox}>
                <Text style={s.kpiLabel}>Netto-Ersparnis / Jahr</Text>
                <Text style={s.kpiValue}>{fmtEUR(annualSavingsRealistic)}</Text>
                <Text style={s.kpiNote}>Nach Wartung</Text>
              </View>
              <View style={profit20Realistic > 0 ? s.kpiBoxGreen : s.kpiBox}>
                <Text style={s.kpiLabel}>Realer Gewinn 20 J.</Text>
                <Text style={profit20Realistic > 0 ? s.kpiValueGreen : s.kpiValue}>{fmtEUR(profit20Realistic)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={s.disclaimer}>
          <Text style={s.disclaimerTitle}>Hinweise zur Berechnungsgrundlage</Text>
          <Text style={s.disclaimerText}>
            Systemwirkungsgrad inkl. Wechselrichterverluste: 80 % · EEG-Einspeisevergütung: 0,082 €/kWh (Stand 2024, &lt;10 kWp) ·
            Modulkosten: 1.800 €/kWp (Marktdurchschnitt DE) · Sonneneinstrahlungsdaten: regionaler Jahresmittelwert (PLZ-Datenbank) ·
            Eigenverbrauchsrate: {hasBattery ? '65 % mit Speicher' : '30 % ohne Speicher'} (Einfamilienhaus){'\n'}
            Tatsächliche Erträge können je nach Wetterjahr, Modulalterung (ca. 0,5 %/Jahr), Netzausfällen und Strompreisentwicklung abweichen.
            Dieses Dokument ersetzt keine individuell berechnete Wirtschaftlichkeitsstudie nach VDI 6025.
          </Text>
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <View style={s.footerRow}>
            <Text style={s.footerText}>{company.firmenname} · {company.adresse} · {company.ort}</Text>
            <Text style={s.footerText}>Berechnungsnachweis · {lead.first_name} {lead.last_name} · {today}</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
}
