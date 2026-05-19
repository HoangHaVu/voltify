import {
  Document, Page, View, Text, StyleSheet, Image,
} from '@react-pdf/renderer';
import type { Lead } from '../../services/data';

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
  invoiceNumber: string;
  type: 1 | 2 | 3;
}

const BASE = {
  green: '#16A34A',
  red: '#DC2626',
  slate50: '#F8FAFC',
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',
  slate400: '#94A3B8',
  slate500: '#64748B',
  slate700: '#334155',
  white: '#FFFFFF',
};

function getStyles(primary: string, accent: string) {
  return StyleSheet.create({
    page: { fontFamily: 'Helvetica', fontSize: 9, color: BASE.slate700, padding: 32 },

    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    headerLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
    headerRight: { alignItems: 'flex-end' },
    companyName: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: primary },
    companySlogan: { fontSize: 8, color: BASE.slate400, marginTop: 2 },
    companyDetails: { fontSize: 8, color: BASE.slate500, marginTop: 4, lineHeight: 1.4 },

    invoiceMeta: { fontSize: 8, color: BASE.slate500, textAlign: 'right', lineHeight: 1.5 },
    invoiceNumber: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: primary },
    invoiceType: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: accent, marginTop: 2 },

    accentBar: { height: 3, backgroundColor: accent, marginBottom: 16 },

    section: { marginBottom: 14 },
    sectionTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: accent, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },

    row: { flexDirection: 'row', gap: 16 },
    col: { flex: 1 },

    box: { backgroundColor: BASE.slate50, borderRadius: 4, border: `1 solid ${BASE.slate200}`, padding: 10 },
    boxLabel: { fontSize: 7, color: BASE.slate400, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
    boxValue: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: primary },
    boxValueSmall: { fontSize: 8, color: BASE.slate500, marginTop: 1 },

    statusBadge: { fontSize: 8, fontFamily: 'Helvetica-Bold', padding: '3 8', borderRadius: 4, marginTop: 6, alignSelf: 'flex-start' },
    statusPaid: { backgroundColor: '#DCFCE7', color: BASE.green },
    statusOpen: { backgroundColor: '#FEE2E2', color: BASE.red },

    table: { marginTop: 4 },
    tableHeader: { flexDirection: 'row', backgroundColor: primary, padding: '6 10', borderRadius: '4 4 0 0' },
    tableHeaderCell: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: BASE.white, flex: 1 },
    tableHeaderCellRight: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: BASE.white, textAlign: 'right', width: 80 },
    tableRow: { flexDirection: 'row', padding: '6 10', borderBottom: `1 solid ${BASE.slate200}` },
    tableCell: { fontSize: 8, color: BASE.slate700, flex: 1 },
    tableCellRight: { fontSize: 8, color: BASE.slate700, textAlign: 'right', width: 80, fontFamily: 'Helvetica-Bold' },

    totalRow: { flexDirection: 'row', justifyContent: 'flex-end', padding: '8 10', backgroundColor: BASE.slate50, borderRadius: '0 0 4 4' },
    totalLabel: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: primary },
    totalValue: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: accent, marginLeft: 12 },
    totalValueBig: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: primary, marginLeft: 12 },

    summaryBox: { backgroundColor: primary, borderRadius: 4, padding: 12, marginTop: 8, marginBottom: 8 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    summaryLabel: { fontSize: 8, color: BASE.slate400 },
    summaryValue: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: BASE.white },
    summaryTotal: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, paddingTop: 6, borderTop: `1 solid ${BASE.slate400}` },
    summaryTotalLabel: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: BASE.white },
    summaryTotalValue: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: accent },

    terms: { marginTop: 6, padding: 10, backgroundColor: BASE.slate50, borderRadius: 4 },
    termsTitle: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: primary, marginBottom: 4 },
    termsText: { fontSize: 7, color: BASE.slate500, lineHeight: 1.5 },

    footer: { position: 'absolute', bottom: 24, left: 32, right: 32, borderTop: `1 solid ${BASE.slate200}`, paddingTop: 8 },
    footerRow: { flexDirection: 'row', justifyContent: 'space-between' },
    footerText: { fontSize: 7, color: BASE.slate400 },

    stamp: { position: 'absolute', top: 120, right: 40, transform: 'rotate(-15deg)', border: `2 solid ${BASE.green}`, borderRadius: 4, padding: '6 12', opacity: 0.3 },
    stampText: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: BASE.green, textTransform: 'uppercase' },
  });
}

