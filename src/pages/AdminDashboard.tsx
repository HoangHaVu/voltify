import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search, Zap, Pencil, X, Filter, Download,
  Plus, TrendingUp, DollarSign, CheckCircle2, Clock,
  Mail, Phone, Tag, Percent, ToggleLeft, ToggleRight, Trash2,
  AlertTriangle, Loader2, Send, Eye, FileText as FileTextIcon, Receipt,
  ChevronRight, MapPin, BatteryCharging, Car, Thermometer, Sun, Users, BarChart3,
  Trophy, FilterX, Calendar, FolderOpen, TrendingDown, Activity, Target,
  Crown, Compass,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLeads } from '../hooks/useLeads';
import { recalculateLead } from '../lib/calculations';
import { useProjects } from '../hooks/useProjects';
import { AdminSidebar } from '../components/layout/AdminSidebar';
import { KanbanColumn } from '../components/pipeline/KanbanColumn';
import { LeadCard } from '../components/pipeline/LeadCard';
import { ProjectCard } from '../components/pipeline/ProjectCard';
import {
  fetchOwnerDiscountCodes, createDiscountCode, toggleDiscountCode, deleteDiscountCode,
  fetchPendingDiscountRequestsScoped, resolveDiscountRequest,
  updateLeadOfferStatus, updateLeadStatus, updatePaymentStatus, updateLeadFields,
  applyDiscountCode, requestDiscount, clearDiscount, redeemDiscountCode,
  upsertSiteVisitAppointment,
  type DiscountCode, type Lead,
} from '../services/data';
import { OfferPreviewCard } from '../components/settings/OfferPreviewCard';
import { InvoicePreviewCard } from '../components/settings/InvoicePreviewCard';
import { supabase } from '../lib/supabase';


// ── Settings Types & Defaults ──

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

/* ─── PIPELINE CONFIG ─── */

// Lead-Pipeline Spalten
const LEAD_COLUMNS: { key: Lead['status']; label: string; color: string }[] = [
  { key: 'neu',         label: 'Neu',               color: 'bg-emerald-500' },
  { key: 'kontaktiert', label: 'Kontaktiert',       color: 'bg-blue-500' },
  { key: 'vorort',      label: 'Vor Ort',           color: 'bg-purple-500' },
  { key: 'angebot',     label: 'Angebot versendet', color: 'bg-indigo-500' },
  { key: 'abschluss',   label: 'Abschluss',         color: 'bg-amber-500' },
];

const ACTIVE_LEAD_STATUSES = new Set(LEAD_COLUMNS.map(c => c.key));

// Projekt-Pipeline Spalten
const PROJECT_COLUMNS: { key: 'planung' | 'genehmigung' | 'installation' | 'inbetrieb'; label: string; color: string; done?: boolean }[] = [
  { key: 'planung',      label: 'In Planung',      color: 'bg-indigo-500' },
  { key: 'genehmigung',  label: 'Genehmigung',     color: 'bg-amber-500' },
  { key: 'installation', label: 'In Installation', color: 'bg-purple-500' },
  { key: 'inbetrieb',    label: 'Abgeschlossen',   color: 'bg-green-500', done: true },
];

