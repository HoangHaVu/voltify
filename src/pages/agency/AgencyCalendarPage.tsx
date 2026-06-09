// PROJECT: Voltify | PURPOSE: Agentur-Kalender (Beratung + Partner-Meetings)
import { useState, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, Filter, Sun, X, Clock, MapPin,
  FileText, Calendar, Plus, Loader2, RotateCcw, Trash2, User2, Handshake,
} from 'lucide-react';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { CalendarGrid } from '../../components/calendar/CalendarGrid';
import { useAppointments } from '../../hooks/useAppointments';
import { useAuth } from '../../contexts/AuthContext';
import { fetchAgencyLeads, fetchPartners, type Partner } from '../../services/agency';
import { resolveAgencyId } from '../../services/auth';
import type { Appointment } from '../../services/data';
import type { Lead } from '../../services/data';

const MONTH_NAMES = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const WEEKDAY_NAMES = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

type AgencyType = 'beratung' | 'partnermeeting';

const TYPE_CONFIG: Record<AgencyType, { label: string; bg: string; border: string; text: string; dot: string }> = {
  beratung:       { label: 'Beratung mit Lead',  bg: 'bg-blue-500/10',   border: 'border-blue-500/20',   text: 'text-blue-400',   dot: 'bg-blue-400' },
  partnermeeting: { label: 'Partner-Meeting',     bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', dot: 'bg-purple-400' },
};

const AGENCY_TYPES: AgencyType[] = ['beratung', 'partnermeeting'];

function formatFullDate(iso: string): string {
  const d = new Date(iso);
  return `${WEEKDAY_NAMES[d.getDay()]}, ${d.getDate()}. ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(start: string, end: string): string {
  const diffMin = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
  if (diffMin < 60) return `${diffMin} Min.`;
  const h = Math.floor(diffMin / 60);
  const m = diffMin % 60;
  return m === 0 ? `${h} Std.` : `${h} Std. ${m} Min.`;
}

const EMPTY_CREATE = {
  title: '',
  type: 'beratung' as AgencyType,
  date: '',
  startTime: '09:00',
  endTime: '10:00',
  location: '',
  notes: '',
  contactMode: 'lead' as 'lead' | 'partner' | 'manual' | 'internal',
  leadId: '',
  partnerId: '',
  customerName: '',
  customerPhone: '',
  customerEmail: '',
};

export default function AgencyCalendarPage() {
  const { user } = useAuth();
  const { appointments, isLoading, create, update, remove } = useAppointments();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    if (!user) return;
    const agencyId = resolveAgencyId(user);
    fetchAgencyLeads(agencyId).then(setLeads).catch(() => {});
    // Partner nur für Agency-Admin sichtbar, Vertriebler sehen keine Partnerverwaltung
    if (user.role === 'sales_agency') {
      fetchPartners(agencyId).then(setPartners).catch(() => {});
    }
  }, [user?.id, user?.role]);

  // Nur Agentur-relevante Termintypen anzeigen
  const agencyAppointments = appointments.filter(
    a => a.type === 'beratung' || a.type === 'partnermeeting',
  );

  const [selected, setSelected] = useState<Appointment | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'reschedule' | 'confirmCancel'>('view');
  const [showCreate, setShowCreate] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [rescheduleForm, setRescheduleForm] = useState({ date: '', startTime: '', endTime: '', notes: '' });
  const [createForm, setCreateForm] = useState(EMPTY_CREATE);

  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const goToday = () => { const d = new Date(); setCurrentDate(new Date(d.getFullYear(), d.getMonth(), 1)); };
  const title = `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  function closeDetail() { setSelected(null); setModalMode('view'); }

  function openReschedule() {
    if (!selected) return;
    const d = new Date(selected.starts_at);
    const e = new Date(selected.ends_at);
    setRescheduleForm({
      date: d.toISOString().slice(0, 10),
      startTime: d.toTimeString().slice(0, 5),
      endTime: e.toTimeString().slice(0, 5),
      notes: selected.notes ?? '',
    });
    setModalMode('reschedule');
  }

  async function handleReschedule(ev: React.FormEvent) {
    ev.preventDefault();
    if (!selected) return;
    setIsSaving(true);
    await update(selected.id, {
      starts_at: `${rescheduleForm.date}T${rescheduleForm.startTime}:00`,
      ends_at: `${rescheduleForm.date}T${rescheduleForm.endTime}:00`,
      notes: rescheduleForm.notes || null,
    });
    setIsSaving(false);
    closeDetail();
  }

  async function handleCancel() {
    if (!selected) return;
    setIsSaving(true);
    await remove(selected.id);
    setIsSaving(false);
    closeDetail();
  }

  function resolveContactForCreate() {
    if (createForm.contactMode === 'lead') {
      const lead = leads.find(l => l.id === createForm.leadId);
      return {
        lead_id: createForm.leadId || null,
        customer_name: lead ? `${lead.first_name} ${lead.last_name}` : null,
        customer_phone: lead?.phone ?? null,
        customer_email: lead?.email ?? null,
      };
    }
    if (createForm.contactMode === 'partner') {
      const partner = partners.find(p => p.id === createForm.partnerId);
      return {
        lead_id: null,
        customer_name: partner?.company_name ?? null,
        customer_phone: partner?.phone ?? null,
        customer_email: partner?.email ?? null,
      };
    }
    if (createForm.contactMode === 'manual') {
      return {
        lead_id: null,
        customer_name: createForm.customerName || null,
        customer_phone: createForm.customerPhone || null,
        customer_email: createForm.customerEmail || null,
      };
    }
    return { lead_id: null, customer_name: null, customer_phone: null, customer_email: null };
  }

  async function handleCreate(ev: React.FormEvent) {
    ev.preventDefault();
    setIsSaving(true);
    const contact = resolveContactForCreate();
    await create({
      title: createForm.title,
      type: createForm.type,
      starts_at: `${createForm.date}T${createForm.startTime}:00`,
      ends_at: `${createForm.date}T${createForm.endTime}:00`,
      location: createForm.location || null,
      notes: createForm.notes || null,
      ...contact,
    });
    setIsSaving(false);
    setShowCreate(false);
    setCreateForm(EMPTY_CREATE);
  }

  // Wenn Typ sich ändert: Kontaktmodus anpassen
  function handleTypeChange(type: AgencyType) {
    const defaultMode = type === 'partnermeeting' ? 'partner' : 'lead';
    setCreateForm(f => ({ ...f, type, contactMode: defaultMode, leadId: '', partnerId: '' }));
  }

  const inputCls = 'w-full bg-[#0F0F0F] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623]';

  const selectedType = selected
    ? (AGENCY_TYPES.includes(selected.type as AgencyType)
        ? TYPE_CONFIG[selected.type as AgencyType]
        : TYPE_CONFIG.beratung)
    : null;

  return (
    <div className="min-h-screen flex bg-[#0F0F0F] text-white">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto px-6 py-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-6">
              <h1 className="text-xl md:text-3xl font-black text-white">{title}</h1>
              <div className="flex items-center bg-[#1A1A1A] rounded-xl border border-white/5 p-1">
                <button onClick={prevMonth} className="p-1.5 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={nextMonth} className="p-1.5 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={goToday} className="px-5 py-2 bg-[#1A1A1A] border border-white/5 rounded-xl text-sm font-bold text-white hover:bg-white/5 transition-colors">
                Heute
              </button>
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-5 py-2 bg-[#F5A623] text-[#1A3A5C] rounded-xl text-sm font-bold hover:bg-[#E09000] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Neuer Termin
              </button>
            </div>
          </div>

          {/* Legende */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest mr-2">
              <Filter className="w-3 h-3" />Legende:
            </div>
            {AGENCY_TYPES.map(t => (
              <div key={t} className={`flex items-center gap-2 px-4 py-1.5 rounded-full ${TYPE_CONFIG[t].bg} border ${TYPE_CONFIG[t].border} ${TYPE_CONFIG[t].text} text-xs font-bold`}>
                <span className={`w-2 h-2 rounded-full ${TYPE_CONFIG[t].dot}`} />
                {TYPE_CONFIG[t].label}
              </div>
            ))}
          </div>

          {/* Kalender-Grid */}
          {isLoading ? (
            <div className="flex justify-center py-24">
              <Sun className="w-10 h-10 text-[#F5A623] animate-spin" />
            </div>
          ) : (
            <CalendarGrid
              appointments={agencyAppointments}
              currentDate={currentDate}
              onSelect={a => { setSelected(a); setModalMode('view'); }}
            />
          )}
        </div>

        {/* ─── Detail Modal ─── */}
        {selected && selectedType && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={closeDetail}>
            <div className="bg-[#1A1A1A] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-white/10" onClick={e => e.stopPropagation()}>

              <div className={`${selectedType.bg} ${selectedType.border} border-b px-6 py-5 flex items-start justify-between gap-4`}>
                <div className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full shrink-0 mt-0.5 ${selectedType.dot}`} />
                  <div>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${selectedType.text}`}>{selectedType.label}</p>
                    <h2 className="text-lg font-black text-white leading-tight">{selected.title}</h2>
                  </div>
                </div>
                <button onClick={closeDetail} className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {modalMode === 'view' && (
                <>
                  <div className="px-6 py-5 space-y-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                      <p className="text-sm font-semibold text-white">{formatFullDate(selected.starts_at)}</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-white">{formatTime(selected.starts_at)} – {formatTime(selected.ends_at)} Uhr</p>
                        <p className="text-xs text-gray-500 mt-0.5">{formatDuration(selected.starts_at, selected.ends_at)}</p>
                      </div>
                    </div>
                    {selected.location && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-white">{selected.location}</p>
                      </div>
                    )}
                    {selected.notes && (
                      <div className="flex items-start gap-3">
                        <FileText className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-400 leading-relaxed">{selected.notes}</p>
                      </div>
                    )}
                    <div className="flex items-start gap-3 pt-3 border-t border-white/5">
                      {selected.type === 'partnermeeting'
                        ? <Handshake className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                        : <User2 className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                      }
                      {selected.customer_name ? (
                        <div>
                          <p className="text-sm font-semibold text-white">{selected.customer_name}</p>
                          {(selected.customer_phone || selected.customer_email) && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {[selected.customer_phone, selected.customer_email].filter(Boolean).join(' · ')}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 italic mt-0.5">Interner Termin — keine Person zugeordnet</p>
                      )}
                    </div>
                  </div>

                  <div className="px-6 pb-5 flex gap-2">
                    <button onClick={openReschedule}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 text-sm font-bold text-gray-400 hover:bg-white/5 transition-colors">
                      <RotateCcw className="w-4 h-4" />Verschieben
                    </button>
                    <button onClick={() => setModalMode('confirmCancel')}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-500/20 text-sm font-bold text-red-400 hover:bg-red-500/10 transition-colors">
                      <Trash2 className="w-4 h-4" />Absagen
                    </button>
                  </div>
                </>
              )}

              {modalMode === 'reschedule' && (
                <form onSubmit={handleReschedule}>
                  <div className="px-6 py-5 space-y-4">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Neuer Termin-Zeitpunkt</p>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-400">Datum *</label>
                      <input required type="date" value={rescheduleForm.date}
                        onChange={e => setRescheduleForm(f => ({ ...f, date: e.target.value }))}
                        className={inputCls} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-400">Von *</label>
                        <input required type="time" value={rescheduleForm.startTime}
                          onChange={e => setRescheduleForm(f => ({ ...f, startTime: e.target.value }))}
                          className={inputCls} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-400">Bis *</label>
                        <input required type="time" value={rescheduleForm.endTime}
                          onChange={e => setRescheduleForm(f => ({ ...f, endTime: e.target.value }))}
                          className={inputCls} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-400">Hinweis</label>
                      <textarea rows={2} value={rescheduleForm.notes}
                        onChange={e => setRescheduleForm(f => ({ ...f, notes: e.target.value }))}
                        placeholder="z.B. Kunde hat Termin abgesagt"
                        className={`${inputCls} resize-none`} />
                    </div>
                  </div>
                  <div className="px-6 pb-5 flex gap-2">
                    <button type="submit" disabled={isSaving}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#F5A623] text-[#1A3A5C] text-sm font-bold hover:bg-[#E09000] disabled:opacity-60 transition-colors">
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                      {isSaving ? 'Wird gespeichert…' : 'Termin verschieben'}
                    </button>
                    <button type="button" onClick={() => setModalMode('view')}
                      className="py-2.5 px-4 rounded-xl border border-white/10 text-sm font-bold text-gray-500 hover:bg-white/5 transition-colors">
                      Zurück
                    </button>
                  </div>
                </form>
              )}

              {modalMode === 'confirmCancel' && (
                <>
                  <div className="px-6 py-5">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-4 space-y-1">
                      <p className="text-sm font-bold text-red-400">Termin wirklich absagen?</p>
                      <p className="text-sm text-red-400/80">
                        „{selected.title}" am {formatFullDate(selected.starts_at)} wird gelöscht.
                      </p>
                    </div>
                  </div>
                  <div className="px-6 pb-5 flex gap-2">
                    <button onClick={handleCancel} disabled={isSaving}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 disabled:opacity-60 transition-colors">
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      {isSaving ? 'Wird abgesagt…' : 'Ja, absagen'}
                    </button>
                    <button onClick={() => setModalMode('view')}
                      className="py-2.5 px-4 rounded-xl border border-white/10 text-sm font-bold text-gray-500 hover:bg-white/5 transition-colors">
                      Zurück
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ─── Neuen Termin anlegen ─── */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => { setShowCreate(false); setCreateForm(EMPTY_CREATE); }}>
            <form className="bg-[#1A1A1A] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-white/10"
              onClick={e => e.stopPropagation()} onSubmit={handleCreate}>

              <div className="border-b border-white/5 px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F5A623]/10 flex items-center justify-center">
                    <Plus className="w-4 h-4 text-[#F5A623]" />
                  </div>
                  <h2 className="text-lg font-black text-white">Neuer Termin</h2>
                </div>
                <button type="button" onClick={() => { setShowCreate(false); setCreateForm(EMPTY_CREATE); }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-6 py-5 space-y-4 max-h-[62vh] overflow-y-auto">

                {/* Typ-Auswahl */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400">Typ *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {AGENCY_TYPES.map(t => (
                      <button key={t} type="button"
                        onClick={() => handleTypeChange(t)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition-colors ${
                          createForm.type === t
                            ? `${TYPE_CONFIG[t].bg} ${TYPE_CONFIG[t].border} ${TYPE_CONFIG[t].text}`
                            : 'bg-[#0F0F0F] border-white/10 text-gray-500 hover:border-white/20'
                        }`}>
                        <span className={`w-2 h-2 rounded-full shrink-0 ${createForm.type === t ? TYPE_CONFIG[t].dot : 'bg-gray-600'}`} />
                        {TYPE_CONFIG[t].label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Titel */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400">Titel *</label>
                  <input required type="text" value={createForm.title}
                    onChange={e => setCreateForm(f => ({ ...f, title: e.target.value }))}
                    placeholder={createForm.type === 'partnermeeting' ? 'z.B. Abstimmung Solar GmbH' : 'z.B. Erstgespräch Familie Müller'}
                    className={inputCls} />
                </div>

                {/* Datum + Zeit */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400">Datum *</label>
                  <input required type="date" value={createForm.date}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={e => setCreateForm(f => ({ ...f, date: e.target.value }))}
                    className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-400">Von *</label>
                    <input required type="time" value={createForm.startTime}
                      onChange={e => setCreateForm(f => ({ ...f, startTime: e.target.value }))}
                      className={inputCls} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-400">Bis *</label>
                    <input required type="time" value={createForm.endTime}
                      onChange={e => setCreateForm(f => ({ ...f, endTime: e.target.value }))}
                      className={inputCls} />
                  </div>
                </div>

                {/* Ort + Notizen */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400">Ort</label>
                  <input type="text" value={createForm.location}
                    onChange={e => setCreateForm(f => ({ ...f, location: e.target.value }))}
                    placeholder="z.B. Zoom-Call / Adresse"
                    className={inputCls} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400">Notizen</label>
                  <textarea rows={2} value={createForm.notes}
                    onChange={e => setCreateForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Interne Hinweise…"
                    className={`${inputCls} resize-none`} />
                </div>

                {/* Kontaktzuordnung — variiert je nach Typ */}
                <div className="space-y-3 pt-1">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    {createForm.type === 'partnermeeting' ? 'Partner-Zuordnung' : 'Kundenzuordnung'}
                  </p>

                  {/* Kontaktmodus-Tabs */}
                  <div className="flex gap-2">
                    {createForm.type === 'beratung' && (
                      <>
                        {(['lead', 'manual', 'internal'] as const).map(mode => {
                          const labels = { lead: 'Aus Leads', manual: 'Manuell', internal: 'Intern' };
                          return (
                            <button key={mode} type="button"
                              onClick={() => setCreateForm(f => ({ ...f, contactMode: mode }))}
                              className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${
                                createForm.contactMode === mode
                                  ? 'bg-[#F5A623] text-[#1A3A5C] border-[#F5A623]'
                                  : 'bg-[#0F0F0F] text-gray-500 border-white/10 hover:border-white/20'
                              }`}>
                              {labels[mode]}
                            </button>
                          );
                        })}
                      </>
                    )}
                    {createForm.type === 'partnermeeting' && (
                      <>
                        {(['partner', 'manual', 'internal'] as const).map(mode => {
                          const labels = { partner: 'Aus Partnern', manual: 'Manuell', internal: 'Intern' };
                          return (
                            <button key={mode} type="button"
                              onClick={() => setCreateForm(f => ({ ...f, contactMode: mode }))}
                              className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${
                                createForm.contactMode === mode
                                  ? 'bg-[#F5A623] text-[#1A3A5C] border-[#F5A623]'
                                  : 'bg-[#0F0F0F] text-gray-500 border-white/10 hover:border-white/20'
                              }`}>
                              {labels[mode]}
                            </button>
                          );
                        })}
                      </>
                    )}
                  </div>

                  {/* Lead-Picker */}
                  {createForm.contactMode === 'lead' && (
                    <select value={createForm.leadId}
                      onChange={e => setCreateForm(f => ({ ...f, leadId: e.target.value }))}
                      className={inputCls}>
                      <option value="">— Lead auswählen —</option>
                      {leads.map(l => (
                        <option key={l.id} value={l.id}>
                          {l.first_name} {l.last_name}{l.zip ? ` · PLZ ${l.zip}` : ''}{l.phone ? ` · ${l.phone}` : ''}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Partner-Picker */}
                  {createForm.contactMode === 'partner' && (
                    <select value={createForm.partnerId}
                      onChange={e => setCreateForm(f => ({ ...f, partnerId: e.target.value }))}
                      className={inputCls}>
                      <option value="">— Partner auswählen —</option>
                      {partners.filter(p => p.is_active).map(p => (
                        <option key={p.id} value={p.id}>
                          {p.company_name}{p.contact_name ? ` · ${p.contact_name}` : ''}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Manuelle Eingabe */}
                  {createForm.contactMode === 'manual' && (
                    <div className="space-y-3">
                      <input type="text" value={createForm.customerName}
                        onChange={e => setCreateForm(f => ({ ...f, customerName: e.target.value }))}
                        placeholder="Name / Firma"
                        className={inputCls} />
                      <div className="grid grid-cols-2 gap-3">
                        <input type="tel" value={createForm.customerPhone}
                          onChange={e => setCreateForm(f => ({ ...f, customerPhone: e.target.value }))}
                          placeholder="Telefon"
                          className={inputCls} />
                        <input type="email" value={createForm.customerEmail}
                          onChange={e => setCreateForm(f => ({ ...f, customerEmail: e.target.value }))}
                          placeholder="E-Mail"
                          className={inputCls} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 pb-5 flex gap-2">
                <button type="submit" disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#F5A623] text-[#1A3A5C] text-sm font-bold hover:bg-[#E09000] disabled:opacity-60 transition-colors">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {isSaving ? 'Wird angelegt…' : 'Termin anlegen'}
                </button>
                <button type="button" onClick={() => { setShowCreate(false); setCreateForm(EMPTY_CREATE); }}
                  className="py-2.5 px-4 rounded-xl border border-white/10 text-sm font-bold text-gray-500 hover:bg-white/5 transition-colors">
                  Abbrechen
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
