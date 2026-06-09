import { useState, useEffect, useMemo } from 'react';
import {
  Send, MapPin, Search, Zap, Star, CheckCircle, XCircle, Clock,
  Users, ChevronRight, Inbox, Handshake, RotateCcw,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import {
  fetchPartners, fetchLeadAssignments, fetchAgencyLeads, assignLeadToPartner,
  type Partner, type LeadAssignment,
} from '../../services/agency';
import type { Lead } from '../../services/data';

// Längster passender PLZ-Präfix → höherer Score = besserer Match
function getMatchScore(leadZip: string | null, partner: Partner): number {
  if (!leadZip || !partner.zip_regions?.length) return 0;
  let best = 0;
  for (const r of partner.zip_regions) {
    if (leadZip.startsWith(r)) best = Math.max(best, r.length);
  }
  return best;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Ausstehend',  color: 'text-amber-400 bg-amber-500/10' },
  accepted:  { label: 'Angenommen', color: 'text-green-400 bg-green-500/10' },
  rejected:  { label: 'Abgelehnt',  color: 'text-red-400 bg-red-500/10' },
  converted: { label: 'Konvertiert', color: 'text-blue-400 bg-blue-500/10' },
  expired:   { label: 'Abgelaufen', color: 'text-gray-400 bg-gray-500/10' },
};

export default function LeadRouterPage() {
  const { user } = useAuth();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [assignments, setAssignments] = useState<LeadAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'pending' | 'accepted' | 'converted'>('all');

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user?.id]);

  async function loadData() {
    setLoading(true);
    try {
      const [p, a, allLeads] = await Promise.all([
        fetchPartners(user!.id),
        fetchLeadAssignments(user!.id),
        fetchAgencyLeads(user!.id),
      ]);
      setPartners(p);
      setAssignments(a);
      const assignedLeadIds = new Set(
        a.filter(x => ['pending', 'accepted'].includes(x.status)).map(x => x.lead_id)
      );
      const unrouted = allLeads.filter(l => !assignedLeadIds.has(l.id));
      setLeads(unrouted);
      // Auswahl zurücksetzen falls Lead jetzt zugewiesen
      if (selectedLead && assignedLeadIds.has(selectedLead.id)) {
        setSelectedLead(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleAssign(partnerId: string) {
    if (!selectedLead || !user) return;
    setAssigning(partnerId);
    try {
      await assignLeadToPartner(selectedLead.id, partnerId, user.id, user.id);
      setSelectedLead(null);
      await loadData();
    } catch (e) {
      alert('Fehler: ' + (e as Error).message);
    } finally {
      setAssigning(null);
    }
  }

  // Leads nach Suchquery filtern
  const filteredLeads = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return leads;
    return leads.filter(l =>
      `${l.first_name} ${l.last_name}`.toLowerCase().includes(q) ||
      (l.zip || '').includes(q)
    );
  }, [leads, searchQuery]);

  // Partner sortiert: match zuerst, dann alphabetisch
  const rankedPartners = useMemo(() => {
    if (!selectedLead) return [];
    return [...partners.filter(p => p.is_active)]
      .map(p => ({ partner: p, score: getMatchScore(selectedLead.zip, p) }))
      .sort((a, b) => b.score - a.score || a.partner.company_name.localeCompare(b.partner.company_name));
  }, [selectedLead, partners]);

  // Anzahl passender Partner pro Lead (für Badge in Lead-Liste)
  const matchCountForLead = useMemo(() => {
    const map = new Map<string, number>();
    for (const lead of leads) {
      const count = partners.filter(p => p.is_active && getMatchScore(lead.zip, p) > 0).length;
      map.set(lead.id, count);
    }
    return map;
  }, [leads, partners]);

  // History-Filter
  const filteredAssignments = useMemo(() => {
    if (historyFilter === 'all') return assignments;
    return assignments.filter(a => a.status === historyFilter);
  }, [assignments, historyFilter]);

  // Stats
  const stats = useMemo(() => ({
    unrouted:   leads.length,
    pending:    assignments.filter(a => a.status === 'pending').length,
    accepted:   assignments.filter(a => a.status === 'accepted').length,
    converted:  assignments.filter(a => a.status === 'converted').length,
  }), [leads, assignments]);

  return (
    <div className="min-h-screen flex bg-[#0F0F0F] text-white">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {/* ── Header ── */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-2xl font-semibold text-white">Lead-Router</h1>
              <p className="text-sm text-gray-500 mt-0.5">Leads intelligent an Partner zuweisen</p>
            </div>
            <button
              onClick={loadData}
              className="flex items-center gap-2 text-xs text-gray-500 hover:text-white border border-white/10 hover:border-white/20 px-3 py-2 rounded-lg transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Aktualisieren
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Nicht zugewiesen', value: stats.unrouted, icon: Inbox,     color: 'text-[#F5A623]' },
              { label: 'Ausstehend',       value: stats.pending,  icon: Clock,     color: 'text-amber-400' },
              { label: 'Angenommen',       value: stats.accepted, icon: CheckCircle, color: 'text-green-400' },
              { label: 'Konvertiert',      value: stats.converted, icon: Zap,      color: 'text-blue-400' },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="bg-[#1A1A1A] border border-white/5 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                    <Icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">{s.value}</p>
                    <p className="text-[10px] text-gray-500 leading-tight">{s.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Two-Pane Router ── */}
        <div className="px-6 pb-4 flex gap-4" style={{ minHeight: '440px' }}>

          {/* ── Left: Lead-Queue ── */}
          <div className="w-72 flex-shrink-0 flex flex-col gap-2">
            <div className="flex items-center gap-2 bg-[#1A1A1A] border border-white/5 rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <input
                type="text"
                placeholder="Name oder PLZ…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-0.5" style={{ maxHeight: '520px' }}>
              {loading ? (
                <div className="text-center py-10 text-gray-600 text-sm">Laden…</div>
              ) : filteredLeads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-600">
                  <Inbox className="w-8 h-8 opacity-30" />
                  <p className="text-sm">Keine offenen Leads</p>
                </div>
              ) : (
                filteredLeads.map(lead => {
                  const matchCount = matchCountForLead.get(lead.id) ?? 0;
                  const isSelected = selectedLead?.id === lead.id;
                  return (
                    <button
                      key={lead.id}
                      onClick={() => setSelectedLead(isSelected ? null : lead)}
                      className={`w-full text-left rounded-xl border p-3.5 transition-all ${
                        isSelected
                          ? 'bg-[#1A3A5C] border-[#F5A623]/40 shadow-lg shadow-[#F5A623]/5'
                          : 'bg-[#1A1A1A] border-white/5 hover:border-white/15 hover:bg-[#222]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-[#1A3A5C] flex items-center justify-center text-[10px] font-bold text-[#F5A623] flex-shrink-0">
                            {lead.first_name?.[0]}{lead.last_name?.[0]}
                          </div>
                          <span className="text-sm font-medium text-white truncate">
                            {lead.first_name} {lead.last_name}
                          </span>
                        </div>
                        <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform ${isSelected ? 'rotate-90 text-[#F5A623]' : 'text-gray-600'}`} />
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {lead.zip && (
                          <span className="flex items-center gap-1 text-[11px] text-gray-400">
                            <MapPin className="w-3 h-3" />{lead.zip}
                          </span>
                        )}
                        {lead.kwp && (
                          <span className="flex items-center gap-1 text-[11px] text-[#F5A623]">
                            <Zap className="w-3 h-3" />{lead.kwp} kWp
                          </span>
                        )}
                        {matchCount > 0 && (
                          <span className="flex items-center gap-1 text-[11px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-md">
                            <Users className="w-3 h-3" />{matchCount} Match{matchCount > 1 ? 'es' : ''}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* ── Right: Partner-Vorschläge ── */}
          <div className="flex-1 min-w-0">
            {!selectedLead ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 bg-[#1A1A1A] border border-white/5 rounded-xl text-gray-600">
                <Handshake className="w-12 h-12 opacity-20" />
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-500">Lead auswählen</p>
                  <p className="text-xs mt-1">Wähle links einen Lead, um passende Partner zu sehen</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 h-full">
                {/* Lead-Zusammenfassung */}
                <div className="bg-[#1A3A5C]/30 border border-[#F5A623]/20 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#1A3A5C] flex items-center justify-center text-sm font-bold text-[#F5A623] flex-shrink-0">
                    {selectedLead.first_name?.[0]}{selectedLead.last_name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white">{selectedLead.first_name} {selectedLead.last_name}</p>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      {selectedLead.email && <span className="text-xs text-gray-400">{selectedLead.email}</span>}
                      {selectedLead.zip && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <MapPin className="w-3 h-3" />{selectedLead.zip}
                        </span>
                      )}
                      {selectedLead.kwp && (
                        <span className="flex items-center gap-1 text-xs text-[#F5A623]">
                          <Zap className="w-3 h-3" />{selectedLead.kwp} kWp
                        </span>
                      )}
                      {selectedLead.investment && (
                        <span className="text-xs text-gray-400">{selectedLead.investment.toLocaleString('de-DE')} €</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedLead(null)}
                    className="text-xs text-gray-500 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
                  >
                    ✕
                  </button>
                </div>

                {/* Partner-Vorschläge */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-0.5" style={{ maxHeight: '420px' }}>
                  {rankedPartners.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3 bg-[#1A1A1A] border border-white/5 rounded-xl text-gray-600">
                      <Users className="w-8 h-8 opacity-30" />
                      <p className="text-sm">Keine aktiven Partner vorhanden</p>
                    </div>
                  ) : (
                    <>
                      {rankedPartners.some(r => r.score > 0) && (
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">
                          Empfohlen für PLZ {selectedLead.zip}
                        </p>
                      )}
                      {rankedPartners.map(({ partner, score }) => (
                        <div
                          key={partner.id}
                          className={`flex items-center gap-4 rounded-xl border p-4 transition-all ${
                            score > 0
                              ? 'bg-[#1A1A1A] border-green-500/20'
                              : 'bg-[#1A1A1A] border-white/5 opacity-70'
                          }`}
                        >
                          {/* Match-Indikator */}
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            score > 0 ? 'bg-green-500/10' : 'bg-white/5'
                          }`}>
                            {score > 0 ? (
                              <Star className="w-5 h-5 text-green-400" fill="currentColor" />
                            ) : (
                              <Handshake className="w-5 h-5 text-gray-500" />
                            )}
                          </div>

                          {/* Partner-Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold text-white truncate">{partner.company_name}</span>
                              {score > 0 && (
                                <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-md flex-shrink-0">
                                  PLZ-Match
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                              {partner.zip_regions?.length > 0 && (
                                <span className="flex items-center gap-1 text-[11px] text-gray-500">
                                  <MapPin className="w-3 h-3" />
                                  {partner.zip_regions.slice(0, 5).join(', ')}
                                  {partner.zip_regions.length > 5 && ` +${partner.zip_regions.length - 5}`}
                                </span>
                              )}
                              <span className="text-[11px] text-gray-500">
                                Provision: {partner.commission_value}{partner.commission_type === 'fixed' ? ' €' : ' %'}
                              </span>
                              {partner.contact_name && (
                                <span className="text-[11px] text-gray-600 truncate">{partner.contact_name}</span>
                              )}
                            </div>
                          </div>

                          {/* Zuweisen-Button */}
                          <button
                            onClick={() => handleAssign(partner.id)}
                            disabled={assigning === partner.id}
                            className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex-shrink-0 ${
                              score > 0
                                ? 'bg-[#F5A623] text-[#1A3A5C] hover:bg-[#E09000]'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                            } disabled:opacity-50`}
                          >
                            {assigning === partner.id ? (
                              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Send className="w-3.5 h-3.5" />
                            )}
                            Zuweisen
                          </button>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Zuweisungs-Historie ── */}
        <div className="px-6 pb-8">
          <div className="bg-[#1A1A1A] border border-white/5 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <h2 className="text-sm font-semibold text-white">Zuweisungs-Historie</h2>
              <div className="flex gap-1">
                {(['all', 'pending', 'accepted', 'converted'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setHistoryFilter(f)}
                    className={`text-[11px] font-medium px-3 py-1.5 rounded-lg transition-all ${
                      historyFilter === f
                        ? 'bg-[#1A3A5C] text-white'
                        : 'text-gray-500 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {{ all: 'Alle', pending: 'Ausstehend', accepted: 'Angenommen', converted: 'Konvertiert' }[f]}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-10 text-gray-600 text-sm">Laden…</div>
            ) : filteredAssignments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-600">
                <CheckCircle className="w-7 h-7 opacity-20" />
                <p className="text-sm">Keine Einträge</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-white/5">
                    <th className="px-5 py-3 text-left">Lead</th>
                    <th className="px-5 py-3 text-left">Partner</th>
                    <th className="px-5 py-3 text-left">PLZ</th>
                    <th className="px-5 py-3 text-left">Provision</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-right">Datum</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignments.map((a, i) => {
                    const s = STATUS_MAP[a.status] || STATUS_MAP.expired;
                    return (
                      <tr key={a.id} className={`border-b border-white/5 text-sm ${i % 2 !== 0 ? 'bg-white/[0.02]' : ''}`}>
                        <td className="px-5 py-3.5 font-medium text-white">
                          {a.lead?.first_name} {a.lead?.last_name}
                        </td>
                        <td className="px-5 py-3.5 text-gray-400">{a.partner?.company_name || '—'}</td>
                        <td className="px-5 py-3.5 text-gray-500">
                          {a.lead?.zip ? (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />{a.lead.zip}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="px-5 py-3.5 text-gray-400">
                          {a.commission_amount ? `${a.commission_amount} €` : '—'}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.color}`}>
                            {s.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right text-gray-600">
                          {new Date(a.assigned_at).toLocaleDateString('de-DE')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
