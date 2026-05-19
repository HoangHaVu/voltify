import { Home, Building2, Building, Factory, HelpCircle, UserCheck, KeyRound } from 'lucide-react';
import type { WizardData } from '../../pages/Configurator';

interface Props {
  data: WizardData;
  updateData: (p: Partial<WizardData>) => void;
}

const buildingTypes = [
  { id: 'efh', label: 'Einfamilienhaus', icon: Home, desc: 'Freistehendes Haus' },
  { id: 'zfh', label: 'Zweifamilienhaus', icon: Home, desc: 'Zwei Wohneinheiten' },
  { id: 'mfh', label: 'Mehrfamilienhaus', icon: Building2, desc: '3+ Wohneinheiten' },
  { id: 'gewerbe', label: 'Firmengebäude', icon: Building, desc: 'Gewerbe & Industrie' },
  { id: 'sonstiges', label: 'Sonstiges', icon: Factory, desc: 'Andere Gebäudeart' },
];

const ownershipTypes = [
  { id: 'eigentuemer', label: 'Eigentümer', icon: KeyRound, desc: 'Ich bin Eigentümer' },
  { id: 'mieter', label: 'Mieter', icon: UserCheck, desc: 'Ich bin Mieter' },
];

export default function Step1_Building({ data, updateData }: Props) {
  return (
    <div className="flex flex-col gap-8">
      {/* Heading */}
      <div>
        <h2 className="text-2xl md:text-3xl font-semibold text-[#1A3A5C] mb-2">Gebäude & Eigentum</h2>
        <p className="text-gray-500 text-sm">Wählen Sie Ihren Gebäudetyp und Ihre Eigentumsform aus.</p>
      </div>

      {/* Building Type */}
      <div>
        <label className="text-sm font-medium text-[#1A3A5C] mb-3 block">Gebäudetyp</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {buildingTypes.map((type) => {
            const Icon = type.icon;
            const selected = data.buildingType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => updateData({ buildingType: type.id })}
                className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                  selected
                    ? 'border-[#1A3A5C] bg-[#1A3A5C]/5'
                    : 'border-gray-200 hover:border-gray-300 bg-white/60'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  selected ? 'bg-[#F5A623]' : 'bg-gray-100'
                }`}>
                  <Icon className={`w-5 h-5 ${selected ? 'text-[#1A3A5C]' : 'text-gray-500'}`} />
                </div>
                <div>
                  <p className={`text-sm font-medium ${selected ? 'text-[#1A3A5C]' : 'text-gray-700'}`}>{type.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{type.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Ownership */}
      <div>
        <label className="text-sm font-medium text-[#1A3A5C] mb-3 block">Eigentumsform</label>
        <div className="grid grid-cols-2 gap-3">
          {ownershipTypes.map((type) => {
            const Icon = type.icon;
            const selected = data.ownership === type.id;
            return (
              <button
                key={type.id}
                onClick={() => updateData({ ownership: type.id })}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                  selected
                    ? 'border-[#1A3A5C] bg-[#1A3A5C]/5'
                    : 'border-gray-200 hover:border-gray-300 bg-white/60'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  selected ? 'bg-[#F5A623]' : 'bg-gray-100'
                }`}>
                  <Icon className={`w-5 h-5 ${selected ? 'text-[#1A3A5C]' : 'text-gray-500'}`} />
                </div>
                <div>
                  <p className={`text-sm font-medium ${selected ? 'text-[#1A3A5C]' : 'text-gray-700'}`}>{type.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{type.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Help Note */}
      {data.ownership === 'mieter' && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-[#F5A623]/10 border border-[#F5A623]/20">
          <HelpCircle className="w-5 h-5 text-[#F5A623] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#1A3A5C]">
            Als Mieter empfehlen wir Ihnen, das Mieterstrommodell zu prüfen. Sprechen Sie mit Ihrem Vermieter über eine gemeinsame Solaranlage.
          </p>
        </div>
      )}
    </div>
  );
}
