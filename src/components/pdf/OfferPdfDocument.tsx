import {
  Document, Page, View, Text, StyleSheet, Image,
} from '@react-pdf/renderer';
import type { Lead } from '../../services/data';

// ── Types ──
interface CompanySettings {
  firmenname: string;
  slogan: string;
  logoDataUrl: string;
  primaryColor: string;
  accentColor: string;
  iban: string;
  zahlungsziel: string;
  steuernummer: string;
  adresse: string;
  ort: string;
  geschaeftsfuehrer: string;
  rechnungskreis: string;
  panelHersteller?: string;
  wechselrichterHersteller?: string;
}

interface Props {
  lead: Lead;
  company: CompanySettings;
  offerNumber: string;
  signaturePng?: string;
  planningPng?: string;
}

// ── Base colors (neutral) ──
const BASE = {
  green: '#16A34A',
  amber200: '#FDE68A',
  amber700: '#B45309',
  slate50: '#F8FAFC',
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',
  slate400: '#94A3B8',
  slate500: '#64748B',
  slate600: '#475569',
  slate700: '#334155',
  white: '#FFFFFF',
};

// ── Dynamic Styles Factory ──
function getStyles(primary: string, accent: string) {
  return StyleSheet.create({
    page: { fontFamily: 'Helvetica', fontSize: 9, color: BASE.slate700, padding: 32 },

    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    headerLeft: { flex: 1 },
    headerRight: { alignItems: 'flex-end' },
    companyName: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: primary },
    companySlogan: { fontSize: 8, color: BASE.slate400, marginTop: 2 },
    companyDetails: { fontSize: 8, color: BASE.slate500, marginTop: 4, lineHeight: 1.4 },
    offerMeta: { fontSize: 8, color: BASE.slate500, textAlign: 'right', lineHeight: 1.5 },
    offerNumber: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: primary },

    accentBar: { height: 3, backgroundColor: accent, marginBottom: 20 },

    section: { marginBottom: 16 },
    sectionTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: accent, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },

    row: { flexDirection: 'row', gap: 16 },
    col: { flex: 1 },

    box: { backgroundColor: BASE.slate50, borderRadius: 4, border: `1 solid ${BASE.slate200}`, padding: 10 },
    boxLabel: { fontSize: 7, color: BASE.slate400, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
    boxValue: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: primary },
    boxValueSmall: { fontSize: 8, color: BASE.slate500, marginTop: 1 },

    table: { marginTop: 4 },
    tableHeader: { flexDirection: 'row', backgroundColor: primary, padding: '6 10', borderRadius: '4 4 0 0' },
    tableHeaderCell: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: BASE.white, flex: 1 },
    tableHeaderCellRight: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: BASE.white, textAlign: 'right', width: 80 },
    tableRow: { flexDirection: 'row', padding: '6 10', borderBottom: `1 solid ${BASE.slate200}` },
    tableRowAlt: { flexDirection: 'row', padding: '6 10', borderBottom: `1 solid ${BASE.slate200}`, backgroundColor: BASE.slate50 },
    tableCell: { fontSize: 8, color: BASE.slate700, flex: 1 },
    tableCellRight: { fontSize: 8, color: BASE.slate700, textAlign: 'right', width: 80, fontFamily: 'Helvetica-Bold' },
    tableCellNote: { fontSize: 7, color: BASE.slate400, flex: 1, marginTop: 1 },

    totalRow: { flexDirection: 'row', justifyContent: 'flex-end', padding: '8 10', backgroundColor: BASE.slate50, borderRadius: '0 0 4 4', marginTop: -1 },
    totalLabel: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: primary },
    totalValue: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: accent, marginLeft: 12 },

    metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
    metricBox: { width: '23%', backgroundColor: BASE.slate50, border: `1 solid ${BASE.slate200}`, borderRadius: 4, padding: 8 },
    metricLabel: { fontSize: 7, color: BASE.slate400, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
    metricValue: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: primary },

    terms: { marginTop: 8, padding: 10, backgroundColor: BASE.slate50, borderRadius: 4 },
    termsTitle: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: primary, marginBottom: 4 },
    termsText: { fontSize: 7, color: BASE.slate500, lineHeight: 1.5 },

    footer: { position: 'absolute', bottom: 24, left: 32, right: 32, borderTop: `1 solid ${BASE.slate200}`, paddingTop: 8 },
    footerRow: { flexDirection: 'row', justifyContent: 'space-between' },
    footerText: { fontSize: 7, color: BASE.slate400 },

    signatureRow: { flexDirection: 'row', gap: 24, marginTop: 20 },
    signatureBox: { flex: 1 },
    signatureLine: { borderBottom: `1 solid ${BASE.slate200}`, paddingBottom: 24, marginBottom: 4 },
    signatureLabel: { fontSize: 8, color: BASE.slate500 },
    signatureImage: { width: 120, height: 40, objectFit: 'contain', marginBottom: 4 },

    lifecycleBox: { marginTop: 16, padding: 12, backgroundColor: '#FEF3C7', borderRadius: 6, border: `1 solid ${BASE.amber200}` },
    lifecycleTitle: { fontSize: 9, fontWeight: 'bold', color: BASE.amber700, marginBottom: 6 },
    lifecycleText: { fontSize: 7.5, color: BASE.slate600, lineHeight: 1.4 },

    // Variant comparison table styles
    variantPage: { padding: 32, paddingTop: 28 },
    variantTitle: { fontSize: 16, fontWeight: 'black', color: BASE.slate700, marginBottom: 4 },
    variantSubtitle: { fontSize: 8, color: BASE.slate500, marginBottom: 20 },
    variantTable: { width: '100%', border: `1 solid ${BASE.slate200}`, borderRadius: 6, overflow: 'hidden' },
    variantHeaderRow: { flexDirection: 'row', backgroundColor: BASE.slate100, borderBottom: `1 solid ${BASE.slate200}` },
    variantHeaderCell: { flex: 1, padding: 8, fontSize: 8, fontWeight: 'bold', color: BASE.slate700, textAlign: 'center' as const },
    variantHeaderCellFirst: { width: 120, padding: 8, fontSize: 8, fontWeight: 'bold', color: BASE.slate500, borderRight: `1 solid ${BASE.slate200}` },
    variantRow: { flexDirection: 'row', borderBottom: `1 solid ${BASE.slate100}` },
    variantRowLast: { flexDirection: 'row' },
    variantCellFirst: { width: 120, padding: 8, fontSize: 8, color: BASE.slate500, borderRight: `1 solid ${BASE.slate200}`, backgroundColor: BASE.slate50 },
    variantCell: { flex: 1, padding: 8, fontSize: 8, color: BASE.slate700, textAlign: 'center' as const },
    variantCellRecommended: { flex: 1, padding: 8, fontSize: 8, color: BASE.slate700, textAlign: 'center' as const, backgroundColor: '#FEF3C7' },
    variantRecommendedBadge: { fontSize: 7, color: BASE.amber700, fontWeight: 'bold', marginTop: 2 },
  });
}

