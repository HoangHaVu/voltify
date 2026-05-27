import { Car, Power, Smartphone, Check, Flame } from 'lucide-react';
import type { WizardData } from '../../pages/Configurator';

interface Props {
  data: WizardData;
  updateData: (p: Partial<WizardData>) => void;
}

const options = [
  {
    id: 'wallbox',
    key: 'wallbox' as const,
    label: 'E-Mobility Wallbox',
    price: '+ 1.200 €',
    desc: 'Laden Sie Ihr E-Auto bequem mit Solarstrom zu Hause. Inkl. Installation.',
    icon: Car,
  },
  {
    id: 'heatPump',
    key: 'heatPump' as const,
    label: 'Wärmepumpe (geplant)',
    price: '+ 0 €',
    desc: 'Planen Sie eine Wärmepumpe? Wir berücksichtigen +3.000 kWh/Jahr im Verbrauch.',
    icon: Flame,
  },
  {
    id: 'backup',
    key: 'backupPower' as const,
    label: 'Notstromfunktion',
    price: '+ 800 €',
    desc: 'Bleiben Sie auch beim Stromausfall versorgt. Automatische Umschaltung.',
    icon: Power,
  },
  {
    id: 'app',
    key: 'energyApp' as const,
    label: 'Energiemanagement-App',
    price: '+ 0 €',
    desc: 'Kostenlose App zur Überwachung und Optimierung Ihrer Solaranlage.',
    icon: Smartphone,
  },
];

export default function Step5_Options({ data, updateData }: Props) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-semibold text-[#1A3A5C] mb-2">Optionen wählen</h2>
        <p className="text-gray-500 text-sm">Ergänzen Sie Ihre Solaranlage mit praktischen Zusatzfunktionen.</p>
      </div>

      <div className="flex flex-col gap-4">
        {options.map((opt) => {
          const Icon = opt.icon;
          const active = data[opt.key];
          return (
            <button
              key={opt.id}
              onClick={() => updateData({ [opt.key]: !active })}
              className={`flex items-start gap-4 p-5 rounded-xl border-2 text-left transition-all ${
                active
                  ? 'border-[#1A3A5C] bg-[#1A3A5C]/5'
                  : 'border-gray-200 hover:border-gray-300 bg-white/60'
              }`}
            >
              {/* Toggle Circle */}
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                active ? 'bg-[#F5A623] border-[#F5A623]' : 'border-gray-300'
              }`}>
                {active && <Check className="w-3.5 h-3.5 text-[#1A3A5C]" />}
              </div>

              {/* Icon */}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                active ? 'bg-[#F5A623]' : 'bg-gray-100'
              }`}>
                <Icon className={`w-5 h-5 ${active ? 'text-[#1A3A5C]' : 'text-gray-500'}`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm font-medium ${active ? 'text-[#1A3A5C]' : 'text-gray-800'}`}>{opt.label}</p>
                  <span className="text-sm font-semibold text-[#F5A623] flex-shrink-0">{opt.price}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{opt.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
