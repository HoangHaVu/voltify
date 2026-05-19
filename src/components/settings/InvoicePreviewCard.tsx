import { Sun } from 'lucide-react';

interface InvoicePreviewProps {
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
}

const MOCK = {
  name: 'Max Mustermann',
  adresse: 'Musterstraße 12',
  ort: '80331 München',
  investment: 17100,
  kwp: 9.5,
  datum: new Date().toLocaleDateString('de-DE'),
  rechnungsnr: '001',
};

export const InvoicePreviewCard: React.FC<InvoicePreviewProps> = ({
  firmenname,
  slogan,
  logoDataUrl,
  primaryColor,
  accentColor,
  iban,
  zahlungsziel,
  steuernummer,
  adresse,
  ort,
  geschaeftsfuehrer,
  rechnungskreis,
}) => {
  const fmt = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const prefix = rechnungskreis || 'RE';
  const year = new Date().getFullYear();
  const rechnungsnummer = `${prefix}-${year}-${MOCK.rechnungsnr}`;

  const faelligDatum = (() => {
    const d = new Date();
    d.setDate(d.getDate() + parseInt(zahlungsziel || '14', 10));
    return d.toLocaleDateString('de-DE');
  })();

  const netto = MOCK.investment;
  const mwst = 0;

  const positionen = [
    { pos: '1', beschreibung: `PV-Anlage ${MOCK.kwp} kWp inkl. Montage`, menge: 1, einheit: 'Pauschal', preis: netto },
  ];

  return (
    <div className="w-full max-w-lg mx-auto rounded-2xl overflow-hidden shadow-lg border border-white/10 bg-[#1A1A1A] text-sm select-none">
      {/* Briefkopf */}
      <div className="px-6 py-4 flex items-center gap-4" style={{ backgroundColor: primaryColor }}>
        <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center shrink-0 overflow-hidden">
          {logoDataUrl
            ? <img src={logoDataUrl} alt="Logo" className="w-full h-full object-contain p-1" />
            : <Sun className="w-5 h-5 text-white/70" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-black text-sm truncate">{firmenname || 'Ihr Firmenname'}</p>
          {slogan && <p className="text-white/50 text-[10px] truncate">{slogan}</p>}
        </div>
        <span
          className="text-[10px] font-black px-2.5 py-1 rounded-full shrink-0 uppercase tracking-wide"
          style={{ backgroundColor: accentColor, color: primaryColor }}
        >
          Rechnung
        </span>
      </div>

      {/* Absender-Zeile */}
      {(adresse || ort || steuernummer) && (
        <div className="px-6 pt-3 pb-0">
          <p className="text-[9px] text-gray-500 border-b border-white/5 pb-1 truncate">
            {[firmenname, adresse, ort].filter(Boolean).join(' · ')}
          </p>
        </div>
      )}

      {/* Empfänger + Rechnungsdetails */}
      <div className="px-6 py-4 flex justify-between gap-4 border-b border-white/5">
        <div>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Rechnungsempfänger</p>
          <p className="font-bold text-white text-xs">{MOCK.name}</p>
          <p className="text-gray-400 text-[11px]">{MOCK.adresse}</p>
          <p className="text-gray-400 text-[11px]">{MOCK.ort}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="space-y-1">
            {[
              { label: 'Rechnungsnr.', value: rechnungsnummer },
              { label: 'Datum', value: MOCK.datum },
              { label: 'Fällig am', value: faelligDatum },
              ...(steuernummer ? [{ label: 'St.-Nr.', value: steuernummer }] : []),
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-end gap-2">
                <span className="text-[10px] text-gray-500">{label}</span>
                <span className="text-[10px] font-bold text-gray-300 min-w-[80px] text-right">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leistungsbezeichnung */}
      <div className="px-6 py-3 border-b border-white/5">
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Leistung</p>
        <table className="w-full">
          <thead>
            <tr className="text-[9px] text-gray-500 uppercase border-b border-white/5">
              <th className="text-left pb-1.5 font-semibold w-6">Pos.</th>
              <th className="text-left pb-1.5 font-semibold">Beschreibung</th>
              <th className="text-right pb-1.5 font-semibold w-16">Betrag</th>
            </tr>
          </thead>
          <tbody>
            {positionen.map((p) => (
              <tr key={p.pos}>
                <td className="text-[10px] text-gray-500 py-2 align-top">{p.pos}</td>
                <td className="text-[10px] text-gray-300 py-2 pr-2 align-top">
                  <span className="font-semibold">{p.beschreibung}</span>
                  <br />
                  <span className="text-gray-500">Lieferung und Montage gem. Auftragsbestätigung</span>
                </td>
                <td className="text-[10px] font-bold text-white py-2 text-right align-top">
                  {fmt(p.preis)} €
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summen */}
      <div className="px-6 py-3 border-b border-white/5">
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>Nettobetrag</span>
            <span>{fmt(netto)} €</span>
          </div>
          <div className="flex justify-between text-[10px] text-gray-500">
            <span>MwSt. 0 % (§ 12 Abs. 3 UStG — PV-Anlage)</span>
            <span>{fmt(mwst)} €</span>
          </div>
          <div
            className="flex justify-between text-sm font-black pt-1.5 mt-1.5 border-t border-white/10"
            style={{ color: primaryColor }}
          >
            <span>Gesamtbetrag</span>
            <span>{fmt(netto)} €</span>
          </div>
        </div>
      </div>

      {/* Zahlungsinfo */}
      <div className="px-6 py-3 bg-[#252525] border-b border-white/5">
        <p className="text-[10px] text-gray-400 font-semibold mb-1">Zahlungshinweis</p>
        <p className="text-[10px] text-gray-500">
          Bitte überweisen Sie den Betrag innerhalb von{' '}
          <strong className="text-gray-300">{zahlungsziel || '14'} Tagen</strong> auf folgendes Konto:
        </p>
        {iban && (
          <p className="text-[10px] font-mono font-bold text-gray-300 mt-1">{iban}</p>
        )}
        <p className="text-[10px] text-gray-500 mt-0.5">Verwendungszweck: {rechnungsnummer}</p>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 flex flex-wrap gap-x-4 gap-y-0.5">
        {geschaeftsfuehrer && (
          <p className="text-[9px] text-gray-500">GF: {geschaeftsfuehrer}</p>
        )}
        {steuernummer && (
          <p className="text-[9px] text-gray-500">St.-Nr.: {steuernummer}</p>
        )}
        {ort && (
          <p className="text-[9px] text-gray-500">{ort}</p>
        )}
      </div>
    </div>
  );
};