// ─── Lead Pipeline Sub-Component ───
function LeadPipelineView({
  leads,
  moveCard,
  markWon,
  markLost,
  onLeadClick,
}: {
  leads: Lead[];
  moveCard: (id: string, status: Lead['status']) => Promise<void>;
  markWon: (lead: Lead) => Promise<string | null>;
  markLost: (id: string) => Promise<void>;
  onLeadClick: (lead: Lead) => void;
}) {
  const [filterZip, setFilterZip] = useState('');
  const [filterMinKwp, setFilterMinKwp] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const hasActiveFilter = filterZip || filterMinKwp || filterDate;

  function resetFilters() {
    setFilterZip('');
    setFilterMinKwp('');
    setFilterDate('');
  }

  const allActiveLeads = leads.filter(l => ACTIVE_LEAD_STATUSES.has(l.status));
  const activeLeads = allActiveLeads.filter(l => {
    if (filterZip && !l.zip?.startsWith(filterZip.trim())) return false;
    if (filterMinKwp && (l.kwp == null || l.kwp < Number(filterMinKwp))) return false;
    if (filterDate && l.created_at < filterDate) return false;
    return true;
  });

  const wonCount = leads.filter(l => l.status === 'gewonnen').length;
  const lostCount = leads.filter(l => l.status === 'verloren').length;

  const byStatus = LEAD_COLUMNS.reduce<Record<string, Lead[]>>((acc, col) => {
    acc[col.key] = activeLeads.filter(l => l.status === col.key);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Lead-Pipeline</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {activeLeads.length} aktive Lead{activeLeads.length !== 1 ? 's' : ''} im Trichter
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {wonCount > 0 && (
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2">
              <Trophy className="w-4 h-4 text-green-400" />
              <span className="text-sm font-bold text-green-400">{wonCount} gewonnen</span>
            </div>
          )}
          {lostCount > 0 && (
            <div className="flex items-center gap-2 bg-[#252525] border border-white/5 rounded-xl px-4 py-2">
              <X className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-bold text-gray-500">{lostCount} verloren</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-3 items-end bg-[#141414] p-4 rounded-xl border border-white/5">
        <div className="flex flex-col gap-1 w-full sm:w-40">
          <label className="text-xs font-bold text-gray-500" htmlFor="filter-plz">Postleitzahl</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 w-4 h-4" />
            <input
              className="w-full bg-[#0F0F0F] border border-white/10 text-white rounded-lg pl-10 pr-3 py-2.5 text-sm focus:ring-1 focus:ring-[#F5A623] outline-none placeholder:text-gray-600"
              id="filter-plz"
              placeholder="z.B. 20457"
              type="text"
              value={filterZip}
              onChange={e => setFilterZip(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1 w-full sm:w-48">
          <label className="text-xs font-bold text-gray-500" htmlFor="filter-size">Min. Anlagengröße</label>
          <div className="relative">
            <Sun className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 w-4 h-4" />
            <select
              className="w-full bg-[#0F0F0F] border border-white/10 text-white rounded-lg pl-10 pr-8 py-2.5 text-sm focus:ring-1 focus:ring-[#F5A623] outline-none appearance-none"
              id="filter-size"
              value={filterMinKwp}
              onChange={e => setFilterMinKwp(e.target.value)}
            >
              <option value="">Alle Größen</option>
              <option value="5">Ab 5 kWp</option>
              <option value="10">Ab 10 kWp</option>
              <option value="15">Ab 15 kWp</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-1 w-full sm:w-44">
          <label className="text-xs font-bold text-gray-500" htmlFor="filter-date">Eingangsdatum ab</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 w-4 h-4" />
            <input
              className="w-full bg-[#0F0F0F] border border-white/10 text-white rounded-lg pl-10 pr-3 py-2.5 text-sm focus:ring-1 focus:ring-[#F5A623] outline-none"
              id="filter-date"
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
            />
          </div>
        </div>
        <div className="w-full sm:w-auto sm:ml-auto flex items-center gap-3">
          {hasActiveFilter && (
            <span className="text-xs font-bold text-[#F5A623]">
              {activeLeads.length} von {allActiveLeads.length} Leads
            </span>
          )}
          <button
            onClick={resetFilters}
            disabled={!hasActiveFilter}
            className="w-full sm:w-auto bg-[#0F0F0F] border border-white/10 hover:bg-white/5 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FilterX className="w-4 h-4" />
            Filter zurücksetzen
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        <div className="flex gap-5 overflow-x-auto pb-4 h-full items-start">
          {LEAD_COLUMNS.map((col) => {
            const colLeads = byStatus[col.key] ?? [];
            const isAbschluss = col.key === 'abschluss';

            return (
              <KanbanColumn
                key={col.key}
                columnKey={col.key}
                onCardDrop={(id, status) => moveCard(id, status as Lead['status'])}
                title={col.label}
                count={colLeads.length}
                color={col.color}
              >
                {colLeads.length === 0 ? (
                  <div className="border-2 border-dashed border-white/5 rounded-lg p-8 flex flex-col items-center justify-center text-gray-600 text-sm h-32 gap-1">
                    {isAbschluss ? (
                      <>
                        <Trophy className="w-5 h-5 text-amber-500/30" />
                        <span>Leads hierher ziehen</span>
                      </>
                    ) : (
                      <span>Hierher ziehen</span>
                    )}
                  </div>
                ) : (
                  colLeads.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      showClosingActions={isAbschluss}
                      onWon={() => markWon(lead)}
                      onLost={() => markLost(lead.id)}
                      onClick={() => onLeadClick(lead)}
                    />
                  ))
                )}
              </KanbanColumn>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Project Pipeline Sub-Component ───
function ProjectPipelineView({
  projects,
  moveProject,
}: {
  projects: import('../services/data').Project[];
  moveProject: (id: string, status: import('../services/data').Project['status']) => Promise<void>;
}) {
  const navigate = useNavigate();
  const boardProjects = projects.filter(p => p.status !== 'angebot');
  const activeCount = boardProjects.filter(p => p.status !== 'inbetrieb').length;
  const doneCount = boardProjects.filter(p => p.status === 'inbetrieb').length;

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Projekte</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {activeCount} laufend · {doneCount} abgeschlossen
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/completed')}
            className="flex items-center gap-2 bg-[#1A1A1A] border border-white/10 hover:border-[#F5A623]/30 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all"
          >
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            Alle abgeschlossenen Aufträge
          </button>
          <div className="bg-[#1A1A1A] rounded-xl border border-white/5 px-5 py-3 text-center shadow-sm min-w-[80px]">
            <p className="text-2xl font-black text-white">{activeCount}</p>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Laufend</p>
          </div>
          <div className="bg-[#1A1A1A] rounded-xl border border-white/5 px-5 py-3 text-center shadow-sm min-w-[80px]">
            <p className="text-2xl font-black text-green-400">{doneCount}</p>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Fertig</p>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        {boardProjects.length === 0 ? (
          <div className="bg-[#1A1A1A] rounded-xl border border-white/5 p-16 text-center max-w-[600px] mx-auto mt-8">
            <FolderOpen className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="font-bold text-gray-500">Noch keine Projekte vorhanden.</p>
            <p className="text-sm text-gray-600 mt-1">
              Neue Projekte entstehen wenn du einen Lead als gewonnen markierst.
            </p>
          </div>
        ) : (
          <div className="flex gap-5 overflow-x-auto pb-4 h-full items-start">
            {PROJECT_COLUMNS.map(col => {
              const cards = boardProjects.filter(p => p.status === col.key);
              return (
                <KanbanColumn
                  key={col.key}
                  title={col.label}
                  count={cards.length}
                  color={col.color}
                  columnKey={col.key}
                  onCardDrop={col.done ? () => {} : (id, status) => moveProject(id, status as import('../services/data').Project['status'])}
                  done={col.done}
                >
                  {cards.length === 0 ? (
                    <div className={`flex items-center justify-center h-24 text-sm font-medium border-2 border-dashed rounded-xl ${
                      col.done
                        ? 'border-green-500/20 text-green-500/30'
                        : 'border-white/5 text-gray-700'
                    }`}>
                      {col.done ? 'Noch keine abgeschlossenen Projekte' : 'Keine Projekte'}
                    </div>
                  ) : (
                    cards.map(project => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        done={col.done}
                      />
                    ))
                  )}
                </KanbanColumn>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { leads, moveCard, markWon, markLost } = useLeads();
  const { projects, moveProject } = useProjects();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // ── Lead Detail Drawer ──
  const openLeadDetail = (lead: Lead) => setSelectedLead(lead);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // ── Rabatt UI State ──
  const [discountCodeInput, setDiscountCodeInput] = useState('');
  const [requestPercentage, setRequestPercentage] = useState(5);
  const [requestNote, setRequestNote] = useState('');
  const [showDiscountRequest, setShowDiscountRequest] = useState(false);
  const [availableDiscountCodes, setAvailableDiscountCodes] = useState<DiscountCode[]>([]);

  // Rabattcodes laden wenn Drawer geöffnet wird
  useEffect(() => {
    if (selectedLead && user) {
      const ownerId = user.role === 'owner' ? user.id : (user.ownerId || user.id);
      fetchOwnerDiscountCodes(ownerId)
        .then(setAvailableDiscountCodes)
        .catch(() => setAvailableDiscountCodes([]));
    }
  }, [selectedLead?.id, user?.id]);

  // ── Settings State ──
  const STORAGE_KEY = 'voltify_settings_v1';
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

  // Profil-Daten laden
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

  // ── Angebots-Status Config ──
  const OFFER_CONFIG: Record<Lead['offer_status'], { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
    created:  { label: 'Noch nicht versendet', icon: FileTextIcon, color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20' },
    sent:     { label: 'Angebot versendet',    icon: Send,         color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    viewed:   { label: 'Angebot angesehen',    icon: Eye,          color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    accepted: { label: 'Angebot angenommen',   icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
    rejected: { label: 'Angebot abgelehnt',    icon: X,            color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  };

  const STATUS_LABELS: Record<Lead['status'], string> = {
    neu: 'Neu',
    kontaktiert: 'Kontaktiert',
    vorort: 'Vor Ort',
    angebot: 'Angebot versendet',
    abschluss: 'Abschluss',
    gewonnen: 'Gewonnen',
    verloren: 'Verloren',
    planung: 'In Planung',
    installation: 'In Installation',
    abgeschlossen: 'Abgeschlossen',
  };

  // ── Rabatt-Codes State ──
  const [ownerCodes, setOwnerCodes] = useState<DiscountCode[]>([]);
  const [codesLoading, setCodesLoading] = useState(true);
  const [newCode, setNewCode] = useState({ code: '', label: '', percentage: '' });
  const [isAddingCode, setIsAddingCode] = useState(false);

  // ── Offene Anfragen State ──
  const [pendingRequests, setPendingRequests] = useState<Lead[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  // Rabatt-Codes & Anfragen laden
  useEffect(() => {
    if (!user) return;
    const ownerId = user.role === 'owner' ? user.id : (user.ownerId || user.id);
    fetchOwnerDiscountCodes(ownerId)
      .then(setOwnerCodes)
      .catch(console.error)
      .finally(() => setCodesLoading(false));
    fetchPendingDiscountRequestsScoped(user.id, user.role === 'owner' ? 'owner' : 'installer')
      .then(setPendingRequests)
      .catch(console.error)
      .finally(() => setRequestsLoading(false));
  }, [user]);

  async function handleAddCode() {
    if (!user || !newCode.code || !newCode.percentage) return;
    setIsAddingCode(true);
    try {
      const created = await createDiscountCode({
        createdBy: user.id,
        code: newCode.code.toUpperCase(),
        label: newCode.label || undefined,
        percentage: parseFloat(newCode.percentage),
      });
      setOwnerCodes((prev) => [...prev, created]);
      setNewCode({ code: '', label: '', percentage: '' });
    } catch (e) {
      console.error(e);
    } finally {
      setIsAddingCode(false);
    }
  }

  async function handleToggleCode(id: string, active: boolean) {
    await toggleDiscountCode(id, active);
    setOwnerCodes((prev) => prev.map((c) => c.id === id ? { ...c, active } : c));
  }

  async function handleDeleteCode(id: string) {
    await deleteDiscountCode(id);
    setOwnerCodes((prev) => prev.filter((c) => c.id !== id));
  }

  async function handleResolveRequest(leadId: string, approved: boolean) {
    setResolvingId(leadId);
    try {
      await resolveDiscountRequest(leadId, approved);
      setPendingRequests((prev) => prev.filter((r) => r.id !== leadId));
    } finally {
      setResolvingId(null);
    }
  }

  // ── Angebots-Status Handler ──
  async function handleOfferStatusChange(leadId: string, status: Lead['offer_status'], extra?: { offer_sent_at?: string; offer_viewed_at?: string }) {
    setDetailLoading(true);
    try {
      await updateLeadOfferStatus(leadId, status, extra);
      if (selectedLead?.id === leadId) {
        setSelectedLead((prev) => prev ? { ...prev, offer_status: status, ...extra } : prev);
      }
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleLeadStatusChange(leadId: string, status: Lead['status']) {
    setDetailLoading(true);
    try {
      await updateLeadStatus(leadId, status);
      if (selectedLead?.id === leadId) {
        setSelectedLead((prev) => prev ? { ...prev, status } : prev);
      }
    } finally {
      setDetailLoading(false);
    }
  }

  async function handlePaymentToggle(leadId: string, payment: 1 | 2 | 3, current: boolean) {
    setDetailLoading(true);
    try {
      await updatePaymentStatus(leadId, payment, !current);
      if (selectedLead?.id === leadId) {
        const field = `payment_${payment}_paid` as const;
        setSelectedLead((prev) => prev ? { ...prev, [field]: !current } : prev);
      }
    } finally {
      setDetailLoading(false);
    }
  }

  // ── Rabatt Handler ──
  async function handleApplyDiscount(leadId: string, code: string) {
    if (!selectedLead || !user) return;
    setDetailLoading(true);
    try {
      const basePrice = selectedLead.investment ?? 0;
      const validation = await redeemDiscountCode(user.id, code, basePrice);
      if (!validation.success) throw new Error(validation.reason);
      await applyDiscountCode(leadId, code, validation.percentage ?? 0, basePrice);
      const finalPrice = Math.round(basePrice * (1 - (validation.percentage ?? 0) / 100));
      setSelectedLead((prev) => prev ? {
        ...prev,
        discount_code: code,
        discount_percentage: validation.percentage ?? 0,
        discount_status: 'code_applied',
        final_price: finalPrice,
        discount_note: null,
        discount_requested_at: null,
        discount_resolved_at: null,
      } : prev);
      // Angebot zurücksetzen damit neues generiert wird
      await updateLeadOfferStatus(leadId, 'created');
      setSelectedLead((prev) => prev ? { ...prev, offer_status: 'created', offer_sent_at: null, offer_viewed_at: null } : prev);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleRequestDiscount(leadId: string, percentage: number, note: string) {
    if (!selectedLead) return;
    setDetailLoading(true);
    try {
      const basePrice = selectedLead.investment ?? 0;
      await requestDiscount(leadId, percentage, note, basePrice);
      const finalPrice = Math.round(basePrice * (1 - percentage / 100));
      setSelectedLead((prev) => prev ? {
        ...prev,
        discount_code: null,
        discount_percentage: percentage,
        discount_status: 'requested',
        final_price: finalPrice,
        discount_note: note || null,
        discount_requested_at: new Date().toISOString(),
        discount_resolved_at: null,
      } : prev);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleClearDiscount(leadId: string) {
    setDetailLoading(true);
    try {
      await clearDiscount(leadId);
      setSelectedLead((prev) => prev ? {
        ...prev,
        discount_code: null,
        discount_percentage: null,
        discount_status: 'none',
        final_price: null,
        discount_note: null,
        discount_requested_at: null,
        discount_resolved_at: null,
      } : prev);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleResetOffer(leadId: string) {
    setDetailLoading(true);
    try {
      await updateLeadOfferStatus(leadId, 'created');
      setSelectedLead((prev) => prev ? { ...prev, offer_status: 'created', offer_sent_at: null, offer_viewed_at: null } : prev);
    } finally {
      setDetailLoading(false);
    }
  }

  const toggleLead = (id: string) => {
    setSelectedLeads((prev) => prev.includes(id) ? prev.filter((lid) => lid !== id) : [...prev, id]);
  };

  const selectAll = () => {
    if (selectedLeads.length === leads.length) setSelectedLeads([]);
    else setSelectedLeads(leads.map((l) => l.id));
  };

  const filteredLeads = leads.filter((l) =>
    l.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Reports Statistics ───────────────────────────────────────────────
  const reportStats = useMemo(() => {
    const totalLeads = leads.length;
    const wonLeads = leads.filter(l => l.status === 'gewonnen');
    const lostLeads = leads.filter(l => l.status === 'verloren');
    const openLeads = leads.filter(l => !['gewonnen', 'verloren', 'abgeschlossen'].includes(l.status));
    const revenue = wonLeads.reduce((sum, l) => sum + (l.investment || 0), 0);
    const avgDeal = wonLeads.length > 0 ? revenue / wonLeads.length : 0;
    const conversionRate = totalLeads > 0 ? (wonLeads.length / totalLeads) * 100 : 0;
    const winLossRatio = lostLeads.length > 0 ? wonLeads.length / lostLeads.length : wonLeads.length;

    // Pipeline breakdown
    const pipeline = {
      neu: leads.filter(l => l.status === 'neu').length,
      kontaktiert: leads.filter(l => l.status === 'kontaktiert').length,
      angebot: leads.filter(l => l.status === 'angebot').length,
      abschluss: leads.filter(l => l.status === 'abschluss').length,
      gewonnen: wonLeads.length,
      verloren: lostLeads.length,
      abgeschlossen: leads.filter(l => l.status === 'abgeschlossen').length,
    };

    // Monthly leads (last 6 months)
    const now = new Date();
    const monthly = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthLeads = leads.filter(l => l.created_at?.startsWith(monthKey)).length;
      return {
        label: d.toLocaleDateString('de-DE', { month: 'short' }),
        count: monthLeads,
      };
    }).reverse();

    // Top deals by investment
    const topDeals = [...wonLeads]
      .filter(l => l.investment)
      .sort((a, b) => (b.investment || 0) - (a.investment || 0))
      .slice(0, 5);

    return {
      totalLeads, wonLeads: wonLeads.length, lostLeads: lostLeads.length,
      openLeads: openLeads.length, revenue, avgDeal, conversionRate,
      winLossRatio, pipeline, monthly, topDeals,
    };
  }, [leads]);

  return (
    <div className="min-h-screen flex bg-[#0F0F0F] text-white">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* ─── DASHBOARD VIEW ─── */}
          {activeTab === 'dashboard' && (
            <div className="flex flex-col gap-6">
              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Gesamt-Leads', value: reportStats.totalLeads.toString(), change: `+${reportStats.monthly[5]?.count || 0}`, icon: Users, color: 'bg-[#F5A623]/10 text-[#F5A623]' },
                  { label: 'Aktive Deals', value: reportStats.openLeads.toString(), change: `${reportStats.wonLeads} gewonnen`, icon: CheckCircle2, color: 'bg-green-500/10 text-green-400' },
                  { label: 'Pipeline-Wert', value: `€ ${(reportStats.revenue / 1000).toFixed(1)}k`, change: `${reportStats.conversionRate.toFixed(1)}% Conv.`, icon: DollarSign, color: 'bg-blue-500/10 text-blue-400' },
                  { label: 'Conversion-Rate', value: `${reportStats.conversionRate.toFixed(1)}%`, change: `${reportStats.winLossRatio.toFixed(1)}:1 Win/Loss`, icon: TrendingUp, color: 'bg-purple-500/10 text-purple-400' },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="bg-[#1A1A1A] rounded-2xl p-5 border border-white/5">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-9 h-9 rounded-lg ${stat.color.split(' ')[0]} flex items-center justify-center`}>
                          <Icon className={`w-4 h-4 ${stat.color.split(' ')[1]}`} />
                        </div>
                        <span className="text-xs text-green-400 flex items-center gap-0.5">
                          <TrendingUp className="w-3 h-3" /> {stat.change}
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-12 gap-5">
                {/* Funnel / Pipeline Flow */}
                <div className="col-span-7 bg-[#1A1A1A] rounded-2xl p-5 border border-white/5">
                  <h3 className="text-sm font-semibold text-white mb-4">Pipeline Flow</h3>
                  <div className="flex flex-col gap-3">
                    {(() => {
                      const stages = [
                        { stage: 'Neue Leads', count: reportStats.pipeline.neu, color: '#3B82F6' },
                        { stage: 'Kontaktiert', count: reportStats.pipeline.kontaktiert, color: '#60A5FA' },
                        { stage: 'Angebot', count: reportStats.pipeline.angebot, color: '#93C5FD' },
                        { stage: 'Abschluss', count: reportStats.pipeline.abschluss, color: '#BFDBFE' },
                        { stage: 'Gewonnen', count: reportStats.pipeline.gewonnen, color: '#F5A623' },
                      ];
                      const maxCount = Math.max(...stages.map(s => s.count), 1);
                      return stages.map((s, i) => {
                        const width = maxCount > 0 ? (s.count / maxCount) * 100 : 0;
                        return (
                          <div key={i} className="flex items-center gap-4">
                            <span className="text-xs text-gray-500 w-28 text-right flex-shrink-0">{s.stage}</span>
                            <div className="flex-1 h-8 bg-[#252525] rounded-lg overflow-hidden relative">
                              <div
                                className="h-full rounded-lg flex items-center px-3 transition-all"
                                style={{ width: `${Math.max(width, 5)}%`, background: s.color, opacity: 0.7 }}
                              >
                                <span className="text-xs font-semibold text-white whitespace-nowrap">{s.count}</span>
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="col-span-5 bg-[#1A1A1A] rounded-2xl p-5 border border-white/5">
                  <h3 className="text-sm font-semibold text-white mb-4">Recent Activity</h3>
                  <div className="flex flex-col gap-4">
                    {[
                      { action: 'New lead assigned', detail: 'Theresa Webb — McDonald\'s', time: '2m ago', icon: Users },
                      { action: 'Deal moved to Closed', detail: 'Bank of America — €53,100', time: '15m ago', icon: CheckCircle2 },
                      { action: 'Proposal sent', detail: 'Sony — €20,700', time: '1h ago', icon: Mail },
                      { action: 'Follow-up call', detail: 'Nintendo — discussed contract', time: '3h ago', icon: Phone },
                      { action: 'Lead reactivated', detail: 'Kathryn Murphy — Louis Vuitton', time: '5h ago', icon: Clock },
                    ].map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#252525] flex items-center justify-center flex-shrink-0">
                            <Icon className="w-4 h-4 text-[#F5A623]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-white font-medium">{item.action}</p>
                            <p className="text-[11px] text-gray-500">{item.detail}</p>
                          </div>
                          <span className="text-[10px] text-gray-600 flex-shrink-0">{item.time}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Deals Table */}
              <div className="bg-[#1A1A1A] rounded-2xl p-5 border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white">Recent Deals</h3>
                  <button className="text-xs text-[#F5A623] hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-[10px] text-gray-500 uppercase tracking-wider border-b border-white/5">
                        <th className="text-left pb-3 font-medium">Company</th>
                        <th className="text-left pb-3 font-medium">Contact</th>
                        <th className="text-left pb-3 font-medium">Value</th>
                        <th className="text-left pb-3 font-medium">Stage</th>
                        <th className="text-left pb-3 font-medium">Assigned</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.slice(0, 5).map((lead, i) => (
                        <tr key={i} onClick={() => setSelectedLead(lead)} className="border-b border-white/5 hover:bg-white/3 transition-colors cursor-pointer">
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-[#1A3A5C] flex items-center justify-center text-[10px] font-bold text-white">
                                {lead.first_name?.[0]}{lead.last_name?.[0]}
                              </div>
                              <span className="text-xs text-white font-medium">{lead.first_name} {lead.last_name}</span>
                            </div>
                          </td>
                          <td className="py-3 text-xs text-gray-400">{lead.email}</td>
                          <td className="py-3 text-xs text-white font-medium">{lead.investment ? `${lead.investment.toLocaleString('de-DE')} €` : '-'}</td>
                          <td className="py-3">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border capitalize ${
                              lead.status === 'neu' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                              lead.status === 'kontaktiert' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                              lead.status === 'angebot' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                              lead.status === 'gewonnen' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                              'bg-gray-500/10 text-gray-400 border-gray-500/20'
                            }`}>{lead.status}</span>
                          </td>
                          <td className="py-3 text-xs text-gray-400">{lead.kwp ? `${lead.kwp} kWp` : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}


          {/* ─── PIPELINE VIEW (Lead Kanban) ─── */}
          {activeTab === 'pipeline' && (
            <LeadPipelineView
              leads={leads}
              moveCard={moveCard}
              markWon={markWon}
              markLost={markLost}
              onLeadClick={openLeadDetail}
            />
          )}

          {/* ─── PROJEKTE VIEW (Project Kanban) ─── */}
          {activeTab === 'projects' && (
            <ProjectPipelineView
              projects={projects}
              moveProject={moveProject}
            />
          )}

          {/* ─── RABATTE VIEW ─── */}
          {activeTab === 'discounts' && (
            <div className="flex flex-col gap-6">
              <h1 className="text-2xl font-semibold text-white">Rabatt-System</h1>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ── Rabatt-Codes ── */}
                <div className="bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <Tag className="w-5 h-5 text-[#F5A623]" />
                      <h3 className="text-sm font-semibold text-white">Rabatt-Codes</h3>
                    </div>
                    <span className="text-xs text-gray-500">
                      {ownerCodes.filter((c) => c.active).length} aktiv
                    </span>
                  </div>
                  <div className="px-6 py-6 space-y-5">
                    {/* Neuen Code hinzufügen */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-400">Code</label>
                        <input
                          type="text"
                          value={newCode.code}
                          onChange={(e) => setNewCode((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                          className="w-full bg-[#252525] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#F5A623]/50"
                          placeholder="SOLAR10"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-400">Bezeichnung</label>
                        <input
                          type="text"
                          value={newCode.label}
                          onChange={(e) => setNewCode((p) => ({ ...p, label: e.target.value }))}
                          className="w-full bg-[#252525] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#F5A623]/50"
                          placeholder="Treue-Rabatt"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-400">Rabatt (%)</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={newCode.percentage}
                            onChange={(e) => setNewCode((p) => ({ ...p, percentage: e.target.value }))}
                            className="w-full bg-[#252525] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#F5A623]/50"
                            placeholder="10"
                            min="1"
                            max="50"
                          />
                          <button
                            onClick={handleAddCode}
                            disabled={isAddingCode || !newCode.code || !newCode.percentage}
                            className="bg-[#F5A623] hover:bg-[#E09000] text-[#1A3A5C] font-bold px-4 rounded-lg disabled:opacity-50 flex items-center gap-1 transition-colors shrink-0"
                          >
                            {isAddingCode ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Code-Liste */}
                    {codesLoading ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                      </div>
                    ) : ownerCodes.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">Noch keine Codes erstellt.</p>
                    ) : (
                      <div className="space-y-2">
                        {ownerCodes.map((code) => (
                          <div
                            key={code.id}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-opacity ${code.active ? 'border-white/10 bg-[#252525]' : 'border-white/5 bg-[#1A1A1A] opacity-50'}`}
                          >
                            <span className="font-mono font-bold text-white text-sm w-24 shrink-0">{code.code}</span>
                            <span className="text-sm text-gray-400 flex-1 truncate">{code.label ?? '—'}</span>
                            <span className="text-sm font-bold text-[#F5A623] w-10 text-right shrink-0">{code.percentage}%</span>
                            <button
                              onClick={() => handleToggleCode(code.id, !code.active)}
                              className={`p-1 rounded transition-colors shrink-0 ${code.active ? 'text-green-400 hover:text-gray-400' : 'text-gray-600 hover:text-green-400'}`}
                              title={code.active ? 'Deaktivieren' : 'Aktivieren'}
                            >
                              {code.active
                                ? <ToggleRight className="w-5 h-5" />
                                : <ToggleLeft className="w-5 h-5" />}
                            </button>
                            <button
                              onClick={() => handleDeleteCode(code.id)}
                              className="p-1 rounded text-gray-600 hover:text-red-400 transition-colors shrink-0"
                              title="Löschen"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Offene Rabatt-Anfragen ── */}
                <div className="bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-[#F5A623]" />
                      <h3 className="text-sm font-semibold text-white">Offene Rabatt-Anfragen</h3>
                    </div>
                    {pendingRequests.length > 0 && (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#F5A623]/20 text-[#F5A623]">
                        {pendingRequests.length} offen
                      </span>
                    )}
                  </div>
                  <div className="px-6 py-6">
                    {requestsLoading ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                      </div>
                    ) : pendingRequests.length === 0 ? (
                      <div className="flex items-center justify-center gap-3 text-gray-500 py-4">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <p className="text-sm font-medium">Keine offenen Anfragen</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {pendingRequests.map((req) => (
                          <div key={req.id} className="flex items-center gap-4 p-4 border border-[#F5A623]/20 bg-[#F5A623]/5 rounded-xl">
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-white text-sm">{req.first_name} {req.last_name}</p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                Anfrage: <strong className="text-[#F5A623]">{req.discount_percentage}% Rabatt</strong>
                                {req.investment != null && (
                                  <> · Originalpreis: {req.investment.toLocaleString('de-DE')} €</>
                                )}
                                {req.final_price != null && (
                                  <> → <strong>{req.final_price.toLocaleString('de-DE')} €</strong></>
                                )}
                              </p>
                              {req.discount_note && (
                                <p className="text-xs text-gray-500 mt-0.5 italic">„{req.discount_note}"</p>
                              )}
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <button
                                onClick={() => handleResolveRequest(req.id, true)}
                                disabled={resolvingId === req.id}
                                className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-3 py-2 rounded-lg disabled:opacity-50 transition-colors"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Genehmigen
                              </button>
                              <button
                                onClick={() => handleResolveRequest(req.id, false)}
                                disabled={resolvingId === req.id}
                                className="flex items-center gap-1.5 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs px-3 py-2 rounded-lg disabled:opacity-50 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                                Ablehnen
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── REPORTS VIEW ─── */}
          {activeTab === 'reports' && (
            <div className="flex flex-col gap-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  {
                    label: 'Gesamt-Leads',
                    value: reportStats.totalLeads.toString(),
                    icon: Users,
                    color: 'bg-blue-500/10 text-blue-400',
                  },
                  {
                    label: 'Gewonnene Deals',
                    value: reportStats.wonLeads.toString(),
                    icon: CheckCircle2,
                    color: 'bg-emerald-500/10 text-emerald-400',
                  },
                  {
                    label: 'Umsatz',
                    value: `€ ${(reportStats.revenue / 1000).toFixed(1)}k`,
                    icon: DollarSign,
                    color: 'bg-[#F5A623]/10 text-[#F5A623]',
                  },
                  {
                    label: 'Conversion-Rate',
                    value: `${reportStats.conversionRate.toFixed(1)}%`,
                    icon: Target,
                    color: 'bg-purple-500/10 text-purple-400',
                  },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="bg-[#1A1A1A] rounded-2xl p-5 border border-white/5">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-9 h-9 rounded-lg ${stat.color.split(' ')[0]} flex items-center justify-center`}>
                          <Icon className={`w-4 h-4 ${stat.color.split(' ')[1]}`} />
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Secondary Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Offene Leads', value: reportStats.openLeads, icon: Activity, color: 'text-blue-400' },
                  { label: 'Verlorene Deals', value: reportStats.lostLeads, icon: TrendingDown, color: 'text-red-400' },
                  { label: 'Ø Deal-Wert', value: `€ ${reportStats.avgDeal.toLocaleString('de-DE', { maximumFractionDigits: 0 })}`, icon: DollarSign, color: 'text-[#F5A623]' },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="bg-[#1A1A1A] rounded-2xl p-4 border border-white/5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#252525] flex items-center justify-center">
                        <Icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-white">{stat.value}</p>
                        <p className="text-xs text-gray-500">{stat.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-12 gap-5">
                {/* Pipeline Breakdown */}
                <div className="col-span-7 bg-[#1A1A1A] rounded-2xl p-5 border border-white/5">
                  <h3 className="text-sm font-semibold text-white mb-4">Pipeline-Übersicht</h3>
                  <div className="flex flex-col gap-3">
                    {[
                      { stage: 'Neu', count: reportStats.pipeline.neu, color: '#3B82F6' },
                      { stage: 'Kontaktiert', count: reportStats.pipeline.kontaktiert, color: '#60A5FA' },
                      { stage: 'Angebot', count: reportStats.pipeline.angebot, color: '#93C5FD' },
                      { stage: 'Abschluss', count: reportStats.pipeline.abschluss, color: '#BFDBFE' },
                      { stage: 'Gewonnen', count: reportStats.pipeline.gewonnen, color: '#F5A623' },
                      { stage: 'Verloren', count: reportStats.pipeline.verloren, color: '#EF4444' },
                    ].map((s, i) => {
                      const maxCount = Math.max(...Object.values(reportStats.pipeline).filter(v => typeof v === 'number')) || 1;
                      const width = maxCount > 0 ? (s.count / maxCount) * 100 : 0;
                      return (
                        <div key={i} className="flex items-center gap-4">
                          <span className="text-xs text-gray-500 w-24 text-right flex-shrink-0">{s.stage}</span>
                          <div className="flex-1 h-8 bg-[#252525] rounded-lg overflow-hidden relative">
                            <div
                              className="h-full rounded-lg flex items-center px-3 transition-all"
                              style={{ width: `${Math.max(width, 5)}%`, background: s.color, opacity: 0.7 }}
                            >
                              <span className="text-xs font-semibold text-white whitespace-nowrap">{s.count}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Monthly Trend */}
                <div className="col-span-5 bg-[#1A1A1A] rounded-2xl p-5 border border-white/5">
                  <h3 className="text-sm font-semibold text-white mb-4">Leads pro Monat</h3>
                  <div className="flex items-end gap-3 h-48">
                    {reportStats.monthly.map((m, i) => {
                      const maxCount = Math.max(...reportStats.monthly.map(x => x.count), 1);
                      const height = maxCount > 0 ? (m.count / maxCount) * 100 : 0;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                          <div className="w-full flex-1 bg-[#252525] rounded-t-lg relative overflow-hidden">
                            <div
                              className="absolute bottom-0 left-0 right-0 bg-[#F5A623] rounded-t-lg transition-all"
                              style={{ height: `${height}%`, opacity: 0.7 }}
                            />
                          </div>
                          <span className="text-[10px] text-gray-500">{m.label}</span>
                          <span className="text-xs font-bold text-white">{m.count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Top Deals */}
              {reportStats.topDeals.length > 0 && (
                <div className="bg-[#1A1A1A] rounded-2xl p-5 border border-white/5">
                  <h3 className="text-sm font-semibold text-white mb-4">Top Deals</h3>
                  <div className="space-y-3">
                    {reportStats.topDeals.map((lead, i) => (
                      <div key={lead.id} className="flex items-center gap-4 p-3 bg-[#252525]/50 rounded-xl">
                        <div className="w-8 h-8 rounded-lg bg-[#F5A623]/10 flex items-center justify-center text-xs font-bold text-[#F5A623]">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{lead.first_name} {lead.last_name}</p>
                          <p className="text-xs text-gray-500">{lead.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-[#F5A623]">
                            € {lead.investment?.toLocaleString('de-DE')}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            {lead.kwp?.toFixed(1)} kWp · Score {lead.score}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── SETTINGS VIEW ─── */}
          {activeTab === 'settings' && (
            <div className="flex flex-col items-center justify-center gap-6 py-20">
              <div className="w-16 h-16 rounded-2xl bg-[#1A3A5C] flex items-center justify-center">
                <Crown className="w-8 h-8 text-[#F5A623]" />
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-semibold text-white mb-2">Einstellungen</h1>
                <p className="text-gray-500 mb-6">Verwalte dein Firmenprofil, Branding und Kalkulationsparameter.</p>
                <Link
                  to="/admin/settings"
                  className="inline-flex items-center gap-2 bg-[#F5A623] hover:bg-[#E09000] text-[#1A3A5C] text-sm font-bold px-6 py-3 rounded-xl transition-all"
                >
                  <Crown className="w-4 h-4" />
                  Inhaber-Einstellungen öffnen
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ─── LEAD DETAIL DRAWER ─── */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedLead(null)}
          />
          {/* Drawer */}
          <div className="relative w-full max-w-lg bg-[#0F0F0F] border-l border-white/10 h-full overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-[#0F0F0F]/95 backdrop-blur border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1A3A5C] flex items-center justify-center text-sm font-bold text-white">
                  {selectedLead.first_name?.[0]}{selectedLead.last_name?.[0]}
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">{selectedLead.first_name} {selectedLead.last_name}</h2>
                  <p className="text-xs text-gray-500">{selectedLead.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="w-8 h-8 rounded-lg bg-[#1A1A1A] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {detailLoading && (
                <div className="flex justify-center py-2">
                  <Loader2 className="w-5 h-5 animate-spin text-[#F5A623]" />
                </div>
              )}

              {/* Lead Status */}
              <div className="bg-[#1A1A1A] rounded-xl border border-white/5 p-4">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Lead-Status</label>
                <select
                  value={selectedLead.status}
                  onChange={(e) => handleLeadStatusChange(selectedLead.id, e.target.value as Lead['status'])}
                  className="w-full bg-[#252525] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5A623]/50"
                >
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Kontaktdaten */}
              <div className="bg-[#1A1A1A] rounded-xl border border-white/5 p-4 space-y-3">
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Kontaktdaten</h3>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-300">{selectedLead.email}</span>
                </div>
                {selectedLead.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-300">{selectedLead.phone}</span>
                  </div>
                )}
                {selectedLead.zip && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-300">{selectedLead.zip}</span>
                  </div>
                )}
              </div>

              {/* Konfiguration */}
              <div className="bg-[#1A1A1A] rounded-xl border border-white/5 p-4 space-y-3">
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Konfiguration</h3>
                <div className="grid grid-cols-2 gap-3">
                  {selectedLead.kwp != null && (
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-[#F5A623]" />
                      <span className="text-sm text-gray-300">{selectedLead.kwp} kWp</span>
                    </div>
                  )}
                  {selectedLead.investment != null && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-[#F5A623]" />
                      <span className="text-sm text-gray-300">
                        {selectedLead.final_price != null ? (
                          <>
                            <span className="text-gray-500 line-through text-xs mr-1">{selectedLead.investment.toLocaleString('de-DE')} €</span>
                            <span className="text-[#F5A623] font-bold">{selectedLead.final_price.toLocaleString('de-DE')} €</span>
                          </>
                        ) : (
                          <>{selectedLead.investment.toLocaleString('de-DE')} €</>
                        )}
                      </span>
                    </div>
                  )}
                  {selectedLead.roof_orientation && (
                    <div className="flex items-center gap-2">
                      <Compass className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-300">{selectedLead.roof_orientation}</span>
                    </div>
                  )}
                  {selectedLead.has_battery && (
                    <div className="flex items-center gap-2">
                      <BatteryCharging className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-gray-300">Speicher</span>
                    </div>
                  )}
                  {selectedLead.has_e_car && (
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-gray-300">E-Auto</span>
                    </div>
                  )}
                  {selectedLead.has_heat_pump && (
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-orange-400" />
                      <span className="text-sm text-gray-300">Wärmepumpe</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Vor-Ort-Termin & Messung */}
              {(selectedLead.status === 'kontaktiert' || selectedLead.status === 'vorort' || selectedLead.status === 'angebot' || selectedLead.status === 'abschluss') && (
                <div className="bg-[#1A1A1A] rounded-xl border border-white/5 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Vor-Ort-Termin</h3>
                    {selectedLead.site_visit_done && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">
                        Durchgeführt
                      </span>
                    )}
                  </div>

                  {/* Termin-Datum */}
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">Termin-Datum</label>
                    <input
                      type="date"
                      value={selectedLead.site_visit_date?.slice(0, 10) || ''}
                      onChange={(e) => setSelectedLead((prev) => prev ? { ...prev, site_visit_date: e.target.value ? new Date(e.target.value).toISOString() : null } : prev)}
                      className="w-full bg-[#252525] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5A623]/50"
                    />
                  </div>

                  {/* Notizen */}
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">Vor-Ort-Notizen</label>
                    <textarea
                      value={selectedLead.site_visit_notes || ''}
                      onChange={(e) => setSelectedLead((prev) => prev ? { ...prev, site_visit_notes: e.target.value || null } : prev)}
                      placeholder="Notizen vom Termin..."
                      rows={2}
                      className="w-full bg-[#252525] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#F5A623]/50 resize-none"
                    />
                  </div>

                  {/* Gemessene Daten */}
                  <div className="space-y-3 pt-2 border-t border-white/5">
                    <h4 className="text-xs font-bold text-gray-400">Gemessene Daten</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500">Dachfläche (m²)</label>
                        <input
                          type="number"
                          value={selectedLead.roof_area_measured ?? ''}
                          onChange={(e) => setSelectedLead((prev) => prev ? { ...prev, roof_area_measured: e.target.value ? Number(e.target.value) : null } : prev)}
                          className="w-full bg-[#252525] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5A623]/50"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500">Dachneigung (°)</label>
                        <input
                          type="number"
                          value={selectedLead.roof_angle ?? ''}
                          onChange={(e) => setSelectedLead((prev) => prev ? { ...prev, roof_angle: e.target.value ? Number(e.target.value) : null } : prev)}
                          className="w-full bg-[#252525] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5A623]/50"
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedLead.shading_issues || false}
                        onChange={(e) => setSelectedLead((prev) => prev ? { ...prev, shading_issues: e.target.checked } : prev)}
                        className="w-4 h-4 rounded border-white/10 bg-[#252525] text-[#F5A623] focus:ring-[#F5A623]/50"
                      />
                      Verschattungsprobleme festgestellt
                    </label>
                  </div>

                  {/* Konfiguration vor Ort anpassen */}
                  <div className="space-y-3 pt-2 border-t border-white/5">
                    <h4 className="text-xs font-bold text-gray-400">Konfiguration anpassen</h4>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500">Dachausrichtung</label>
                        <select
                          value={selectedLead.roof_orientation || ''}
                          onChange={(e) => setSelectedLead((prev) => prev ? { ...prev, roof_orientation: e.target.value || null } : prev)}
                          className="w-full bg-[#252525] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5A623]/50"
                        >
                          <option value="">—</option>
                          <option value="Süd">Süd</option>
                          <option value="Süd-Ost">Süd-Ost</option>
                          <option value="Süd-West">Süd-West</option>
                          <option value="Ost">Ost</option>
                          <option value="West">West</option>
                          <option value="Nord">Nord</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500">Stromverbrauch (kWh/Jahr)</label>
                        <input
                          type="number"
                          value={selectedLead.consumption ?? ''}
                          onChange={(e) => setSelectedLead((prev) => prev ? { ...prev, consumption: e.target.value ? Number(e.target.value) : null } : prev)}
                          className="w-full bg-[#252525] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5A623]/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-gray-500">Strompreis (ct/kWh)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={selectedLead.electricity_price ?? ''}
                        onChange={(e) => setSelectedLead((prev) => prev ? { ...prev, electricity_price: e.target.value ? Number(e.target.value) : null } : prev)}
                        className="w-full bg-[#252525] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F5A623]/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedLead.has_battery || false}
                          onChange={(e) => setSelectedLead((prev) => prev ? { ...prev, has_battery: e.target.checked } : prev)}
                          className="w-4 h-4 rounded border-white/10 bg-[#252525] text-[#F5A623] focus:ring-[#F5A623]/50"
                        />
                        <BatteryCharging className="w-4 h-4 text-green-400" />
                        Speicher / Batteriespeicher
                      </label>
                      <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedLead.has_e_car || false}
                          onChange={(e) => setSelectedLead((prev) => prev ? { ...prev, has_e_car: e.target.checked } : prev)}
                          className="w-4 h-4 rounded border-white/10 bg-[#252525] text-[#F5A623] focus:ring-[#F5A623]/50"
                        />
                        <Car className="w-4 h-4 text-blue-400" />
                        E-Auto / Wallbox
                      </label>
                      <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedLead.has_heat_pump || false}
                          onChange={(e) => setSelectedLead((prev) => prev ? { ...prev, has_heat_pump: e.target.checked } : prev)}
                          className="w-4 h-4 rounded border-white/10 bg-[#252525] text-[#F5A623] focus:ring-[#F5A623]/50"
                        />
                        <Thermometer className="w-4 h-4 text-orange-400" />
                        Wärmepumpe
                      </label>
                    </div>

                    {/* Konfiguration neu berechnen */}
                    <button
                      onClick={() => {
                        const recalculated = recalculateLead(selectedLead);
                        setSelectedLead((prev) => prev ? { ...prev, ...recalculated } : prev);
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-[#1A3A5C]/30 hover:bg-[#1A3A5C]/50 text-blue-400 font-bold text-xs px-4 py-2 rounded-lg transition-colors border border-[#1A3A5C]/30"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Konfiguration neu berechnen
                    </button>

                    {/* Vorschau der neuen Werte */}
                    {(selectedLead.kwp != null || selectedLead.investment != null) && (
                      <div className="grid grid-cols-3 gap-2 bg-[#252525] rounded-lg p-3">
                        <div>
                          <p className="text-[10px] text-gray-500">kWp</p>
                          <p className="text-sm font-bold text-white">{selectedLead.kwp}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500">Investition</p>
                          <p className="text-sm font-bold text-white">{selectedLead.investment?.toLocaleString('de-DE')} €</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500">Ersparnis/Jahr</p>
                          <p className="text-sm font-bold text-[#F5A623]">{selectedLead.annual_savings?.toLocaleString('de-DE')} €</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Termin durchgeführt Toggle */}
                  <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer pt-2 border-t border-white/5">
                    <input
                      type="checkbox"
                      checked={selectedLead.site_visit_done}
                      onChange={(e) => setSelectedLead((prev) => prev ? { ...prev, site_visit_done: e.target.checked } : prev)}
                      className="w-4 h-4 rounded border-white/10 bg-[#252525] text-[#F5A623] focus:ring-[#F5A623]/50"
                    />
                    Termin wurde durchgeführt
                  </label>

                  {/* Speichern & Status-Wechsel */}
                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      onClick={async () => {
                        setDetailLoading(true);
                        try {
                          await updateLeadFields(selectedLead.id, {
                            site_visit_date: selectedLead.site_visit_date,
                            site_visit_notes: selectedLead.site_visit_notes,
                            site_visit_done: selectedLead.site_visit_done,
                            roof_area_measured: selectedLead.roof_area_measured,
                            roof_angle: selectedLead.roof_angle,
                            shading_issues: selectedLead.shading_issues,
                            roof_area: selectedLead.roof_area_measured ?? selectedLead.roof_area,
                            roof_orientation: selectedLead.roof_orientation,
                            consumption: selectedLead.consumption,
                            electricity_price: selectedLead.electricity_price,
                            has_battery: selectedLead.has_battery,
                            has_e_car: selectedLead.has_e_car,
                            has_heat_pump: selectedLead.has_heat_pump,
                            kwp: selectedLead.kwp,
                            investment: selectedLead.investment,
                            annual_savings: selectedLead.annual_savings,
                            amortization: selectedLead.amortization,
                            autarky: selectedLead.autarky,
                            profit_20_years: selectedLead.profit_20_years,
                            score: selectedLead.score,
                          });
                          // Termin automatisch mit Kalender synchronisieren
                          if (selectedLead.site_visit_date && user) {
                            await upsertSiteVisitAppointment(user.id, selectedLead);
                          }
                        } finally {
                          setDetailLoading(false);
                        }
                      }}
                      className="w-full bg-[#252525] hover:bg-white/5 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-colors border border-white/10"
                    >
                      Speichern
                    </button>

                    {selectedLead.status === 'kontaktiert' && (
                      <button
                        onClick={() => handleLeadStatusChange(selectedLead.id, 'vorort')}
                        className="w-full flex items-center justify-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-bold text-xs px-4 py-2.5 rounded-lg transition-colors border border-purple-500/20"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        Termin vereinbart → Vor Ort
                      </button>
                    )}

                    {selectedLead.status === 'vorort' && selectedLead.site_visit_done && (
                      <button
                        onClick={() => handleLeadStatusChange(selectedLead.id, 'angebot')}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-bold text-xs px-4 py-2.5 rounded-lg transition-colors border border-indigo-500/20"
                      >
                        <FileTextIcon className="w-3.5 h-3.5" />
                        Angebot erstellen → Angebot versendet
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Angebots-Management */}
              <div className="bg-[#1A1A1A] rounded-xl border border-white/5 p-4 space-y-4">
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Angebots-Management</h3>

                {/* Status Badge */}
                {(() => {
                  const cfg = OFFER_CONFIG[selectedLead.offer_status];
                  const OfferIcon = cfg.icon;
                  return (
                    <div className={`inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                      <OfferIcon className="w-3.5 h-3.5" />
                      {cfg.label}
                      {selectedLead.offer_sent_at && (
                        <span className="font-normal opacity-70">· {new Date(selectedLead.offer_sent_at).toLocaleDateString('de-DE')}</span>
                      )}
                    </div>
                  );
                })()}

                {/* Aktionen */}
                <div className="flex flex-wrap gap-2">
                  {selectedLead.offer_status === 'created' && (
                    <button
                      onClick={() => handleOfferStatusChange(selectedLead.id, 'sent', { offer_sent_at: new Date().toISOString() })}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Als versendet markieren
                    </button>
                  )}

                  {selectedLead.offer_status === 'sent' && (
                    <>
                      <button
                        onClick={() => handleOfferStatusChange(selectedLead.id, 'viewed', { offer_viewed_at: new Date().toISOString() })}
                        className="flex items-center gap-2 border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-bold text-xs px-4 py-2.5 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Als angesehen markieren
                      </button>
                      <button
                        onClick={async () => {
                          await handleOfferStatusChange(selectedLead.id, 'accepted');
                          if (selectedLead.status !== 'gewonnen') await handleLeadStatusChange(selectedLead.id, 'gewonnen');
                        }}
                        className="flex items-center gap-2 border border-green-500/30 bg-green-500/10 hover:bg-green-500/20 text-green-400 font-bold text-xs px-4 py-2.5 rounded-lg transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Angenommen
                      </button>
                      <button
                        onClick={() => handleOfferStatusChange(selectedLead.id, 'rejected')}
                        className="flex items-center gap-2 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs px-4 py-2.5 rounded-lg transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        Abgelehnt
                      </button>
                    </>
                  )}

                  {selectedLead.offer_status === 'viewed' && (
                    <>
                      <button
                        onClick={async () => {
                          await handleOfferStatusChange(selectedLead.id, 'accepted');
                          if (selectedLead.status !== 'gewonnen') await handleLeadStatusChange(selectedLead.id, 'gewonnen');
                        }}
                        className="flex items-center gap-2 border border-green-500/30 bg-green-500/10 hover:bg-green-500/20 text-green-400 font-bold text-xs px-4 py-2.5 rounded-lg transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Angenommen
                      </button>
                      <button
                        onClick={() => handleOfferStatusChange(selectedLead.id, 'rejected')}
                        className="flex items-center gap-2 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs px-4 py-2.5 rounded-lg transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        Abgelehnt
                      </button>
                    </>
                  )}

                  {selectedLead.offer_status === 'rejected' && (
                    <button
                      onClick={() => handleOfferStatusChange(selectedLead.id, 'created')}
                      className="flex items-center gap-2 border border-white/10 bg-[#252525] hover:bg-white/5 text-gray-300 font-bold text-xs px-4 py-2.5 rounded-lg transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Neues Angebot erstellen
                    </button>
                  )}
                </div>

                {/* Zahlungsstatus (nur bei accepted) */}
                {selectedLead.offer_status === 'accepted' && selectedLead.investment != null && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5" />
                      Zahlungsstatus
                    </h4>
                    <div className="space-y-2">
                      {[
                        { num: 1 as const, label: 'Anzahlung', pct: 30 },
                        { num: 2 as const, label: 'Zwischenzahlung', pct: 60 },
                        { num: 3 as const, label: 'Schlusszahlung', pct: 10 },
                      ].map((p) => {
                        const paid = selectedLead[`payment_${p.num}_paid` as const];
                        const amount = Math.round((selectedLead.investment ?? 0) * (p.pct / 100));
                        return (
                          <button
                            key={p.num}
                            onClick={() => handlePaymentToggle(selectedLead.id, p.num, paid)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all ${
                              paid
                                ? 'border-green-500/30 bg-green-500/10'
                                : 'border-white/5 bg-[#252525] hover:border-white/10'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                paid ? 'bg-green-500 text-white' : 'bg-white/10 text-gray-500'
                              }`}>
                                {paid ? <CheckCircle2 className="w-3.5 h-3.5" /> : p.num}
                              </div>
                              <div className="text-left">
                                <p className={`text-sm font-medium ${paid ? 'text-green-400' : 'text-gray-300'}`}>{p.label} ({p.pct}%)</p>
                                <p className="text-xs text-gray-500">{amount.toLocaleString('de-DE')} €</p>
                              </div>
                            </div>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              paid ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-500'
                            }`}>
                              {paid ? 'Bezahlt' : 'Offen'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Rabatt-Management */}
              <div className="bg-[#1A1A1A] rounded-xl border border-white/5 p-4 space-y-4">
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Rabatt & Preis</h3>

                {/* Aktueller Preis */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Projektsumme</span>
                  <span className="text-sm font-bold text-white">
                    {selectedLead.final_price != null
                      ? <><span className="text-gray-500 line-through mr-2">{selectedLead.investment?.toLocaleString('de-DE')} €</span>{selectedLead.final_price.toLocaleString('de-DE')} €</>
                      : <>{selectedLead.investment?.toLocaleString('de-DE')} €</>
                    }
                  </span>
                </div>

                {/* Aktiver Rabatt */}
                {selectedLead.discount_status !== 'none' && (
                  <div className={`rounded-lg p-3 border ${
                    selectedLead.discount_status === 'requested' ? 'bg-amber-500/5 border-amber-500/20' :
                    selectedLead.discount_status === 'approved' ? 'bg-green-500/5 border-green-500/20' :
                    'bg-[#F5A623]/5 border-[#F5A623]/20'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-[#F5A623]" />
                        <span className="text-sm text-white">
                          {selectedLead.discount_code && (
                            <span className="font-mono text-[#F5A623] mr-1">{selectedLead.discount_code}</span>
                          )}
                          {selectedLead.discount_percentage}% Rabatt
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        selectedLead.discount_status === 'requested' ? 'bg-amber-500/10 text-amber-400' :
                        selectedLead.discount_status === 'approved' ? 'bg-green-500/10 text-green-400' :
                        'bg-[#F5A623]/10 text-[#F5A623]'
                      }`}>
                        {selectedLead.discount_status === 'code_applied' ? 'Aktiv' :
                         selectedLead.discount_status === 'requested' ? 'Angefragt' :
                         selectedLead.discount_status === 'approved' ? 'Genehmigt' :
                         selectedLead.discount_status}
                      </span>
                    </div>
                    {selectedLead.discount_note && (
                      <p className="text-xs text-gray-500 mt-1 italic">„{selectedLead.discount_note}"</p>
                    )}
                    {/* Rabatt entfernen */}
                    {selectedLead.discount_status !== 'requested' && (
                      <button
                        onClick={() => handleClearDiscount(selectedLead.id)}
                        className="mt-2 text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Rabatt entfernen
                      </button>
                    )}
                  </div>
                )}

                {/* Rabatt-Code anwenden */}
                {selectedLead.discount_status === 'none' && (
                  <div className="space-y-2">
                    {availableDiscountCodes.length > 0 ? (
                      <div className="space-y-2">
                        <label className="text-xs text-gray-500">Verfügbare Rabattcodes</label>
                        <div className="relative">
                          <select
                            value={discountCodeInput}
                            onChange={(e) => setDiscountCodeInput(e.target.value)}
                            className="w-full appearance-none bg-[#252525] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#F5A623]/50"
                          >
                            <option value="">Rabatt-Code wählen…</option>
                            {availableDiscountCodes.map((code) => {
                              const hints: string[] = [];
                              if (code.min_investment != null) hints.push(`ab ${code.min_investment.toLocaleString('de-DE')} €`);
                              if (code.max_uses != null) hints.push(`noch ${Math.max(0, code.max_uses - code.uses_count)}×`);
                              if (code.valid_until) hints.push(`bis ${new Date(code.valid_until).toLocaleDateString('de-DE')}`);
                              const suffix = hints.length ? ` (${hints.join(', ')})` : '';
                              const lbl = code.label ? ` — ${code.label}` : '';
                              return (
                                <option key={code.id} value={code.code}>
                                  {code.code}{lbl} · {code.percentage}%{suffix}
                                </option>
                              );
                            })}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        </div>
                        <button
                          onClick={() => { if (discountCodeInput.trim()) handleApplyDiscount(selectedLead.id, discountCodeInput.trim()); }}
                          disabled={!discountCodeInput.trim() || detailLoading}
                          className="w-full bg-[#F5A623] text-[#1A3A5C] font-bold text-xs px-4 py-2 rounded-lg hover:bg-[#E09000] transition-colors disabled:opacity-50"
                        >
                          Anwenden
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={discountCodeInput}
                          onChange={(e) => setDiscountCodeInput(e.target.value)}
                          placeholder="Rabatt-Code eingeben"
                          className="flex-1 bg-[#252525] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#F5A623]/50"
                        />
                        <button
                          onClick={() => { if (discountCodeInput.trim()) handleApplyDiscount(selectedLead.id, discountCodeInput.trim()); }}
                          disabled={!discountCodeInput.trim() || detailLoading}
                          className="bg-[#F5A623] text-[#1A3A5C] font-bold text-xs px-4 py-2 rounded-lg hover:bg-[#E09000] transition-colors disabled:opacity-50"
                        >
                          Anwenden
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => setShowDiscountRequest(!showDiscountRequest)}
                      className="text-xs text-gray-500 hover:text-white transition-colors flex items-center gap-1"
                    >
                      <Percent className="w-3 h-3" />
                      {showDiscountRequest ? 'Abbrechen' : 'Individuellen Rabatt anfragen'}
                    </button>
                  </div>
                )}

                {/* Individuellen Rabatt anfragen */}
                {showDiscountRequest && selectedLead.discount_status === 'none' && (
                  <div className="space-y-3 bg-[#252525] rounded-lg p-3 border border-white/5">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Rabatt-Satz: {requestPercentage}%</label>
                      <input
                        type="range"
                        min="1"
                        max="30"
                        value={requestPercentage}
                        onChange={(e) => setRequestPercentage(Number(e.target.value))}
                        className="w-full accent-[#F5A623]"
                      />
                      <div className="flex justify-between text-[10px] text-gray-600">
                        <span>1%</span>
                        <span>15%</span>
                        <span>30%</span>
                      </div>
                    </div>
                    <textarea
                      value={requestNote}
                      onChange={(e) => setRequestNote(e.target.value)}
                      placeholder="Begründung für Rabatt..."
                      rows={2}
                      className="w-full bg-[#0F0F0F] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#F5A623]/50 resize-none"
                    />
                    <button
                      onClick={() => { handleRequestDiscount(selectedLead.id, requestPercentage, requestNote); setShowDiscountRequest(false); setRequestNote(''); }}
                      disabled={detailLoading}
                      className="w-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-xs px-4 py-2 rounded-lg hover:bg-amber-500/20 transition-colors"
                    >
                      Rabatt-Anfrage senden
                    </button>
                  </div>
                )}

                {/* Neues Angebot nötig Warnung */}
                {selectedLead.discount_status !== 'none' && selectedLead.offer_status !== 'created' && (
                  <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                    <p className="text-xs text-red-400 mb-2">
                      <AlertTriangle className="w-3 h-3 inline mr-1" />
                      Rabatt geändert — altes Angebot ist ungültig
                    </p>
                    <button
                      onClick={() => handleResetOffer(selectedLead.id)}
                      className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs px-4 py-2.5 rounded-lg transition-colors border border-red-500/20"
                    >
                      <FileTextIcon className="w-3.5 h-3.5" />
                      Neues Angebot generieren
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
  </div>
);
}
