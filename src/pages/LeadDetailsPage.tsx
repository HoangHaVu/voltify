import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PDFDownloadLink } from '@react-pdf/renderer';
import {
  ArrowLeft, Sun, Mail, Phone, MapPin, Zap, Euro, Calendar,
  Flame, Snowflake, ChevronDown, Clock, CreditCard, Home,
  Compass, BatteryCharging, Car, Thermometer, TrendingUp,
  Video, BarChart2, FileText, Send, CheckCircle, Eye, XCircle,
  Tag, Percent, Loader2, ArrowRight, AlertCircle, Receipt,
  Download, Check, AlertTriangle, FilePlus,
} from 'lucide-react';
import { AdminSidebar } from '../components/layout/AdminSidebar';
import SolarPlanningSection from '../components/solar-planner/SolarPlanningSection';
import { useAuth } from '../contexts/AuthContext';
import { useInstallerLead } from '../hooks/useInstallerLead';
import { getScoreResult, computeLeadScoreDetailed } from '../utils/leadScore';
import { calculateROI, generateStorageVariants } from '../lib/calculations';
import InvoicePdfDocument from '../components/pdf/InvoicePdfDocument';
import CalculationPdfDocument from '../components/pdf/CalculationPdfDocument';
import type { CompanySettings } from '../components/pdf/OfferPdfDocument';
import ActivityLog from '../components/lead/ActivityLog';
import { getOfferDraftForLead, type OfferDraft } from '../services/offers';
import type { Lead, Project } from '../services/data';

const TIER_ICON = { heiss: Flame, warm: Zap, kalt: Snowflake };

