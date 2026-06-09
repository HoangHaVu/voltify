import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Handshake, CheckCircle, XCircle, Send, Mail, Phone, MapPin, Zap } from 'lucide-react';
import { fetchPartnerByToken, fetchPartnerAssignmentsByToken, partnerUpdateAssignmentByToken, type Partner, type LeadAssignment } from '../../services/agency';

export default function PartnerPortalPage() {
  const { token } = useParams<{ token: string }>();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [assignments, setAssignments] = useState<LeadAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    loadData();
  }, [token]);

  async function loadData() {
    setLoading(true);
    try {
      const p = await fetchPartnerByToken(token!);
      if (!p) {
        setError('Ungültiger Zugriff. Bitte überprüfen Sie Ihren Link.');
        setLoading(false);
        return;
      }
      setPartner(p);
      const a = await fetchPartnerAssignmentsByToken(token!);
      setAssignments(a);
    } catch (e) {
      setError('Fehler beim Laden der Daten.');
    } finally {
      setLoading(false);
    }
  }

  async function handleStatus(assignmentId: string, status: 'accepted' | 'rejected') {
    try {
      await partnerUpdateAssignmentByToken(token!, assignmentId, status);
      loadData();
    } catch (e) {
      alert('Fehler: ' + (e as Error).message);
    }
  }

  async function handleConverted(assignmentId: string) {
    try {
      await partnerUpdateAssignmentByToken(token!, assignmentId, 'converted');
      loadData();
    } catch (e) {
      alert('Fehler: ' + (e as Error).message);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F]">
        <p className="text-gray-500">Laden...</p>
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F] text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Zugriff verweigert</h1>
          <p className="text-gray-500">{error || 'Ungültiger Link'}</p>
        </div>
      </div>
    );
  }

  const pending = assignments.filter(a => a.status === 'pending');
  const active = assignments.filter(a => ['accepted','converted'].includes(a.status));

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      {/* Header */}
      <header className="bg-[#1A1A1A] border-b border-white/5 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F5A623] flex items-center justify-center">
              <Handshake className="w-5 h-5 text-[#1A3A5C]" />
            </div>
            <div>
              <h1 className="font-semibold text-white">{partner.company_name}</h1>
              <p className="text-xs text-gray-500">Partner-Portal</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Provision</p>
            <p className="text-sm font-medium text-[#F5A623]">
              {partner.commission_value}{partner.commission_type === 'fixed' ? ' €' : ' %'}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {/* Neue Zuweisungen */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Neue Leads ({pending.length})</h2>
          {pending.length === 0 ? (
            <div className="bg-[#1A1A1A] rounded-xl border border-white/5 p-8 text-center text-gray-500">
              Keine neuen Leads
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map((a) => (
                <LeadCard key={a.id} assignment={a} onAccept={() => handleStatus(a.id, 'accepted')} onReject={() => handleStatus(a.id, 'rejected')} />
              ))}
            </div>
          )}
        </section>

        {/* Aktive Zuweisungen */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Meine Leads ({active.length})</h2>
          {active.length === 0 ? (
            <div className="bg-[#1A1A1A] rounded-xl border border-white/5 p-8 text-center text-gray-500">
              Keine aktiven Leads
            </div>
          ) : (
            <div className="space-y-3">
              {active.map((a) => (
                <div key={a.id} className="bg-[#1A1A1A] rounded-xl border border-white/5 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-white">{a.lead?.first_name} {a.lead?.last_name}</h3>
                    {a.status === 'accepted' && (
                      <button
                        onClick={() => handleConverted(a.id)}
                        className="flex items-center gap-1 text-xs bg-green-500/10 text-green-400 hover:bg-green-500/20 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <CheckCircle className="w-3 h-3" />
                        Auftrag erteilt
                      </button>
                    )}
                    {a.status === 'converted' && (
                      <span className="text-xs text-green-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Konvertiert
                      </span>
                    )}
                  </div>
                  <LeadInfo lead={a.lead} />
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function LeadCard({ assignment, onAccept, onReject }: {
  assignment: LeadAssignment;
  onAccept: () => void;
  onReject: () => void;
}) {
  return (
    <div className="bg-[#1A1A1A] rounded-xl border border-white/5 p-4">
      <h3 className="font-medium text-white mb-2">{assignment.lead?.first_name} {assignment.lead?.last_name}</h3>
      <LeadInfo lead={assignment.lead} />
      <div className="flex gap-2 mt-4">
        <button
          onClick={onAccept}
          className="flex items-center gap-1 bg-green-500/10 text-green-400 hover:bg-green-500/20 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <CheckCircle className="w-4 h-4" />
          Annehmen
        </button>
        <button
          onClick={onReject}
          className="flex items-center gap-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <XCircle className="w-4 h-4" />
          Ablehnen
        </button>
      </div>
    </div>
  );
}

function LeadInfo({ lead }: { lead?: LeadAssignment['lead'] }) {
  if (!lead) return null;
  return (
    <div className="space-y-1 text-sm text-gray-400">
      {lead.email && (
        <div className="flex items-center gap-2">
          <Mail className="w-3.5 h-3.5 text-gray-600" />{lead.email}
        </div>
      )}
      {lead.phone && (
        <div className="flex items-center gap-2">
          <Phone className="w-3.5 h-3.5 text-gray-600" />{lead.phone}
        </div>
      )}
      {lead.zip && (
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-gray-600" />{lead.zip}
        </div>
      )}
      {(lead.kwp || lead.investment) && (
        <div className="flex items-center gap-4 mt-2">
          {lead.kwp && (
            <span className="flex items-center gap-1 text-xs text-[#F5A623]">
              <Zap className="w-3 h-3" />{lead.kwp} kWp
            </span>
          )}
          {lead.investment && (
            <span className="text-xs text-[#F5A623]">{lead.investment.toLocaleString()} €</span>
          )}
        </div>
      )}
    </div>
  );
}
