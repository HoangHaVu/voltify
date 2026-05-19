import { Sun, CloudSun, CloudRain } from 'lucide-react';
import type { WizardData } from '../../pages/Configurator';

interface Props {
  data: WizardData;
  updateData: (p: Partial<WizardData>) => void;
}

const orientations = [
  { id: 'N', label: 'Norden', deg: 0 },
  { id: 'NO', label: 'N-Ost', deg: 45 },
  { id: 'O', label: 'Osten', deg: 90 },
  { id: 'SO', label: 'S-Ost', deg: 135 },
  { id: 'S', label: 'Süden', deg: 180 },
  { id: 'SW', label: 'S-West', deg: 225 },
  { id: 'W', label: 'Westen', deg: 270 },
  { id: 'NW', label: 'N-West', deg: 315 },
];

const shadingOptions = [
  { id: 'none', label: 'Keine Verschattung', icon: Sun, desc: 'Freie Sonneneinstrahlung' },
  { id: 'partial', label: 'Teilweise', icon: CloudSun, desc: 'Gelegentlich Schatten' },
  { id: 'strong', label: 'Stark', icon: CloudRain, desc: 'Häufig verschattet' },
];

export default function Step2_Roof({ data, updateData }: Props) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-semibold text-[#1A3A5C] mb-2">Dach konfigurieren</h2>
        <p className="text-gray-500 text-sm">Geben Sie die Eigenschaften Ihres Daches an.</p>
      </div>

      {/* Roof Tilt */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-medium text-[#1A3A5C]">Dachneigung</label>
          <span className="text-2xl font-bold text-[#1A3A5C]">{data.roofTilt}°</span>
        </div>
        <input
          type="range"
          min={0}
          max={60}
          value={data.roofTilt}
          onChange={(e) => updateData({ roofTilt: Number(e.target.value) })}
          className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[#F5A623]"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>0° (Flach)</span>
          <span>30° (Optimal)</span>
          <span>60° (Steil)</span>
        </div>
      </div>

      {/* Orientation - Compass */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200 p-6">
        <label className="text-sm font-medium text-[#1A3A5C] mb-4 block">Dachausrichtung</label>
        <div className="relative w-[240px] h-[240px] mx-auto">
          {/* Compass Circle */}
          <div className="absolute inset-0 rounded-full border-2 border-gray-200 bg-white/40" />
          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#1A3A5C]" />
          {/* Direction Buttons */}
          {orientations.map((o) => {
            const angle = (o.deg - 90) * (Math.PI / 180);
            const x = 50 + 38 * Math.cos(angle);
            const y = 50 + 38 * Math.sin(angle);
            const selected = data.roofOrientation === o.id;
            return (
              <button
                key={o.id}
                onClick={() => updateData({ roofOrientation: o.id })}
                className={`absolute w-12 h-12 rounded-full flex flex-col items-center justify-center text-xs font-medium transition-all transform -translate-x-1/2 -translate-y-1/2 ${
                  selected
                    ? 'bg-[#F5A623] text-[#1A3A5C] shadow-lg scale-110'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                {o.id}
              </button>
            );
          })}
          {/* S Label inside */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-8">
            <p className="text-[10px] text-gray-400">Süd = Optimal</p>
          </div>
        </div>
      </div>

      {/* Roof Area */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200 p-6">
        <label className="text-sm font-medium text-[#1A3A5C] mb-3 block">Geschätzte Dachfläche</label>
        <div className="relative">
          <input
            type="number"
            value={data.roofArea}
            onChange={(e) => updateData({ roofArea: e.target.value })}
            placeholder="z.B. 60"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-16 text-sm text-[#1A3A5C] placeholder:text-gray-400 focus:outline-none focus:border-[#1A3A5C] focus:ring-1 focus:ring-[#1A3A5C]"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">m²</span>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Ungefähre nutzbare Fläche für Solarmodule. Bei Unsicherheit: Einfamilienhaus ≈ 40-60m².
        </p>
      </div>

      {/* Shading */}
      <div>
        <label className="text-sm font-medium text-[#1A3A5C] mb-3 block">Verschattung</label>
        <div className="grid grid-cols-3 gap-3">
          {shadingOptions.map((opt) => {
            const Icon = opt.icon;
            const selected = data.shading === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => updateData({ shading: opt.id })}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  selected
                    ? 'border-[#1A3A5C] bg-[#1A3A5C]/5'
                    : 'border-gray-200 hover:border-gray-300 bg-white/60'
                }`}
              >
                <Icon className={`w-6 h-6 ${selected ? 'text-[#F5A623]' : 'text-gray-400'}`} />
                <p className={`text-xs font-medium ${selected ? 'text-[#1A3A5C]' : 'text-gray-600'}`}>{opt.label}</p>
                <p className="text-[10px] text-gray-400">{opt.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
