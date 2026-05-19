import { Sun, CheckCircle } from 'lucide-react';

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
}

const MOCK = {
  name: 'Max Mustermann',
  zip: '80331 München',
  kwp: 9.5,
  investment: 17100,
  savings: 1420,
  amortization: 12,
};

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
}) => {
  const rate1 = Math.round(MOCK.investment * 0.30);
  const rate2 = Math.round(MOCK.investment * 0.60);
  const rate3 = MOCK.investment - rate1 - rate2;

  const fmt = (n: number) => n.toLocaleString('de-DE');

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

      {/* Empfänger */}
      <div className="px-6 pt-5 pb-3 border-b border-white/5">
        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Angebot für</p>
        <p className="font-bold text-white">{MOCK.name}</p>
        <p className="text-gray-400 text-xs">{MOCK.zip}</p>
      </div>

      {/* System-Übersicht */}
      <div className="px-6 py-4 border-b border-white/5">
        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-3">Ihre Photovoltaikanlage</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Systemgröße', value: `${MOCK.kwp} kWp` },
            { label: 'Investition', value: `${fmt(MOCK.investment)} €` },
            { label: 'Jahresersparnis', value: `${fmt(MOCK.savings)} €/Jahr` },
            { label: 'Amortisation', value: `~${MOCK.amortization} Jahre` },
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

      {/* Zahlungsplan */}
      <div className="px-6 py-4 border-b border-white/5">
        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-3">Zahlungsplan</p>
        <div className="space-y-2">
          {[
            { label: 'Anzahlung (30 %)', amount: rate1, when: 'Bei Auftragserteilung' },
            { label: 'Montagerechnung (60 %)', amount: rate2, when: 'Nach Montage' },
            { label: 'Schlussrechnung (10 %)', amount: rate3, when: 'Nach Abnahme' },
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