const OFFER_CONFIG: Record<Lead['offer_status'], { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
  created:  { label: 'Noch nicht versendet', icon: FileText,     color: 'text-gray-400',  bg: 'bg-[#252525]', border: 'border-white/5' },
  sent:     { label: 'Angebot versendet',    icon: Send,         color: 'text-blue-400',  bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  viewed:   { label: 'Angebot angesehen',    icon: Eye,          color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  accepted: { label: 'Angebot angenommen ✓', icon: CheckCircle,  color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  rejected: { label: 'Angebot abgelehnt',    icon: XCircle,      color: 'text-red-400',   bg: 'bg-red-500/10', border: 'border-red-500/20' },
};

const STATUS_OPTIONS: { value: Lead['status']; label: string }[] = [
  { value: 'neu', label: 'Neu' },
  { value: 'kontaktiert', label: 'Kontaktiert' },
  { value: 'angebot', label: 'Angebot versendet' },
  { value: 'abschluss', label: 'Abschluss' },
  { value: 'gewonnen', label: 'Gewonnen' },
  { value: 'verloren', label: 'Verloren' },
];

const STATUS_COLOR: Record<Lead['status'], string> = {
  neu: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  kontaktiert: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  vorort: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  angebot: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  abschluss: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  gewonnen: 'bg-green-500/10 text-green-400 border-green-500/20',
  verloren: 'bg-red-500/10 text-red-400 border-red-500/20',
  planung: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  installation: 'bg-green-500/10 text-green-400 border-green-500/20',
  abgeschlossen: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

const HORIZON_LABEL: Record<string, string> = {
  sofort: 'So bald wie möglich',
  '3monate': 'In 3 Monaten',
  '12monate': 'In 12 Monaten',
};

const ORIENTATION_LABEL: Record<string, string> = {
  sued: 'Süd',
  ostwest: 'Ost / West',
  nord: 'Nord',
};

const CONSTRUCTION_LABEL: Record<string, string> = {
  pre1980: 'Vor 1980',
  '1980-2000': '1980 – 2000',
  '2000-2010': '2000 – 2010',
  after2010: 'Nach 2010',
};

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  accent?: string;
}
function InfoRow({ icon, label, value, accent }: InfoRowProps) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${accent ?? 'bg-[#252525]'}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

interface StatCardProps { label: string; value: string; sub?: string; icon: React.ReactNode; accent?: string }
function StatCard({ label, value, sub, icon, accent }: StatCardProps) {
  return (
    <div className="bg-[#1A1A1A] rounded-xl p-4 flex flex-col gap-1 border border-white/5">
      <div className={`flex items-center gap-1.5 mb-1 ${accent ?? 'text-gray-500'}`}>
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-xl font-black text-white">{value}</p>
      {sub && <p className="text-[10px] text-gray-500 font-medium">{sub}</p>}
    </div>
  );
}

// ─── Default company settings for PDF ───
const DEFAULT_COMPANY: CompanySettings = {
  firmenname: 'Voltify Solar',
  slogan: 'Ihre Solaranlage — einfach konfiguriert.',
  logoDataUrl: '',
  primaryColor: '#1A3A5C',
  accentColor: '#F5A623',
  iban: '',
  zahlungsziel: '14',
  steuernummer: '',
  adresse: '',
  ort: '',
  geschaeftsfuehrer: '',
  rechnungskreis: 'RE',
};

function loadCompanySettings(): CompanySettings {
  try {
    const raw = localStorage.getItem('voltify_settings_v1');
    if (raw) return { ...DEFAULT_COMPANY, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return DEFAULT_COMPANY;
}

function generateOfferNumber(lead: Lead): string {
  const prefix = loadCompanySettings().rechnungskreis || 'RE';
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const leadId = lead.id.slice(0, 4).toUpperCase();
  return `${prefix}-${date}-${leadId}`;
}

// ─── Angebots-CTA Sub-Component ───────────────────────────────────────
function OfferActionSection({
  lead,
  draft,
  loadingDraft,
  onStatusChange,
}: {
  lead: Lead;
  draft: OfferDraft | null;
  loadingDraft: boolean;
  onStatusChange: (status: Lead['offer_status']) => Promise<void>;
}) {
  const navigate = useNavigate();
  const company = loadCompanySettings();

  const statusLabel: Record<OfferDraft['status'], string> = {
    draft: 'Entwurf vorhanden',
    sent: 'Angebot versendet',
    accepted: 'Angebot angenommen',
    rejected: 'Angebot abgelehnt',
  };

  const statusColor: Record<OfferDraft['status'], string> = {
    draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    sent: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    accepted: 'bg-green-500/10 text-green-400 border-green-500/20',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <section className="bg-[#1A1A1A] rounded-xl border border-white/5 p-6">
      <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Angebot</h2>

      {loadingDraft ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-[#F5A623] animate-spin" />
        </div>
      ) : draft ? (
        <div className="space-y-4">
          <div className={`inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full border ${statusColor[draft.status]}`}>
            <FileText className="w-3.5 h-3.5" />
            {statusLabel[draft.status]}
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Gesamtsumme</span>
            <span className="text-2xl font-black text-[#F5A623]">{draft.total.toLocaleString('de-DE')} €</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate(`/lead/${lead.id}/offer`)}
              className="flex items-center gap-2 bg-[#F5A623] hover:bg-[#E09000] text-[#1A3A5C] font-bold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              <FilePlus className="w-4 h-4" />
              {draft.status === 'draft' ? 'Angebot bearbeiten' : 'Angebot ansehen'}
            </button>

            {draft.status === 'sent' && (
              <>
                <button
                  onClick={() => onStatusChange('viewed')}
                  className="flex items-center gap-2 border border-purple-500/20 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-bold text-sm px-4 py-2.5 rounded-xl transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Als angesehen
                </button>
                <button
                  onClick={() => onStatusChange('accepted')}
                  className="flex items-center gap-2 border border-green-500/20 bg-green-500/10 hover:bg-green-500/20 text-green-400 font-bold text-sm px-4 py-2.5 rounded-xl transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Angenommen
                </button>
                <button
                  onClick={() => onStatusChange('rejected')}
                  className="flex items-center gap-2 border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-sm px-4 py-2.5 rounded-xl transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Abgelehnt
                </button>
              </>
            )}
          </div>

          {draft.status === 'accepted' && (
            <div className="pt-4 border-t border-white/5 space-y-3">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5" />
                Abschlagsrechnungen
              </p>
              <div className="flex flex-wrap gap-2">
                {([1, 2, 3] as const).map((type) => {
                  const isPaid = type === 1 ? lead.payment_1_paid : type === 2 ? lead.payment_2_paid : lead.payment_3_paid;
                  const invNum = `${draft.offer_number || lead.id.slice(0, 8).toUpperCase()}-${String(type).padStart(2, '0')}`;
                  return (
                    <PDFDownloadLink
                      key={type}
                      document={<InvoicePdfDocument lead={lead} company={company} invoiceNumber={invNum} type={type} />}
                      fileName={`Rechnung-${invNum}.pdf`}
                      className="flex items-center gap-1.5 bg-[#252525] border border-white/10 text-white font-bold text-xs px-3 py-2 rounded-lg hover:bg-[#333] transition-colors cursor-pointer"
                    >
                      {({ loading }) => (
                        <>
                          <Receipt className="w-3.5 h-3.5" />
                          {loading ? 'PDF…' : (
                            <>
                              {type === 3 ? 'Schlussrechnung (10%)' : `Rechnung ${type}/${type === 1 ? '30' : '60'}%`}
                              {isPaid && <span className="ml-1 text-[9px] text-green-400">✓</span>}
                            </>
                          )}
                        </>
                      )}
                    </PDFDownloadLink>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6">
          <FileText className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm mb-4">Noch kein Angebot erstellt</p>
          <button
            onClick={() => navigate(`/lead/${lead.id}/offer`)}
            className="flex items-center justify-center gap-2 w-full bg-[#F5A623] hover:bg-[#E09000] text-[#1A3A5C] font-bold text-sm px-5 py-3 rounded-xl transition-colors shadow-sm"
          >
            <FilePlus className="w-4 h-4" />
            Angebot erstellen
          </button>
        </div>
      )}
    </section>
  );
}

export default function LeadDetailsPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { lead, isLoading, changeStatus, changeOfferStatus } = useInstallerLead(id);

  const [draft, setDraft] = useState<OfferDraft | null>(null);
  const [loadingDraft, setLoadingDraft] = useState(true);
  const [planningPng, setPlanningPng] = useState<string | undefined>(
    lead?.module_layout?.previewPng ?? undefined
  );

  useEffect(() => {
    if (!id) return;
    setLoadingDraft(true);
    getOfferDraftForLead(id)
      .then(setDraft)
      .catch((e) => console.error('Fehler beim Laden des Angebots-Entwurfs:', e))
      .finally(() => setLoadingDraft(false));
  }, [id]);

  const scoreResult = lead?.score != null ? getScoreResult(lead.score) : null;
  const detailedScore = lead ? computeLeadScoreDetailed({
    kwp: lead.kwp,
    investment: lead.investment,
    zip: lead.zip,
    isOwner: true,
    hasBattery: lead.has_battery,
    area: lead.roof_area,
    planningHorizon: lead.planning_horizon ?? undefined,
  }) : null;
  const TierIcon = scoreResult ? TIER_ICON[scoreResult.tier] : null;

  // Realistische Amortisation mit Folgekosten berechnen
  const realisticCalc = lead ? calculateROI({
    buildingType: lead.building_type || 'efh',
    ownership: lead.ownership || 'eigentuemer',
    roofTilt: lead.roof_tilt || 30,
    roofOrientation: lead.roof_orientation || 'S',
    roofArea: String(lead.roof_area || 50),
    shading: lead.shading || 'none',
    consumption: String(lead.consumption || 4000),
    consumptionMethod: 'manual',
    storageSize: lead.has_battery ? '10' : 'none',
    wallbox: false,
    futureCar: lead.has_e_car || false,
    heatPump: lead.has_heat_pump || false,
    backupPower: false,
    energyApp: false,
    electricityPrice: String(lead.electricity_price || 0.32),
    constructionYear: lead.construction_year || 'after2010',
    firstName: lead.first_name,
    lastName: lead.last_name,
    email: lead.email,
    phone: lead.phone || '',
    zipCode: lead.zip || '',
    city: '',
    company: '',
    privacyConsent: true,
  }) : null;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });

  const leadAsProject = lead ? ({
    id: lead.id,
    status: 'angebot' as const,
    zip: lead.zip,
    kwp: lead.kwp,
    investment: lead.final_price ?? lead.investment,
    annual_savings: lead.annual_savings,
    amortization: lead.amortization,
    autarky: lead.autarky,
    notes: null,
    customer_id: null,
    installer_id: null,
    lead_id: null,
    created_at: lead.created_at,
    customer: { id: '', full_name: `${lead.first_name} ${lead.last_name}`, phone: lead.phone, zip: lead.zip },
    installer: null,
    lead: null,
  } as unknown as Project) : null;

  return (
    <div className="min-h-screen flex bg-[#0F0F0F] text-white">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto px-6 py-8">

          {isLoading && (
            <div className="flex justify-center py-24">
              <Sun className="w-10 h-10 text-[#F5A623] animate-spin" />
            </div>
          )}

          {!isLoading && !lead && (
            <div className="bg-[#1A1A1A] rounded-xl border border-white/5 p-12 text-center text-gray-500">
              <p className="font-semibold">Lead nicht gefunden.</p>
            </div>
          )}

          {!isLoading && lead && (
            <>
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-white transition-colors mb-6 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                Zurück zur Pipeline
              </button>

              {/* Header */}
              <header className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${STATUS_COLOR[lead.status]}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {STATUS_OPTIONS.find(o => o.value === lead.status)?.label}
                    </span>
                    {scoreResult && TierIcon && (
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${scoreResult.bgColor} ${scoreResult.color}`}>
                        <TierIcon className="w-3.5 h-3.5" />
                        {scoreResult.label} {scoreResult.score}
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black text-white">
                    {lead.first_name} {lead.last_name}
                  </h1>
                  <p className="text-xs text-gray-500 mt-1 font-bold uppercase tracking-widest">
                    Lead #{lead.id.slice(0, 8).toUpperCase()} · Eingegangen {formatDate(lead.created_at)}
                  </p>
                </div>

                <div className="relative shrink-0">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Status ändern</label>
                  <div className="relative">
                    <select
                      value={lead.status}
                      onChange={(e) => changeStatus(e.target.value as Lead['status'])}
                      className="appearance-none bg-[#1A1A1A] border border-white/10 text-white font-bold text-sm rounded-xl pl-4 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 w-52 shadow-sm"
                    >
                      {STATUS_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Linke Spalte */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                  {/* Kontakt */}
                  <section className="bg-[#1A1A1A] rounded-xl border border-white/5 p-6">
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Kontaktdaten</h2>
                    <div className="space-y-3">
                      <InfoRow
                        icon={<Mail className="w-4 h-4 text-gray-400" />}
                        label="E-Mail"
                        value={<a href={`mailto:${lead.email}`} className="hover:text-[#F5A623] transition-colors">{lead.email}</a>}
                      />
                      {lead.phone && (
                        <InfoRow
                          icon={<Phone className="w-4 h-4 text-gray-400" />}
                          label="Telefon"
                          value={<a href={`tel:${lead.phone}`} className="hover:text-[#F5A623] transition-colors">{lead.phone}</a>}
                        />
                      )}
                      {lead.zip && (
                        <InfoRow
                          icon={<MapPin className="w-4 h-4 text-gray-400" />}
                          label="Postleitzahl"
                          value={lead.zip}
                        />
                      )}
                      {lead.wants_zoom_call && (
                        <InfoRow
                          icon={<Video className="w-4 h-4 text-blue-400" />}
                          label="Wunsch"
                          value="Zoom-Beratungsgespräch gewünscht"
                          accent="bg-blue-500/10"
                        />
                      )}
                    </div>
                  </section>

                  {/* Dachkonfiguration */}
                  <section className="bg-[#1A1A1A] rounded-xl border border-white/5 p-6">
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Dachkonfiguration</h2>
                    <div className="space-y-3">
                      {lead.roof_area != null && (
                        <InfoRow
                          icon={<Home className="w-4 h-4 text-indigo-400" />}
                          label="Dachfläche"
                          value={`${lead.roof_area} m²`}
                          accent="bg-indigo-500/10"
                        />
                      )}
                      {lead.roof_orientation && (
                        <InfoRow
                          icon={<Compass className="w-4 h-4 text-amber-400" />}
                          label="Ausrichtung"
                          value={ORIENTATION_LABEL[lead.roof_orientation] ?? lead.roof_orientation}
                          accent="bg-amber-500/10"
                        />
                      )}
                      {lead.construction_year && (
                        <InfoRow
                          icon={<Calendar className="w-4 h-4 text-gray-400" />}
                          label="Baujahr"
                          value={CONSTRUCTION_LABEL[lead.construction_year] ?? lead.construction_year}
                        />
                      )}
                    </div>
                  </section>

                  {/* Energiebedarf */}
                  <section className="bg-[#1A1A1A] rounded-xl border border-white/5 p-6">
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Energiebedarf & Ausstattung</h2>
                    <div className="space-y-3">
                      {lead.consumption != null && (
                        <InfoRow
                          icon={<Zap className="w-4 h-4 text-yellow-400" />}
                          label="Jahresverbrauch"
                          value={`${lead.consumption.toLocaleString('de-DE')} kWh/Jahr`}
                          accent="bg-yellow-500/10"
                        />
                      )}
                      {lead.electricity_price != null && (
                        <InfoRow
                          icon={<Euro className="w-4 h-4 text-gray-400" />}
                          label="Strompreis"
                          value={`${(lead.electricity_price * 100).toFixed(0)} Ct/kWh`}
                        />
                      )}
                      <div className="flex gap-2 flex-wrap pt-1">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${lead.has_battery ? 'bg-green-500/10 text-green-400' : 'bg-[#252525] text-gray-600 line-through'}`}>
                          <BatteryCharging className="w-3.5 h-3.5" />
                          Stromspeicher
                        </span>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${lead.has_e_car ? 'bg-blue-500/10 text-blue-400' : 'bg-[#252525] text-gray-600 line-through'}`}>
                          <Car className="w-3.5 h-3.5" />
                          Elektroauto
                        </span>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${lead.has_heat_pump ? 'bg-orange-500/10 text-orange-400' : 'bg-[#252525] text-gray-600 line-through'}`}>
                          <Thermometer className="w-3.5 h-3.5" />
                          Wärmepumpe
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* Planung & Finanzierung */}
                  <section className="bg-[#1A1A1A] rounded-xl border border-white/5 p-6">
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Planung & Finanzierung</h2>
                    <div className="space-y-3">
                      {lead.planning_horizon && (
                        <InfoRow
                          icon={<Clock className="w-4 h-4 text-amber-400" />}
                          label="Planungshorizont"
                          value={HORIZON_LABEL[lead.planning_horizon]}
                          accent="bg-amber-500/10"
                        />
                      )}
                      <InfoRow
                        icon={<CreditCard className={`w-4 h-4 ${lead.needs_financing ? 'text-blue-400' : 'text-gray-400'}`} />}
                        label="Finanzierung"
                        value={lead.needs_financing ? 'KfW-Finanzierung gewünscht' : 'Eigenkapital'}
                        accent={lead.needs_financing ? 'bg-blue-500/10' : 'bg-[#252525]'}
                      />
                    </div>
                  </section>
                </div>

                {/* Rechte Spalte */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                  {/* Anlagenkennzahlen */}
                  <section className="bg-[#1A1A1A] rounded-xl border border-white/5 p-6">
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Anlagenkonfiguration</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <StatCard label="Anlagengröße" value={lead.kwp != null ? `${lead.kwp} kWp` : '—'} icon={<Zap className="w-3.5 h-3.5" />} accent="text-yellow-400" />
                      <StatCard label="Investition" value={lead.investment != null ? `${lead.investment.toLocaleString('de-DE')} €` : '—'} icon={<Euro className="w-3.5 h-3.5" />} accent="text-gray-400" />
                      <StatCard label="Ersparnis/Jahr" value={lead.annual_savings != null ? `${lead.annual_savings.toLocaleString('de-DE')} €` : '—'} icon={<TrendingUp className="w-3.5 h-3.5" />} accent="text-green-400" />
                      <div className="relative">
                        <StatCard label="Amortisation" value={lead.amortization != null ? `${lead.amortization} Jahre` : '—'} icon={<Calendar className="w-3.5 h-3.5" />} accent="text-indigo-400" />
                        {realisticCalc && realisticCalc.amortizationRealistic > (lead.amortization || 0) && (
                          <div className="absolute -bottom-1 left-0 right-0 text-center">
                            <span className="text-[10px] text-amber-400 font-medium bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                              Realistisch: {realisticCalc.amortizationRealistic} J.
                            </span>
                          </div>
                        )}
                      </div>
                      <StatCard label="Autarkie" value={lead.autarky != null ? `${lead.autarky} %` : '—'} sub="Eigenverbrauchsanteil" icon={<BatteryCharging className="w-3.5 h-3.5" />} accent="text-teal-400" />
                      <StatCard label="Gewinn 20 J." value={lead.profit_20_years != null ? `${lead.profit_20_years.toLocaleString('de-DE')} €` : '—'} sub="nach Investitionsabzug" icon={<BarChart2 className="w-3.5 h-3.5" />} accent="text-emerald-400" />
                    </div>
                  </section>

                  {/* Solar-Planung */}
                  <SolarPlanningSection
                    leadId={lead.id}
                    leadName={`${lead.first_name} ${lead.last_name}`}
                    kwp={lead.kwp}
                    roofAreaM2={lead.roof_area}
                    orientation={lead.roof_orientation}
                    zip={lead.zip}
                    existingLayout={lead.module_layout}
                    onPdfReady={(png) => setPlanningPng(png)}
                  />

                  {/* Lead-Score */}
                  {scoreResult && (
                    <section className="bg-[#1A1A1A] rounded-xl border border-white/5 p-6">
                      <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Lead-Score</h2>
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center ${scoreResult.bgColor} border`}>
                          {TierIcon && <TierIcon className={`w-6 h-6 mb-0.5 ${scoreResult.color}`} />}
                          <span className={`text-lg font-black ${scoreResult.color}`}>{scoreResult.score}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-base font-black ${scoreResult.color}`}>{scoreResult.label}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Top-Faktoren: {detailedScore?.factors.slice(0, 3).map(f => f.label).join(', ')}
                          </p>
                          {/* Score-Faktoren Detail */}
                          <div className="mt-3 space-y-1.5">
                            {detailedScore?.factors.map((factor) => (
                              <div key={factor.label} className="flex items-center gap-2">
                                <span className="text-xs">{factor.icon}</span>
                                <span className="text-[11px] text-gray-400 flex-1 truncate">{factor.label}</span>
                                <div className="w-16 h-1.5 bg-[#252525] rounded-full overflow-hidden flex-shrink-0">
                                  <div
                                    className={`h-full rounded-full ${
                                      factor.earned >= factor.maxPoints * 0.7 ? 'bg-green-400' :
                                      factor.earned >= factor.maxPoints * 0.4 ? 'bg-amber-400' : 'bg-gray-500'
                                    }`}
                                    style={{ width: `${(factor.earned / factor.maxPoints) * 100}%` }}
                                  />
                                </div>
                                <span className="text-[10px] text-gray-500 w-8 text-right">{factor.earned}/{factor.maxPoints}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="ml-auto">
                          <div className="w-32 h-3 bg-[#252525] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                scoreResult.tier === 'heiss' ? 'bg-red-400' :
                                scoreResult.tier === 'warm' ? 'bg-amber-400' : 'bg-blue-400'
                              }`}
                              style={{ width: `${scoreResult.score}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-gray-500 mt-1 text-right">{scoreResult.score}/100</p>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Schnellaktionen */}
                  <section className="bg-[#1A1A1A] rounded-xl border border-white/5 p-6">
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Schnellaktionen</h2>
                    <div className="flex flex-wrap gap-3">
                      <a href={`mailto:${lead.email}`} className="flex items-center gap-2 bg-[#F5A623] text-[#1A3A5C] font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-[#E09000] transition-colors shadow-sm">
                        <Mail className="w-4 h-4" />
                        E-Mail senden
                      </a>
                      {lead.phone && (
                        <a href={`tel:${lead.phone}`} className="flex items-center gap-2 border border-white/10 text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-white/5 transition-colors">
                          <Phone className="w-4 h-4" />
                          Anrufen
                        </a>
                      )}
                      {lead.wants_zoom_call && (
                        <span className="flex items-center gap-2 border border-blue-500/20 bg-blue-500/10 text-blue-400 font-bold text-sm px-5 py-2.5 rounded-xl">
                          <Video className="w-4 h-4" />
                          Zoom-Call gewünscht
                        </span>
                      )}
                    </div>
                  </section>

                  {/* Vor-Ort-Info */}
                  {(lead.site_visit_date || lead.site_visit_done || lead.roof_area_measured) && (
                    <section className="bg-[#1A1A1A] rounded-xl border border-white/5 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Vor-Ort-Termin</h2>
                        {lead.site_visit_done ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">Durchgeführt</span>
                        ) : lead.site_visit_date ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400">
                            Geplant: {new Date(lead.site_visit_date).toLocaleDateString('de-DE')}
                          </span>
                        ) : null}
                      </div>
                      <div className="space-y-2">
                        {lead.site_visit_notes && (
                          <p className="text-sm text-gray-400 italic">„{lead.site_visit_notes}"</p>
                        )}
                        {(lead.roof_area_measured || lead.roof_angle != null) && (
                          <div className="flex flex-wrap gap-3 pt-2 border-t border-white/5">
                            {lead.roof_area_measured && (
                              <span className="text-xs text-gray-400">
                                Gemessene Dachfläche: <strong className="text-white">{lead.roof_area_measured} m²</strong>
                                {lead.roof_area && lead.roof_area !== lead.roof_area_measured && (
                                  <span className="text-gray-600 line-through ml-1">({lead.roof_area} m² vorher)</span>
                                )}
                              </span>
                            )}
                            {lead.roof_angle != null && (
                              <span className="text-xs text-gray-400">
                                Dachneigung: <strong className="text-white">{lead.roof_angle}°</strong>
                              </span>
                            )}
                            {lead.shading_issues && (
                              <span className="text-xs text-amber-400">⚠ Verschattung festgestellt</span>
                            )}
                          </div>
                        )}
                      </div>
                    </section>
                  )}

                  {/* Angebot */}
                  <OfferActionSection
                    lead={lead}
                    draft={draft}
                    loadingDraft={loadingDraft}
                    onStatusChange={async (status) => {
                      const now = new Date().toISOString();
                      if (status === 'viewed') {
                        await changeOfferStatus('viewed', { offer_viewed_at: now });
                      } else if (status === 'accepted') {
                        await changeOfferStatus('accepted');
                        if (lead.status !== 'gewonnen') await changeStatus('gewonnen');
                      } else if (status === 'rejected') {
                        await changeOfferStatus('rejected');
                      } else {
                        await changeOfferStatus(status);
                      }
                    }}
                  />

                  {/* Aktivitäts-Log */}
                  <ActivityLog lead={lead} userName={user?.fullName || 'System'} />
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
