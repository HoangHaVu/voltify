import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, Mail, Phone, MapPin, Zap, BatteryCharging, Car, Thermometer,
  Clock, Calendar, CheckCircle, Handshake, AlertTriangle, Star,
  RefreshCw, XCircle, Send, ChevronDown, ChevronUp,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import {
  fetchPartners, assignLeadToPartner, updateAssignmentStatus,
  type Partner, type LeadAssignment,
} from '../../services/agency';
import type { Lead } from '../../services/data';

// Längster passender PLZ-Präfix = höchster Score
function getMatchScore(zip: string | null, partner: Partner): number {
  if (!zip || !partner.zip_regions?.length) return 0;
  let best = 0;
  for (const r of partner.zip_regions) {
    if (zip.startsWith(r)) best = Math.max(best, r.length);
  }
  return best;
}

const PLANNING_LABELS: Record<string, string> = {
  sofort:    'Sofort bereit',
  '3monate':  'In 3 Monaten',
  '12monate': 'In 12 Monaten',
};

const STATUS_COLORS: Record<string, string> = {
  neu:           'bg-[#F5A623]/10 text-[#F5A623]',
  kontaktiert:   'bg-blue-500/10 text-blue-400',
  vorort:        'bg-purple-500/10 text-purple-400',
  angebot:       'bg-cyan-500/10 text-cyan-400',
  abschluss:     'bg-orange-500/10 text-orange-400',
  gewonnen:      'bg-green-500/10 text-green-400',
  verloren:      'bg-red-500/10 text-red-400',
  planung:       'bg-indigo-500/10 text-indigo-400',
  installation:  'bg-teal-500/10 text-teal-400',
  abgeschlossen: 'bg-gray-500/10 text-gray-400',
};

const ASSIGNMENT_BADGES: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Ausstehend',   color: 'text-amber-400 bg-amber-500/10' },
  accepted:  { label: 'Angenommen',  color: 'text-green-400 bg-green-500/10' },
  rejected:  { label: 'Abgelehnt',   color: 'text-red-400 bg-red-500/10' },
  converted: { label: 'Konvertiert', color: 'text-blue-400 bg-blue-500/10' },
  expired:   { label: 'Abgelaufen',  color: 'text-gray-400 bg-gray-500/10' },
};

type ActiveAssignment = LeadAssignment & { partner?: { company_name: string; email: string } };

interface Props {
  lead: Lead;
  onClose: () => void;
}

