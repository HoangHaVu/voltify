import { useState } from 'react';
import { TrendingUp, DollarSign, Clock, Sun, ArrowRight, Zap, CheckCircle, Percent, Landmark, Download, HelpCircle, ExternalLink, Wrench, Lightbulb } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ROIPdfDocument from '../../components/pdf/ROIPdfDocument';
import type { WizardData } from '../../pages/Configurator';
import { calculateROI } from '../../lib/calculations';
import { getGrantSubsidyTotal } from '../../data/grants';

interface Props {
  data: WizardData;
  updateData: (p: Partial<WizardData>) => void;
  onNext: () => void;
}

export default function Step7_Analysis({ data, onNext }: Props) {
  const [showWithoutBattery, setShowWithoutBattery] = useState(false);

  // Berechnung mit/ohne Speicher für Vergleich
  const calcWith = calculateROI(data);
  const calcWithout = calculateROI({ ...data, storageSize: '0' });
  const calc = showWithoutBattery ? calcWithout : calcWith;

  const co2Saved = Math.round(calc.kwp * 900 / 1000 * 10) / 10;
  const grantSavings = calc.grantSavings;
  const effectiveInvestment = calc.effectiveInvestment;
  // Realistischer Chart mit Folgekosten
  const chartData = (calc.chartDataRealistic ?? calc.chartData).slice(1);
  const maxVal = Math.max(...chartData.map(d => d.value));
  const minVal = Math.min(...chartData.map(d => d.value));

  // Zero-Line-Position: sicherstellen dass 0 immer im sichtbaren Bereich liegt
  const chartMax = Math.max(maxVal, 0);
  const chartMin = Math.min(minVal, 0);
  const chartRange = chartMax - chartMin || 1;
  // Anteil des Charts unterhalb der Zero-Line (% von unten)
  const zeroFromBottom = ((-chartMin) / chartRange) * 100;

  // Ob das System in 20 Jahren realistisch amortisiert
  const neverAmortized = calc.amortizationRealistic === 0 && calc.profit20YearsRealistic < 0;
  const profit20 = calc.profit20YearsRealistic ?? calc.profit20Years;

  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-semibold text-[#1A3A5C] mb-2">Wirtschaftlichkeitsanalyse</h2>
        <p className="text-gray-500 text-sm">Ihre persönliche Auswertung basierend auf den eingegebenen Daten.</p>
      </div>

      {/* Speicher-Vergleich Toggle */}
      {Number(data.storageSize) > 0 && (
        <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#1A3A5C]">Wie ändert sich die Wirtschaftlichkeit ohne Speicher?</p>
              <p className="text-xs text-gray-500 mt-0.5">Vergleichen Sie die Zahlen mit und ohne Batteriespeicher</p>
            </div>
            <button
              onClick={() => setShowWithoutBattery(!showWithoutBattery)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                showWithoutBattery ? 'bg-[#F5A623]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  showWithoutBattery ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          {showWithoutBattery && (
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div className="bg-red-50 rounded-lg p-2 text-center">
                <span className="text-gray-500 block">Investition</span>
                <span className="font-bold text-red-600">−{(calcWith.investment - calcWithout.investment).toLocaleString()} €</span>
              </div>
              <div className="bg-red-50 rounded-lg p-2 text-center">
                <span className="text-gray-500 block">Autarkie</span>
                <span className="font-bold text-red-600">−{calcWith.autarky - calcWithout.autarky}%</span>
              </div>
              <div className="bg-green-50 rounded-lg p-2 text-center">
                <span className="text-gray-500 block">Amortisation</span>
                <span className="font-bold text-green-600">{calcWithout.amortization < calcWith.amortization ? '−' : '+'}{Math.abs(calcWithout.amortization - calcWith.amortization)} J.</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-[#F5A623]" />
            <span className="text-xs text-gray-500">Gewinn nach 20 J.</span>
          </div>
          <p className={`text-2xl font-bold ${profit20 >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {profit20 >= 0 ? '+' : ''}{Math.round(profit20).toLocaleString()} <span className="text-sm font-normal">€</span>
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">realistisch · inkl. Folgekosten</p>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-[#F5A623]" />
            <span className="text-xs text-gray-500">Investition</span>
          </div>
          {grantSavings > 0 ? (
            <>
              <p className="text-2xl font-bold text-[#1A3A5C]">{effectiveInvestment.toLocaleString()} <span className="text-sm font-normal">€</span></p>
              <p className="text-[10px] text-green-600 font-medium mt-0.5 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                nach Förderungen (statt {calc.investment.toLocaleString()} €)
              </p>
            </>
          ) : (
            <p className="text-2xl font-bold text-[#1A3A5C]">{calc.investment.toLocaleString()} <span className="text-sm font-normal">€</span></p>
          )}
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-[#F5A623]" />
            <span className="text-xs text-gray-500">Ersparnis/Jahr</span>
          </div>
          <p className="text-2xl font-bold text-[#F5A623]">{calc.annualSavings.toLocaleString()} <span className="text-sm font-normal">€</span></p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {calc.kwp} kWp · {calc.annualYield.toLocaleString()} kWh/Jahr Ertrag
          </p>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="w-4 h-4 text-[#F5A623]" />
            <span className="text-xs text-gray-500">Folgekosten (20 J.)</span>
          </div>
          <p className="text-2xl font-bold text-[#1A3A5C]">{calc.totalFollowUpCosts?.toLocaleString() || '—'} <span className="text-sm font-normal">€</span></p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Wartung + Wechselrichter{(Number(data.storageSize) > 0 && !showWithoutBattery) ? ' + Batterie' : ''}
          </p>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-[#F5A623]" />
            <span className="text-xs text-gray-500">Amortisation</span>
          </div>
          {neverAmortized ? (
            <>
              <p className="text-2xl font-bold text-red-500">&gt; 20 <span className="text-sm font-normal">Jahre</span></p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Realistisch: nicht in 20 J. · Einfach: {calc.amortization} J.
              </p>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold text-[#1A3A5C]">{calc.amortizationRealistic || calc.amortization} <span className="text-sm font-normal">Jahre</span></p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Realistisch (inkl. Folgekosten){calc.amortizationRealistic ? ` · Einfach: ${calc.amortization} J.` : ''}
              </p>
            </>
          )}
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-[#F5A623]" />
            <span className="text-xs text-gray-500">Autarkie</span>
          </div>
          <p className="text-2xl font-bold text-[#1A3A5C]">{calc.autarky} <span className="text-sm font-normal">%</span></p>
          <p className="text-[10px] text-gray-400 mt-0.5">Eigenverbrauchsanteil</p>
        </div>
      </div>

      {/* Optimierungshinweis bei langer Amortisationszeit */}
      {(neverAmortized || calc.amortizationRealistic > 16) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Diese Anlage lässt sich weiter optimieren</p>
            <p className="text-xs text-amber-700 mt-1">
              {!data.futureCar && !data.heatPump
                ? 'Planen Sie ein E-Auto oder eine Wärmepumpe? Damit steigt Ihr Eigenverbrauch deutlich — die Amortisationszeit sinkt oft um 3–5 Jahre.'
                : 'Mit einer angepassten Anlagengröße oder Speicherkonfiguration lässt sich das Ergebnis oft deutlich verbessern.'}{' '}
              Ein Installateur zeigt Ihnen die optimale Kombination für Ihre persönliche Situation.
            </p>
          </div>
        </div>
      )}

      {/* Förderungsübersicht */}
      <div className="bg-gradient-to-r from-[#1A3A5C]/5 to-[#F5A623]/5 border border-[#1A3A5C]/10 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-4 h-4 text-[#F5A623]" />
          <h3 className="font-semibold text-[#1A3A5C] text-xs uppercase tracking-widest">Förderungen & Vergünstigungen — bereits eingerechnet</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-start gap-3 bg-white/60 rounded-lg p-4">
            <Percent className="w-5 h-5 text-[#F5A623] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#1A3A5C] text-sm">0 % Mehrwertsteuer</p>
              <p className="text-xs text-gray-500 mt-0.5">Preis bereits ohne MwSt. — spart ~19 % auf den Kaufpreis</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-white/60 rounded-lg p-4">
            <Zap className="w-5 h-5 text-[#F5A623] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#1A3A5C] text-sm">EEG Einspeisevergütung</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {calc.gridFeedIn > 0
                  ? `ca. ${Math.round(calc.gridFeedIn * 0.082).toLocaleString()} €/Jahr · 8,2 ct/kWh · 20 Jahre garantiert`
                  : '8,2 ct/kWh · 20 Jahre garantiert'}
              </p>
            </div>
          </div>
          {grantSavings > 0 ? (
            <div className="flex items-start gap-3 bg-[#F5A623]/10 border border-[#F5A623]/20 rounded-lg p-4">
              <Landmark className="w-5 h-5 text-[#F5A623] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#1A3A5C] text-sm">Regionaler Zuschuss</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  −{grantSavings.toLocaleString()} € vom Kaufpreis abgezogen
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 bg-white/60 rounded-lg p-4">
              <Landmark className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#1A3A5C] text-sm">Regionale Förderung</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Prüfen Sie zusätzliche Zuschüsse im Förderungsschritt
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payback Chart */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-[#1A3A5C]">Amortisationsverlauf (20 Jahre)</p>
          <span className={`text-xs px-2 py-0.5 rounded-full ${profit20 >= 0 ? 'text-[#F5A623] bg-[#F5A623]/10' : 'text-red-500 bg-red-50'}`}>
            {profit20 >= 0 ? '+' : ''}{Math.round(profit20).toLocaleString()} € nach 20 Jahren (mit Folgekosten)
          </span>
        </div>
        <div className="flex gap-[2px] h-40 sm:h-48 relative">
          {/* Zero-Line */}
          <div
            className="absolute left-0 right-0 h-px bg-gray-400 z-10 pointer-events-none"
            style={{ bottom: `${zeroFromBottom}%` }}
          />
          {chartData.map((d, i) => {
            const isPositive = d.value >= 0;
            // Balkenhöhe als Anteil am gesamten sichtbaren Bereich
            const barPct = (Math.abs(d.value) / chartRange) * 100;
            const finalPct = Math.max(barPct, 0.8);
            return (
              <div
                key={i}
                className="flex-1 h-full relative"
                onMouseEnter={() => setHoveredBar(i)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {/* Tooltip */}
                {hoveredBar === i && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#1A3A5C] text-white text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap z-20 shadow-lg">
                    Jahr {d.year}: {d.value >= 0 ? '+' : ''}{d.value.toLocaleString()} €
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1A3A5C] rotate-45" />
                  </div>
                )}
                {/* Balken: positive gehen von zero-line aufwärts, negative abwärts */}
                <div
                  className={`absolute left-0 right-0 ${
                    isPositive
                      ? `bg-[#F5A623] rounded-t-sm ${hoveredBar === i ? 'brightness-110' : ''}`
                      : `bg-gray-300 rounded-b-sm ${hoveredBar === i ? 'brightness-90' : ''}`
                  }`}
                  style={{
                    height: `${finalPct}%`,
                    bottom: isPositive ? `${zeroFromBottom}%` : undefined,
                    top: isPositive ? undefined : `${100 - zeroFromBottom}%`,
                  }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 mt-2">
          <span>Jahr 1</span>
          <span className={`font-medium ${neverAmortized ? 'text-red-400' : 'text-[#F5A623]'}`}>
            {neverAmortized
              ? 'Break-even nicht in 20 Jahren erreicht'
              : `Break-even ca. Jahr ${Math.ceil(calc.amortizationRealistic || calc.amortization)}`}
          </span>
          <span>Jahr 20</span>
        </div>
      </div>

      {/* Mini-FAQ — Verbraucherzentrale */}
      <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="w-4 h-4 text-blue-600" />
          <h3 className="font-semibold text-blue-800 text-sm">Häufige Fragen vor dem Kauf</h3>
        </div>
        <div className="flex flex-col gap-2">
          {[
            {
              q: 'Wie lange hält ein Wechselrichter?',
              a: 'In der Regel 10–15 Jahre. Danach fällt ein Austausch an (ca. 1.500–3.000 €).',
            },
            {
              q: 'Was kostet der Austausch der Batterie?',
              a: 'Nach ca. 10.000 Ladezyklen (10–15 Jahre) sollte der Speicher erneuert werden (ca. 4.000–8.000 €).',
            },
            {
              q: 'Wie oft muss die Anlage gewartet werden?',
              a: 'Eine Inspektion alle 2–3 Jahre wird empfohlen (ca. 150–300 €).',
            },
            {
              q: 'Sind die Amortisationszeiten realistisch?',
              a: 'Diese Analyse berücksichtigt aktuelle Strompreise und EEG-Vergütung. Folgekosten verlängern die Amortisation typisch um 2–3 Jahre.',
            },
          ].map((item, i) => (
            <a
              key={i}
              href="https://www.verbraucherzentrale.de/wissen/energie/erneuerbare-energien/photovoltaik-was-bei-der-planung-einer-solaranlage-wichtig-ist-5574"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 p-3 rounded-lg bg-white/60 hover:bg-white transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5 text-blue-600 text-xs font-bold">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-blue-800 group-hover:underline underline-offset-2 flex items-center gap-1">
                  {item.q}
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </p>
                <p className="text-xs text-blue-600 mt-0.5">{item.a}</p>
              </div>
            </a>
          ))}
        </div>
        <p className="text-[10px] text-blue-400 mt-3 flex items-center gap-1">
          <ExternalLink className="w-3 h-3" />
          Alle Antworten basieren auf dem Ratgeber der Verbraucherzentrale — unabhängig und neutral.
        </p>
      </div>

      {/* CO2 */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
        <Zap className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-green-800">CO₂-Einsparung</p>
          <p className="text-xs text-green-600 mt-0.5">
            Ihre Anlage spart jährlich ca. <strong>{co2Saved} Tonnen</strong> CO₂ — das entspricht {Math.round(co2Saved * 50)} Bäumen!
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onNext}
          className="flex-1 flex items-center justify-center gap-2 bg-[#F5A623] text-[#1A3A5C] px-6 py-4 rounded-xl text-sm font-bold hover:bg-[#E09000] transition-all"
        >
          Individuelles Angebot anfordern
          <ArrowRight className="w-4 h-4" />
        </button>
        <PDFDownloadLink
          document={<ROIPdfDocument data={data} calc={calc} />}
          fileName={`Voltify-ROI-Analyse-${data.zipCode || 'PLZ'}.pdf`}
          className="flex items-center justify-center gap-2 bg-white border-2 border-[#1A3A5C] text-[#1A3A5C] px-6 py-4 rounded-xl text-sm font-bold hover:bg-[#1A3A5C]/5 transition-all"
        >
          {({ loading }) => (
            <>
              <Download className="w-4 h-4" />
              {loading ? 'PDF wird erstellt…' : 'Analyse als PDF'}
            </>
          )}
        </PDFDownloadLink>
      </div>
    </div>
  );
}
