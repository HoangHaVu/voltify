import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PDFDownloadLink, pdf } from '@react-pdf/renderer';
import {
  ArrowLeft, Plus, Trash2, Save, Send, FileText, CheckCircle, XCircle,
  Loader2, AlertTriangle, Download, Percent, Tag, Euro, Package,
  Zap, BatteryCharging, Wrench, Cable, HardHat, Car, MoreHorizontal, GripVertical,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AdminSidebar } from '../components/layout/AdminSidebar';
import OfferPdfDocument, { type CompanySettings } from '../components/pdf/OfferPdfDocument';
import {
  fetchLeadByIdScoped, addLeadActivity, type Lead, type DiscountCode,
} from '../services/data';
import { useDiscountCodes } from '../hooks/useDiscountCodes';
import {
  getOrCreateOfferDraft, recalculateDraft, addLineItem, updateLineItem, deleteLineItem,
  updateOfferDraft, markOfferDraftSent, markOfferDraftAccepted, markOfferDraftRejected,
  applyDiscountCodeToDraft, CATEGORY_LABELS, fetchOfferTemplates, interpolateTemplate,
  DEFAULT_OFFER_TEXT_TEMPLATE, DEFAULT_EMAIL_TEMPLATE,
  type OfferDraft, type OfferLineItem, type OfferTextTemplate, type EmailTemplate,
} from '../services/offers';
import { supabase } from '../lib/supabase';

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

const CATEGORY_ICONS: Record<OfferLineItem['category'], React.ElementType> = {
  module: Zap,
  inverter: Zap,
  storage: BatteryCharging,
  mounting: HardHat,
  electrical: Cable,
  scaffolding: Wrench,
  travel: Car,
  other: Package,
};

const STATUS_LABELS: Record<OfferDraft['status'], string> = {
  draft: 'Entwurf',
  sent: 'Versendet',
  accepted: 'Angenommen',
  rejected: 'Abgelehnt',
};

const STATUS_COLORS: Record<OfferDraft['status'], string> = {
  draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  sent: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  accepted: 'bg-green-500/10 text-green-400 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
};

function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '0 €';
  return value.toLocaleString('de-DE') + ' €';
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Empty line item template ─────────────────────────────────────────

function createEmptyItem(sortOrder: number): Omit<OfferLineItem, 'id' | 'offer_draft_id'> {
  return {
    category: 'other',
    description: '',
    quantity: 1,
    unit: 'Stk',
    unit_price: 0,
    total_price: 0,
    is_optional: false,
    sort_order: sortOrder,
  };
}

