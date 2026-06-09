import { useState, useEffect, useMemo } from 'react';
import {
  Landmark, CheckCircle, FileText, Clock, Trophy, TrendingUp,
  Filter, ChevronDown, Euro, RotateCcw, Users,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { fetchCommissions, markCommissionInvoiced, markCommissionPaid, type Commission } from '../../services/agency';
import { fetchTeamMembers } from '../../services/data';
import { resolveAgencyId } from '../../services/auth';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Ausstehend',   color: 'text-amber-400 bg-amber-500/10' },
  invoiced:  { label: 'In Rechnung',  color: 'text-blue-400 bg-blue-500/10' },
  paid:      { label: 'Bezahlt',      color: 'text-green-400 bg-green-500/10' },
  cancelled: { label: 'Storniert',    color: 'text-gray-400 bg-gray-500/10' },
};

type StatusFilter = 'all' | 'pending' | 'invoiced' | 'paid' | 'cancelled';

export default function CommissionsPage() {
  const { user } = useAuth();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [partnerFilter, setPartnerFilter] = useState<string>('all');
  const [memberFilter, setMemberFilter] = useState<string>('all');
  const [teamMembers, setTeamMembers] = useState<{ id: string; full_name: string }[]>([]);

  useEffect(() => {
    if (!user) return;
    loadCommissions();
    // Team-Mitglieder nur für den Inhaber laden
    if (user.role === 'sales_agency') {
      fetchTeamMembers(user.id)
        .then(members => setTeamMembers(
          members.filter(m => m.role === 'agency_agent').map(m => ({ id: m.id, full_name: m.full_name }))
        ))
        .catch(() => {});
    }
  }, [user?.id]);

  async function loadCommissions() {
    if (!user) return;
    setLoading(true);
    try {
      const agencyId = resolveAgencyId(user);
      const data = await fetchCommissions(agencyId);
      setCommissions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleInvoice(commissionId: string) {
    const num = prompt('Rechnungsnummer:');
    if (num === null) return;
    try {
      await markCommissionInvoiced(commissionId, num || undefined);
      loadCommissions();
    } catch (e) {
      alert('Fehler: ' + (e as Error).message);
    }
  }

  async function handlePaid(commissionId: string) {
    if (!confirm('Als bezahlt markieren?')) return;
    try {
      await markCommissionPaid(commissionId);
      loadCommissions();
    } catch (e) {
      alert('Fehler: ' + (e as Error).message);
    }
  }

  // ── Aggregierte Stats ──
  const stats = useMemo(() => ({
    pending:  commissions.filter(c => c.status === 'pending').reduce((s, c) => s + c.amount, 0),
    invoiced: commissions.filter(c => c.status === 'invoiced').reduce((s, c) => s + c.amount, 0),
    paid:     commissions.filter(c => c.status === 'paid').reduce((s, c) => s + c.amount, 0),
    total:    commissions.reduce((s, c) => s + c.amount, 0),
  }), [commissions]);

  // ── Partner-Rangliste ──
  const partnerStats = useMemo(() => {
    const map = new Map<string, { name: string; count: number; totalAmount: number; paidAmount: number }>();
    for (const c of commissions) {
      const name = c.partner?.company_name || 'Unbekannt';
      const key = c.partner_id;
      const existing = map.get(key) ?? { name, count: 0, totalAmount: 0, paidAmount: 0 };
      map.set(key, {
        name,
        count:       existing.count + 1,
        totalAmount: existing.totalAmount + c.amount,
        paidAmount:  existing.paidAmount + (c.status === 'paid' ? c.amount : 0),
      });
    }
    return Array.from(map.values());
  }, [commissions]);

  const topByOrders = useMemo(() =>
    [...partnerStats].sort((a, b) => b.count - a.count).slice(0, 5),
    [partnerStats]
  );
  const topByPaid = useMemo(() =>
    [...partnerStats].sort((a, b) => b.paidAmount - a.paidAmount).slice(0, 5),
    [partnerStats]
  );

  // ── Unique Partner für Filter-Dropdown ──
  const uniquePartners = useMemo(() => {
    const seen = new Map<string, string>();
    for (const c of commissions) {
      if (c.partner_id && c.partner?.company_name) seen.set(c.partner_id, c.partner.company_name);
    }
    return Array.from(seen.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [commissions]);

  // ── Gefilterte Liste ──
  const filtered = useMemo(() => {
    return commissions.filter(c => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (partnerFilter !== 'all' && c.partner_id !== partnerFilter) return false;
      if (memberFilter !== 'all' && c.assignment?.assigned_by !== memberFilter) return false;
      return true;
    });
  }, [commissions, statusFilter, partnerFilter, memberFilter]);

  const maxOrders  = topByOrders[0]?.count ?? 1;
  const maxPaid    = topByPaid[0]?.paidAmount ?? 1;

  return (
    <div className="min-h-screen flex bg-[#0F0F0F] text-white">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-semibold text-white">Provisionen</h1>
            <p className="text-sm text-gray-500 mt-0.5">Übersicht über offene und bezahlte Provisionen</p>
          </div>
          <button
            onClick={loadCommissions}
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-white border border-white/10 hover:border-white/20 px-3 py-2 rounded-lg transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Aktualisieren
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Gesamt',       value: stats.total,    color: 'text-white',       icon: Euro },
            { label: 'Ausstehend',   value: stats.pending,  color: 'text-amber-400',   icon: Clock },
            { label: 'In Rechnung',  value: stats.invoiced, color: 'text-blue-400',    icon: FileText },
            { label: 'Bezahlt',      value: stats.paid,     color: 'text-green-400',   icon: CheckCircle },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-[#1A1A1A] border border-white/5 rounded-xl p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <div>
                  <p className={`text-xl font-bold ${s.color}`}>{s.value.toLocaleString('de-DE')} €</p>
                  <p className="text-[10px] text-gray-500 leading-tight">{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Ranglisten ── */}
        {partnerStats.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Meiste Aufträge */}
            <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-4 h-4 text-[#F5A623]" />
                <h2 className="text-sm font-semibold text-white">Meiste Aufträge</h2>
              </div>
              <div className="space-y-3">
                {topByOrders.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-3">
                    <span className={`text-[11px] font-bold w-5 text-center flex-shrink-0 ${
                      i === 0 ? 'text-[#F5A623]' : i === 1 ? 'text-gray-400' : 'text-gray-600'
                    }`}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-white truncate">{p.name}</span>
                        <span className="text-xs font-bold text-white ml-2 flex-shrink-0">{p.count}</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${i === 0 ? 'bg-[#F5A623]' : 'bg-white/20'}`}
                          style={{ width: `${(p.count / maxOrders) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Höchste Provisionen bezahlt */}
            <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <h2 className="text-sm font-semibold text-white">Höchste bezahlte Provision</h2>
              </div>
              <div className="space-y-3">
                {topByPaid.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-3">
                    <span className={`text-[11px] font-bold w-5 text-center flex-shrink-0 ${
                      i === 0 ? 'text-green-400' : i === 1 ? 'text-gray-400' : 'text-gray-600'
                    }`}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-white truncate">{p.name}</span>
                        <span className="text-xs font-bold text-green-400 ml-2 flex-shrink-0">
                          {p.paidAmount.toLocaleString('de-DE')} €
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${i === 0 ? 'bg-green-500' : 'bg-white/20'}`}
                          style={{ width: `${maxPaid > 0 ? (p.paidAmount / maxPaid) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {topByPaid.every(p => p.paidAmount === 0) && (
                  <p className="text-xs text-gray-600 text-center py-4">Noch keine bezahlten Provisionen</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Filter-Leiste ── */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-1 bg-[#1A1A1A] border border-white/5 rounded-xl p-1">
            {(['all', 'pending', 'invoiced', 'paid', 'cancelled'] as StatusFilter[]).map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`text-[11px] font-medium px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === f
                    ? 'bg-[#1A3A5C] text-white'
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {{ all: 'Alle', pending: 'Ausstehend', invoiced: 'In Rechnung', paid: 'Bezahlt', cancelled: 'Storniert' }[f]}
              </button>
            ))}
          </div>

          {uniquePartners.length > 0 && (
            <div className="relative">
              <select
                value={partnerFilter}
                onChange={e => setPartnerFilter(e.target.value)}
                className="appearance-none bg-[#1A1A1A] border border-white/5 text-sm text-gray-400 rounded-xl px-4 py-2 pr-8 focus:outline-none focus:border-white/20 hover:border-white/15 transition-colors cursor-pointer"
              >
                <option value="all">Alle Partner</option>
                {uniquePartners.map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
            </div>
          )}

          {/* Team-Mitglieder-Filter — nur für Inhaber */}
          {teamMembers.length > 0 && (
            <div className="relative">
              <select
                value={memberFilter}
                onChange={e => setMemberFilter(e.target.value)}
                className="appearance-none bg-[#1A1A1A] border border-white/5 text-sm text-gray-400 rounded-xl px-4 py-2 pr-8 focus:outline-none focus:border-white/20 hover:border-white/15 transition-colors cursor-pointer"
              >
                <option value="all">Alle Vertriebler</option>
                {teamMembers.map(m => (
                  <option key={m.id} value={m.id}>{m.full_name}</option>
                ))}
              </select>
              <Users className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
            </div>
          )}

          {(statusFilter !== 'all' || partnerFilter !== 'all' || memberFilter !== 'all') && (
            <button
              onClick={() => { setStatusFilter('all'); setPartnerFilter('all'); setMemberFilter('all'); }}
              className="text-[11px] text-gray-500 hover:text-white flex items-center gap-1 transition-colors"
            >
              <Filter className="w-3 h-3" />
              Filter zurücksetzen
            </button>
          )}

          <span className="ml-auto text-xs text-gray-600">{filtered.length} Einträge</span>
        </div>

        {/* ── Tabelle ── */}
        <div className="bg-[#1A1A1A] border border-white/5 rounded-xl overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-gray-500 text-sm">Laden…</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-600">
              <Landmark className="w-8 h-8 opacity-20" />
              <p className="text-sm">Keine Provisionen gefunden</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-white/5">
                  <th className="px-5 py-3 text-left">Partner</th>
                  <th className="px-5 py-3 text-left">Lead</th>
                  <th className="px-5 py-3 text-right">Betrag</th>
                  <th className="px-5 py-3 text-left">Rechnung-Nr.</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-right">Datum</th>
                  <th className="px-5 py-3 text-right">Aktion</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => {
                  const s = STATUS_MAP[c.status] || STATUS_MAP.cancelled;
                  return (
                    <tr key={c.id} className={`border-b border-white/5 text-sm ${i % 2 !== 0 ? 'bg-white/[0.02]' : ''}`}>
                      <td className="px-5 py-3.5 font-medium text-white">{c.partner?.company_name || '—'}</td>
                      <td className="px-5 py-3.5 text-gray-400">{c.lead?.first_name} {c.lead?.last_name}</td>
                      <td className="px-5 py-3.5 text-right font-semibold text-white">{c.amount.toLocaleString('de-DE')} €</td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs">{c.invoice_number || '—'}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.color}`}>{s.label}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right text-gray-600">
                        {new Date(c.created_at).toLocaleDateString('de-DE')}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {c.status === 'pending' && (
                          <button
                            onClick={() => handleInvoice(c.id)}
                            className="flex items-center gap-1 text-xs bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg transition-colors ml-auto"
                          >
                            <FileText className="w-3 h-3" />
                            In Rechnung
                          </button>
                        )}
                        {c.status === 'invoiced' && (
                          <button
                            onClick={() => handlePaid(c.id)}
                            className="flex items-center gap-1 text-xs bg-green-500/10 text-green-400 hover:bg-green-500/20 px-3 py-1.5 rounded-lg transition-colors ml-auto"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Bezahlt
                          </button>
                        )}
                        {c.status === 'paid' && (
                          <span className="text-xs text-green-500 flex items-center gap-1 justify-end">
                            <CheckCircle className="w-3 h-3" />
                            {c.paid_at ? new Date(c.paid_at).toLocaleDateString('de-DE') : '—'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