function fmtEUR(n: number | null | undefined): string {
  if (n == null) return '—';
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

const INVOICE_TYPE_LABEL: Record<number, string> = {
  1: 'Anzahlung (30%)',
  2: 'Zwischenzahlung (60%)',
  3: 'Schlussrechnung (10%)',
};

const INVOICE_DESC: Record<number, string> = {
  1: 'Anzahlung für Photovoltaikanlage — Auftragserteilung',
  2: 'Zwischenzahlung für Photovoltaikanlage — nach Montage',
  3: 'Schlussrechnung für Photovoltaikanlage — nach Abnahme',
};

export default function InvoicePdfDocument({ lead, company, invoiceNumber, type }: Props) {
  const today = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });

  const primary = company.primaryColor || '#1A3A5C';
  const accent = company.accentColor || '#F5A623';
  const s = getStyles(primary, accent);

  const totalNet = lead.final_price ?? lead.investment ?? 0;
  const percentages = { 1: 0.30, 2: 0.60, 3: 0.10 };
  const invoiceNet = Math.round(totalNet * percentages[type]);
  const invoiceMwst = 0;
  const invoiceBrutto = invoiceNet;

  const isPaid = type === 1 ? lead.payment_1_paid : type === 2 ? lead.payment_2_paid : lead.payment_3_paid;

  const faelligDatum = (() => {
    const d = new Date();
    d.setDate(d.getDate() + parseInt(company.zahlungsziel || '14', 10));
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });
  })();

  return (
    <Document title={`Rechnung ${invoiceNumber} — ${company.firmenname}`} author={company.firmenname}>
      <Page size="A4" style={s.page}>

        {/* Header */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            {company.logoDataUrl ? (
              <Image src={company.logoDataUrl} style={{ width: 40, height: 40, borderRadius: 6 }} />
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
            <Text style={s.invoiceNumber}>{invoiceNumber}</Text>
            <Text style={s.invoiceType}>{INVOICE_TYPE_LABEL[type]}</Text>
            <Text style={s.invoiceMeta}>
              Datum: {today}{'\n'}
              Fällig: {faelligDatum}{'\n'}
              Kunde: {lead.first_name} {lead.last_name}
            </Text>
          </View>
        </View>
        <View style={s.accentBar} />

        {/* Paid stamp */}
        {isPaid && (
          <View style={s.stamp}>
            <Text style={s.stampText}>Bezahlt</Text>
          </View>
        )}

        {/* Customer & Project Info */}
        <View style={s.section}>
          <View style={s.row}>
            <View style={s.col}>
              <Text style={s.sectionTitle}>Rechnungsempfänger</Text>
              <View style={s.box}>
                <Text style={s.boxValue}>{lead.first_name} {lead.last_name}</Text>
                {lead.zip && <Text style={s.boxValueSmall}>{lead.zip}</Text>}
                {lead.email && <Text style={s.boxValueSmall}>{lead.email}</Text>}
                {lead.phone && <Text style={s.boxValueSmall}>{lead.phone}</Text>}
                <View style={[s.statusBadge, isPaid ? s.statusPaid : s.statusOpen]}>
                  <Text>{isPaid ? '✓ Bezahlt' : '○ Offen'}</Text>
                </View>
              </View>
            </View>
            <View style={s.col}>
              <Text style={s.sectionTitle}>Projekt</Text>
              <View style={s.box}>
                <Text style={s.boxValue}>Photovoltaikanlage</Text>
                {lead.kwp != null && (
                  <Text style={s.boxValueSmall}>Anlagenleistung: {lead.kwp} kWp</Text>
                )}
                {lead.roof_area != null && (
                  <Text style={s.boxValueSmall}>Dachfläche: {lead.roof_area} m²</Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Invoice Items */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Rechnungspositionen</Text>
          <View style={s.table}>
            <View style={s.tableHeader}>
              <Text style={s.tableHeaderCell}>Position</Text>
              <Text style={s.tableHeaderCellRight}>Betrag</Text>
            </View>

            <View style={s.tableRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.tableCell}>{INVOICE_DESC[type]}</Text>
                <Text style={{ fontSize: 7, color: BASE.slate400, marginTop: 1 }}>
                  Gesamtprojektwert: {fmtEUR(totalNet)} · Abschlag: {type === 1 ? '30%' : type === 2 ? '60%' : '10%'}
                </Text>
              </View>
              <Text style={s.tableCellRight}>{fmtEUR(invoiceNet)}</Text>
            </View>

            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Nettobetrag</Text>
              <Text style={s.totalValue}>{fmtEUR(invoiceNet)}</Text>
            </View>
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>MwSt. (0% — § 12 Abs. 3 UStG, PV-Anlage)</Text>
              <Text style={s.totalValue}>{fmtEUR(invoiceMwst)}</Text>
            </View>
            <View style={[s.totalRow, { backgroundColor: primary, borderRadius: 4, marginTop: 4 }]}>
              <Text style={[s.totalLabel, { color: BASE.white }]}>Rechnungsbetrag brutto</Text>
              <Text style={[s.totalValueBig, { color: accent }]}>{fmtEUR(invoiceBrutto)}</Text>
            </View>
          </View>
        </View>

        {/* Payment Summary */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Zahlungsübersicht</Text>
          <View style={s.summaryBox}>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Anzahlung (30%)</Text>
              <Text style={s.summaryValue}>{fmtEUR(Math.round(totalNet * 0.30))} {lead.payment_1_paid ? '✓' : ''}</Text>
            </View>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Zwischenzahlung (60%)</Text>
              <Text style={s.summaryValue}>{fmtEUR(Math.round(totalNet * 0.60))} {lead.payment_2_paid ? '✓' : ''}</Text>
            </View>
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Schlussrechnung (10%)</Text>
              <Text style={s.summaryValue}>{fmtEUR(Math.round(totalNet * 0.10))} {lead.payment_3_paid ? '✓' : ''}</Text>
            </View>
            <View style={s.summaryTotal}>
              <Text style={s.summaryTotalLabel}>Gesamtsumme</Text>
              <Text style={s.summaryTotalValue}>{fmtEUR(totalNet)}</Text>
            </View>
          </View>
        </View>

        {/* Terms */}
        <View style={s.terms}>
          <Text style={s.termsTitle}>Zahlungsbedingungen</Text>
          <Text style={s.termsText}>
            Zahlungsziel: {company.zahlungsziel || '14'} Tage nach Rechnungsdatum ohne Abzug.{'\n'}
            Fällig am: {faelligDatum}{'\n'}
            Bitte überweisen Sie den Betrag auf folgendes Konto:{'\n'}
            {company.iban && `IBAN: ${company.iban}\n`}
            Verwendungszweck: {invoiceNumber}{'\n'}
            {company.geschaeftsfuehrer && `Geschäftsführer: ${company.geschaeftsfuehrer}\n`}
            MwSt.-Befreiung gemäß § 12 Abs. 3 UStG für Lieferung und Montage von Photovoltaikanlagen.{'\n'}
            Diese Rechnung wurde maschinell erstellt und ist ohne Unterschrift gültig.
          </Text>
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <View style={s.footerRow}>
            <Text style={s.footerText}>{company.firmenname} · {company.adresse} · {company.ort}</Text>
            <Text style={s.footerText}>Seite 1 von 1 · {today}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