// ── Helpers ──
function fmtEUR(n: number | null | undefined): string {
  if (n == null) return '—';
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

function fmtNum(n: number | null | undefined, suffix = ''): string {
  if (n == null) return '—';
  return n.toLocaleString('de-DE') + suffix;
}

// ── Document ──
export default function OfferPdfDocument({ lead, company, offerNumber, signaturePng, planningPng }: Props) {
  const today = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });
  const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });

  const primary = company.primaryColor || '#1A3A5C';
  const accent = company.accentColor || '#F5A623';
  const s = getStyles(primary, accent);

  const bruttoPrice = lead.investment ?? 0;
  const discountPct = lead.discount_percentage ?? 0;
  const discountAmount = discountPct > 0 ? Math.round(bruttoPrice * (discountPct / 100)) : 0;
  const netPrice = lead.final_price ?? (bruttoPrice - discountAmount);
  const mwst = 0;
  const bruttoTotal = netPrice;

  return (
    <Document title={`Angebot ${offerNumber} — ${company.firmenname}`} author={company.firmenname}>
      <Page size="A4" style={s.page}>

        {/* Header */}
        <View style={s.header}>
          <View style={[s.headerLeft, { flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
            {company.logoDataUrl ? (
              <Image src={company.logoDataUrl} style={{ width: 48, height: 48, borderRadius: 6 }} />
            ) : null}
            <View>
              <Text style={s.companyName}>{company.firmenname}</Text>
              {company.slogan && <Text style={s.companySlogan}>{company.slogan}</Text>}
              <Text style={s.companyDetails}>
                {company.adresse && `${company.adresse}\n`}
                {company.ort && `${company.ort}\n`}
                {company.steuernummer && `Steuernr.: ${company.steuernummer}\n`}
                {company.iban && `IBAN: ${company.iban}`}
              </Text>
            </View>
          </View>
          <View style={s.headerRight}>
            <Text style={s.offerNumber}>{offerNumber}</Text>
            <Text style={s.offerMeta}>
              Datum: {today}{'\n'}
              Gültig bis: {validUntil}{'\n'}
              Kunde: {lead.first_name} {lead.last_name}
            </Text>
          </View>
        </View>
        <View style={s.accentBar} />

        {/* Customer & Project Info */}
        <View style={s.section}>
          <View style={s.row}>
            <View style={s.col}>
              <Text style={s.sectionTitle}>Kundendaten</Text>
              <View style={s.box}>
                <Text style={s.boxValue}>{lead.first_name} {lead.last_name}</Text>
                {lead.zip && <Text style={s.boxValueSmall}>{lead.zip}</Text>}
                {lead.email && <Text style={s.boxValueSmall}>{lead.email}</Text>}
                {lead.phone && <Text style={s.boxValueSmall}>{lead.phone}</Text>}
              </View>
            </View>
            <View style={s.col}>
              <Text style={s.sectionTitle}>Projektdetails</Text>
              <View style={s.box}>
                <Text style={s.boxValue}>Photovoltaikanlage</Text>
                {lead.kwp != null && (
                  <Text style={s.boxValueSmall}>Anlagenleistung: {lead.kwp} kWp</Text>
                )}
                {lead.roof_area != null && (
                  <Text style={s.boxValueSmall}>Dachfläche: {lead.roof_area} m²</Text>
                )}
                {lead.roof_orientation && (
                  <Text style={s.boxValueSmall}>Ausrichtung: {lead.roof_orientation}</Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Configuration Table */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Anlagenkonfiguration</Text>
          <View style={s.table}>
            <View style={s.tableHeader}>
              <Text style={s.tableHeaderCell}>Position</Text>
              <Text style={s.tableHeaderCellRight}>Preis</Text>
            </View>

            {/* PV-Anlage */}
            <View style={s.tableRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.tableCell}>Photovoltaikanlage</Text>
                <Text style={s.tableCellNote}>
                  {lead.kwp ? `${lead.kwp} kWp` : 'Leistung auf Anfrage'}
                  {lead.roof_area ? ` · ${lead.roof_area} m² Dachfläche` : ''}
                  {company.panelHersteller ? ` · Module: ${company.panelHersteller.split(',')[0].trim()}` : ''}
                  {company.wechselrichterHersteller ? ` · Wechselrichter: ${company.wechselrichterHersteller.split(',')[0].trim()}` : ''}
                </Text>
              </View>
              <Text style={s.tableCellRight}>{fmtEUR(bruttoPrice)}</Text>
            </View>

            {/* Speicher */}
            {lead.has_battery && (
              <View style={s.tableRowAlt}>
                <View style={{ flex: 1 }}>
                  <Text style={s.tableCell}>Batteriespeicher</Text>
                  <Text style={s.tableCellNote}>Inkl. Energiemanagement-System</Text>
                </View>
                <Text style={s.tableCellRight}>im Preis enthalten</Text>
              </View>
            )}

            {/* Wallbox / E-Auto */}
            {lead.has_e_car && (
              <View style={s.tableRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.tableCell}>Wallbox-Vorbereitung</Text>
                  <Text style={s.tableCellNote}>Für E-Auto-Ladung</Text>
                </View>
                <Text style={s.tableCellRight}>im Preis enthalten</Text>
              </View>
            )}

            {/* Wärmepumpe */}
            {lead.has_heat_pump && (
              <View style={s.tableRowAlt}>
                <View style={{ flex: 1 }}>
                  <Text style={s.tableCell}>Wärmepumpen-Integration</Text>
                  <Text style={s.tableCellNote}>PV-Überschusssteuerung</Text>
                </View>
                <Text style={s.tableCellRight}>im Preis enthalten</Text>
              </View>
            )}

            {/* Rabatt */}
            {discountAmount > 0 && (
              <View style={s.tableRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[s.tableCell, { color: BASE.green }]}>Rabatt ({discountPct}%)</Text>
                  {lead.discount_code && (
                    <Text style={s.tableCellNote}>Code: {lead.discount_code}</Text>
                  )}
                </View>
                <Text style={[s.tableCellRight, { color: BASE.green }]}>− {fmtEUR(discountAmount)}</Text>
              </View>
            )}

            {/* Netto */}
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Nettobetrag</Text>
              <Text style={s.totalValue}>{fmtEUR(netPrice)}</Text>
            </View>
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>MwSt. (0% — § 12 Abs. 3 UStG, PV-Anlage)</Text>
              <Text style={s.totalValue}>{fmtEUR(mwst)}</Text>
            </View>
            <View style={[s.totalRow, { backgroundColor: primary, borderRadius: 4, marginTop: 4 }]}>
              <Text style={[s.totalLabel, { color: BASE.white }]}>Gesamtbetrag brutto</Text>
              <Text style={[s.totalValue, { color: accent }]}>{fmtEUR(bruttoTotal)}</Text>
            </View>
          </View>
        </View>

        {/* ROI Highlights */}
        {(lead.annual_savings || lead.amortization || lead.autarky || lead.profit_20_years) && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Ihre Vorteile auf einen Blick</Text>
            <View style={s.metricGrid}>
              {lead.annual_savings != null && (
                <View style={s.metricBox}>
                  <Text style={s.metricLabel}>Jährliche Ersparnis</Text>
                  <Text style={s.metricValue}>{fmtEUR(lead.annual_savings)}</Text>
                </View>
              )}
              {lead.amortization != null && (
                <View style={s.metricBox}>
                  <Text style={s.metricLabel}>Amortisation</Text>
                  <Text style={s.metricValue}>~ {lead.amortization} Jahre</Text>
                </View>
              )}
              {lead.autarky != null && (
                <View style={s.metricBox}>
                  <Text style={s.metricLabel}>Autarkiegrad</Text>
                  <Text style={s.metricValue}>{lead.autarky}%</Text>
                </View>
              )}
              {lead.profit_20_years != null && (
                <View style={s.metricBox}>
                  <Text style={s.metricLabel}>Gewinn 20 J.</Text>
                  <Text style={s.metricValue}>{fmtEUR(lead.profit_20_years)}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Terms */}
        <View style={s.terms}>
          <Text style={s.termsTitle}>Zahlungsbedingungen & Hinweise</Text>
          <Text style={s.termsText}>
            Zahlungsziel: {company.zahlungsziel || '14'} Tage nach Rechnungsstellung ohne Abzug.{'\n'}
            Die Liefer- und Leistungsfrist beginnt mit Zahlungseingang der Anzahlung.{'\n'}
            {company.geschaeftsfuehrer && `Geschäftsführer: ${company.geschaeftsfuehrer}\n`}
            Dieses Angebot ist unverbindlich und freibleibend. Die angegebenen Werte sind Prognosen auf Basis von Einstrahlungsdaten und Standardannahmen.{'\n'}
            Es gelten unsere Allgemeinen Geschäftsbedingungen (AGB), einsehbar unter {company.firmenname.toLowerCase().replace(/\s/g, '')}.de/agb
          </Text>
        </View>

        {/* Lifecycle Costs Disclaimer */}
        <View style={s.lifecycleBox}>
          <Text style={s.lifecycleTitle}>Hinweis zu Folgekosten & Transparenz</Text>
          <Text style={s.lifecycleText}>
            Diese Analyse rechnet ehrlich — die meisten Anbieter verschweigen Folgekosten.{'\n\n'}
            Berücksichtigte Lebenszykluskosten:{'\n'}
            • Wechselrichter-Austausch nach ca. 12 Jahren: ~2.000 €{'\n'}
            {lead.has_battery ? '• Batterie-Austausch nach ca. 12 Jahren: ~6.000 €\n' : ''}
            • Jährliche Wartung & Inspektion: ~200 €/Jahr{'\n\n'}
            Die angegebenen Amortisations- und Gewinnwerte sind Planungswerte auf Basis von Einstrahlungsdaten und Standardannahmen. Tatsächliche Erträge können je nach Wetter, Strompreisentwicklung und technischer Ausfallquote davon abweichen.
          </Text>
        </View>

        {/* Signature */}
        <View style={s.signatureRow}>
          <View style={s.signatureBox}>
            <View style={s.signatureLine} />
            <Text style={s.signatureLabel}>Ort, Datum</Text>
          </View>
          <View style={s.signatureBox}>
            {signaturePng ? (
              <Image src={signaturePng} style={s.signatureImage} />
            ) : (
              <View style={s.signatureLine} />
            )}
            <Text style={s.signatureLabel}>
              {signaturePng ? 'Digital unterschrieben' : 'Unterschrift Kunde'}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <View style={s.footerRow}>
            <Text style={s.footerText}>{company.firmenname} · {company.adresse} · {company.ort}</Text>
            <Text style={s.footerText}>Seite 1 von 1 · {today}</Text>
          </View>
        </View>
      </Page>

      {/* Seite 2: Varianten-Vergleich */}
      {lead.offer_variants && lead.offer_variants.length > 1 && (
        <Page size="A4" style={s.variantPage}>
          <Text style={s.variantTitle}>Angebots-Varianten im Vergleich</Text>
          <Text style={s.variantSubtitle}>Wählen Sie die für Sie passende Konfiguration. Alle Varianten basieren auf Ihren Angaben.</Text>

          <View style={s.variantTable}>
            {/* Header */}
            <View style={s.variantHeaderRow}>
              <View style={s.variantHeaderCellFirst}>
                <Text>Merkmal</Text>
              </View>
              {lead.offer_variants.map((v) => (
                <View key={v.variant_key} style={s.variantHeaderCell}>
                  <Text>{v.label}</Text>
                  {v.is_recommended && <Text style={s.variantRecommendedBadge}>★ Empfohlen</Text>}
                </View>
              ))}
            </View>

            {/* Speicher */}
            <View style={s.variantRow}>
              <View style={s.variantCellFirst}><Text>Speicher</Text></View>
              {lead.offer_variants.map((v) => (
                <View key={v.variant_key} style={v.is_recommended ? s.variantCellRecommended : s.variantCell}>
                  <Text>{v.storage_kwh > 0 ? `${v.storage_kwh} kWh` : 'Keiner'}</Text>
                </View>
              ))}
            </View>

            {/* Wallbox */}
            <View style={s.variantRow}>
              <View style={s.variantCellFirst}><Text>Wallbox</Text></View>
              {lead.offer_variants.map((v) => (
                <View key={v.variant_key} style={v.is_recommended ? s.variantCellRecommended : s.variantCell}>
                  <Text>{v.has_wallbox ? '✓ Inklusive' : '—'}</Text>
                </View>
              ))}
            </View>

            {/* kWp */}
            <View style={s.variantRow}>
              <View style={s.variantCellFirst}><Text>Anlagengröße</Text></View>
              {lead.offer_variants.map((v) => (
                <View key={v.variant_key} style={v.is_recommended ? s.variantCellRecommended : s.variantCell}>
                  <Text>{v.kwp != null ? `${v.kwp} kWp` : '—'}</Text>
                </View>
              ))}
            </View>

            {/* Investition */}
            <View style={s.variantRow}>
              <View style={s.variantCellFirst}><Text>Investition</Text></View>
              {lead.offer_variants.map((v) => (
                <View key={v.variant_key} style={v.is_recommended ? s.variantCellRecommended : s.variantCell}>
                  <Text>{fmtEUR(v.investment)}</Text>
                </View>
              ))}
            </View>

            {/* Ersparnis/Jahr */}
            <View style={s.variantRow}>
              <View style={s.variantCellFirst}><Text>Ersparnis / Jahr</Text></View>
              {lead.offer_variants.map((v) => (
                <View key={v.variant_key} style={v.is_recommended ? s.variantCellRecommended : s.variantCell}>
                  <Text>{fmtEUR(v.annual_savings)}</Text>
                </View>
              ))}
            </View>

            {/* Amortisation */}
            <View style={s.variantRow}>
              <View style={s.variantCellFirst}><Text>Amortisation</Text></View>
              {lead.offer_variants.map((v) => (
                <View key={v.variant_key} style={v.is_recommended ? s.variantCellRecommended : s.variantCell}>
                  <Text>{v.amortization != null ? `${v.amortization} Jahre` : '—'}</Text>
                </View>
              ))}
            </View>

            {/* Autarkie */}
            <View style={s.variantRow}>
              <View style={s.variantCellFirst}><Text>Autarkie</Text></View>
              {lead.offer_variants.map((v) => (
                <View key={v.variant_key} style={v.is_recommended ? s.variantCellRecommended : s.variantCell}>
                  <Text>{v.autarky != null ? `${v.autarky} %` : '—'}</Text>
                </View>
              ))}
            </View>

            {/* Gewinn 20 J. */}
            <View style={s.variantRowLast}>
              <View style={s.variantCellFirst}><Text>Gewinn 20 Jahre</Text></View>
              {lead.offer_variants.map((v) => (
                <View key={v.variant_key} style={v.is_recommended ? s.variantCellRecommended : s.variantCell}>
                  <Text style={{ fontWeight: 'bold' }}>{fmtEUR(v.profit_20_years)}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Hinweis */}
          <View style={{ marginTop: 16, padding: 10, backgroundColor: BASE.slate50, borderRadius: 6 }}>
            <Text style={{ fontSize: 7.5, color: BASE.slate500, lineHeight: 1.4 }}>
              Die Empfehlung basiert auf einer Wirtschaftlichkeitsanalyse unter Berücksichtigung Ihres aktuellen Stromverbrauchs, der Dachfläche und der regionalen Sonneneinstrahlung. Die "Optimal"-Variante bietet in der Regel das beste Preis-Leistungs-Verhältnis.
            </Text>
          </View>

          {/* Footer */}
          <View style={{ ...s.footer, position: 'absolute', bottom: 24, left: 32, right: 32 }}>
            <View style={s.footerRow}>
              <Text style={s.footerText}>{company.firmenname} · {company.adresse} · {company.ort}</Text>
              <Text style={s.footerText}>Seite 2 von 2 · {today}</Text>
            </View>
          </View>
        </Page>
      )}
      {/* Planungs-Seite: Satellitenbild + Modul-Overlay */}
      {planningPng && (
        <Page size="A4" style={s.page}>
          <View style={s.header}>
            <View style={s.headerLeft}>
              <Text style={s.companyName}>{company.firmenname}</Text>
              <Text style={s.companySlogan}>{company.slogan}</Text>
            </View>
            <View style={s.headerRight}>
              <Text style={[s.offerMeta, { fontFamily: 'Helvetica-Bold' }]}>Solar-Planung</Text>
              <Text style={s.offerMeta}>{lead.first_name} {lead.last_name}</Text>
              {lead.zip && <Text style={s.offerMeta}>PLZ {lead.zip}</Text>}
            </View>
          </View>
          <View style={s.accentBar} />

          <Text style={{ fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#1A3A5C', marginBottom: 6 }}>
            Visualisierung Ihrer Solaranlage
          </Text>
          <Text style={{ fontSize: 8, color: BASE.slate400, marginBottom: 14 }}>
            Die folgende Darstellung zeigt eine Übersicht der geplanten Modulanordnung auf Ihrem Dach.
            Die genaue Positionierung erfolgt durch Ihren Installateur vor Ort.
          </Text>

          <Image
            src={planningPng}
            style={{ width: '100%', borderRadius: 6, marginBottom: 10 }}
          />

          {lead.module_layout && (
            <View style={{ flexDirection: 'row', gap: 16, marginTop: 4 }}>
              <Text style={{ fontSize: 8, color: BASE.slate500 }}>
                Adresse: {lead.module_layout.address}
              </Text>
              <Text style={{ fontSize: 8, color: BASE.slate500 }}>
                {lead.module_layout.moduleCount} Module · {lead.module_layout.kwp} kWp
              </Text>
            </View>
          )}

          <View style={s.footer}>
            <View style={s.footerRow}>
              <Text style={s.footerText}>{company.firmenname} · {company.adresse} · {company.ort}</Text>
              <Text style={s.footerText}>{today}</Text>
            </View>
          </View>
        </Page>
      )}
    </Document>
  );
}

export type { CompanySettings };
