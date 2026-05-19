import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Sun, CheckCircle, UploadCloud, FileText,
  ChevronDown, ArrowLeft, Download, ArrowRight, Receipt,
  Zap, Euro, TrendingUp, Calendar, BatteryCharging, BarChart2, MapPin, Phone,
} from 'lucide-react';
import { AdminSidebar } from '../components/layout/AdminSidebar';
import { useInstallerProject } from '../hooks/useInstallerProject';
import type { Project } from '../services/data';

const STATUS_LABELS: Record<Project['status'], string> = {
  angebot: 'Angebot erstellt',
  planung: 'In Planung',
  genehmigung: 'Genehmigung läuft',
  installation: 'In Installation',
  inbetrieb: 'In Betrieb ✓',
};

const STATUS_COLORS: Record<Project['status'], string> = {
  angebot: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  planung: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  genehmigung: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  installation: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  inbetrieb: 'bg-green-500/10 text-green-400 border-green-500/20',
};

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}
function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-[#252525] flex items-center justify-center shrink-0">
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

export default function ProjectDetailsPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { project, isLoading, isSaving, advancePhase, changeStatus, saveNotes, isLastPhase } = useInstallerProject(id);

  const [notes, setNotes] = useState('');
  const [paymentPaid, setPaymentPaid] = useState([false, false, false]);

  useEffect(() => {
    if (project?.notes != null) setNotes(project.notes);
  }, [project?.notes]);

  const leadAsCustomer = project?.lead
    ? { full_name: `${project.lead.first_name} ${project.lead.last_name}`, phone: project.lead.phone, zip: project.lead.zip }
    : null;
  const customer = project?.customer ?? leadAsCustomer;

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

          {!isLoading && !project && (
            <div className="bg-[#1A1A1A] rounded-xl border border-white/5 p-12 text-center text-gray-500">
              <p className="font-semibold">Noch kein Projekt vorhanden.</p>
            </div>
          )}

          {!isLoading && project && (
            <>
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-white transition-colors mb-6 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                Zurück zu Projekten
              </button>

              <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`inline-flex items-center font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border ${STATUS_COLORS[project.status]}`}>
                      {STATUS_LABELS[project.status]}
                    </span>
                    <span className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">
                      #{project.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <h1 className="text-3xl font-black text-white">
                    {customer?.full_name ?? 'PV Anlage'}
                  </h1>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border bg-green-500/10 text-green-400 border-green-500/20">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Angebot angenommen
                  </span>

                  <button className="border border-white/10 text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-white/5 transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Angebot als PDF
                  </button>

                  {isLastPhase ? (
                    <div className="flex items-center gap-2 bg-green-500/10 text-green-400 font-bold text-sm px-5 py-2.5 rounded-xl border border-green-500/20">
                      <CheckCircle className="w-4 h-4" />
                      Anlage in Betrieb
                    </div>
                  ) : (
                    <button
                      onClick={advancePhase}
                      disabled={isSaving}
                      className="bg-[#F5A623] text-[#1A3A5C] font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-[#E09000] transition-colors flex items-center gap-2 shadow-sm disabled:opacity-60"
                    >
                      {isSaving ? <Sun className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                      Phase abschließen
                    </button>
                  )}
                </div>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Linke Spalte */}
                <div className="lg:col-span-5 flex flex-col gap-8">
                  {/* Kundendaten */}
                  {customer && (
                    <section className="bg-[#1A1A1A] rounded-xl border border-white/5 p-6">
                      <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Kundendaten</h2>
                      <div className="space-y-3">
                        <InfoRow
                          icon={<span className="text-white font-bold text-sm">{customer.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</span>}
                          label="Name"
                          value={customer.full_name}
                        />
                        {customer.phone && (
                          <InfoRow
                            icon={<Phone className="w-4 h-4 text-gray-400" />}
                            label="Telefon"
                            value={<a href={`tel:${customer.phone}`} className="hover:text-[#F5A623] transition-colors">{customer.phone}</a>}
                          />
                        )}
                        {customer.zip && (
                          <InfoRow
                            icon={<MapPin className="w-4 h-4 text-gray-400" />}
                            label="Postleitzahl"
                            value={customer.zip}
                          />
                        )}
                      </div>
                    </section>
                  )}

                  {/* Konfiguration */}
                  <section className="bg-[#1A1A1A] rounded-xl border border-white/5 p-6">
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Anlagenkonfiguration</h2>
                    <div className="grid grid-cols-2 gap-3">
                      <StatCard label="Anlagengröße" value={project.kwp != null ? `${project.kwp} kWp` : '—'} icon={<Zap className="w-3.5 h-3.5" />} accent="text-yellow-400" />
                      <StatCard label="Investition" value={project.investment != null ? `${project.investment.toLocaleString('de-DE')} €` : '—'} icon={<Euro className="w-3.5 h-3.5" />} accent="text-gray-400" />
                      <StatCard label="Ersparnis/Jahr" value={project.annual_savings != null ? `${project.annual_savings.toLocaleString('de-DE')} €` : '—'} icon={<TrendingUp className="w-3.5 h-3.5" />} accent="text-green-400" />
                      <StatCard label="Amortisation" value={project.amortization != null ? `${project.amortization} Jahre` : '—'} icon={<Calendar className="w-3.5 h-3.5" />} accent="text-indigo-400" />
                      <StatCard label="Autarkie" value={project.autarky != null ? `${project.autarky} %` : '—'} sub="Eigenverbrauchsanteil" icon={<BatteryCharging className="w-3.5 h-3.5" />} accent="text-teal-400" />
                      <StatCard label="Jährlicher Ertrag" value={project.annual_savings != null ? `${(project.annual_savings * 1.5).toFixed(0)} €` : '—'} icon={<BarChart2 className="w-3.5 h-3.5" />} accent="text-emerald-400" />
                    </div>
                  </section>
                </div>

                {/* Rechte Spalte */}
                <div className="lg:col-span-7 flex flex-col gap-8">
                  {/* Status */}
                  <section className="bg-[#1A1A1A] rounded-xl border border-white/5 p-6">
                    <h2 className="text-lg font-bold text-white mb-4">Projektstatus</h2>
                    <div className="relative">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                        Status manuell setzen
                      </label>
                      <div className="relative">
                        <select
                          value={project.status}
                          onChange={(e) => changeStatus(e.target.value as Project['status'])}
                          className="w-full appearance-none bg-[#0F0F0F] border border-white/10 text-white font-bold text-sm rounded-xl pl-4 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30"
                        >
                          <option value="angebot">Angebot erstellt</option>
                          <option value="planung">In Planung</option>
                          <option value="genehmigung">Genehmigung läuft</option>
                          <option value="installation">In Installation</option>
                          <option value="inbetrieb">In Betrieb</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Oder nutze "Phase abschließen" oben für den nächsten Schritt.
                      </p>
                    </div>
                  </section>

                  {/* Dokumente */}
                  <section className="bg-[#1A1A1A] rounded-xl border-2 border-dashed border-white/5 p-8 flex flex-col justify-center items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-[#252525] flex items-center justify-center text-[#F5A623] mb-4">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1">Dokumente hochladen</h3>
                    <p className="text-xs text-gray-500 mb-4">Zählerfoto, Dachpläne, etc.</p>
                    <button className="bg-[#252525] text-white font-bold text-xs px-4 py-2 rounded-lg hover:bg-[#333] transition-colors">
                      Datei auswählen
                    </button>
                  </section>

                  {/* Notizen */}
                  <section className="bg-[#1A1A1A] rounded-xl border border-white/5 p-6">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-white/5 pb-4">
                      <FileText className="w-5 h-5 text-gray-500" />
                      Interne Notizen
                    </h2>
                    <textarea
                      className="w-full h-32 bg-[#0F0F0F] border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#F5A623]/30 resize-none placeholder:text-gray-600"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Notizen zur Dachbeschaffenheit, Kundenwünschen oder Besonderheiten..."
                    />
                    <div className="flex justify-end mt-3">
                      <button
                        onClick={() => saveNotes(notes)}
                        disabled={isSaving || notes === (project.notes ?? '')}
                        className="bg-[#F5A623] text-[#1A3A5C] font-bold text-sm px-6 py-2 rounded-xl hover:bg-[#E09000] transition-colors disabled:opacity-40 flex items-center gap-2"
                      >
                        {isSaving && <Sun className="w-4 h-4 animate-spin" />}
                        Notizen speichern
                      </button>
                    </div>
                  </section>

                  {/* Zahlungsstatus */}
                  {(project.investment ?? 0) > 0 && (
                    <section className="bg-[#1A1A1A] rounded-xl border border-white/5 p-6">
                      <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        Zahlungsstatus
                      </h2>
                      <p className="text-xs text-gray-500 mb-4">3-Raten-Zahlungsplan — als bezahlt markieren</p>
                      <div className="space-y-2">
                        {(['Abschlags-Rechnung 1 — 30 % Anzahlung', 'Abschlags-Rechnung 2 — 60 % Montage', 'Schluss-Rechnung — 10 % Abnahme'] as const).map((label, i) => {
                          const amounts = [
                            Math.round((project.investment ?? 0) * 0.30),
                            Math.round((project.investment ?? 0) * 0.60),
                            (project.investment ?? 0) - Math.round((project.investment ?? 0) * 0.30) - Math.round((project.investment ?? 0) * 0.60),
                          ];
                          const paid = paymentPaid[i];
                          return (
                            <button
                              key={label}
                              onClick={() => setPaymentPaid(prev => prev.map((v, idx) => idx === i ? !v : v))}
                              className={`flex items-center justify-between w-full px-4 py-3 rounded-xl border transition-all text-sm font-medium ${
                                paid
                                  ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                  : 'bg-[#0F0F0F] border-white/5 text-gray-400 hover:border-white/10'
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${paid ? 'bg-green-500 border-green-500' : 'border-gray-600'}`}>
                                  {paid && <span className="text-white text-[10px] font-black">✓</span>}
                                </span>
                                {label}
                              </span>
                              <span className={`font-bold ${paid ? 'text-green-400' : 'text-white'}`}>
                                {amounts[i].toLocaleString('de-DE')} €
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                        <span>{paymentPaid.filter(Boolean).length} / 3 Raten bezahlt</span>
                        <span className="font-bold text-white">
                          {paymentPaid.reduce((sum, paid, i) => {
                            const amounts = [
                              Math.round((project.investment ?? 0) * 0.30),
                              Math.round((project.investment ?? 0) * 0.60),
                              (project.investment ?? 0) - Math.round((project.investment ?? 0) * 0.30) - Math.round((project.investment ?? 0) * 0.60),
                            ];
                            return sum + (paid ? amounts[i] : 0);
                          }, 0).toLocaleString('de-DE')} € erhalten
                        </span>
                      </div>
                    </section>
                  )}

                  {/* Rechnungen */}
                  <section className="bg-[#1A1A1A] rounded-xl border border-white/5 p-6">
                    <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-[#F5A623]" />
                      Rechnungen generieren
                    </h2>
                    <p className="text-xs text-gray-500 mb-4">3-Raten-Zahlungsplan · 0 % MwSt. gem. § 12 Abs. 3 UStG</p>
                    <div className="space-y-2">
                      {([1, 2, 3] as const).map((type) => {
                        const labels = ['Abschlags-Rechnung 1 — 30 % Anzahlung', 'Abschlags-Rechnung 2 — 60 % Montage', 'Schluss-Rechnung — 10 % Abnahme'];
                        const amounts = [
                          Math.round((project.investment ?? 0) * 0.30),
                          Math.round((project.investment ?? 0) * 0.60),
                          (project.investment ?? 0) - Math.round((project.investment ?? 0) * 0.30) - Math.round((project.investment ?? 0) * 0.60),
                        ];
                        return (
                          <button
                            key={type}
                            className="flex items-center justify-between w-full border border-white/10 hover:border-[#F5A623]/30 text-white font-medium text-sm px-4 py-3 rounded-xl transition-colors group bg-[#0F0F0F]"
                          >
                            <span className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-[#F5A623]" />
                              {labels[type - 1]}
                            </span>
                            <span className="flex items-center gap-2 text-gray-500 group-hover:text-[#F5A623] transition-colors">
                              <span className="font-bold text-white">{amounts[type - 1].toLocaleString('de-DE')} €</span>
                              <Download className="w-3.5 h-3.5" />
                              PDF
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
