import { useState } from 'react';
import { Upload, Zap, Users, Calculator } from 'lucide-react';
import type { WizardData } from '../../pages/Configurator';

interface Props {
  data: WizardData;
  updateData: (p: Partial<WizardData>) => void;
}

const presets = [
  { id: 'small', label: '1-2 Personen', value: '2500', icon: Users, desc: '~2.500 kWh/Jahr' },
  { id: 'medium', label: '3-4 Personen', value: '4000', icon: Users, desc: '~4.000 kWh/Jahr' },
  { id: 'large', label: '5+ Personen', value: '6000', icon: Users, desc: '~6.000 kWh/Jahr' },
];

export default function Step3_Consumption({ data, updateData }: Props) {
  const [method, setMethod] = useState<'manual' | 'preset'>(data.consumptionMethod === 'upload' ? 'manual' : data.consumptionMethod);

  const handlePreset = (value: string) => {
    updateData({ consumption: value, consumptionMethod: 'preset' });
  };

  const handleManual = (value: string) => {
    updateData({ consumption: value, consumptionMethod: 'manual' });
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-semibold text-[#1A3A5C] mb-2">Stromverbrauch</h2>
        <p className="text-gray-500 text-sm">Wie viel Strom verbrauchen Sie jährlich?</p>
      </div>

      {/* Upload Option */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-dashed border-gray-300 p-8 text-center hover:border-[#1A3A5C] transition-colors cursor-pointer">
        <div className="w-12 h-12 rounded-xl bg-[#F5A623]/10 flex items-center justify-center mx-auto mb-3">
          <Upload className="w-6 h-6 text-[#F5A623]" />
        </div>
        <p className="text-sm font-medium text-[#1A3A5C] mb-1">Stromrechnung hochladen</p>
        <p className="text-xs text-gray-400">PDF oder Bild (max. 10MB)</p>
        <input type="file" accept=".pdf,image/*" className="hidden" />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">oder</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Method Toggle */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
        <button
          onClick={() => setMethod('preset')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
            method === 'preset' ? 'bg-white text-[#1A3A5C] shadow-sm font-medium' : 'text-gray-500'
          }`}
        >
          <Users className="w-4 h-4" />
          Nach Haushaltsgröße
        </button>
        <button
          onClick={() => setMethod('manual')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
            method === 'manual' ? 'bg-white text-[#1A3A5C] shadow-sm font-medium' : 'text-gray-500'
          }`}
        >
          <Calculator className="w-4 h-4" />
          Manuell eingeben
        </button>
      </div>

      {/* Preset Cards */}
      {method === 'preset' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {presets.map((preset) => {
            const Icon = preset.icon;
            const selected = data.consumptionMethod === 'preset' && data.consumption === preset.value;
            return (
              <button
                key={preset.id}
                onClick={() => handlePreset(preset.value)}
                className={`flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all ${
                  selected
                    ? 'border-[#1A3A5C] bg-[#1A3A5C]/5'
                    : 'border-gray-200 hover:border-gray-300 bg-white/60'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selected ? 'bg-[#F5A623]' : 'bg-gray-100'}`}>
                  <Icon className={`w-5 h-5 ${selected ? 'text-[#1A3A5C]' : 'text-gray-500'}`} />
                </div>
                <p className={`text-sm font-medium ${selected ? 'text-[#1A3A5C]' : 'text-gray-700'}`}>{preset.label}</p>
                <p className="text-xs text-gray-400">{preset.desc}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* Manual Input */}
      {method === 'manual' && (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200 p-6">
          <label className="text-sm font-medium text-[#1A3A5C] mb-3 block">Jährlicher Stromverbrauch</label>
          <div className="relative">
            <input
              type="number"
              value={data.consumption}
              onChange={(e) => handleManual(e.target.value)}
              placeholder="z.B. 4000"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-20 text-sm text-[#1A3A5C] placeholder:text-gray-400 focus:outline-none focus:border-[#1A3A5C] focus:ring-1 focus:ring-[#1A3A5C]"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">kWh/Jahr</span>
          </div>
          {/* Slider */}
          <input
            type="range"
            min={1000}
            max={15000}
            step={100}
            value={Number(data.consumption) || 4000}
            onChange={(e) => handleManual(e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[#F5A623] mt-4"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>1.000 kWh</span>
            <span>15.000 kWh</span>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-[#1A3A5C]/5 border border-[#1A3A5C]/10">
        <Zap className="w-5 h-5 text-[#F5A623] flex-shrink-0 mt-0.5" />
        <p className="text-sm text-[#1A3A5C]">
          Je höher Ihr Stromverbrauch, desto mehr Solarmodule lohnen sich. Ein typischer 4-Personen-Haushalt verbraucht etwa 4.000 kWh pro Jahr.
        </p>
      </div>
    </div>
  );
}
