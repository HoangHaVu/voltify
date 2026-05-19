import { useState, useEffect, useRef } from 'react';
import {
  Crown, Palette, Building2, Zap, Calculator, Euro, Loader2,
  CheckCircle, Upload, RotateCcw, Sun, TrendingUp, Percent,
  CreditCard, Clock, MapPin, Globe, User, Copy,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { OfferPreviewCard } from '../components/settings/OfferPreviewCard';
import { InvoicePreviewCard } from '../components/settings/InvoicePreviewCard';
import { WebhookSettingsSection } from '../components/settings/WebhookSettingsSection';
import { AdminSidebar } from '../components/layout/AdminSidebar';
import { supabase } from '../lib/supabase';

// ── Types & Defaults ──

interface OwnerSettings {
  firmenname: string;
  slogan: string;
  logoDataUrl: string;
  primaryColor: string;
  accentColor: string;
  mindestpreis: string;
  marge: string;
  iban: string;
  zahlungsziel: string;
  panelHersteller: string;
  wechselrichterHersteller: string;
  strompreis: string;
  strompreissteigerung: string;
  kfwZinssatz: string;
  eigenverbrauch: string;
  co2Faktor: string;
  plzGebiete: string;
  maxEntfernung: string;
  steuernummer: string;
  adresse: string;
  ort: string;
  geschaeftsfuehrer: string;
  rechnungskreis: string;
}

const DEFAULT_SETTINGS: OwnerSettings = {
  firmenname: 'Voltify Solar',
  slogan: 'Ihre Solaranlage — einfach konfiguriert.',
  logoDataUrl: '',
  primaryColor: '#1A3A5C',
  accentColor: '#F5A623',
  mindestpreis: '12000',
  marge: '18',
  iban: '',
  zahlungsziel: '14',
  panelHersteller: 'Heckert Solar, JA Solar, Trina Solar',
  wechselrichterHersteller: 'SMA, Fronius, Huawei',
  strompreis: '32',
  strompreissteigerung: '3',
  kfwZinssatz: '5.25',
  eigenverbrauch: '65',
  co2Faktor: '0.38',
  plzGebiete: '',
  maxEntfernung: '80',
  steuernummer: '',
  adresse: '',
  ort: '',
  geschaeftsfuehrer: '',
  rechnungskreis: 'RE',
};

const STORAGE_KEY = 'voltify_settings_v1';

// ── Sidebar Navigation ──

export default function AdminSettings() {
  const { user } = useAuth();

  // Settings State
  const [settings, setSettings] = useState<OwnerSettings>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch { /* ignore */ }
    return { ...DEFAULT_SETTINGS };
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const [linkCopied, setLinkCopied] = useState(false);
  const [profileCompanyName, setProfileCompanyName] = useState('');
  const [profileWebsite, setProfileWebsite] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Tabs
  const [activeTab, setActiveTab] = useState<'abo' | 'profil' | 'kalkulation' | 'rechtliches' | 'vorschauen' | 'integration'>('abo');

  const tabs = [
    { id: 'abo' as const, label: 'Abo & Limits' },
    { id: 'profil' as const, label: 'Profil & Branding' },
    { id: 'kalkulation' as const, label: 'Kalkulation' },
    { id: 'rechtliches' as const, label: 'Rechtliches' },
    { id: 'vorschauen' as const, label: 'Vorschauen' },
    { id: 'integration' as const, label: 'Integration' },
  ];

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('company_name, website, bio').eq('id', user.id).single()
      .then(({ data }) => {
        if (data) {
          setProfileCompanyName(data.company_name ?? '');
          setProfileWebsite(data.website ?? '');
          setProfileBio(data.bio ?? '');
        }
      });
  }, [user]);

  const profileUrl = user ? `${window.location.origin}/installer/${user.id}` : '';

  function copyProfileLink() {
    navigator.clipboard.writeText(profileUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }

  function updateSetting<K extends keyof OwnerSettings>(key: K, value: OwnerSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => updateSetting('logoDataUrl', ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function resetLogo() {
    updateSetting('logoDataUrl', '');
    if (logoInputRef.current) logoInputRef.current.value = '';
  }

  async function saveSettings() {
    setSaveStatus('saving');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    if (user) {
      await supabase.from('profiles').update({
        company_name: profileCompanyName || null,
        website: profileWebsite || null,
        bio: profileBio || null,
      }).eq('id', user.id);
    }
    setSaveStatus('success');
    setTimeout(() => setSaveStatus('idle'), 2500);
  }

  return (
    <div className="min-h-screen flex bg-[#0F0F0F] text-white">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#F5A623]/10 flex items-center justify-center text-[#F5A623]">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Inhaber-Konfiguration</h2>
              <p className="text-sm text-gray-500">Branding, Kalkulationsparameter & Regionseinstellungen</p>
            </div>
          </div>
          {/* Tab Navigation */}
          <div className="flex items-center gap-1 bg-[#1A1A1A] rounded-xl p-1 border border-white/5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#F5A623] text-[#1A3A5C] font-bold'
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 px-4 md:px-8 py-8 max-w-5xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {activeTab === 'abo' && (
            <>
            {/* ── Abo & Limits ── */}
            <div className="lg:col-span-2 bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
                <CreditCard className="w-5 h-5 text-[#F5A623]" />
                <h3 className="text-sm font-semibold text-white">Abo & Limits</h3>
                <span className="ml-auto text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">Aktiv</span>
              </div>
              <div className="px-6 py-6">
                {/* Tier-Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Aktuelles Paket</p>
                    <p className="text-xl font-bold text-white">Professional</p>
                    <p className="text-xs text-gray-500">299 €/Monat · 5 Nutzer · unbegrenzte Leads</p>
                  </div>
                  <button className="px-5 py-2.5 bg-[#F5A623] text-[#1A3A5C] rounded-xl text-sm font-bold hover:bg-[#E09000] transition-colors">
                    Upgrade
                  </button>
                </div>

                {/* Limits Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Leads */}
                  <div className="bg-[#252525]/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">Leads diesen Monat</span>
                      <span className="text-xs font-bold text-[#F5A623]">Unbegrenzt</span>
                    </div>
                    <div className="h-2 bg-[#0F0F0F] rounded-full overflow-hidden">
                      <div className="h-full bg-[#F5A623] rounded-full" style={{ width: '35%' }} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5">12 Leads erstellt</p>
                  </div>

                  {/* Team */}
                  <div className="bg-[#252525]/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">Team-Mitglieder</span>
                      <span className="text-xs font-bold text-emerald-400">1 / 5</span>
                    </div>
                    <div className="h-2 bg-[#0F0F0F] rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: '20%' }} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5">Noch 4 Plätze frei</p>
                  </div>

                  {/* Features */}
                  <div className="bg-[#252525]/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">Features</span>
                      <span className="text-xs font-bold text-blue-400">12 / 14</span>
                    </div>
                    <div className="h-2 bg-[#0F0F0F] rounded-full overflow-hidden">
                      <div className="h-full bg-blue-400 rounded-full" style={{ width: '85%' }} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5">Kalender, CRM-Webhook, Lead-Scoring</p>
                  </div>
                </div>

                {/* Feature-Liste */}
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Konfigurator', active: true },
                    { label: 'Lead-Pipeline', active: true },
                    { label: 'Projekte', active: true },
                    { label: 'Angebots-PDF', active: true },
                    { label: 'Rechnungs-PDF', active: true },
                    { label: 'Nachrichten', active: true },
                    { label: 'Kalender', active: true },
                    { label: 'CRM-Webhook', active: true },
                    { label: 'Lead-Scoring', active: true },
                    { label: 'Eigene Domain', active: false, tier: 'Enterprise' },
                    { label: 'API-Zugriff', active: false, tier: 'Enterprise' },
                    { label: 'Multi-Standort', active: false, tier: 'Enterprise' },
                  ].map((feat, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                        feat.active
                          ? 'bg-emerald-500/5 text-emerald-400'
                          : 'bg-gray-500/5 text-gray-600'
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${feat.active ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                      {feat.label}
                      {!feat.active && <span className="ml-auto text-[10px] opacity-60">{feat.tier}</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            </>
            )}

            {activeTab === 'profil' && (
            <>
            {/* ── Öffentliches Profil ── */}
            <div className="bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
                <Globe className="w-5 h-5 text-[#F5A623]" />
                <h3 className="text-sm font-semibold text-white">Öffentliches Profil</h3>
              </div>
              <div className="px-6 py-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400">Dein Profil-Link</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-[#252525] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-400 font-mono truncate">
                      {profileUrl}
                    </div>
                    <button
                      onClick={copyProfileLink}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border font-semibold text-sm transition-colors shrink-0 ${
                        linkCopied
                          ? 'bg-green-500/10 border-green-500/20 text-green-400'
                          : 'border-white/10 hover:bg-white/5 text-gray-300'
                      }`}
                    >
                      {linkCopied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {linkCopied ? 'Kopiert!' : 'Kopieren'}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-400">Firmenname (öffentlich)</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        value={profileCompanyName}
                        onChange={(e) => setProfileCompanyName(e.target.value)}
                        className="w-full bg-[#252525] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#F5A623]/50"
                        placeholder="Muster Solar GmbH"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-400">Website</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="url"
                        value={profileWebsite}
                        onChange={(e) => setProfileWebsite(e.target.value)}
                        className="w-full bg-[#252525] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#F5A623]/50"
                        placeholder="https://muster-solar.de"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400">Kurzbeschreibung</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                    <textarea
                      value={profileBio}
                      onChange={(e) => setProfileBio(e.target.value)}
                      className="w-full bg-[#252525] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#F5A623]/50 resize-none h-20"
                      placeholder="Wir sind ein erfahrener Solarbetrieb..."
                      maxLength={400}
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-right">{profileBio.length}/400</p>
                </div>
              </div>
            </div>

            {/* ── Firmenprofil ── */}
            <div className="bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
                <Building2 className="w-5 h-5 text-[#F5A623]" />
                <h3 className="text-sm font-semibold text-white">Firmenprofil</h3>
              </div>
              <div className="px-6 py-6 space-y-5">
                <div className="space-y-3">
                  <label className="text-xs font-medium text-gray-400">Firmen-Logo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center bg-[#252525] overflow-hidden shrink-0">
                      {settings.logoDataUrl
                        ? <img src={settings.logoDataUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                        : <Sun className="w-8 h-8 text-gray-600" />}
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => logoInputRef.current?.click()}
                        className="flex items-center gap-2 border border-white/10 hover:bg-white/5 text-gray-300 font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
                      >
                        <Upload className="w-4 h-4" />
                        Logo hochladen
                      </button>
                      {settings.logoDataUrl && (
                        <button
                          onClick={resetLogo}
                          className="flex items-center gap-2 text-gray-500 hover:text-red-400 text-xs font-medium transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Zurücksetzen
                        </button>
                      )}
                    </div>
                  </div>
                  <input ref={logoInputRef} type="file" accept="image/png,image/svg+xml,image/jpeg" className="hidden" onChange={handleLogoUpload} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-400">Firmenname</label>
                    <input
                      type="text"
                      value={settings.firmenname}
                      onChange={(e) => updateSetting('firmenname', e.target.value)}
                      className="w-full bg-[#252525] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#F5A623]/50"
                      placeholder="Muster Solar GmbH"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-400">Slogan</label>
                    <input
                      type="text"
                      value={settings.slogan}
                      onChange={(e) => updateSetting('slogan', e.target.value)}
                      className="w-full bg-[#252525] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#F5A623]/50"
                      placeholder="Ihr Partner für Solarenergie"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Branding & Farben ── */}
            <div className="bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden lg:col-span-2">
              <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
                <Palette className="w-5 h-5 text-[#F5A623]" />
                <h3 className="text-sm font-semibold text-white">Branding & Farben</h3>
              </div>
              <div className="px-6 py-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-400">Primärfarbe</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={settings.primaryColor}
                        onChange={(e) => updateSetting('primaryColor', e.target.value)}
                        className="w-12 h-12 rounded-lg border border-white/10 cursor-pointer p-1 bg-[#252525]"
                      />
                      <input
                        type="text"
                        value={settings.primaryColor}
                        onChange={(e) => updateSetting('primaryColor', e.target.value)}
                        className="w-full bg-[#252525] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#F5A623]/50"
                        placeholder="#1A3A5C"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-400">Akzentfarbe</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={settings.accentColor}
                        onChange={(e) => updateSetting('accentColor', e.target.value)}
                        className="w-12 h-12 rounded-lg border border-white/10 cursor-pointer p-1 bg-[#252525]"
                      />
                      <input
                        type="text"
                        value={settings.accentColor}
                        onChange={(e) => updateSetting('accentColor', e.target.value)}
                        className="w-full bg-[#252525] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#F5A623]/50"
                        placeholder="#F5A623"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-5 rounded-lg border border-white/10 overflow-hidden">
                  <div className="px-5 py-3 text-white text-sm font-bold" style={{ backgroundColor: settings.primaryColor }}>
                    {settings.firmenname || 'Ihr Firmenname'}
                  </div>
                  <div className="px-5 py-3 bg-[#252525] flex items-center gap-3">
                    <span className="text-xs font-bold px-3 py-1 rounded-full text-white" style={{ backgroundColor: settings.accentColor }}>
                      Angebot erstellt
                    </span>
                    <span className="text-xs text-gray-500">Vorschau der Farbkombination</span>
                  </div>
                </div>
              </div>
            </div>

            </>
            )}

            {activeTab === 'kalkulation' && (
            <>
            {/* ── Angebots-Konfiguration ── */}
            <div className="bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
                <Zap className="w-5 h-5 text-[#F5A623]" />
                <h3 className="text-sm font-semibold text-white">Angebots-Konfiguration</h3>
              </div>
              <div className="px-6 py-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-400">Mindestpreis (€)</label>
                    <div className="relative">
                      <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="number"
                        value={settings.mindestpreis}
                        onChange={(e) => updateSetting('mindestpreis', e.target.value)}
                        className="w-full bg-[#252525] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#F5A623]/50"
                        min="0" step="500"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-400">Standard-Marge (%)</label>
                    <div className="relative">
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="number"
                        value={settings.marge}
                        onChange={(e) => updateSetting('marge', e.target.value)}
                        className="w-full bg-[#252525] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#F5A623]/50"
                        min="0" max="100" step="0.5"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-400">Standard-IBAN</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        value={settings.iban}
                        onChange={(e) => updateSetting('iban', e.target.value)}
                        className="w-full bg-[#252525] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#F5A623]/50"
                        placeholder="DE89 3704 0044 0532 0130 00"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-400">Zahlungsziel (Tage)</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="number"
                        value={settings.zahlungsziel}
                        onChange={(e) => updateSetting('zahlungsziel', e.target.value)}
                        className="w-full bg-[#252525] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#F5A623]/50"
                        min="0" max="90"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400">Panel-Hersteller</label>
                  <input
                    type="text"
                    value={settings.panelHersteller}
                    onChange={(e) => updateSetting('panelHersteller', e.target.value)}
                    className="w-full bg-[#252525] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#F5A623]/50"
                    placeholder="Heckert Solar, JA Solar, Trina Solar"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400">Wechselrichter-Hersteller</label>
                  <input
                    type="text"
                    value={settings.wechselrichterHersteller}
                    onChange={(e) => updateSetting('wechselrichterHersteller', e.target.value)}
                    className="w-full bg-[#252525] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#F5A623]/50"
                    placeholder="SMA, Fronius, Huawei"
                  />
                </div>
              </div>
            </div>

            {/* ── Kalkulations-Parameter ── */}
            <div className="bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
                <Calculator className="w-5 h-5 text-[#F5A623]" />
                <h3 className="text-sm font-semibold text-white">Kalkulations-Parameter</h3>
              </div>
              <div className="px-6 py-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-400">Strompreis (ct/kWh)</label>
                    <div className="relative">
                      <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="number"
                        value={settings.strompreis}
                        onChange={(e) => updateSetting('strompreis', e.target.value)}
                        className="w-full bg-[#252525] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#F5A623]/50"
                        min="0" step="0.5"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-400">Strompreissteigerung (%/Jahr)</label>
                    <div className="relative">
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="number"
                        value={settings.strompreissteigerung}
                        onChange={(e) => updateSetting('strompreissteigerung', e.target.value)}
                        className="w-full bg-[#252525] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#F5A623]/50"
                        min="0" step="0.1"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-400">KfW-Zinssatz (%)</label>
                    <div className="relative">
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="number"
                        value={settings.kfwZinssatz}
                        onChange={(e) => updateSetting('kfwZinssatz', e.target.value)}
                        className="w-full bg-[#252525] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#F5A623]/50"
                        min="0" step="0.05"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-400">Eigenverbrauchsquote (%)</label>
                    <div className="relative">
                      <Sun className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="number"
                        value={settings.eigenverbrauch}
                        onChange={(e) => updateSetting('eigenverbrauch', e.target.value)}
                        className="w-full bg-[#252525] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#F5A623]/50"
                        min="0" max="100"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-400">CO₂-Faktor (kg/kWh)</label>
                    <input
                      type="number"
                      value={settings.co2Faktor}
                      onChange={(e) => updateSetting('co2Faktor', e.target.value)}
                      className="w-full bg-[#252525] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#F5A623]/50"
                      min="0" step="0.01"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Region & Verfügbarkeit ── */}
            <div className="bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
                <MapPin className="w-5 h-5 text-[#F5A623]" />
                <h3 className="text-sm font-semibold text-white">Region & Verfügbarkeit</h3>
              </div>
              <div className="px-6 py-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400">Bediente PLZ-Gebiete</label>
                  <textarea
                    value={settings.plzGebiete}
                    onChange={(e) => updateSetting('plzGebiete', e.target.value)}
                    className="w-full bg-[#252525] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#F5A623]/50 resize-none h-20"
                    placeholder="80, 81, 82, 83, 84, 85"
                  />
                  <p className="text-xs text-gray-500">Komma-getrennte Postleitzahlen oder Präfixe — leer = überregional</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-400">Max. Entfernung (km)</label>
                  <input
                    type="number"
                    value={settings.maxEntfernung}
                    onChange={(e) => updateSetting('maxEntfernung', e.target.value)}
                    className="w-full bg-[#252525] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#F5A623]/50"
                    min="0" step="5"
                  />
                </div>
              </div>
            </div>

            </>
            )}

            {activeTab === 'rechtliches' && (
            <>
            {/* ── Rechtliche Pflichtangaben ── */}
            <div className="bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
                <CreditCard className="w-5 h-5 text-[#F5A623]" />
                <h3 className="text-sm font-semibold text-white">Rechtliche Pflichtangaben</h3>
              </div>
              <div className="px-6 py-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-400">Steuernummer / USt-IdNr.</label>
                    <input
                      type="text"
                      value={settings.steuernummer}
                      onChange={(e) => updateSetting('steuernummer', e.target.value)}
                      className="w-full bg-[#252525] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#F5A623]/50"
                      placeholder="123/456/78901"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-400">Rechnungsnummernkreis</label>
                    <input
                      type="text"
                      value={settings.rechnungskreis}
                      onChange={(e) => updateSetting('rechnungskreis', e.target.value)}
                      className="w-full bg-[#252525] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#F5A623]/50"
                      placeholder="RE"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-400">Straße & Hausnummer</label>
                    <input
                      type="text"
                      value={settings.adresse}
                      onChange={(e) => updateSetting('adresse', e.target.value)}
                      className="w-full bg-[#252525] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#F5A623]/50"
                      placeholder="Musterstraße 1"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-400">PLZ & Ort</label>
                    <input
                      type="text"
                      value={settings.ort}
                      onChange={(e) => updateSetting('ort', e.target.value)}
                      className="w-full bg-[#252525] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#F5A623]/50"
                      placeholder="80331 München"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-400">Geschäftsführer</label>
                    <input
                      type="text"
                      value={settings.geschaeftsfuehrer}
                      onChange={(e) => updateSetting('geschaeftsfuehrer', e.target.value)}
                      className="w-full bg-[#252525] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#F5A623]/50"
                      placeholder="Max Mustermann"
                    />
                  </div>
                </div>
              </div>
            </div>

            </>
            )}

            {activeTab === 'vorschauen' && (
            <>
            {/* ── Angebots-Vorschau ── */}
            <div className="bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
                <Sun className="w-5 h-5 text-[#F5A623]" />
                <h3 className="text-sm font-semibold text-white">Angebots-Vorschau</h3>
              </div>
              <div className="px-6 py-6 bg-[#0F0F0F]">
                <p className="text-xs text-gray-500 text-center mb-5">
                  So sieht dein Angebot für einen Musterkunden aus.
                </p>
                <OfferPreviewCard
                  firmenname={settings.firmenname}
                  slogan={settings.slogan}
                  logoDataUrl={settings.logoDataUrl}
                  primaryColor={settings.primaryColor}
                  accentColor={settings.accentColor}
                  iban={settings.iban}
                  zahlungsziel={settings.zahlungsziel}
                  panelHersteller={settings.panelHersteller}
                  wechselrichterHersteller={settings.wechselrichterHersteller}
                  marge={settings.marge}
                />
              </div>
            </div>

            {/* ── Rechnungs-Vorschau ── */}
            <div className="bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
                <Euro className="w-5 h-5 text-[#F5A623]" />
                <h3 className="text-sm font-semibold text-white">Rechnungs-Vorschau</h3>
              </div>
              <div className="px-6 py-6 bg-[#0F0F0F]">
                <p className="text-xs text-gray-500 text-center mb-5">
                  Musterrechnung mit deinen Einstellungen — inkl. 0 % MwSt. nach § 12 Abs. 3 UStG.
                </p>
                <InvoicePreviewCard
                  firmenname={settings.firmenname}
                  slogan={settings.slogan}
                  logoDataUrl={settings.logoDataUrl}
                  primaryColor={settings.primaryColor}
                  accentColor={settings.accentColor}
                  iban={settings.iban}
                  zahlungsziel={settings.zahlungsziel}
                  steuernummer={settings.steuernummer}
                  adresse={settings.adresse}
                  ort={settings.ort}
                  geschaeftsfuehrer={settings.geschaeftsfuehrer}
                  rechnungskreis={settings.rechnungskreis}
                />
              </div>
            </div>

            </>
            )}

            {activeTab === 'integration' && (
            <>
            {/* ── CRM-Webhook ── */}
            <div className="lg:col-span-2 space-y-8">
              <WebhookSettingsSection />
            </div>
            </>
            )}

            {/* ── Speichern ── */}
            <div className="flex items-center gap-4 pb-8 lg:col-span-2">
              <button
                onClick={saveSettings}
                disabled={saveStatus === 'saving'}
                className="flex items-center gap-2 bg-[#F5A623] hover:bg-[#E09000] text-[#1A3A5C] font-bold px-8 py-3 rounded-lg transition-colors disabled:opacity-60 shadow-sm"
              >
                {saveStatus === 'saving'
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Speichern…</>
                  : 'Einstellungen speichern'}
              </button>
              {saveStatus === 'success' && (
                <span className="flex items-center gap-2 text-green-400 font-semibold text-sm">
                  <CheckCircle className="w-5 h-5" />
                  Gespeichert
                </span>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
