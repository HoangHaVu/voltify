import { useState } from 'react';
import { TrendingUp, DollarSign, Clock, Sun, ArrowRight, Zap, CheckCircle, Percent, Landmark, Download } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ROIPdfDocument from '../../components/pdf/ROIPdfDocument';
import type { WizardData } from '../../pages/Configurator';
import { calculateROI } from '../../lib/calculations';
import { getGrantSubsidyTotal, getStateLabel } from '../../data/grants';

interface Props {
  data: WizardData;
  updateData: (p: Partial<WizardData>) => void;
  onNext: () => void;
}

export default function Step7_Analysis({ data, onNext }: Props) {
  const calc = calculateROI(data);
  const consumption = Number(data.consumption) || 4000;
  const roofArea = Number(data.roofArea) || 50;

  const co2Saved = Math.round(calc.kwp * 900 / 1000 * 10) / 10;
  const grantSavings = calc.grantSavings;
  const effectiveInvestment = calc.effectiveInvestment;
  const eegRevenue = Math.round(calc.kwp * 1000 * 0.3 * 0.082); // ~30% Einspeisung * 8,2ct

  const chartData = Array.from({ length: 20 }, (_, i) => {
    const year = i + 1;
    const cumulative = year * calc.annualSavings - effectiveInvestment;
    return { year, value: cumulative };
  });

  const maxVal = Math.max(...chartData.map(d => d.value));
  const minVal = Math.min(...chartData.map(d => d.value));
  const range = maxVal - minVal;

  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  return (
    <>
      <style>{`
        @keyframes barGrow {
          from { height: 0%; }
          to { height: var(--target-height); }
        }
        .animate-bar-grow {
          animation: barGrow 0.8s ease-out forwards;
        }
      `}</style>
      <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-semibold text-[#1A3A5C] mb-2">Wirtschaftlichkeitsanalyse</h2>
        <p className="text-gray-500 text-sm">Ihre persönliche Auswertung basierend auf den eingegebenen Daten.</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sun className="w-4 h-4 text-[#F5A623]" />
            <span className="text-xs text-gray-500">Systemleistung</span>
          </div>
          <p className="text-2xl font-bold text-[#1A3A5C]">{calc.kwp} <span className="text-sm font-normal">kWp</span></p>
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
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-[#F5A623]" />
            <span className="text-xs text-gray-500">Amortisation</span>
          </div>
          <p className="text-2xl font-bold text-[#1A3A5C]">{calc.amortization} <span className="text-sm font-normal">Jahre</span></p>
        </div>
      </div>

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
                {eegRevenue > 0
                  ? `ca. ${eegRevenue.toLocaleString()} €/Jahr · 20 Jahre garantiert`
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
          <span className="text-xs text-[#F5A623] bg-[#F5A623]/10 px-2 py-0.5 rounded-full">+{Math.round(calc.profit20Years).toLocaleString()} € nach 20 Jahren</span>
        </div>
        <div className="flex items-end gap-[2px] h-40 sm:h-48">
          {chartData.map((d, i) => {
            const targetHeight = range === 0 ? 50 : ((d.value - minVal) / range) * 100;
            const isPositive = d.value >= 0;
            const finalHeight = Math.max(targetHeight, 4);
            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-1 relative"
                onMouseEnter={() => setHoveredBar(i)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {/* Tooltip */}
                {hoveredBar === i && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#1A3A5C] text-white text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap z-10 shadow-lg">
                    Jahr {d.year}: {d.value >= 0 ? '+' : ''}{d.value.toLocaleString()} €
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1A3A5C] rotate-45" />
                  </div>
                )}
                <div
                  className={`w-full rounded-t-sm animate-bar-grow ${
                    isPositive ? 'bg-[#F5A623]' : 'bg-gray-300'
                  } ${hoveredBar === i ? 'brightness-110' : ''}`}
                  style={{ '--target-height': `${finalHeight}%` } as React.CSSProperties}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 mt-2">
          <span>Jahr 1</span>
          <span className="text-[#F5A623] font-medium">Break-even ca. Jahr {Math.ceil(calc.amortization)}</span>
          <span>Jahr 20</span>
        </div>
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
    </>
  );
}
