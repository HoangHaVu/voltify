import { Battery, Clock } from 'lucide-react';
import type { WizardData } from '../../pages/Configurator';

interface Props {
  data: WizardData;
  updateData: (p: Partial<WizardData>) => void;
}

const storageOptions = [
  { id: '5', kwh: 5, label: '5 kWh', price: '~4.500 €', desc: 'Für kleine Haushalte', hours: 'ca. 4-5 Std.' },
  { id: '10', kwh: 10, label: '10 kWh', price: '~7.000 €', desc: 'Optimal für 3-4 Pers.', hours: 'ca. 8-10 Std.', recommended: true },
  { id: '15', kwh: 15, label: '15 kWh', price: '~9.500 €', desc: 'Für große Haushalte', hours: 'ca. 12-15 Std.' },
  { id: '20', kwh: 20, label: '20 kWh', price: '~12.000 €', desc: 'Maximale Unabhängigkeit', hours: 'ca. 16-20 Std.' },
];

export default function Step4_Storage({ data, updateData }: Props) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-semibold text-[#1A3A5C] mb-2">Speicher wählen</h2>
        <p className="text-gray-500 text-sm">Welche Speichergröße passt zu Ihrem Haushalt?</p>
      </div>

      {/* Storage Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {storageOptions.map((opt) => {
          const selected = data.storageSize === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => updateData({ storageSize: opt.id })}
              className={`relative p-5 rounded-xl border-2 text-left transition-all ${
                selected
                  ? 'border-[#1A3A5C] bg-[#1A3A5C]/5'
                  : 'border-gray-200 hover:border-gray-300 bg-white/60'
              }`}
            >
              {opt.recommended && (
                <span className="absolute -top-2.5 left-4 bg-[#F5A623] text-[#1A3A5C] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Empfohlen
                </span>
              )}
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selected ? 'bg-[#F5A623]' : 'bg-gray-100'}`}>
                  <Battery className={`w-5 h-5 ${selected ? 'text-[#1A3A5C]' : 'text-gray-500'}`} />
                </div>
                <span className={`text-lg font-bold ${selected ? 'text-[#1A3A5C]' : 'text-gray-400'}`}>{opt.price}</span>
              </div>
              <p className={`text-base font-semibold mb-1 ${selected ? 'text-[#1A3A5C]' : 'text-gray-800'}`}>{opt.label}</p>
              <p className="text-xs text-gray-500 mb-3">{opt.desc}</p>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Autarkie: {opt.hours}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Battery Visualization */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200 p-6">
        <label className="text-sm font-medium text-[#1A3A5C] mb-3 block">Feinjustierung</label>
        <input
          type="range"
          min={5}
          max={20}
          step={1}
          value={Number(data.storageSize)}
          onChange={(e) => updateData({ storageSize: e.target.value })}
          className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[#F5A623]"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>5 kWh</span>
          <span className="font-medium text-[#F5A623]">{data.storageSize} kWh ausgewählt</span>
          <span>20 kWh</span>
        </div>
      </div>
    </div>
  );
}