export default function OfferBuilderPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [lead, setLead] = useState<Lead | null>(null);
  const [draft, setDraft] = useState<OfferDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // E-Mail-Modal
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendEmail, setSendEmail] = useState('');
  const [sendSubject, setSendSubject] = useState('');
  const [sendMessage, setSendMessage] = useState('');
  const [sendSuccess, setSendSuccess] = useState(false);

  // Angebotsvorlagen
  const [offerTextTemplate, setOfferTextTemplate] = useState<OfferTextTemplate>({ ...DEFAULT_OFFER_TEXT_TEMPLATE });
  const [emailTemplate] = useState<EmailTemplate>({ ...DEFAULT_EMAIL_TEMPLATE });

  // Drag & Drop Reordering
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Rabatt
  const [selectedCodeId, setSelectedCodeId] = useState('');
  const [manualDiscountPct, setManualDiscountPct] = useState<string>('');
  const [manualDiscountAmount, setManualDiscountAmount] = useState<string>('');

  const ownerId = user?.role === 'owner' ? user.id : undefined;
  const { codes: discountCodes } = useDiscountCodes(ownerId);

  const roleForFetch = user?.role === 'owner' ? 'owner' : 'installer';

  const loadData = useCallback(async () => {
    if (!user || !id) return;
    setLoading(true);
    setError(null);
    try {
      const leadData = await fetchLeadByIdScoped(user.id, roleForFetch, id);
      if (!leadData) {
        setError('Lead nicht gefunden.');
        return;
      }
      setLead(leadData);
      setSendEmail(leadData.email);

      const draftData = await getOrCreateOfferDraft(leadData, user.id);
      setDraft(draftData);

      // Vorlagen des Inhabers laden
      const templateOwnerId = user.role === 'owner' ? user.id : (user.ownerId ?? user.id);
      const templates = await fetchOfferTemplates(templateOwnerId);
      setOfferTextTemplate(templates.offerTextTemplate);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [user, id, roleForFetch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Live-Berechnung im State
  const calculated = useMemo(() => {
    if (!draft?.line_items) return { subtotal: 0, discount: 0, vat: 0, total: 0 };
    const subtotal = draft.line_items.reduce((sum, item) => sum + (item.total_price || 0), 0);
    const discount = draft.discount_amount || 0;
    const net = Math.max(0, subtotal - discount);
    const vat = Math.round((net * (draft.vat_rate || 0)) / 100);
    return { subtotal, discount, vat, total: net + vat };
  }, [draft]);

  // ROI-Impact vom aktuellen Angebots-Total
  const roiImpact = useMemo(() => {
    if (!lead) return null;
    const investment = calculated.total;
    const savings = lead.annual_savings;
    if (!savings || savings <= 0 || investment <= 0) return null;
    const amortization = parseFloat((investment / savings).toFixed(1));
    const profit20 = Math.round(savings * 20 - investment);
    return { amortization, annualSavings: savings, profit20, autarky: lead.autarky, kwp: lead.kwp };
  }, [calculated.total, lead]);

  // ─── Line Item Helpers ────────────────────────────────────────────────

  async function handleItemChange(
    itemId: string,
    field: keyof OfferLineItem,
    value: string | number | boolean
  ) {
    if (!draft) return;

    const current = draft.line_items?.find((i) => i.id === itemId);
    if (!current) return;

    let updates: Partial<OfferLineItem> = { [field]: value };

    // Berechne total_price wenn quantity oder unit_price sich ändern
    const nextQuantity = field === 'quantity' ? Number(value) : current.quantity;
    const nextUnitPrice = field === 'unit_price' ? Number(value) : current.unit_price;
    if (field === 'quantity' || field === 'unit_price') {
      updates = { ...updates, total_price: Math.round(nextQuantity * nextUnitPrice) };
    }

    // Optimistische UI-Update
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        line_items: prev.line_items?.map((i) =>
          i.id === itemId ? { ...i, ...updates } : i
        ),
      };
    });

    // Server-Update
    try {
      await updateLineItem(itemId, updates);
    } catch (e) {
      console.error('Fehler beim Aktualisieren der Position:', e);
    }
  }

  async function handleAddItem() {
    if (!draft) return;
    const sortOrder = (draft.line_items?.length || 0) + 1;
    try {
      const newItem = await addLineItem(draft.id, createEmptyItem(sortOrder));
      setDraft((prev) =>
        prev
          ? { ...prev, line_items: [...(prev.line_items || []), newItem] }
          : prev
      );
    } catch (e) {
      alert('Fehler: ' + (e as Error).message);
    }
  }

  async function handleDeleteItem(itemId: string) {
    if (!confirm('Position wirklich löschen?')) return;
    try {
      await deleteLineItem(itemId);
      setDraft((prev) =>
        prev
          ? { ...prev, line_items: prev.line_items?.filter((i) => i.id !== itemId) }
          : prev
      );
    } catch (e) {
      alert('Fehler: ' + (e as Error).message);
    }
  }

  // ─── Drag & Drop ─────────────────────────────────────────────────────

  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    setDragOverIndex(index);
  }

  function handleDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    const items = [...(draft?.line_items || [])];
    const [moved] = items.splice(dragIndex, 1);
    items.splice(targetIndex, 0, moved);
    const reordered = items.map((item, i) => ({ ...item, sort_order: i + 1 }));
    setDraft((prev) => prev ? { ...prev, line_items: reordered } : prev);
    setDragIndex(null);
    setDragOverIndex(null);
    reordered.forEach((item) => {
      updateLineItem(item.id, { sort_order: item.sort_order }).catch(console.error);
    });
  }

  function handleDragEnd() {
    setDragIndex(null);
    setDragOverIndex(null);
  }

  // ─── Rabatt ───────────────────────────────────────────────────────────

  async function handleApplyDiscountCode() {
    if (!draft || !selectedCodeId) return;
    const code = discountCodes.find((c) => c.id === selectedCodeId);
    if (!code) return;
    try {
      setSaving(true);
      const updated = await applyDiscountCodeToDraft(draft.id, code);
      setDraft(updated);
      setSelectedCodeId('');
      setManualDiscountPct('');
      setManualDiscountAmount('');
    } catch (e) {
      alert('Fehler: ' + (e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleApplyManualDiscount() {
    if (!draft) return;
    const pct = manualDiscountPct ? Number(manualDiscountPct) : 0;
    const amount = manualDiscountAmount ? Number(manualDiscountAmount) : 0;

    try {
      setSaving(true);
      await updateOfferDraft(draft.id, {
        discount_percentage: pct,
        discount_amount: amount,
        discount_code: null,
        discount_note: null,
      });
      const updated = await recalculateDraft(draft.id);
      setDraft(updated);
    } catch (e) {
      alert('Fehler: ' + (e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveDiscount() {
    if (!draft) return;
    try {
      setSaving(true);
      await updateOfferDraft(draft.id, {
        discount_percentage: 0,
        discount_amount: 0,
        discount_code: null,
        discount_note: null,
      });
      const updated = await recalculateDraft(draft.id);
      setDraft(updated);
      setManualDiscountPct('');
      setManualDiscountAmount('');
      setSelectedCodeId('');
    } catch (e) {
      alert('Fehler: ' + (e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  // ─── Speichern / Senden / Status ──────────────────────────────────────

  async function handleSaveDraft() {
    if (!draft || !lead || !user) return;
    setSaving(true);
    try {
      const updated = await recalculateDraft(draft.id);
      setDraft(updated);
      await addLeadActivity(
        lead.id,
        'offer_draft_saved',
        `Angebotsentwurf gespeichert (Summe: ${formatCurrency(updated.total)})`,
        user.id,
        user.fullName
      );
    } catch (e) {
      alert('Fehler: ' + (e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSendOffer() {
    if (!draft || !lead || !user) return;
    setSending(true);
    setSendError(null);

    try {
      // 1. Aktuellen Stand speichern
      await recalculateDraft(draft.id);

      // 2. PDF generieren
      const company = loadCompanySettings();
      const blob = await pdf(
        <OfferPdfDocument lead={lead} company={company} offerNumber={draft.offer_number || undefined} offerDraft={draft} textTemplate={offerTextTemplate} />
      ).toBlob();

      const arrayBuffer = await blob.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      // 3. E-Mail senden
      const subject = sendSubject.trim() || `Ihr persönliches Solar-Angebot — ${company.firmenname}`;
      const signatureLink = lead.signing_token ? `${window.location.origin}/sign/${lead.signing_token}` : null;
      const html = sendMessage.trim().replace(/\n/g, '<br>') || `
        <p>Guten Tag ${lead.first_name} ${lead.last_name},</p>
        <p>vielen Dank für Ihr Interesse an einer Photovoltaikanlage. Anbei finden Sie Ihr persönliches Angebot.</p>
        ${signatureLink ? `
          <p>
            <a href="${signatureLink}" style="display: inline-block; padding: 12px 24px; background-color: #F5A623; color: #1A3A5C; text-decoration: none; font-weight: bold; border-radius: 6px;">
              Angebot digital unterschreiben
            </a>
          </p>
          <p style="font-size: 12px; color: #666; margin-top: 8px;">
            Sie können das Angebot auch bequem digital unterzeichnen. Der obige Link bleibt 30 Tage gültig.
          </p>
        ` : ''}
        <p>Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>
        <p>Mit freundlichen Grüßen<br>${company.firmenname}</p>
      `;

      const { data: fnData, error: fnError } = await supabase.functions.invoke('send-offer', {
        body: {
          to: sendEmail.trim(),
          subject,
          html,
          pdfBase64: base64,
          filename: `Angebot-${draft.offer_number || lead.id.slice(0, 8).toUpperCase()}.pdf`,
          from_name: company.firmenname,
        },
      });

      if (fnError || !fnData?.success) {
        throw new Error(fnError?.message || fnData?.error || 'E-Mail-Versand fehlgeschlagen');
      }

      // 4. Status aktualisieren
      const updated = await markOfferDraftSent(draft.id);
      setDraft(updated);
      await addLeadActivity(
        lead.id,
        'offer_sent',
        `Angebot versendet an ${sendEmail.trim()}`,
        user.id,
        user.fullName
      );

      setSendSuccess(true);
      setTimeout(() => {
        setShowSendModal(false);
        setSendSuccess(false);
      }, 2000);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Fehler beim Versand');
    } finally {
      setSending(false);
    }
  }

  async function handleAccept() {
    if (!draft || !lead || !user) return;
    if (!confirm('Angebot als angenommen markieren? Der Lead wird auf „Gewonnen" gesetzt.')) return;
    try {
      setSaving(true);
      const updated = await markOfferDraftAccepted(draft.id);
      setDraft(updated);
      await addLeadActivity(
        lead.id,
        'offer_accepted',
        `Angebot angenommen (Summe: ${formatCurrency(updated.total)})`,
        user.id,
        user.fullName
      );
    } catch (e) {
      alert('Fehler: ' + (e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleReject() {
    if (!draft || !lead || !user) return;
    if (!confirm('Angebot als abgelehnt markieren?')) return;
    try {
      setSaving(true);
      const updated = await markOfferDraftRejected(draft.id);
      setDraft(updated);
      await addLeadActivity(
        lead.id,
        'offer_rejected',
        'Angebot abgelehnt',
        user.id,
        user.fullName
      );
    } catch (e) {
      alert('Fehler: ' + (e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex bg-[#0F0F0F] text-white">
        <AdminSidebar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-[#F5A623] animate-spin" />
        </main>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="min-h-screen flex bg-[#0F0F0F] text-white">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="bg-[#1A1A1A] rounded-xl border border-white/5 p-8 text-center text-gray-500">
            <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-red-400" />
            <p className="font-semibold">{error || 'Lead nicht gefunden.'}</p>
            <button
              onClick={() => navigate('/admin')}
              className="mt-4 text-sm text-[#F5A623] hover:underline"
            >
              Zurück zur Pipeline
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#0F0F0F] text-white">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <button
                onClick={() => navigate(`/lead/${id}`)}
                className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-white transition-colors mb-3 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                Zurück zum Lead
              </button>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-black text-white">
                  Angebot erstellen
                </h1>
                {draft && (
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${STATUS_COLORS[draft.status]}`}>
                    {STATUS_LABELS[draft.status]}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {lead.first_name} {lead.last_name} · {lead.email} {lead.zip && `· ${lead.zip}`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleSaveDraft}
                disabled={saving}
                className="flex items-center gap-2 bg-[#252525] border border-white/10 hover:bg-[#333] text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Entwurf speichern
              </button>

              {draft?.status === 'draft' && (
                <button
                  onClick={() => {
                    const company = loadCompanySettings();
                    const vars: Record<string, string> = {
                      vorname: lead?.first_name ?? '',
                      nachname: lead?.last_name ?? '',
                      angebotsnummer: draft?.offer_number ?? '',
                      firmenname: company.firmenname,
                      datum: new Date().toLocaleDateString('de-DE'),
                      gueltig_bis: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('de-DE'),
                      zahlungsziel: company.zahlungsziel || '14',
                    };
                    setSendSubject(interpolateTemplate(emailTemplate.betreff, vars));
                    setSendMessage(interpolateTemplate(emailTemplate.nachricht, vars));
                    setShowSendModal(true);
                  }}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Angebot senden
                </button>
              )}

              {draft?.status === 'sent' && (
                <>
                  <button
                    onClick={handleAccept}
                    disabled={saving}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Angenommen
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={saving}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Abgelehnt
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Linke Spalte: Positionen */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-[#1A1A1A] rounded-xl border border-white/5 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                  <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                    Angebotspositionen
                  </h2>
                  <button
                    onClick={handleAddItem}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#F5A623] hover:text-white transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Position hinzufügen
                  </button>
                </div>

                {/* Spalten-Header */}
                <div
                  className="grid items-center text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-white/5 bg-white/[0.02]"
                  style={{ gridTemplateColumns: '36px minmax(160px, 1.5fr) 80px 76px 110px 100px 40px' }}
                >
                  <div className="pl-3 py-3" />
                  <div className="px-3 py-3">Kategorie</div>
                  <div className="px-3 py-3 text-right">Menge</div>
                  <div className="px-3 py-3">Einheit</div>
                  <div className="px-3 py-3 text-right">Einzelpreis</div>
                  <div className="px-3 py-3 text-right">Gesamt</div>
                  <div className="pr-3 py-3" />
                </div>

                {/* Positionen */}
                {(draft?.line_items || []).map((item, index) => {
                  const Icon = CATEGORY_ICONS[item.category];
                  const isDragging = dragIndex === index;
                  const isDragOver = dragOverIndex === index && dragIndex !== index;
                  return (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={() => handleDrop(index)}
                      onDragEnd={handleDragEnd}
                      className={[
                        'border-b border-white/5 transition-colors',
                        isDragging ? 'opacity-40' : 'hover:bg-white/[0.02]',
                        isDragOver ? 'ring-1 ring-inset ring-[#F5A623]/40 bg-[#F5A623]/[0.03]' : '',
                      ].join(' ')}
                    >
                      {/* Haupt-Zeile: Kategorie · Menge · Einheit · Preis · Summe */}
                      <div
                        className="grid items-center pt-3 pb-1"
                        style={{ gridTemplateColumns: '36px minmax(160px, 1.5fr) 80px 76px 110px 100px 40px' }}
                      >
                        <div className="pl-3 flex items-center">
                          <GripVertical className="w-4 h-4 text-gray-600 cursor-grab active:cursor-grabbing" />
                        </div>
                        <div className="px-3">
                          <div className="flex items-center gap-1.5">
                            <Icon className="w-4 h-4 text-[#F5A623] shrink-0" />
                            <select
                              value={item.category}
                              onChange={(e) => handleItemChange(item.id, 'category', e.target.value)}
                              className="w-full bg-[#252525] border border-white/10 text-white text-xs rounded-lg px-2 py-1.5 outline-none focus:border-[#F5A623]"
                            >
                              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="px-3">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                            className="w-full bg-[#252525] border border-white/10 text-white text-xs rounded-lg px-2 py-1.5 outline-none focus:border-[#F5A623] text-right"
                            min={0}
                            step="0.01"
                          />
                        </div>
                        <div className="px-3">
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                            className="w-full bg-[#252525] border border-white/10 text-white text-xs rounded-lg px-2 py-1.5 outline-none focus:border-[#F5A623]"
                          />
                        </div>
                        <div className="px-3">
                          <input
                            type="number"
                            value={item.unit_price}
                            onChange={(e) => handleItemChange(item.id, 'unit_price', Number(e.target.value))}
                            className="w-full bg-[#252525] border border-white/10 text-white text-xs rounded-lg px-2 py-1.5 outline-none focus:border-[#F5A623] text-right"
                            min={0}
                            step="1"
                          />
                        </div>
                        <div className="px-3 text-right font-bold text-white whitespace-nowrap text-sm">
                          {formatCurrency(item.total_price)}
                        </div>
                        <div className="pr-3 flex items-center justify-center">
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
                            title="Position löschen"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Beschreibungs-Zeile — bündig mit dem Kategorie-Select (36px Drag + 12px Zell-Padding + 16px Icon + 6px Gap) */}
                      <div className="pb-3" style={{ paddingLeft: '70px', paddingRight: '52px' }}>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                          placeholder="Beschreibung (z. B. Hersteller, Modell, Details)…"
                          className="w-full bg-[#1E1E1E] border border-white/[0.07] text-gray-300 text-xs rounded-lg px-3 py-2 outline-none focus:border-[#F5A623] placeholder:text-gray-600"
                        />
                      </div>
                    </div>
                  );
                })}

                {(!draft?.line_items || draft.line_items.length === 0) && (
                  <div className="text-center py-12 text-gray-600">
                    <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Noch keine Positionen</p>
                    <button
                      onClick={handleAddItem}
                      className="mt-3 text-xs font-bold text-[#F5A623] hover:text-white transition-colors"
                    >
                      Erste Position hinzufügen
                    </button>
                  </div>
                )}
              </div>

              {/* Notizen */}
              <div className="bg-[#1A1A1A] rounded-xl border border-white/5 p-5">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
                  Interne Notizen
                </h2>
                <textarea
                  value={draft?.notes || ''}
                  onChange={async (e) => {
                    const value = e.target.value;
                    setDraft((prev) => prev ? { ...prev, notes: value } : prev);
                    if (draft) {
                      await updateOfferDraft(draft.id, { notes: value });
                    }
                  }}
                  rows={3}
                  className="w-full bg-[#252525] border border-white/10 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-[#F5A623] resize-none"
                  placeholder="Interne Hinweise zum Angebot..."
                />
              </div>
            </div>

            {/* Rechte Spalte: Zusammenfassung */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 bg-[#1A1A1A] rounded-xl border border-white/5 p-5 space-y-5">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                  Zusammenfassung
                </h2>

                {/* Beträge */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Zwischensumme</span>
                    <span className="font-bold text-white">{formatCurrency(calculated.subtotal)}</span>
                  </div>
                  {(draft?.discount_amount || 0) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">
                        Rabatt
                        {draft?.discount_percentage ? ` (${draft.discount_percentage}%)` : ''}
                        {draft?.discount_code ? ` · ${draft.discount_code}` : ''}
                      </span>
                      <span className="font-bold text-red-400">- {formatCurrency(calculated.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">MwSt ({draft?.vat_rate || 0}%)</span>
                    <span className="font-bold text-white">{formatCurrency(calculated.vat)}</span>
                  </div>
                  <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                    <span className="text-base font-bold text-white">Gesamtsumme</span>
                    <span className="text-2xl font-black text-[#F5A623]">{formatCurrency(calculated.total)}</span>
                  </div>
                </div>

                {/* ROI-Impact für den Kunden */}
                {roiImpact && (
                  <div className="pt-4 border-t border-white/5 space-y-3">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Impact für den Kunden</p>
                    <div className="grid grid-cols-2 gap-2">
                      {/* Amortisation */}
                      <div className={`rounded-lg px-3 py-2.5 ${roiImpact.amortization < 10 ? 'bg-green-500/10 border border-green-500/20' : roiImpact.amortization < 15 ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-0.5">Amortisation</p>
                        <p className={`text-base font-black ${roiImpact.amortization < 10 ? 'text-green-400' : roiImpact.amortization < 15 ? 'text-amber-400' : 'text-red-400'}`}>
                          ~{roiImpact.amortization} J.
                        </p>
                      </div>

                      {/* Jahresersparnis */}
                      <div className="rounded-lg px-3 py-2.5 bg-[#252525] border border-white/5">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-0.5">Ersparnis/Jahr</p>
                        <p className="text-base font-black text-green-400">{formatCurrency(roiImpact.annualSavings)}</p>
                      </div>

                      {/* 20-Jahre-Gewinn */}
                      <div className={`rounded-lg px-3 py-2.5 ${roiImpact.profit20 >= 0 ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-0.5">Gewinn 20 J.</p>
                        <p className={`text-base font-black ${roiImpact.profit20 >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {roiImpact.profit20 >= 0 ? '+' : ''}{formatCurrency(roiImpact.profit20)}
                        </p>
                      </div>

                      {/* Autarkie oder kWp */}
                      <div className="rounded-lg px-3 py-2.5 bg-[#252525] border border-white/5">
                        {roiImpact.autarky != null ? (
                          <>
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-0.5">Autarkie</p>
                            <p className="text-base font-black text-blue-400">{roiImpact.autarky}%</p>
                          </>
                        ) : (
                          <>
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 mb-0.5">Anlagenleistung</p>
                            <p className="text-base font-black text-blue-400">{roiImpact.kwp ?? '—'} kWp</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Rabatt-Code */}
                {draft?.status === 'draft' && discountCodes.length > 0 && (
                  <div className="space-y-2 pt-3 border-t border-white/5">
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                      <Tag className="w-3.5 h-3.5" />
                      Rabatt-Code
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={selectedCodeId}
                        onChange={(e) => setSelectedCodeId(e.target.value)}
                        className="flex-1 bg-[#252525] border border-white/10 text-white text-xs rounded-lg px-3 py-2 outline-none focus:border-[#F5A623]"
                      >
                        <option value="">Code wählen...</option>
                        {discountCodes.map((code) => (
                          <option key={code.id} value={code.id}>
                            {code.code} ({code.percentage}%)
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleApplyDiscountCode}
                        disabled={!selectedCodeId || saving}
                        className="bg-[#F5A623] hover:bg-[#E09000] disabled:opacity-50 text-[#1A3A5C] font-bold text-xs px-3 py-2 rounded-lg transition-colors"
                      >
                        Anwenden
                      </button>
                    </div>
                  </div>
                )}

                {/* Manueller Rabatt */}
                {draft?.status === 'draft' && (
                  <div className="space-y-2 pt-3 border-t border-white/5">
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                      <Percent className="w-3.5 h-3.5" />
                      Manueller Rabatt
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={manualDiscountPct}
                        onChange={(e) => {
                          setManualDiscountPct(e.target.value);
                          if (e.target.value) setManualDiscountAmount('');
                        }}
                        placeholder="%"
                        className="w-20 bg-[#252525] border border-white/10 text-white text-xs rounded-lg px-3 py-2 outline-none focus:border-[#F5A623]"
                      />
                      <input
                        type="number"
                        value={manualDiscountAmount}
                        onChange={(e) => {
                          setManualDiscountAmount(e.target.value);
                          if (e.target.value) setManualDiscountPct('');
                        }}
                        placeholder="€"
                        className="flex-1 bg-[#252525] border border-white/10 text-white text-xs rounded-lg px-3 py-2 outline-none focus:border-[#F5A623]"
                      />
                      <button
                        onClick={handleApplyManualDiscount}
                        disabled={(!manualDiscountPct && !manualDiscountAmount) || saving}
                        className="bg-[#252525] border border-white/10 hover:bg-[#333] disabled:opacity-50 text-white font-bold text-xs px-3 py-2 rounded-lg transition-colors"
                      >
                        OK
                      </button>
                    </div>
                    {(draft.discount_amount || 0) > 0 && (
                      <button
                        onClick={handleRemoveDiscount}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors"
                      >
                        Rabatt entfernen
                      </button>
                    )}
                  </div>
                )}

                {/* Aktionen */}
                <div className="pt-4 border-t border-white/5 space-y-2">
                  <PDFDownloadLink
                    document={
                      <OfferPdfDocument
                        lead={lead}
                        company={loadCompanySettings()}
                        offerNumber={draft?.offer_number || undefined}
                        offerDraft={draft || undefined}
                        textTemplate={offerTextTemplate}
                      />
                    }
                    fileName={`Angebot-${draft?.offer_number || lead.id.slice(0, 8).toUpperCase()}.pdf`}
                    className="flex items-center justify-center gap-2 w-full bg-[#252525] border border-white/10 hover:bg-[#333] text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    {({ loading: pdfLoading }) => (
                      <>
                        {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                        {pdfLoading ? 'PDF wird erstellt…' : 'Angebot als PDF'}
                      </>
                    )}
                  </PDFDownloadLink>

                  {draft?.status === 'draft' && (
                    <button
                      onClick={() => {
                        const company = loadCompanySettings();
                        const vars: Record<string, string> = {
                          vorname: lead?.first_name ?? '',
                          nachname: lead?.last_name ?? '',
                          angebotsnummer: draft?.offer_number ?? '',
                          firmenname: company.firmenname,
                          datum: new Date().toLocaleDateString('de-DE'),
                          gueltig_bis: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('de-DE'),
                          zahlungsziel: company.zahlungsziel || '14',
                        };
                        setSendSubject(interpolateTemplate(emailTemplate.betreff, vars));
                        setSendMessage(interpolateTemplate(emailTemplate.nachricht, vars));
                        setShowSendModal(true);
                      }}
                      className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      Angebot senden
                    </button>
                  )}
                </div>

                {/* Meta */}
                <div className="text-[10px] text-gray-600 space-y-1">
                  <p>Angebotsnr.: {draft?.offer_number || '—'}</p>
                  <p>Zuletzt gespeichert: {formatDate(draft?.updated_at)}</p>
                  {draft?.sent_at && <p>Versendet: {formatDate(draft.sent_at)}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Send-Modal */}
        {showSendModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#1A1A1A] rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-white/10 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Send className="w-4 h-4 text-blue-400" />
                </div>
                <h2 className="text-base font-bold text-white">Angebot versenden</h2>
              </div>

              {sendSuccess ? (
                <div className="flex items-center gap-3 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="font-bold text-sm">Angebot erfolgreich versendet!</p>
                    <p className="text-xs text-emerald-300/70">E-Mail wurde an {sendEmail} gesendet.</p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-400 mb-4">
                    Das Angebot wird als PDF generiert und per E-Mail an den Kunden gesendet.
                  </p>

                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">E-Mail-Adresse</label>
                  <input
                    type="email"
                    value={sendEmail}
                    onChange={(e) => setSendEmail(e.target.value)}
                    className="w-full bg-[#0F0F0F] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 mb-3 placeholder:text-gray-600"
                  />

                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Betreff</label>
                  <input
                    type="text"
                    value={sendSubject}
                    onChange={(e) => setSendSubject(e.target.value)}
                    className="w-full bg-[#0F0F0F] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 mb-3 placeholder:text-gray-600"
                    placeholder="Ihr persönliches Solar-Angebot"
                  />

                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Nachricht</label>
                  <textarea
                    value={sendMessage}
                    onChange={(e) => setSendMessage(e.target.value)}
                    rows={4}
                    className="w-full bg-[#0F0F0F] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 mb-3 placeholder:text-gray-600 resize-none"
                  />

                  {sendError && (
                    <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-3">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      {sendError}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => { setShowSendModal(false); setSendError(null); }}
                      className="flex-1 border border-white/10 text-gray-400 font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      Abbrechen
                    </button>
                    <button
                      onClick={handleSendOffer}
                      disabled={!sendEmail.trim() || sending}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      {sending ? 'Wird gesendet…' : 'Jetzt senden'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
