import {
  CheckCircle,
  Landmark,
  TrendingUp,
  Leaf,
  Zap,
  Globe,
  MapPin,
  ExternalLink,
  Info,
  Check,
  ArrowRight,
} from 'lucide-react';
import type { WizardData } from '../../pages/Configurator';
import {
  NATIONAL_GRANTS,
  getRegionalGrants,
  getStateLabel,
  getGrantSubsidyTotal,
  type Grant,
} from '../../data/grants';

interface Props {
  data: WizardData;
  updateData: (p: Partial<WizardData>) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  percent: <TrendingUp className="w-5 h-5" />,
  zap: <Zap className="w-5 h-5" />,
  landmark: <Landmark className="w-5 h-5" />,
  sun: <SunIcon />,
  trees: <Leaf className="w-5 h-5" />,
  building: <Landmark className="w-5 h-5" />,
  forest: <Leaf className="w-5 h-5" />,
  waves: <Zap className="w-5 h-5" />,
  wind: <Zap className="w-5 h-5" />,
  leaf: <Leaf className="w-5 h-5" />,
  factory: <Landmark className="w-5 h-5" />,
  castle: <Landmark className="w-5 h-5" />,
  'git-branch': <TrendingUp className="w-5 h-5" />,
};

function SunIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function GrantCard({ grant }: { grant: Grant }) {
  const isCalculated =
    grant.id === 'mwst' || grant.id === 'eeg' || (grant.subsidyAmount != null && grant.subsidyAmount > 0);

  return (
    <a
      href={grant.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col gap-4 p-5 rounded-xl border-2 text-left transition-all duration-200 group relative overflow-hidden hover:border-[#1A3A5C] hover:shadow-md bg-white/60 backdrop-blur-sm"
    >
      {/* Type Badge */}
      <div
        className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[10px] font-semibold flex items-center gap-1 ${
          grant.type === 'national'
            ? 'bg-[#1A3A5C] text-white'
            : 'bg-gray-100 text-gray-600'
        }`}
      >
        {grant.type === 'national' ? <Globe className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
        {grant.type === 'national' ? 'National' : 'Regional'}
      </div>

      {/* Icon */}
      <div className="w-10 h-10 rounded-lg bg-[#1A3A5C]/5 flex items-center justify-center text-[#1A3A5C]">
        {iconMap[grant.icon] || <Zap className="w-5 h-5" />}
      </div>

      {/* Content */}
      <div>
        <h4 className="font-semibold text-sm text-[#1A3A5C] mb-1 group-hover:underline underline-offset-2 flex items-center gap-1">
          {grant.title}
          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </h4>
        <p className="text-xs text-gray-500 leading-relaxed">{grant.description}</p>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
        {isCalculated ? (
          <div className="flex items-center text-green-600 text-xs font-medium gap-1">
            <Check className="w-3.5 h-3.5" />
            Im Ergebnis enthalten
          </div>
        ) : (
          <div className="flex items-center text-gray-400 text-xs font-medium gap-1">
            <Info className="w-3.5 h-3.5" />
            Separates Antragsverfahren
          </div>
        )}
        <span className="shrink-0 text-[10px] font-semibold text-[#1A3A5C] bg-[#1A3A5C]/5 px-2 py-1 rounded-full">
          {grant.highlight}
        </span>
      </div>
    </a>
  );
}

export default function Step6_Subsidies({ data }: Props) {
  const zip = data.zipCode;
  const regionalGrants = getRegionalGrants(zip);
  const stateLabel = getStateLabel(zip);
  const totalGrants = NATIONAL_GRANTS.length + regionalGrants.length;
  const subsidyTotal = getGrantSubsidyTotal(zip);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-semibold text-[#1A3A5C] mb-2">Fördermittel für Ihr Projekt</h2>
        <p className="text-gray-500 text-sm">
          Wir haben <strong>{totalGrants} Förderprogramme</strong> für Ihren Standort
          {zip ? <> (<strong>{zip} — {stateLabel}</strong>)</> : ''} ermittelt.
          Diese werden automatisch in Ihrer Wirtschaftlichkeitsberechnung berücksichtigt.
        </p>
      </div>

      {/* Highlight: 0% MwSt */}
      <div className="bg-[#F5A623]/10 border-2 border-[#F5A623]/30 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#F5A623] flex items-center justify-center shrink-0">
          <TrendingUp className="w-6 h-6 text-[#1A3A5C]" />
        </div>
        <div>
          <h3 className="font-semibold text-[#1A3A5C] mb-1">0 % Mehrwertsteuer — Sofort wirksam</h3>
          <p className="text-xs text-gray-600">
            <strong>Sparen Sie ~19 % auf den Kaufpreis Ihrer Anlage.</strong> Seit dem 01.01.2023
            entfällt die Umsatzsteuer bundesweit auf PV-Anlagen und Speicher auf Wohngebäuden —
            automatisch in unserem Angebotspreis einkalkuliert.
          </p>
        </div>
      </div>

      {/* Regional Grants */}
      {regionalGrants.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#F5A623]" />
            <h3 className="font-semibold text-[#1A3A5C]">Regionale Förderungen — {stateLabel}</h3>
          </div>
          {subsidyTotal > 0 && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 w-fit">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-green-800">
                Direktzuschuss-Summe: bis zu {subsidyTotal.toLocaleString()} €
              </span>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {regionalGrants.map((grant) => (
              <GrantCard key={grant.id} grant={grant} />
            ))}
          </div>
        </div>
      )}

      {/* National Grants */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#F5A623]" />
          <h3 className="font-semibold text-[#1A3A5C]">Bundesweite Förderungen</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {NATIONAL_GRANTS.filter((g) => g.id !== 'mwst').map((grant) => (
            <GrantCard key={grant.id} grant={grant} />
          ))}
        </div>
      </div>
    </div>
  );
}
