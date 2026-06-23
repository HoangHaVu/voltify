import { Sun, CheckCircle } from 'lucide-react';
import type { OfferTextTemplate } from '../../services/offers';

interface OfferPreviewProps {
  firmenname: string;
  slogan: string;
  logoDataUrl: string;
  primaryColor: string;
  accentColor: string;
  iban: string;
  zahlungsziel: string;
  panelHersteller: string;
  wechselrichterHersteller: string;
  marge: string;
  // Kalkulations-Parameter für dynamische ROI-Berechnung
  modulePricePerKwp?: string;
  inverterPricePerKwp?: string;
  mountingFixed?: string;
  electricalFixed?: string;
  strompreis?: string;
  eigenverbrauch?: string;
  // Text-Vorlage
  offerTextTemplate?: OfferTextTemplate;
}

const MOCK_KWP = 9.5;

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '');
}

export const OfferPreviewCard: React.FC<OfferPreviewProps> = ({
  firmenname,
  slogan,
  logoDataUrl,
  primaryColor,
  accentColor,
  iban,
  zahlungsziel,
  panelHersteller,
  wechselrichterHersteller,
  modulePricePerKwp,
  inverterPricePerKwp,
  mountingFixed,
  electricalFixed,
  strompreis,
  eigenverbrauch,
  offerTextTemplate,
}) => {
  // ── Dynamische ROI-Berechnung aus Kalkulations-Einstellungen ──
  const modPrice  = Number(modulePricePerKwp)   || 1200;
  const invPrice  = Number(inverterPricePerKwp)  || 250;
  const mounting  = Number(mountingFixed)         || 2500;
  const electrical = Number(electricalFixed)      || 1800;
  const investment = Math.round((modPrice + invPrice) * MOCK_KWP + mounting + electrical);

  const strompreisEuro    = (Number(strompreis)   || 32) / 100;
  const eigenverbrauchRate = (Number(eigenverbrauch) || 65) / 100;
  const annualProduction  = MOCK_KWP * 950; // kWh (DE-Durchschnitt)
  const savings = Math.round(
    annualProduction * eigenverbrauchRate * strompreisEuro +
    annualProduction * (1 - eigenverbrauchRate) * 0.082
  );
  const amortization = savings > 0 ? Math.round(investment / savings) : 0;

  const rate1 = Math.round(investment * 0.30);
  const rate2 = Math.round(investment * 0.60);
  const rate3 = investment - rate1 - rate2;

  const fmt = (n: number) => n.toLocaleString('de-DE');

  // ── Template-Interpolation für Vorschau ──
  const mockVars: Record<string, string> = {
    vorname: 'Max',
    nachname: 'Mustermann',
    angebotsnummer: 'ANG-20260619-DEMO',
    firmenname: firmenname || 'Voltify Solar',
    datum: new Date().toLocaleDateString('de-DE'),
    gueltig_bis: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('de-DE'),
    zahlungsziel: zahlungsziel || '14',
  };

  const anschreibenText = offerTextTemplate?.anschreiben
    ? interpolate(offerTextTemplate.anschreiben, mockVars)
    : '';
  const termsText = offerTextTemplate?.zahlungsbedingungen
    ? interpolate(offerTextTemplate.zahlungsbedingungen, mockVars)
    : '';

  return (
    <div className="w-full max-w-lg mx-auto rounded-2xl overflow-hidden shadow-lg border border-white/10 bg-[#1A1A1A] text-sm select-none">
      {/* Briefkopf */}
      <div className="px-6 py-5 flex items-center gap-4" style={{ backgroundColor: primaryColor }}>
        <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0 overflow-hidden">
          {logoDataUrl
            ? <img src={logoDataUrl} alt="Logo" className="w-full h-full object-contain p-1" />
            : <Sun className="w-6 h-6 text-white/70" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-black text-base truncate">{firmenname || 'Ihr Firmenname'}</p>
          {slogan && <p className="text-white/60 text-xs truncate">{slogan}</p>}
        </div>
        <span
          className="text-xs font-bold px-3 py-1 rounded-full shrink-0"
          style={{ backgroundColor: accentColor, color: primaryColor }}
        >
          Angebot
        </span>
      </div>

      {/* Anschreiben-Vorschau */}
      {anschreibenText && (
        <div className="px-6 pt-4 pb-3 border-b border-white/5 bg-[#252525]/30">
          <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-line line-clamp-3">
            {anschreibenText}
          </p>
        </div>
      )}

      {/* Empfänger */}
      <div className="px-6 pt-5 pb-3 border-b border-white/5">
        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Angebot für</p>
        <p className="font-bold text-white">Max Mustermann</p>
        <p className="text-gray-400 text-xs">80331 München</p>
      </div>

      {/* Angebotspositionen (Muster) */}
      <div className="px-6 py-4 border-b border-white/5">
        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-3">Angebotspositionen</p>
        <div className="space-y-1.5">
          {[
            { pos: 'Solarmodule', detail: `${MOCK_KWP} kWp · ${panelHersteller?.split(',')[0]?.trim() || 'Standard'}`, price: Math.round((Number(modulePricePerKwp) || 1200) * MOCK_KWP) },
            { pos: 'Wechselrichter', detail: wechselrichterHersteller?.split(',')[0]?.trim() || 'Standard', price: Math.round((Number(inverterPricePerKwp) || 250) * MOCK_KWP) },
            { pos: 'Montage & Unterkonstruktion', detail: 'Pauschal', price: Number(mountingFixed) || 2500 },
            { pos: 'Elektroinstallation', detail: 'AC/DC-Verkabelung', price: Number(electricalFixed) || 1800 },
          ].map(({ pos, detail, price }, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
              <div>
                <p className="text-xs font-semibold text-gray-200">{pos}</p>
                <p className="text-[10px] text-gray-500">{detail}</p>
              </div>
              <p className="text-xs font-black text-white shrink-0 ml-4">{fmt(price)} €</p>
            </div>
          ))}
        </div>
        <div className="mt-2 pt-2 border-t border-white/10 flex justify-between items-center">
          <p className="text-xs font-semibold text-gray-400">Gesamtbetrag</p>
          <p className="text-sm font-black" style={{ color: accentColor }}>{fmt(investment)} €</p>
        </div>
      </div>

      {/* System-Übersicht — dynamisch */}
      <div className="px-6 py-4 border-b border-white/5">
        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-3">Ihre Photovoltaikanlage</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Systemgröße',   value: `${MOCK_KWP} kWp` },
            { label: 'Investition',   value: `${fmt(investment)} €` },
            { label: 'Jahresersparnis', value: `${fmt(savings)} €/Jahr` },
            { label: 'Amortisation',  value: `~${amortization} Jahre` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[#252525] rounded-lg px-3 py-2">
              <p className="text-[10px] text-gray-500 font-semibold uppercase">{label}</p>
              <p className="font-black text-white text-sm">{value}</p>
            </div>
          ))}
        </div>

        {(panelHersteller || wechselrichterHersteller) && (
          <div className="mt-3 space-y-1">
            {panelHersteller && (
              <p className="text-xs text-gray-400">
                <span className="font-semibold text-gray-300">Module:</span> {panelHersteller.split(',')[0].trim()}
              </p>
            )}
            {wechselrichterHersteller && (
              <p className="text-xs text-gray-400">
                <span className="font-semibold text-gray-300">Wechselrichter:</span> {wechselrichterHersteller.split(',')[0].trim()}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Zahlungsplan — dynamisch */}
      <div className="px-6 py-4 border-b border-white/5">
        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-3">Zahlungsplan</p>
        <div className="space-y-2">
          {[
            { label: 'Anzahlung (30 %)',        amount: rate1, when: 'Bei Auftragserteilung' },
            { label: 'Montagerechnung (60 %)',   amount: rate2, when: 'Nach Montage' },
            { label: 'Schlussrechnung (10 %)',   amount: rate3, when: 'Nach Abnahme' },
          ].map(({ label, amount, when }) => (
            <div key={label} className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-300 text-xs">{label}</p>
                <p className="text-[10px] text-gray-500">{when}</p>
              </div>
              <p className="font-black text-white text-sm">{fmt(amount)} €</p>
            </div>
          ))}
        </div>
      </div>

      {/* IBAN & Zahlungsziel */}
      {(iban || zahlungsziel) && (
        <div className="px-6 py-3 border-b border-white/5 bg-[#252525]">
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-400">
            {iban && <span><span className="font-semibold text-gray-300">IBAN:</span> {iban}</span>}
            {zahlungsziel && <span><span className="font-semibold text-gray-300">Zahlungsziel:</span> {zahlungsziel} Tage</span>}
          </div>
        </div>
      )}

      {/* AGB-Vorschau */}
      {termsText && (
        <div className="px-6 py-3 border-b border-white/5 bg-[#1E1E1E]">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Zahlungsbedingungen</p>
          <p className="text-[10px] text-gray-600 leading-relaxed line-clamp-2 whitespace-pre-line">{termsText}</p>
        </div>
      )}

      {/* CTA */}
      <div className="px-6 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0" />
          Unverbindliches Angebot · 30 Tage gültig
        </div>
        <button
          className="text-xs font-bold px-4 py-2 rounded-lg shrink-0 transition-opacity hover:opacity-90"
          style={{ backgroundColor: accentColor, color: primaryColor }}
        >
          Angebot annehmen
        </button>
      </div>
    </div>
  );
};
