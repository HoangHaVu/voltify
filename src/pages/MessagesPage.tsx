import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send, MessageSquare, Loader2, RefreshCw, User, ArrowLeft, Phone, Mail, MapPin, Building2, Calendar, ChevronDown,
} from 'lucide-react';
import { AdminSidebar } from '../components/layout/AdminSidebar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
// Lead type not needed directly — using inline interface

interface Note {
  id: string;
  content: string;
  created_at: string;
  installer_id: string;
  lead_id: string | null;
  project_id: string | null;
  installer_name?: string;
}

interface LeadSummary {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  status: string;
  created_at: string;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [leads, setLeads] = useState<LeadSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');
  const [leadFilter, setLeadFilter] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [showLeadPicker, setShowLeadPicker] = useState(false);
  const [showLeadDetail, setShowLeadDetail] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const selectedLead = leads.find(l => l.id === selectedLeadId) ?? null;

  const filteredNotes = selectedLeadId
    ? notes.filter(n => n.lead_id === selectedLeadId)
    : notes;

  const isOwner = user?.role === 'owner';

  useEffect(() => {
    if (!user?.id) return;
    loadData();

    const channel = supabase
      .channel('notes_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes', filter: isOwner ? undefined : `installer_id=eq.${user.id}` }, () => {
        loadData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id, user?.role]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredNotes]);