export function AgencyLeadDrawer({ lead, onClose }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [assignment, setAssignment]           = useState<ActiveAssignment | null>(null);
  const [loadingAssignment, setLoadingAssignment] = useState(true);
  const [partners, setPartners]               = useState<Partner[]>([]);
  const [reassignMode, setReassignMode]       = useState(false);
  const [assigning, setAssigning]             = useState<string | null>(null);
  const [revoking, setRevoking]               = useState(false);

  useEffect(() => {
    loadAssignment();
    if (user) fetchPartners(user.id).then(setPartners).catch(() => {});
  }, [lead.id, user?.id]);

  async function loadAssignment() {
    setLoadingAssignment(true);
    try {
      const { data } = await supabase
        .from('lead_assignments')
        .select('*, partner:partners(company_name, email)')
        .eq('lead_id', lead.id)
        .in('status', ['pending', 'accepted', 'converted'])
        .order('assigned_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      setAssignment(data as ActiveAssignment | null);
    } catch {
      setAssignment(null);
    } finally {
      setLoadingAssignment(false);
    }
  }

  async function handleAssign(partnerId: string) {
    if (!user) return;
    setAssigning(partnerId);
    try {
      // Alte Zuweisung aufheben falls vorhanden
      if (assignment) {
        await updateAssignmentStatus(assignment.id, 'expired');
      }
      await assignLeadToPartner(lead.id, partnerId, user.id, user.id);
      setReassignMode(false);
      await loadAssignment();
    } catch (e) {
      alert('Fehler: ' + (e as Error).message);
    } finally {
      setAssigning(null);
    }
  }

  async function handleRevoke() {
    if (!assignment || !confirm('Zuweisung wirklich aufheben? Der Partner wird nicht mehr benachrichtigt.')) return;
    setRevoking(true);
    try {
      await updateAssignmentStatus(assignment.id, 'expired');
      setReassignMode(false);
      await loadAssignment();
    } catch (e) {
      alert('Fehler: ' + (e as Error).message);
    } finally {
      setRevoking(false);
    }
  }

  // Partner nach PLZ-Match sortiert
  const rankedPartners = useMemo(() =>
    partners
      .filter(p => p.is_active)
      .map(p => ({ partner: p, score: getMatchScore(lead.zip, p) }))
      .sort((a, b) => b.score - a.score || a.partner.company_name.localeCompare(b.partner.company_name)),
    [partners, lead.zip]
  );

  const badge = ASSIGNMENT_BADGES[assignment?.status ?? ''];
  const canReassign = assignment?.status !== 'converted'; // konvertierte nicht mehr ändern

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-[#0F0F0F] border-l border-white/10 h-full overflow-y-auto">

        {/* ── Header ── */}
        <div className="sticky top-0 bg-[#0F0F0F]/95 backdrop-blur border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1A3A5C] flex items-center justify-center text-sm font-bold text-[#F5A623]">
              {lead.first_name?.[0]}{lead.last_name?.[0]}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">{lead.first_name} {lead.last_name}</h2>
              <p className="text-xs text-gray-500">{lead.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#1A1A1A] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* ── Status + Datum ── */}
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${STATUS_COLORS[lead.status] ?? 'bg-gray-500/10 text-gray-400'}`}>
              {lead.status}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(lead.created_at).toLocaleDateString('de-DE')}
            </div>
          </div>

          {/* ── Planungshorizont ── */}
          {lead.planning_horizon && (
            <div className="flex items-center gap-2 bg-[#1A1A1A] border border-white/5 rounded-xl px-4 py-3">
              <Clock className="w-4 h-4 text-[#F5A623]" />
              <span className="text-sm text-gray-300">
                {PLANNING_LABELS[lead.planning_horizon] ?? lead.planning_horizon}
              </span>
            </div>
          )}

          {/* ── Kontaktdaten ── */}
          <div className="bg-[#1A1A1A] rounded-xl border border-white/5 p-4 space-y-3">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Kontaktdaten</h3>
            <a href={`mailto:${lead.email}`} className="flex items-center gap-3 group">
              <Mail className="w-4 h-4 text-gray-500 group-hover:text-[#F5A623] transition-colors flex-shrink-0" />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors truncate">{lead.email}</span>
            </a>
            {lead.phone && (
              <a href={`tel:${lead.phone}`} className="flex items-center gap-3 group">
                <Phone className="w-4 h-4 text-gray-500 group-hover:text-[#F5A623] transition-colors flex-shrink-0" />
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{lead.phone}</span>
              </a>
            )}
            {lead.zip && (
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="text-sm text-gray-300">PLZ {lead.zip}</span>
              </div>
            )}
          </div>

          {/* ── Solaranlage ── */}
          <div className="bg-[#1A1A1A] rounded-xl border border-white/5 p-4 space-y-4">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Solaranlage</h3>
            <div className="grid grid-cols-2 gap-2">
              {([
                { label: 'Leistung',       value: lead.kwp != null ? `${lead.kwp} kWp` : null,                                       color: 'text-[#F5A623]' },
                { label: 'Investition',    value: lead.investment != null ? `${lead.investment.toLocaleString('de-DE')} €` : null,     color: 'text-white' },
                { label: 'Ersparnis/Jahr', value: lead.annual_savings != null ? `${lead.annual_savings.toLocaleString('de-DE')} €` : null, color: 'text-green-400' },
                { label: 'Autarkie',       value: lead.autarky != null ? `${lead.autarky}%` : null,                                   color: 'text-blue-400' },
                { label: 'Amortisation',   value: lead.amortization != null ? `~${lead.amortization} Jahre` : null,                   color: 'text-white' },
                { label: 'Verbrauch',      value: lead.consumption != null ? `${lead.consumption.toLocaleString('de-DE')} kWh` : null, color: 'text-white' },
              ] as const).filter(r => r.value !== null).map(row => (
                <div key={row.label} className="bg-[#252525] rounded-lg p-3">
                  <p className="text-[10px] text-gray-500 mb-0.5">{row.label}</p>
                  <p className={`text-sm font-bold ${row.color}`}>{row.value}</p>
                </div>
              ))}
            </div>
            {lead.roof_orientation && (
              <div className="flex items-center gap-2 text-xs text-gray-500 pt-1">
                <span className="text-gray-600">Dach:</span>
                <span className="text-gray-300">{lead.roof_orientation}</span>
                {lead.roof_area != null && <span className="text-gray-400 ml-1">{lead.roof_area} m²</span>}
              </div>
            )}
            {(lead.has_battery || lead.has_e_car || lead.has_heat_pump || lead.shading_issues) && (
              <div className="flex flex-wrap gap-2 pt-1 border-t border-white/5">
                {lead.has_battery && (
                  <span className="flex items-center gap-1 text-xs bg-green-500/10 text-green-400 px-2.5 py-1 rounded-lg">
                    <BatteryCharging className="w-3.5 h-3.5" />Speicher
                  </span>
                )}
                {lead.has_e_car && (
                  <span className="flex items-center gap-1 text-xs bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-lg">
                    <Car className="w-3.5 h-3.5" />E-Auto
                  </span>
                )}
                {lead.has_heat_pump && (
                  <span className="flex items-center gap-1 text-xs bg-orange-500/10 text-orange-400 px-2.5 py-1 rounded-lg">
                    <Thermometer className="w-3.5 h-3.5" />Wärmepumpe
                  </span>
                )}
                {lead.shading_issues && (
                  <span className="flex items-center gap-1 text-xs bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-lg">
                    <AlertTriangle className="w-3.5 h-3.5" />Verschattung
                  </span>
                )}
              </div>
            )}
          </div>

          {/* ── Partner-Zuweisung ── */}
          <div className="bg-[#1A1A1A] rounded-xl border border-white/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Partner-Zuweisung</h3>
              {assignment && canReassign && !reassignMode && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setReassignMode(true)}
                    className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Neu zuweisen
                  </button>
                  <button
                    onClick={handleRevoke}
                    disabled={revoking}
                    className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 bg-red-500/5 hover:bg-red-500/10 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-3 h-3" />
                    Aufheben
                  </button>
                </div>
              )}
              {reassignMode && (
                <button
                  onClick={() => setReassignMode(false)}
                  className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-white transition-colors"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                  Abbrechen
                </button>
              )}
            </div>

            {loadingAssignment ? (
              <p className="text-xs text-gray-600 py-1">Laden…</p>

            ) : !reassignMode && assignment ? (
              /* ── Aktuelle Zuweisung ── */
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#1A3A5C] flex items-center justify-center flex-shrink-0">
                      <Handshake className="w-4 h-4 text-[#F5A623]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{assignment.partner?.company_name ?? '—'}</p>
                      <p className="text-xs text-gray-500">{new Date(assignment.assigned_at).toLocaleDateString('de-DE')}</p>
                    </div>
                  </div>
                  {badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.color}`}>{badge.label}</span>
                  )}
                </div>
                {assignment.commission_amount != null && (
                  <div className="flex items-center justify-between bg-[#252525] rounded-lg px-3 py-2">
                    <span className="text-xs text-gray-500">Provision</span>
                    <span className="text-sm font-bold text-green-400">{assignment.commission_amount.toLocaleString('de-DE')} €</span>
                  </div>
                )}
                {assignment.status === 'converted' && (
                  <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 rounded-lg px-3 py-2">
                    <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    Auftrag erteilt — Lead erfolgreich konvertiert
                  </div>
                )}
                {/* Was der Partner sieht - Info-Hinweis */}
                <div className="text-[11px] text-gray-600 bg-white/[0.03] rounded-lg px-3 py-2 leading-relaxed">
                  Der Partner erhält per E-Mail Name + PLZ als Teaser, dann im Portal die vollständigen Kontaktdaten.
                </div>
              </div>

            ) : reassignMode || !assignment ? (
              /* ── Partner-Picker ── */
              <div className="space-y-2">
                {!assignment && (
                  <p className="text-sm text-gray-500 mb-1">Wähle einen Partner für diesen Lead:</p>
                )}
                {reassignMode && (
                  <p className="text-xs text-amber-400 bg-amber-500/10 rounded-lg px-3 py-2 mb-1">
                    Die bestehende Zuweisung wird aufgehoben. Der neue Partner erhält eine E-Mail-Benachrichtigung.
                  </p>
                )}

                {rankedPartners.length === 0 ? (
                  <p className="text-xs text-gray-600 py-2">Keine aktiven Partner vorhanden.</p>
                ) : (
                  <>
                    {rankedPartners.some(r => r.score > 0) && (
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-0.5 mb-1">
                        Empfohlen für PLZ {lead.zip}
                      </p>
                    )}
                    {rankedPartners.map(({ partner, score }) => (
                      <div
                        key={partner.id}
                        className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
                          score > 0 ? 'border-green-500/20 bg-[#252525]' : 'border-white/5 bg-[#252525] opacity-75'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${score > 0 ? 'bg-green-500/10' : 'bg-white/5'}`}>
                          {score > 0
                            ? <Star className="w-4 h-4 text-green-400" fill="currentColor" />
                            : <Handshake className="w-4 h-4 text-gray-500" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium text-white truncate">{partner.company_name}</span>
                            {score > 0 && (
                              <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded flex-shrink-0">Match</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {partner.zip_regions?.length > 0 && (
                              <span className="text-[11px] text-gray-500 truncate">
                                PLZ: {partner.zip_regions.slice(0, 3).join(', ')}{partner.zip_regions.length > 3 ? '…' : ''}
                              </span>
                            )}
                            <span className="text-[11px] text-gray-600 flex-shrink-0">
                              {partner.commission_value}{partner.commission_type === 'fixed' ? ' €' : ' %'}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAssign(partner.id)}
                          disabled={assigning === partner.id}
                          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg transition-all flex-shrink-0 ${
                            score > 0
                              ? 'bg-[#F5A623] text-[#1A3A5C] hover:bg-[#E09000]'
                              : 'bg-white/10 text-gray-300 hover:bg-white/15'
                          } disabled:opacity-50`}
                        >
                          {assigning === partner.id
                            ? <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            : <Send className="w-3.5 h-3.5" />
                          }
                          {assigning === partner.id ? '' : 'Zuweisen'}
                        </button>
                      </div>
                    ))}
                  </>
                )}

                {rankedPartners.length > 0 && !reassignMode && (
                  <button
                    onClick={() => { navigate('/admin/router'); onClose(); }}
                    className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-white border border-white/5 hover:border-white/15 py-2 rounded-xl transition-all mt-1"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                    Im Lead-Router zuweisen
                  </button>
                )}
              </div>
            ) : null}
          </div>

        </div>
      </div>
    </div>
  );
}
