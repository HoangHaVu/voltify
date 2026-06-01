import { useState } from 'react';
import { X, User, Mail, Phone, MapPin, Home, Zap, Sun, DollarSign, Calendar, Car, Thermometer, Battery } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { calculateROI } from '../../lib/calculations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  installerId: string;
  onSuccess: () => void;
}

export default function AddLeadModal({ isOpen, onClose, installerId, onSuccess }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    zip: '',
    address: '',
    buildingType: 'efh',
    ownership: 'eigentuemer',
    roofOrientation: 'S',
    roofTilt: '30',
    roofArea: '',
    shading: 'none',
    consumption: '4500',
    electricityPrice: '0.32',
    constructionYear: 'after2010',
    hasECar: false,
    hasHeatPump: false,
    hasBattery: false,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // ROI berechnen
      const calc = calculateROI({
        buildingType: form.buildingType,
        ownership: form.ownership,
        roofTilt: Number(form.roofTilt),
        roofOrientation: form.roofOrientation,
        roofArea: form.roofArea,
        shading: form.shading,
        consumption: form.consumption,
        consumptionMethod: 'manual',
        storageSize: form.hasBattery ? '10' : 'none',
        wallbox: false,
        futureCar: form.hasECar,
        heatPump: form.hasHeatPump,
        backupPower: false,
        energyApp: false,
        electricityPrice: form.electricityPrice,
        constructionYear: form.constructionYear,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        zipCode: form.zip,
        city: '',
        company: '',
        privacyConsent: true,
      });

      // Lead in DB speichern
      const { error } = await supabase.from('leads').insert({
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        phone: form.phone || null,
        zip: form.zip || null,
        installer_id: installerId,
        building_type: form.buildingType,
        ownership: form.ownership,
        roof_orientation: form.roofOrientation,
        roof_tilt: Number(form.roofTilt),
        roof_area: form.roofArea ? Number(form.roofArea) : null,
        shading: form.shading,
        consumption: Number(form.consumption) || 4500,
        has_e_car: form.hasECar,
        has_heat_pump: form.hasHeatPump,
        has_battery: form.hasBattery,
        electricity_price: Number(form.electricityPrice) || 0.32,
        construction_year: form.constructionYear,
        kwp: calc.kwp,
        investment: calc.investment,
        annual_savings: calc.annualSavings,
        amortization: calc.amortization,
        autarky: calc.autarky,
        profit_20_years: calc.profit20Years,
        score: calc.score,
        source: 'direct',
        status: 'neu',
        offer_status: 'created',
      });

      if (error) throw error;
      onSuccess();
      onClose();
      // Form zurücksetzen
      setForm({
        firstName: '', lastName: '', email: '', phone: '', zip: '', address: '',
        buildingType: 'efh', ownership: 'eigentuemer', roofOrientation: 'S',
        roofTilt: '30', roofArea: '', shading: 'none', consumption: '4500',
        electricityPrice: '0.32', constructionYear: 'after2010',
        hasECar: false, hasHeatPump: false, hasBattery: false,
      });
    } catch (err) {
      console.error('Fehler beim Speichern:', err);
      alert('Fehler beim Speichern. Bitte versuchen Sie es erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full bg-[#0F0F0F] border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:ring-1 focus:ring-[#F5A623] outline-none placeholder:text-gray-600";
  const labelClass = "text-xs font-bold text-gray-500 mb-1 block";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1A1A1A] rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div>
            <h2 className="text-lg font-bold text-white">Neuen Lead hinzufügen</h2>
            <p className="text-xs text-gray-500 mt-0.5">Erfassen Sie einen Lead manuell nach Telefonat oder Vor-Ort-Termin</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Kontaktdaten */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Vorname *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 w-4 h-4" />
                <input className={`${inputClass} pl-10`} required value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} placeholder="Max" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Nachname *</label>
              <input className={inputClass} required value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} placeholder="Mustermann" />
            </div>
            <div>
              <label className={labelClass}>E-Mail *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 w-4 h-4" />
                <input className={`${inputClass} pl-10`} type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="max@example.com" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Telefon</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 w-4 h-4" />
                <input className={`${inputClass} pl-10`} value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="0176 12345678" />
              </div>
            </div>
          </div>

          {/* Adresse */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>PLZ *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 w-4 h-4" />
                <input className={`${inputClass} pl-10`} required value={form.zip} onChange={e => setForm({...form, zip: e.target.value})} placeholder="80331" maxLength={5} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Adresse</label>
              <input className={inputClass} value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Musterstraße 1" />
            </div>
          </div>

          {/* Gebäude */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Gebäudetyp</label>
              <select className={inputClass} value={form.buildingType} onChange={e => setForm({...form, buildingType: e.target.value})}>
                <option value="efh">Einfamilienhaus</option>
                <option value="mfh">Mehrfamilienhaus</option>
                <option value="gewerbe">Gewerbe</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Eigentumsform</label>
              <select className={inputClass} value={form.ownership} onChange={e => setForm({...form, ownership: e.target.value})}>
                <option value="eigentuemer">Eigentümer</option>
                <option value="mieter">Mieter</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Baujahr</label>
              <select className={inputClass} value={form.constructionYear} onChange={e => setForm({...form, constructionYear: e.target.value})}>
                <option value="after2010">Ab 2010</option>
                <option value="before2010">Vor 2010</option>
                <option value="before1980">Vor 1980</option>
              </select>
            </div>
          </div>

          {/* Dach */}
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className={labelClass}>Dachfläche (m²)</label>
              <div className="relative">
                <Home className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 w-4 h-4" />
                <input className={`${inputClass} pl-10`} type="number" min="10" value={form.roofArea} onChange={e => setForm({...form, roofArea: e.target.value})} placeholder="60" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Ausrichtung</label>
              <select className={inputClass} value={form.roofOrientation} onChange={e => setForm({...form, roofOrientation: e.target.value})}>
                <option value="S">Süd</option>
                <option value="SO">Süd-Ost</option>
                <option value="SW">Süd-West</option>
                <option value="O">Ost</option>
                <option value="W">West</option>
                <option value="N">Nord</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Neigung (°)</label>
              <input className={inputClass} type="number" min="0" max="90" value={form.roofTilt} onChange={e => setForm({...form, roofTilt: e.target.value})} placeholder="30" />
            </div>
            <div>
              <label className={labelClass}>Verschattung</label>
              <select className={inputClass} value={form.shading} onChange={e => setForm({...form, shading: e.target.value})}>
                <option value="none">Keine</option>
                <option value="partial">Teilweise</option>
                <option value="strong">Stark</option>
              </select>
            </div>
          </div>

          {/* Verbrauch & Preis */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Stromverbrauch (kWh/Jahr)</label>
              <div className="relative">
                <Zap className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 w-4 h-4" />
                <input className={`${inputClass} pl-10`} type="number" min="1000" value={form.consumption} onChange={e => setForm({...form, consumption: e.target.value})} placeholder="4500" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Strompreis (€/kWh)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 w-4 h-4" />
                <input className={`${inputClass} pl-10`} type="number" step="0.01" min="0.1" max="1" value={form.electricityPrice} onChange={e => setForm({...form, electricityPrice: e.target.value})} placeholder="0.32" />
              </div>
            </div>
          </div>

          {/* Optionen */}
          <div>
            <label className={labelClass}>Zusätzliche Optionen</label>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setForm({...form, hasECar: !form.hasECar})} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${form.hasECar ? 'bg-[#F5A623]/10 border-[#F5A623]/30 text-[#F5A623]' : 'bg-[#252525] border-white/10 text-gray-400'}`}>
                <Car className="w-3.5 h-3.5" /> E-Auto
              </button>
              <button type="button" onClick={() => setForm({...form, hasHeatPump: !form.hasHeatPump})} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${form.hasHeatPump ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' : 'bg-[#252525] border-white/10 text-gray-400'}`}>
                <Thermometer className="w-3.5 h-3.5" /> Wärmepumpe
              </button>
              <button type="button" onClick={() => setForm({...form, hasBattery: !form.hasBattery})} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${form.hasBattery ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-[#252525] border-white/10 text-gray-400'}`}>
                <Battery className="w-3.5 h-3.5" /> Batteriespeicher
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
            <button type="button" onClick={onClose} className="text-sm font-bold text-gray-400 hover:text-white px-4 py-2.5 transition-colors">
              Abbrechen
            </button>
            <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-[#F5A623] hover:bg-[#E09000] text-[#1A3A5C] font-bold text-sm px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50">
              {isSubmitting ? 'Speichern…' : 'Lead speichern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
