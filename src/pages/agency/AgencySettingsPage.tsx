// PROJECT: Voltify | PURPOSE: Einstellungen für Agentur-Inhaber
import { useState, useEffect } from 'react';
import {
  Settings, Save, Loader2, CheckCircle2, Globe, Phone,
  MapPin, Building2, Euro, Percent, Bell, BellOff, Users, ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface AgencyProfile {
  full_name: string;
  phone: string;
  zip: string;
  agency_website: string;
  agency_default_commission_type: 'fixed' | 'percentage';
  agency_default_commission_value: number;
  agency_notify_on_response: boolean;
}

const EMPTY: AgencyProfile = {
  full_name: '',
  phone: '',
  zip: '',
  agency_website: '',
  agency_default_commission_type: 'fixed',
  agency_default_commission_value: 0,
  agency_notify_on_response: true,
};

const inputCls = 'w-full bg-[#0F0F0F] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623]';
const labelCls = 'text-xs font-semibold text-gray-400';
const sectionCls = 'bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden';
const sectionHeaderCls = 'px-6 py-4 border-b border-white/5 flex items-center gap-3';

export default function AgencySettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<AgencyProfile>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, phone, zip, agency_website, agency_default_commission_type, agency_default_commission_value, agency_notify_on_response')
          .eq('id', user.id)
          .single();
        if (data) {
          setForm({
            full_name:                       data.full_name ?? '',
            phone:                           data.phone ?? '',
            zip:                             data.zip ?? '',
            agency_website:                  data.agency_website ?? '',
            agency_default_commission_type:  data.agency_default_commission_type ?? 'fixed',
            agency_default_commission_value: data.agency_default_commission_value ?? 0,
            agency_notify_on_response:       data.agency_notify_on_response ?? true,
          });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    setError(null);
    try {
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({
          full_name:                       form.full_name || null,
          phone:                           form.phone || null,
          zip:                             form.zip || null,
          agency_website:                  form.agency_website || null,
          agency_default_commission_type:  form.agency_default_commission_type,
          agency_default_commission_value: form.agency_default_commission_value,
          agency_notify_on_response:       form.agency_notify_on_response,
        })
        .eq('id', user.id);
      if (updateErr) throw updateErr;
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function set<K extends keyof AgencyProfile>(key: K, value: AgencyProfile[K]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  if (loading) {
    return (
      <div className="min-h-screen flex bg-[#0F0F0F] text-white">
        <AdminSidebar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#F5A623] animate-spin" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#0F0F0F] text-white">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">

        {/* Header */}
        <div className="border-b border-white/5 bg-[#0F0F0F] px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#F5A623]/10 flex items-center justify-center">
              <Settings className="w-4 h-4 text-[#F5A623]" />
            </div>
            <div>
              <h1 className="text-base font-black text-white">Einstellungen</h1>
              <p className="text-xs text-gray-500">Agentur-Konfiguration</p>
            </div>
          </div>
          <button
            form="settings-form"
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-60
              bg-[#F5A623] text-[#1A3A5C] hover:bg-[#E09000]"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> :
              saved  ? <CheckCircle2 className="w-4 h-4" />       :
                       <Save className="w-4 h-4" />}
            {saving ? 'Wird gespeichert…' : saved ? 'Gespeichert!' : 'Speichern'}
          </button>
        </div>

        <form id="settings-form" onSubmit={handleSave}>
          <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* ── Firmenprofil ── */}
            <div className={sectionCls}>
              <div className={sectionHeaderCls}>
                <Building2 className="w-4 h-4 text-[#F5A623]" />
                <h2 className="text-sm font-bold text-white">Firmenprofil</h2>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div className="space-y-1.5">
                  <label className={labelCls}>Agenturname</label>
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={e => set('full_name', e.target.value)}
                    placeholder="Solar Vertrieb GmbH"
                    className={inputCls}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={`${labelCls} flex items-center gap-1.5`}>
                      <Phone className="w-3 h-3" />Telefon
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => set('phone', e.target.value)}
                      placeholder="+49 89 123456"
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={`${labelCls} flex items-center gap-1.5`}>
                      <MapPin className="w-3 h-3" />PLZ / Ort
                    </label>
                    <input
                      type="text"
                      value={form.zip}
                      onChange={e => set('zip', e.target.value)}
                      placeholder="80333 München"
                      className={inputCls}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className={`${labelCls} flex items-center gap-1.5`}>
                    <Globe className="w-3 h-3" />Webseite
                  </label>
                  <input
                    type="url"
                    value={form.agency_website}
                    onChange={e => set('agency_website', e.target.value)}
                    placeholder="https://meine-agentur.de"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {/* ── Standard-Provision ── */}
            <div className={sectionCls}>
              <div className={sectionHeaderCls}>
                <Euro className="w-4 h-4 text-[#F5A623]" />
                <div>
                  <h2 className="text-sm font-bold text-white">Standard-Provision</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Vorausgefüllte Werte beim Anlegen neuer Partner</p>
                </div>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div className="space-y-2">
                  <label className={labelCls}>Provisionsart</label>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { value: 'fixed',      label: 'Festbetrag (€)',  icon: Euro },
                      { value: 'percentage', label: 'Prozentsatz (%)', icon: Percent },
                    ] as const).map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => set('agency_default_commission_type', value)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
                          form.agency_default_commission_type === value
                            ? 'bg-[#F5A623]/10 border-[#F5A623]/40 text-[#F5A623]'
                            : 'bg-[#0F0F0F] border-white/10 text-gray-500 hover:border-white/20'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className={labelCls}>
                    Standardwert ({form.agency_default_commission_type === 'fixed' ? '€' : '%'})
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={form.agency_default_commission_type === 'fixed' ? 50 : 0.5}
                    value={form.agency_default_commission_value}
                    onChange={e => set('agency_default_commission_value', parseFloat(e.target.value) || 0)}
                    className={inputCls}
                  />
                  <p className="text-[11px] text-gray-600">
                    Kann beim Erstellen jedes Partners individuell angepasst werden.
                  </p>
                </div>
              </div>
            </div>

            {/* ── Benachrichtigungen ── */}
            <div className={sectionCls}>
              <div className={sectionHeaderCls}>
                <Bell className="w-4 h-4 text-[#F5A623]" />
                <h2 className="text-sm font-bold text-white">Benachrichtigungen</h2>
              </div>
              <div className="px-6 py-5">
                <button
                  type="button"
                  onClick={() => set('agency_notify_on_response', !form.agency_notify_on_response)}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-[#0F0F0F] border border-white/10 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {form.agency_notify_on_response
                      ? <Bell className="w-4 h-4 text-[#F5A623]" />
                      : <BellOff className="w-4 h-4 text-gray-500" />
                    }
                    <div className="text-left">
                      <p className="text-sm font-semibold text-white">Partner-Antwort per E-Mail</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        E-Mail erhalten wenn ein Partner einen Lead annimmt oder ablehnt
                      </p>
                    </div>
                  </div>
                  <div className={`w-11 h-6 rounded-full border-2 transition-colors relative flex-shrink-0 ${
                    form.agency_notify_on_response
                      ? 'bg-[#F5A623] border-[#F5A623]'
                      : 'bg-[#1A1A1A] border-white/20'
                  }`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      form.agency_notify_on_response ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </div>
                </button>
              </div>
            </div>

            {/* ── Team-Shortcut ── */}
            <button
              type="button"
              onClick={() => navigate('/admin/agency-team')}
              className="w-full flex items-center justify-between p-5 bg-[#1A1A1A] rounded-2xl border border-white/5 hover:border-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <Users className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-white">Team verwalten</p>
                  <p className="text-xs text-gray-500 mt-0.5">Vertriebler einladen und Zugänge verwalten</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>

          </div>
        </form>
      </main>
    </div>
  );
}
