import {
  Document, Page, View, Text, StyleSheet,
} from '@react-pdf/renderer';
import type { WizardData } from '../../pages/Configurator';
import type { ExtendedROICalculations } from '../../lib/calculations';
import { NATIONAL_GRANTS, getRegionalGrants, getStateLabel } from '../../data/grants';
import { PDF_BASE } from '../../lib/pdfTheme';

const s = StyleSheet.create(PDF_BASE);

const BUILDING_LABEL: Record<string, string> = {
  einfamilienhaus: 'Einfamilienhaus',
  zweifamilienhaus: 'Zweifamilienhaus',
  mehrfamilienhaus: 'Mehrfamilienhaus',
  firmengebaeude: 'Firmengebäude / Gewerbe',
  sonstiges: 'Sonstiges',
};

const ORIENTATION_LABEL: Record<string, string> = {
  S: 'Süd', SO: 'Süd-Ost', SW: 'Süd-West', O: 'Ost', W: 'West', N: 'Nord',
};

interface Props {
  data: WizardData;
  calc: ExtendedROICalculations;
}

export default function ROIPdfDocument({ data, calc }: Props) {
  const {
    kwp, investment, grantSavings, effectiveInvestment,
    annualSavings, amortization, profit20Years, autarky,
  } = calc;

  const regionalGrants = getRegionalGrants(data.zipCode);
  const stateLabel = getStateLabel(data.zipCode);
  const allGrants = [...regionalGrants, ...NATIONAL_GRANTS];
  const today = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <Document title="Wirtschaftlichkeitsanalyse — Voltify" author="Voltify GmbH">
      <Page size="A4" style={s.page}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Voltify</Text>
            <Text style={s.headerSub}>Persönliche Wirtschaftlichkeitsanalyse</Text>
          </View>
          <View>
            <Text style={s.headerDate}>Erstellt am {today}</Text>
            <Text style={s.headerDate}>PLZ {data.zipCode} — {stateLabel}</Text>
          </View>
        </View>
        <View style={s.accentBar} />

        <View style={s.body}>

          {/* Konfiguration */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>Ihre Konfiguration</Text>
            <View style={s.divider} />
            <View style={s.row}>
              <View style={[s.col, s.configBox]}>
                <View style={s.configRow}>
                  <Text style={s.configLabel}>Gebäudetyp</Text>
                  <Text style={s.configValue}>{BUILDING_LABEL[data.buildingType] || data.buildingType || '-'}</Text>
                </View>
                <View style={s.configRow}>
                  <Text style={s.configLabel}>Eigentumsverhältnis</Text>
                  <Text style={s.configValue}>{data.ownership === 'eigentümer' || data.ownership === 'eigentuemer' ? 'Eigentümer' : 'Mieter'}</Text>
                </View>
                <View style={s.configRow}>
                  <Text style={s.configLabel}>Dachneigung</Text>
                  <Text style={s.configValue}>{data.roofTilt}°</Text>
                </View>
                <View style={[s.configRow, { marginBottom: 0 }]}>
                  <Text style={s.configLabel}>Ausrichtung</Text>
                  <Text style={s.configValue}>{ORIENTATION_LABEL[data.roofOrientation] || data.roofOrientation}</Text>
                </View>
              </View>
              <View style={[s.col, s.configBox]}>
                <View style={s.configRow}>
                  <Text style={s.configLabel}>Nutzbare Dachfläche</Text>
                  <Text style={s.configValue}>{data.roofArea} m²</Text>
                </View>
                <View style={s.configRow}>
                  <Text style={s.configLabel}>Jahresstromverbrauch</Text>
                  <Text style={s.configValue}>{Number(data.consumption).toLocaleString('de-DE')} kWh</Text>
                </View>
                <View style={s.configRow}>
                  <Text style={s.configLabel}>Speichergröße</Text>
                  <Text style={s.configValue}>{data.storageSize} kWh</Text>
                </View>
                <View style={[s.configRow, { marginBottom: 0 }]}>
                  <Text style={s.configLabel}>Verschattung</Text>
                  <Text style={s.configValue}>{data.shading === 'none' ? 'Keine' : data.shading === 'teilweise' ? 'Teilweise' : 'Stark'}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Kennzahlen */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>Ihre Ergebnisse auf einen Blick</Text>
            <View style={s.divider} />
            <View style={s.metricGrid}>
              <View style={s.metricBox}>
                <Text style={s.metricLabel}>Anlagenleistung</Text>
                <Text style={s.metricValue}>{kwp} <Text style={s.metricUnit}>kWp</Text></Text>
              </View>
              <View style={s.metricBox}>
                <Text style={s.metricLabel}>Jahresersparnis</Text>
                <Text style={s.metricValue}>{annualSavings.toLocaleString('de-DE')} <Text style={s.metricUnit}>€</Text></Text>
              </View>
              <View style={s.metricBox}>
                <Text style={s.metricLabel}>Autarkiegrad</Text>
                <Text style={s.metricValue}>{autarky} <Text style={s.metricUnit}>%</Text></Text>
              </View>
              <View style={s.metricBox}>
                <Text style={s.metricLabel}>Investition</Text>
                <Text style={s.metricValue}>{effectiveInvestment.toLocaleString('de-DE')} <Text style={s.metricUnit}>€</Text></Text>
              </View>
              <View style={s.metricBoxHero}>
                <Text style={s.metricLabelHero}>Amortisation</Text>
                <Text style={s.metricValueHero}>~ {amortization} <Text style={s.metricUnitHero}>Jahre</Text></Text>
              </View>
              <View style={s.metricBox}>
                <Text style={s.metricLabel}>Gewinn 20 J.</Text>
                <Text style={s.metricValue}>{profit20Years.toLocaleString('de-DE')} <Text style={s.metricUnit}>€</Text></Text>
              </View>
            </View>
          </View>

          {/* Investition + Förderung */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>Investition & Förderungen</Text>
            <View style={s.divider} />
            <View style={s.row}>
              <View style={[s.col, s.configBox]}>
                <View style={s.configRow}>
                  <Text style={s.configLabel}>Investitionskosten (brutto)</Text>
                  <Text style={s.configValue}>ca. {investment.toLocaleString('de-DE')} €</Text>
                </View>
                {grantSavings > 0 && (
                  <View style={s.configRow}>
                    <Text style={s.configLabel}>Abzgl. Förderungen</Text>
                    <Text style={[s.configValue, { color: '#16A34A' }]}>− {grantSavings.toLocaleString('de-DE')} €</Text>
                  </View>
                )}
                <View style={[s.configRow, { marginBottom: 0, borderTop: `1 solid #E2E8F0`, paddingTop: 5 }]}>
                  <Text style={[s.configLabel, { fontFamily: 'Helvetica-Bold' }]}>Effektive Investition</Text>
                  <Text style={[s.configValue, { fontSize: 10 }]}>ca. {effectiveInvestment.toLocaleString('de-DE')} €</Text>
                </View>
              </View>
              <View style={[s.col, s.savingsBox]}>
                <View>
                  <Text style={s.savingsLabel}>Gewinn nach 20 Jahren</Text>
                  <Text style={[s.savingsLabel, { fontSize: 7, color: '#64748B', marginTop: 2 }]}>nach Abzug der Investition</Text>
                </View>
                <Text style={s.savingsValue}>+ {profit20Years.toLocaleString('de-DE')} €</Text>
              </View>
            </View>
          </View>

          {/* Förderungen */}
          {allGrants.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionLabel}>Anwendbare Förderprogramme ({allGrants.length})</Text>
              <View style={s.divider} />
              {allGrants.map((grant) => (
                <View key={grant.id} style={s.grantRow}>
                  <View style={s.grantDot} />
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={s.grantTitle}>{grant.title}</Text>
                      <Text style={s.grantBadge}>{grant.highlight}</Text>
                    </View>
                    <Text style={s.grantDesc}>{grant.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Disclaimer */}
          <View style={s.disclaimer}>
            <Text style={s.disclaimerText}>
              Diese Analyse basiert auf geschätzten Einstrahlungsdaten für PLZ {data.zipCode}, einem Systemwirkungsgrad von 80 % sowie einem Strompreis von {Number(data.electricityPrice || 0.32).toFixed(2).replace('.', ',')} €/kWh. Alle Angaben sind Prognosen und ohne Gewähr. Die tatsächlichen Werte können je nach Dachbeschaffenheit, Installationsqualität und Strompreisentwicklung abweichen. Förderungen sind ggf. zu beantragen und nicht automatisch zugesichert.
            </Text>
          </View>

        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Voltify GmbH • kontakt@voltify.de • voltify.de</Text>
          <Text style={s.footerText}>Erstellt am {today} • 100 % DSGVO-konform</Text>
        </View>

      </Page>
    </Document>
  );
}
