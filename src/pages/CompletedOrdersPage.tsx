import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Search, Filter, ChevronRight, CheckCircle2,
  X, Mail, Tag, Users, Sun,
} from 'lucide-react';
import { AdminSidebar } from '../components/layout/AdminSidebar';
import { useLeads } from '../hooks/useLeads';

const STATUS_LABELS: Record<string, string> = {
  gewonnen: 'Gewonnen',
  verloren: 'Verloren',
  abgeschlossen: 'Abgeschlossen',
};

const STATUS_COLORS: Record<string, string> = {
  gewonnen: 'bg-green-500/10 text-green-400 border-green-500/20',
  verloren: 'bg-red-500/10 text-red-400 border-red-500/20',
  abgeschlossen: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

export default function CompletedOrdersPage() {
  const navigate = useNavigate();
  const { leads, isLoading } = useLeads();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);

  // Nur abgeschlossene Leads (gewonnen/verloren/abgeschlossen)
  const completedLeads = leads.filter(l =>
    l.status === 'gewonnen' || l.status === 'verloren' || l.status === 'abgeschlossen'
  );

  const filteredLeads = completedLeads.filter(lead => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      lead.first_name.toLowerCase().includes(q) ||
      lead.last_name.toLowerCase().includes(q) ||
      lead.email.toLowerCase().includes(q) ||
      (lead.zip ?? '').includes(q)
    );
  });

  const toggleLead = (id: string) => {
    setSelectedLeads(prev => prev.includes(id) ? prev.filter(lid => lid !== id) : [...prev, id]);
  };

  const selectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map(l => l.id));
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0F0F0F] text-white">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-white transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                Zurück
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-white">Abgeschlossene Aufträge</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {filteredLeads.length} abgeschlossene Lead{filteredLeads.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-[#1A1A1A] border border-white/5 rounded-xl px-4 py-2.5">
                <Search className="w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Suchen..."
                  className="bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none w-48"
                />
              </div>
              <button className="w-9 h-9 rounded-xl bg-[#1A1A1A] border border-white/5 flex items-center justify-center text-gray-500 hover:text-white">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-24">
              <Sun className="w-10 h-10 text-[#F5A623] animate-spin" />
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="bg-[#1A1A1A] rounded-xl border border-white/5 p-16 text-center max-w-[600px] mx-auto">
              <CheckCircle2 className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <p className="font-bold text-gray-500">Noch keine abgeschlossenen Aufträge.</p>
              <p className="text-sm text-gray-600 mt-1">
                Abgeschlossene Leads erscheinen hier, wenn sie als gewonnen oder verloren markiert werden.
              </p>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-[10px] text-gray-500 uppercase tracking-wider border-b border-white/5">
                        <th className="text-left py-4 px-5 font-medium w-10">
                          <input
                            type="checkbox"
                            checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                            onChange={selectAll}
                            className="w-4 h-4 rounded border-gray-600 bg-transparent accent-[#F5A623]"
                          />
                        </th>
                        <th className="text-left py-4 px-2 font-medium">Kunde</th>
                        <th className="text-left py-4 px-2 font-medium">E-Mail</th>
                        <th className="text-left py-4 px-2 font-medium">Status</th>
                        <th className="text-left py-4 px-2 font-medium">PLZ</th>
                        <th className="text-left py-4 px-2 font-medium">Eingegangen</th>
                        <th className="text-left py-4 px-2 font-medium">Anlage</th>
                        <th className="text-left py-4 px-5 font-medium">Aktion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeads.map((lead) => (
                        <tr
                          key={lead.id}
                          onClick={() => navigate(`/lead/${lead.id}`)}
                          className="border-b border-white/5 hover:bg-white/3 transition-colors cursor-pointer"
                        >
                          <td className="py-4 px-5" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedLeads.includes(lead.id)}
                              onChange={() => toggleLead(lead.id)}
                              className="w-4 h-4 rounded border-gray-600 bg-transparent accent-[#F5A623]"
                            />
                          </td>
                          <td className="py-4 px-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#1A3A5C] flex items-center justify-center text-[10px] font-bold text-white">
                                {lead.first_name?.[0]}{lead.last_name?.[0]}
                              </div>
                              <span className="text-sm text-white font-medium">{lead.first_name} {lead.last_name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-2 text-sm text-gray-400">{lead.email}</td>
                          <td className="py-4 px-2">
                            <span className={`text-[10px] px-2.5 py-1 rounded-full border capitalize ${STATUS_COLORS[lead.status] ?? 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                              {STATUS_LABELS[lead.status] ?? lead.status}
                            </span>
                          </td>
                          <td className="py-4 px-2 text-sm text-gray-400">{lead.zip || '-'}</td>
                          <td className="py-4 px-2 text-sm text-gray-400">{new Date(lead.created_at).toLocaleDateString('de-DE')}</td>
                          <td className="py-4 px-2">
                            <span className="text-xs text-gray-300 bg-[#252525] px-2.5 py-1 rounded-lg">{lead.kwp ? `${lead.kwp} kWp` : '-'}</span>
                          </td>
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); navigate(`/lead/${lead.id}`); }}
                                className="w-7 h-7 rounded-lg bg-[#252525] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                              >
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Selection Toolbar */}
              {selectedLeads.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1A1A1A] border border-white/10 rounded-2xl px-5 py-3 flex items-center gap-4 shadow-2xl z-50">
                  <span className="text-sm text-white font-medium">{selectedLeads.length} ausgewählt</span>
                  <div className="w-px h-5 bg-white/10" />
                  <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
                    <Mail className="w-3.5 h-3.5" /> E-Mail
                  </button>
                  <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
                    <Tag className="w-3.5 h-3.5" /> Tag
                  </button>
                  <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
                    <Users className="w-3.5 h-3.5" /> Zuweisen
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
