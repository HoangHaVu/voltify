import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PDFDownloadLink, pdf } from '@react-pdf/renderer';
import {
  ArrowLeft, Sun, Mail, Phone, MapPin, Zap, Euro, Calendar,
  Flame, Snowflake, ChevronDown, Clock, CreditCard, Home,
  Compass, BatteryCharging, Car, Thermometer, TrendingUp,
  Video, BarChart2, FileText, Send, CheckCircle, Eye, XCircle,
  Tag, Percent, Loader2, ArrowRight, AlertCircle, Receipt,
  Download, Check, AlertTriangle,
} from 'lucide-react';
import { AdminSidebar } from '../components/layout/AdminSidebar';
import { useAuth } from '../contexts/AuthContext';
import { useInstallerLead } from '../hooks/useInstallerLead';
import { useDiscountCodes } from '../hooks/useDiscountCodes';
import { supabase } from '../lib/supabase';
import { getScoreResult } from '../utils/leadScore';
import OfferPdfDocument, { type CompanySettings } from '../components/pdf/OfferPdfDocument';
import InvoicePdfDocument from '../components/pdf/InvoicePdfDocument';
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

// ─── Angebots-Management Sub-Component ───
function AngebotsManagementSection({
  lead,
  changeOfferStatus,
  changeStatus,
  setSendEmail,
  setShowSendModal,
  formatDate,
}: {
  lead: Lead;
  changeOfferStatus: (status: Lead['offer_status'], extra?: { offer_sent_at?: string; offer_viewed_at?: string }) => Promise<void>;
  changeStatus: (status: Lead['status']) => Promise<void>;
  setSendEmail: (email: string) => void;
  setShowSendModal: (show: boolean) => void;
  formatDate: (iso: string) => string;
}) {
  const cfg = OFFER_CONFIG[lead.offer_status];
  const OfferIcon = cfg.icon;
  const company = loadCompanySettings();
  const offerNumber = generateOfferNumber(lead);

  return (
    <section className="bg-[#1A1A1A] rounded-xl border border-white/5 p-6">
      <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Angebots-Management</h2>
      <div className={`inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full border mb-5 ${cfg.bg} ${cfg.color} ${cfg.border}`}>
        <OfferIcon className="w-3.5 h-3.5" />
        {cfg.label}
        {lead.offer_sent_at && (
          <span className="font-normal opacity-70">· {formatDate(lead.offer_sent_at)}</span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <PDFDownloadLink
          document={<OfferPdfDocument lead={lead} company={company} offerNumber={offerNumber} />}
          fileName={`Angebot-${offerNumber}.pdf`}
          className="flex items-center gap-2 bg-[#252525] border border-white/10 text-white font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-[#333] transition-colors cursor-pointer"
        >
          {({ loading }) => (
            <>
              <FileText className="w-4 h-4" />
              {loading ? 'PDF wird erstellt…' : 'Angebot als PDF'}
            </>
          )}
        </PDFDownloadLink>
        {lead.offer_status === 'created' && (
          <button
            onClick={() => { setSendEmail(lead.email); setShowSendModal(true); }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
            Angebot senden
          </button>
        )}
        {lead.offer_status === 'sent' && (
          <button
            onClick={() => changeOfferStatus('viewed', { offer_viewed_at: new Date().toISOString() })}
            className="flex items-center gap-2 border border-purple-500/20 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-bold text-sm px-4 py-2.5 rounded-xl transition-colors"
          >
            <Eye className="w-4 h-4" />
            Als angesehen markieren
          </button>
        )}
        {(lead.offer_status === 'sent' || lead.offer_status === 'viewed') && (
          <button
            onClick={async () => {
              await changeOfferStatus('accepted');
              if (lead.status !== 'gewonnen') await changeStatus('gewonnen');
            }}
            className="flex items-center gap-2 border border-green-500/20 bg-green-500/10 hover:bg-green-500/20 text-green-400 font-bold text-sm px-4 py-2.5 rounded-xl transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            Angenommen
          </button>
        )}
        {lead.offer_status === 'rejected' && (
          <button
            onClick={() => changeOfferStatus('created')}
            className="flex items-center gap-2 border border-white/10 bg-[#252525] hover:bg-[#333] text-gray-400 font-bold text-sm px-4 py-2.5 rounded-xl transition-colors"
          >
            <Send className="w-4 h-4" />
            Neues Angebot erstellen
          </button>
        )}
      </div>
      {lead.offer_status === 'accepted' && (
        <div className="mt-5 pt-5 border-t border-white/5">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5" />
            Abschlagsrechnungen
          </p>
          <div className="flex flex-wrap gap-2">
            {([1, 2, 3] as const).map((type) => {
              const isPaid = type === 1 ? lead.payment_1_paid : type === 2 ? lead.payment_2_paid : lead.payment_3_paid;
              const invNum = `${generateOfferNumber(lead)}-${String(type).padStart(2, '0')}`;
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
          {/* Payment status toggles */}
          <div className="flex flex-wrap gap-2 mt-2">
            {([1, 2, 3] as const).map((type) => {
              const isPaid = type === 1 ? lead.payment_1_paid : type === 2 ? lead.payment_2_paid : lead.payment_3_paid;
              const label = type === 1 ? 'Anzahlung' : type === 2 ? 'Zwischenzahlung' : 'Schlussrechnung';
              return (
                <button
                  key={`pay-${type}`}
                  onClick={async () => {
                    const field = type === 1 ? 'payment_1_paid' : type === 2 ? 'payment_2_paid' : 'payment_3_paid';
                    const { error } = await supabase.from('leads').update({ [field]: !isPaid }).eq('id', lead.id);
                    if (!error) {
                      // Force reload via parent
                      window.location.reload();
                    }
                  }}
                  className={`text-[10px] font-bold px-2 py-1 rounded border transition-colors ${
                    isPaid
                      ? 'bg-green-500/10 border-green-500/20 text-green-400'
                      : 'bg-[#252525] border-white/5 text-gray-500 hover:text-white'
                  }`}
                >
                  {isPaid ? `✓ ${label} bezahlt` : `${label} als bezahlt markieren`}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

export default function LeadDetailsPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { lead, isLoading, changeStatus, changeOfferStatus, applyCode, requestCustomDiscount, clearLeadDiscount } = useInstallerLead(id);
  const { codes: discountCodes } = useDiscountCodes(undefined);

  const [showSendModal, setShowSendModal] = useState(false);
  const [sendEmail, setSendEmail] = useState('');
  const [sendSubject, setSendSubject] = useState('');
  const [sendMessage, setSendMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Rabatt-State
  const [selectedCode, setSelectedCode] = useState('');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestPercentage, setRequestPercentage] = useState('');
  const [requestNote, setRequestNote] = useState('');
  const [isApplyingCode, setIsApplyingCode] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);

  const scoreResult = lead?.score != null ? getScoreResult(lead.score) : null;
  const TierIcon = scoreResult ? TIER_ICON[scoreResult.tier] : null;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });

  async function handleApplyCode() {
    const found = discountCodes.find((c) => c.id === selectedCode);
    if (!found || !lead) return;
    setIsApplyingCode(true);
    setCodeError(null);
    try {
      await applyCode(found.code, found.percentage, found.created_by);
      setSelectedCode('');
    } catch (err) {
      setCodeError(err instanceof Error ? err.message : 'Code konnte nicht angewendet werden');
    } finally {
      setIsApplyingCode(false);
    }
  }

  async function handleRequestDiscount() {
    const pct = parseFloat(requestPercentage);
    if (!pct || pct <= 0) return;
    setIsRequesting(true);
    await requestCustomDiscount(pct, requestNote);
    setIsRequesting(false);
    setShowRequestForm(false);
    setRequestPercentage('');
    setRequestNote('');
  }

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

  async function handleSendOffer() {
    if (!lead || !sendEmail.trim()) return;
    setIsSending(true);
    setSendError(null);
    setSendSuccess(false);

    try {
      // 1. PDF generieren
      const company = loadCompanySettings();
      const offerNumber = generateOfferNumber(lead);
      const blob = await pdf(<OfferPdfDocument lead={lead} company={company} offerNumber={offerNumber} />).toBlob();

      // 2. Blob zu Base64
      const arrayBuffer = await blob.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      // 3. E-Mail via Edge Function senden
      const subject = sendSubject.trim() || `Ihr persönliches Solar-Angebot — ${company.firmenname}`;
      const html = sendMessage.trim().replace(/\n/g, '<br>') || `
        <p>Guten Tag ${lead.first_name} ${lead.last_name},</p>
        <p>vielen Dank für Ihr Interesse an einer Photovoltaikanlage. Anbei finden Sie Ihr persönliches Angebot.</p>
        <p>Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>
        <p>Mit freundlichen Grüßen<br>${company.firmenname}</p>
      `;

      const { data: fnData, error: fnError } = await supabase.functions.invoke('send-offer', {
        body: {
          to: sendEmail.trim(),
          subject,
          html,
          pdfBase64: base64,
          filename: `Angebot-${offerNumber}.pdf`,
          from_name: company.firmenname,
        },
      });

      if (fnError || !fnData?.success) {
        throw new Error(fnError?.message || fnData?.error || 'E-Mail-Versand fehlgeschlagen');
      }

      // 4. Status aktualisieren
      await changeOfferStatus('sent', { offer_sent_at: new Date().toISOString() });
      if (lead.status === 'kontaktiert' || lead.status === 'neu') {
        await changeStatus('angebot');
      }

      setSendSuccess(true);
      setTimeout(() => {
        setShowSendModal(false);
        setSendEmail('');
        setSendSubject('');
        setSendMessage('');
        setSendSuccess(false);
      }, 2000);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Fehler beim Versand');
    } finally {
      setIsSending(false);
    }
  }

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

          {/* Angebot-Senden-Modal */}
          {showSendModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-[#1A1A1A] rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-white/10 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Send className="w-4 h-4 text-blue-400" />
                  </div>
                  <h2 className="text-base font-bold text-white">Angebot versenden</h2>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  Das Angebot wird als PDF generiert und per E-Mail an den Kunden gesendet.
                </p>

                {sendSuccess ? (
                  <div className="flex items-center gap-3 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 mb-4">
                    <Check className="w-5 h-5 shrink-0" />
                    <div>
                      <p className="font-bold text-sm">Angebot erfolgreich versendet!</p>
                      <p className="text-xs text-emerald-300/70">E-Mail wurde an {sendEmail} gesendet.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      E-Mail-Adresse
                    </label>
                    <input
                      type="email"
                      value={sendEmail}
                      onChange={(e) => setSendEmail(e.target.value)}
                      className="w-full bg-[#0F0F0F] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 mb-3 placeholder:text-gray-600"
                      placeholder="kunde@beispiel.de"
                    />

                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      Betreff
                    </label>
                    <input
                      type="text"
                      value={sendSubject}
                      onChange={(e) => setSendSubject(e.target.value)}
                      className="w-full bg-[#0F0F0F] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 mb-3 placeholder:text-gray-600"
                      placeholder="Ihr persönliches Solar-Angebot"
                    />

                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                      Nachricht
                    </label>
                    <textarea
                      value={sendMessage}
                      onChange={(e) => setSendMessage(e.target.value)}
                      rows={4}
                      className="w-full bg-[#0F0F0F] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 mb-3 placeholder:text-gray-600 resize-none"
                      placeholder={`Guten Tag,\n\nvielen Dank für Ihr Interesse. Anbei finden Sie Ihr persönliches Angebot.\n\nMit freundlichen Grüßen`}
                    />

                    {sendError && (
                      <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-3">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        {sendError}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => { setShowSendModal(false); setSendEmail(''); setSendSubject(''); setSendMessage(''); setSendError(null); }}
                        className="flex-1 border border-white/10 text-gray-400 font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
                      >
                        Abbrechen
                      </button>
                      <button
                        onClick={handleSendOffer}
                        disabled={!sendEmail.trim() || isSending}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        {isSending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        {isSending ? 'Wird gesendet…' : 'Jetzt senden'}
                      </button>
                    </div>
                  </>
                )}
              </div>
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
                      <StatCard label="Amortisation" value={lead.amortization != null ? `${lead.amortization} Jahre` : '—'} icon={<Calendar className="w-3.5 h-3.5" />} accent="text-indigo-400" />
                      <StatCard label="Autarkie" value={lead.autarky != null ? `${lead.autarky} %` : '—'} sub="Eigenverbrauchsanteil" icon={<BatteryCharging className="w-3.5 h-3.5" />} accent="text-teal-400" />
                      <StatCard label="Gewinn 20 J." value={lead.profit_20_years != null ? `${lead.profit_20_years.toLocaleString('de-DE')} €` : '—'} sub="nach Investitionsabzug" icon={<BarChart2 className="w-3.5 h-3.5" />} accent="text-emerald-400" />
                    </div>
                  </section>

                  {/* Lead-Score */}
                  {scoreResult && (
                    <section className="bg-[#1A1A1A] rounded-xl border border-white/5 p-6">
                      <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Lead-Score</h2>
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center ${scoreResult.bgColor} border`}>
                          {TierIcon && <TierIcon className={`w-6 h-6 mb-0.5 ${scoreResult.color}`} />}
                          <span className={`text-lg font-black ${scoreResult.color}`}>{scoreResult.score}</span>
                        </div>
                        <div>
                          <p className={`text-base font-black ${scoreResult.color}`}>{scoreResult.label}</p>
                          <p className="text-xs text-gray-500 mt-0.5 max-w-xs">
                            Score aus kWp, Investition, PLZ-Einstrahlung, Eigentumsform, Speicher & Planungshorizont.
                          </p>
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

                  {/* Preis & Rabatt */}
                  {lead.investment != null && (
                    <section className="bg-[#1A1A1A] rounded-xl border border-white/5 p-6">
                      <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-5">Preis & Rabatt</h2>
                      <div className="flex items-center gap-4 mb-5">
                        {lead.discount_status !== 'none' && lead.final_price != null && lead.discount_percentage != null ? (
                          <>
                            <div>
                              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Originalpreis</p>
                              <p className="text-lg font-black text-gray-500 line-through">{lead.investment.toLocaleString('de-DE')} €</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-600 shrink-0" />
                            <div>
                              <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Endpreis (−{lead.discount_percentage}%)</p>
                              <p className="text-2xl font-black text-green-400">{lead.final_price.toLocaleString('de-DE')} €</p>
                            </div>
                          </>
                        ) : (
                          <div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Standardpreis</p>
                            <p className="text-2xl font-black text-white">{lead.investment.toLocaleString('de-DE')} €</p>
                          </div>
                        )}
                      </div>

                      {/* Status-Badges */}
                      {lead.discount_status === 'code_applied' && (
                        <div className="flex items-center gap-2 mb-4 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2.5">
                          <Tag className="w-4 h-4 text-green-400 shrink-0" />
                          <span className="text-sm font-bold text-green-400 flex-1">Code „{lead.discount_code}" angewendet</span>
                          <button onClick={clearLeadDiscount} className="text-xs text-gray-500 hover:text-red-400 transition-colors font-medium">Entfernen</button>
                        </div>
                      )}
                      {lead.discount_status === 'requested' && (
                        <div className="flex items-center gap-2 mb-4 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-2.5">
                          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                          <span className="text-sm font-bold text-amber-400 flex-1">Anfrage läuft — wartet auf Inhaber-Freigabe</span>
                          <button onClick={clearLeadDiscount} className="text-xs text-gray-500 hover:text-red-400 transition-colors font-medium">Zurückziehen</button>
                        </div>
                      )}
                      {lead.discount_status === 'approved' && (
                        <div className="flex items-center gap-2 mb-4 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2.5">
                          <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                          <span className="text-sm font-bold text-green-400">Rabatt genehmigt ✓</span>
                        </div>
                      )}
                      {lead.discount_status === 'rejected' && (
                        <div className="flex items-center gap-2 mb-4 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
                          <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                          <span className="text-sm font-bold text-red-400 flex-1">Anfrage abgelehnt</span>
                          <button onClick={clearLeadDiscount} className="text-xs text-gray-500 hover:text-white transition-colors font-medium">Neu anfragen</button>
                        </div>
                      )}

                      {/* Aktionen */}
                      {(lead.discount_status === 'none' || lead.discount_status === 'rejected') && (
                        <div className="space-y-3">
                          {discountCodes.length > 0 && (() => {
                            const previewCode = discountCodes.find(c => c.id === selectedCode) ?? null;
                            const previewFinal = previewCode && lead.investment != null
                              ? Math.round(lead.investment * (1 - previewCode.percentage / 100))
                              : null;
                            const previewSaving = previewFinal != null && lead.investment != null
                              ? lead.investment - previewFinal
                              : null;
                            return (
                              <div className="space-y-2">
                                <div className="flex gap-2">
                                  <div className="relative flex-1">
                                    <select
                                      value={selectedCode}
                                      onChange={(e) => { setSelectedCode(e.target.value); setCodeError(null); }}
                                      className="w-full appearance-none bg-[#0F0F0F] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30"
                                    >
                                      <option value="">Rabatt-Code wählen…</option>
                                      {discountCodes.map((c) => {
                                        const hints: string[] = [];
                                        if (c.min_investment != null) hints.push(`ab ${c.min_investment.toLocaleString('de-DE')} €`);
                                        if (c.max_uses != null) hints.push(`noch ${Math.max(0, c.max_uses - c.uses_count)}×`);
                                        if (c.valid_until) hints.push(`bis ${new Date(c.valid_until).toLocaleDateString('de-DE')}`);
                                        const suffix = hints.length ? ` (${hints.join(', ')})` : '';
                                        const lbl = c.label ? ` — ${c.label}` : '';
                                        return <option key={c.id} value={c.id}>{c.code}{lbl} · {c.percentage}%{suffix}</option>;
                                      })}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                  </div>
                                  <button
                                    onClick={handleApplyCode}
                                    disabled={!selectedCode || isApplyingCode}
                                    className="flex items-center gap-2 bg-[#F5A623] hover:bg-[#E09000] text-[#1A3A5C] font-bold text-sm px-4 py-2.5 rounded-xl disabled:opacity-50 transition-colors shadow-sm whitespace-nowrap"
                                  >
                                    {isApplyingCode ? <Loader2 className="w-4 h-4 animate-spin" /> : <Tag className="w-4 h-4" />}
                                    Anwenden
                                  </button>
                                </div>
                                {previewFinal != null && previewSaving != null && lead.investment != null && (
                                  <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
                                    <div>
                                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ohne Rabatt</p>
                                      <p className="text-base font-bold text-gray-500 line-through">{lead.investment.toLocaleString('de-DE')} €</p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-gray-600 shrink-0" />
                                    <div>
                                      <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Mit Code (−{previewCode!.percentage}%)</p>
                                      <p className="text-xl font-black text-green-400">{previewFinal.toLocaleString('de-DE')} €</p>
                                    </div>
                                    <div className="ml-auto text-right shrink-0">
                                      <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Ersparnis</p>
                                      <p className="text-sm font-bold text-green-400">−{previewSaving.toLocaleString('de-DE')} €</p>
                                    </div>
                                  </div>
                                )}
                                {codeError && (
                                  <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    {codeError}
                                  </div>
                                )}
                              </div>
                            );
                          })()}

                          {!showRequestForm ? (
                            <button
                              onClick={() => setShowRequestForm(true)}
                              className="flex items-center gap-2 border border-dashed border-white/10 text-gray-500 hover:border-[#F5A623]/50 hover:text-[#F5A623] font-bold text-sm px-4 py-2.5 rounded-xl transition-colors w-full justify-center"
                            >
                              <Percent className="w-4 h-4" />
                              Höheren Rabatt beim Inhaber anfragen
                            </button>
                          ) : (
                            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 space-y-3">
                              <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Rabatt-Anfrage</p>
                              <div className="flex gap-3">
                                <div className="relative w-28 shrink-0">
                                  <input
                                    type="number"
                                    value={requestPercentage}
                                    onChange={(e) => setRequestPercentage(e.target.value)}
                                    className="w-full bg-[#0F0F0F] border border-white/10 rounded-lg px-4 py-2.5 pr-8 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 placeholder:text-gray-600"
                                    placeholder="0"
                                    min="1"
                                    max="50"
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold">%</span>
                                </div>
                                <input
                                  type="text"
                                  value={requestNote}
                                  onChange={(e) => setRequestNote(e.target.value)}
                                  className="flex-1 bg-[#0F0F0F] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                                  placeholder="Begründung (optional)"
                                />
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={handleRequestDiscount}
                                  disabled={!requestPercentage || isRequesting}
                                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-[#1A3A5C] font-bold text-sm px-4 py-2 rounded-lg disabled:opacity-50 transition-colors"
                                >
                                  {isRequesting && <Loader2 className="w-4 h-4 animate-spin" />}
                                  {isRequesting ? 'Wird gesendet…' : 'Anfrage senden'}
                                </button>
                                <button
                                  onClick={() => { setShowRequestForm(false); setRequestPercentage(''); setRequestNote(''); }}
                                  className="border border-white/10 text-gray-500 font-bold text-sm px-4 py-2 rounded-lg hover:bg-white/5 transition-colors"
                                >
                                  Abbrechen
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </section>
                  )}

                  {/* Angebots-Management */}
                  {leadAsProject && <AngebotsManagementSection lead={lead} changeOfferStatus={changeOfferStatus} changeStatus={changeStatus} setSendEmail={setSendEmail} setShowSendModal={setShowSendModal} formatDate={formatDate} />}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