  useEffect(() => {
    if (!showLeadPicker) return;
    function onMouseDown(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowLeadPicker(false);
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [showLeadPicker]);

  async function loadData() {
    if (!user?.id) return;
    setIsLoading(true);
    setError(null);

    try {
      // Leads laden: Owner = alle Leads seiner Firma, Installer = nur eigene
      let leadsQuery = supabase
        .from('leads')
        .select('id, first_name, last_name, email, phone, address, city, postal_code, status, created_at');

      if (!isOwner) {
        leadsQuery = leadsQuery.eq('installer_id', user.id);
      } else {
        // Owner: alle Leads von sich + Mitarbeitern
        const { data: employees, error: empErr } = await supabase
          .from('profiles')
          .select('id')
          .eq('owner_id', user.id);
        if (empErr) throw empErr;
        const ids = [user.id, ...(employees ?? []).map(e => e.id)];
        leadsQuery = leadsQuery.in('installer_id', ids);
      }

      const { data: leadsData, error: leadsErr } = await leadsQuery.order('created_at', { ascending: false });

      // Notizen laden: Owner = alle, Installer = nur eigene
      let notesQuery = supabase
        .from('notes')
        .select('id, content, created_at, installer_id, lead_id, project_id');

      if (!isOwner) {
        notesQuery = notesQuery.eq('installer_id', user.id);
      } else {
        const { data: employees } = await supabase
          .from('profiles')
          .select('id')
          .eq('owner_id', user.id);
        const ids = [user.id, ...(employees ?? []).map(e => e.id)];
        notesQuery = notesQuery.in('installer_id', ids);
      }

      const { data: notesData, error: notesErr } = await notesQuery.order('created_at', { ascending: true });

      if (notesErr) throw notesErr;
      if (leadsErr) throw leadsErr;

      // Installer-Namen laden
      const installerIds = [...new Set((notesData ?? []).map(n => n.installer_id).filter(Boolean))];
      let installerMap: Record<string, string> = {};
      if (installerIds.length > 0) {
        const { data: profs } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', installerIds);
        installerMap = Object.fromEntries((profs ?? []).map(p => [p.id, p.full_name ?? 'Unbekannt']));
      }

      setNotes((notesData ?? []).map(n => ({ ...n, installer_name: installerMap[n.installer_id] ?? 'Unbekannt' })));
      setLeads(leadsData ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSendNote(ev: React.FormEvent) {
    ev.preventDefault();
    if (!user?.id || !newNote.trim()) return;
    setIsSending(true);

    try {
      const { error: insertErr } = await supabase.from('notes').insert({
        content: newNote.trim(),
        installer_id: user.id,
        created_by: user.id,
        lead_id: selectedLeadId,
        project_id: null,
      });

      if (insertErr) throw insertErr;
      setNewNote('');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Senden');
    } finally {
      setIsSending(false);
    }
  }

  const filteredLeads = leads.filter(l => {
    const s = leadFilter.toLowerCase();
    return `${l.first_name} ${l.last_name}`.toLowerCase().includes(s)
      || (l.email?.toLowerCase() ?? '').includes(s)
      || (l.phone ?? '').includes(s)
      || (l.city ?? '').toLowerCase().includes(s);
  });

  const statusLabel: Record<string, string> = {
    neu: 'Neu', kontaktiert: 'Kontaktiert', angebot: 'Angebot versendet',
    abschluss: 'Abschluss', gewonnen: 'Gewonnen', verloren: 'Verloren', abgeschlossen: 'Abgeschlossen',
  };
  const statusColor: Record<string, string> = {
    neu: 'bg-green-500', kontaktiert: 'bg-blue-500', angebot: 'bg-indigo-500',
    abschluss: 'bg-amber-500', gewonnen: 'bg-emerald-500', verloren: 'bg-red-500', abgeschlossen: 'bg-gray-500',
  };

  function formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  function formatTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="min-h-screen flex bg-[#0F0F0F] text-white">
      <AdminSidebar />
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-white/5 bg-[#0F0F0F] px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F5A623]/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-[#F5A623]" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">Nachrichten</h1>
              <p className="text-xs text-gray-500">
                {selectedLead
                  ? `${selectedLead.first_name} ${selectedLead.last_name}`
                  : `${notes.length} Notiz${notes.length !== 1 ? 'en' : ''} gesamt`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedLead && (
              <button
                onClick={() => setShowLeadDetail(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] border border-white/5 rounded-xl text-sm font-bold text-gray-400 hover:bg-white/5 transition-colors"
              >
                <User className="w-4 h-4" />
                Kundendetails
              </button>
            )}
            <button onClick={loadData} className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#1A1A1A] border border-white/5 text-gray-500 hover:text-white hover:bg-white/5 transition-colors">
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filter-Bar */}
        <div className="border-b border-white/5 px-6 py-3 flex items-center gap-3 shrink-0">
          {selectedLead ? (
            <button
              onClick={() => { setSelectedLeadId(null); setShowLeadDetail(false); }}
              className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] border border-white/5 rounded-xl text-sm font-bold text-gray-400 hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Alle Notizen
            </button>
          ) : null}

          <div className="relative" ref={pickerRef}>
            <button
              onClick={() => setShowLeadPicker(!showLeadPicker)}
              className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] border border-white/5 rounded-xl text-sm font-bold text-gray-400 hover:bg-white/5 transition-colors"
            >
              {selectedLead ? `${selectedLead.first_name} ${selectedLead.last_name}` : 'Nach Lead filtern'}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showLeadPicker && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-[#1A1A1A] rounded-xl border border-white/10 shadow-2xl z-50 overflow-hidden">
                <div className="p-3 border-b border-white/5">
                  <input
                    type="text"
                    value={leadFilter}
                    onChange={e => setLeadFilter(e.target.value)}
                    placeholder="Kunde suchen…"
                    className="w-full bg-[#0F0F0F] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623]"
                    autoFocus
                  />
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <button
                    onClick={() => { setSelectedLeadId(null); setShowLeadPicker(false); }}
                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-white/5 transition-colors ${selectedLeadId === null ? 'bg-[#F5A623]/10 text-[#F5A623]' : 'text-gray-400'}`}
                  >
                    Alle Notizen
                  </button>
                  {filteredLeads.map(l => (
                    <button
                      key={l.id}
                      onClick={() => { setSelectedLeadId(l.id); setShowLeadPicker(false); }}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-white/5 transition-colors ${selectedLeadId === l.id ? 'bg-[#F5A623]/10 text-[#F5A623]' : 'text-gray-400'}`}
                    >
                      <span className="font-semibold text-white">{l.first_name} {l.last_name}</span>
                      <span className="text-xs text-gray-600 ml-2">{l.city}{l.postal_code ? ` · ${l.postal_code}` : ''}</span>
                    </button>
                  ))}
                  {filteredLeads.length === 0 && (
                    <p className="px-4 py-3 text-xs text-gray-600 text-center">Keine Leads gefunden</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 text-[#F5A623] animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400 text-center">
              {error}
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-16">
              <MessageSquare className="w-12 h-12 text-gray-700 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-500 mb-1">
                {selectedLead ? 'Keine Notizen für diesen Lead' : 'Noch keine Notizen'}
              </p>
              <p className="text-xs text-gray-600">
                {selectedLead ? 'Schreibe die erste Notiz unten.' : 'Notizen erscheinen hier, sobald sie erstellt werden.'}
              </p>
            </div>
          ) : (
            filteredNotes.map(note => (
              <div key={note.id} className="flex gap-3">
                <div className="shrink-0 w-8 h-8 rounded-full bg-[#F5A623]/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-[#F5A623]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-xs font-bold text-white">{note.installer_name ?? 'Unbekannt'}</span>
                    <span className="text-[10px] text-gray-600">
                      {formatDate(note.created_at)} · {formatTime(note.created_at)}
                    </span>
                  </div>
                  <div className="bg-[#1A1A1A] border border-white/5 rounded-xl px-4 py-3">
                    <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-white/5 bg-[#0F0F0F] px-6 py-4 shrink-0">
          <form onSubmit={handleSendNote} className="flex gap-3">
            <input
              type="text"
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
              placeholder={selectedLead ? `Notiz zu ${selectedLead.first_name} ${selectedLead.last_name}…` : 'Neue Notiz schreiben…'}
              className="flex-1 bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 focus:border-[#F5A623]"
            />
            <button
              type="submit"
              disabled={isSending || !newNote.trim()}
              className="shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-[#F5A623] text-[#1A3A5C] hover:bg-[#E09000] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
        </div>
      </main>

      {/* ─── Lead Detail Modal ─── */}
      {showLeadDetail && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowLeadDetail(false)}>
          <div className="bg-[#1A1A1A] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-white/10"
            onClick={e => e.stopPropagation()}>
            <div className="border-b border-white/5 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F5A623]/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-[#F5A623]" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">{selectedLead.first_name} {selectedLead.last_name}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`w-2 h-2 rounded-full ${statusColor[selectedLead.status] ?? 'bg-gray-500'}`} />
                    <span className="text-xs font-bold text-gray-500">{statusLabel[selectedLead.status] ?? selectedLead.status}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowLeadDetail(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-gray-500 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {selectedLead.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-500 shrink-0" />
                  <span className="text-sm text-gray-300">{selectedLead.email}</span>
                </div>
              )}
              {selectedLead.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-500 shrink-0" />
                  <span className="text-sm text-gray-300">{selectedLead.phone}</span>
                </div>
              )}
              {(selectedLead.address || selectedLead.city || selectedLead.postal_code) && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-300">
                    {[selectedLead.address, [selectedLead.postal_code, selectedLead.city].filter(Boolean).join(' ')].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-500 shrink-0" />
                <span className="text-sm text-gray-500">Eingegangen: {formatDate(selectedLead.created_at)}</span>
              </div>
            </div>
            <div className="px-6 pb-5">
              <button
                onClick={() => { setShowLeadDetail(false); navigate(`/lead/${selectedLead.id}`); }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#F5A623] text-[#1A3A5C] text-sm font-bold hover:bg-[#E09000] transition-colors"
              >
                <Building2 className="w-4 h-4" />
                Lead öffnen
              </button>
            </div>
          </div>
        </div>
      )}
  </div>
);
}
