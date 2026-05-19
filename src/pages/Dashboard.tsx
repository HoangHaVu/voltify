import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, TrendingUp, BarChart2, FileText, Cpu, MapPin,
  HelpCircle, Settings, Bell, ChevronDown, Sun, Cloud, Zap,
  ArrowUpRight, Loader2, AlertCircle, LogOut
} from 'lucide-react';
import SEO from '../components/seo/SEO';
import { useAuth } from '../contexts/AuthContext';
import { fetchCustomerProject, fetchCustomerDocuments } from '../services/data';
import type { Project, DocumentItem } from '../services/data';

const sidebarNav = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'analyst', label: 'Analyst', icon: TrendingUp },
  { id: 'performance', label: 'Performance', icon: BarChart2 },
  { id: 'report', label: 'Report', icon: FileText },
  { id: 'system', label: 'System', icon: Cpu },
  { id: 'mysite', label: 'My Site', icon: MapPin },
];

const bottomNav = [
  { id: 'help', label: 'Help', icon: HelpCircle },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const statusLabels: Record<string, string> = {
  angebot: 'Angebot',
  planung: 'Planung',
  genehmigung: 'Genehmigung',
  installation: 'Installation',
  inbetrieb: 'In Betrieb',
};

const statusColors: Record<string, string> = {
  angebot: 'text-yellow-400',
  planung: 'text-blue-400',
  genehmigung: 'text-purple-400',
  installation: 'text-[#F5A623]',
  inbetrieb: 'text-green-400',
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  async function loadData() {
    setIsLoading(true);
    setError('');
    try {
      const [proj, docs] = await Promise.all([
        fetchCustomerProject(user!.id),
        fetchCustomerDocuments(user!.id),
      ]);
      setProject(proj);
      setDocuments(docs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Daten konnten nicht geladen werden.');
    } finally {
      setIsLoading(false);
    }
  }

  // Chart data points for the energy chart
  const producedPoints = [120, 180, 90, 200, 280, 150, 220, 260, 200, 280, 180, 160];
  const consumedPoints = [80, 110, 140, 100, 180, 260, 220, 180, 160, 200, 120, 100];
  const months = ['Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec', 'Jan'];

  const Y_MAX = 350;
  const chartH = 340;
  const chartW = 1000;
  const padLeft = 36;
  const padTop = 6;

  const yScale = (val: number) => padTop + chartH - (val / Y_MAX) * chartH;
  const xScale = (idx: number, total: number) => padLeft + (idx / (total - 1)) * chartW;

  const buildPath = (points: number[]) => {
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${xScale(i, points.length)},${yScale(p)}`).join(' ');
  };

  const buildArea = (points: number[]) => {
    const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${xScale(i, points.length)},${yScale(p)}`).join(' ');
    return `${line} L${xScale(points.length - 1, points.length)},${yScale(0)} L${xScale(0, points.length)},${yScale(0)} Z`;
  };

  const monthlyData = [
    { month: 'Sept', value: 280, icon: Sun, active: true },
    { month: 'Oct', value: 301, icon: Sun, active: false },
    { month: 'Nov', value: 189, icon: Cloud, active: false },
    { month: 'Dec', value: 243, icon: Cloud, active: false },
  ];

  if (isLoading) {
    return (
      <>
        <SEO title="Dashboard" noindex />
        <div className="min-h-screen flex bg-[#0F0F0F] text-white items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#F5A623] animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <SEO title="Dashboard" description="Verwalten Sie Ihre Solar-Projekte und Dokumente." canonical="/dashboard" noindex />
      <div className="min-h-screen flex bg-[#0F0F0F] text-white">
      {/* LEFT SIDEBAR */}
      <aside className="w-[220px] flex-shrink-0 flex flex-col bg-[#0F0F0F] border-r border-white/5">
        {/* Logo */}
        <div className="p-6 pb-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#F5A623] flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#1A3A5C]" fill="currentColor" />
            </div>
            <span className="text-xl font-semibold text-white tracking-tight">Voltify</span>
          </Link>
        </div>

        {/* Top Nav */}
        <nav className="flex-1 px-4 py-2 flex flex-col gap-1">
          {sidebarNav.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                  active
                    ? 'bg-[#1A3A5C] text-white font-medium'
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-[18px] h-[18px]" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom Nav */}
        <div className="px-4 pb-2 flex flex-col gap-1">
          {bottomNav.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                  active
                    ? 'bg-[#1A3A5C] text-white font-medium'
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-[18px] h-[18px]" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* User */}
        <div className="px-4 pb-6 pt-2">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-[#1A3A5C] flex items-center justify-center text-xs font-bold text-[#F5A623]">
              {user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.fullName || 'User'}</p>
              <p className="text-xs text-gray-600">{user?.role === 'customer' ? 'Kunde' : user?.role}</p>
            </div>
            <button onClick={logout} className="text-gray-500 hover:text-white transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-white">Overview</h1>
          <button className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
            <Bell className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm mb-5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {!project ? (
          /* No Project State */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-[#1A3A5C]/30 flex items-center justify-center mb-4">
              <Sun className="w-8 h-8 text-[#F5A623]" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Noch kein Projekt vorhanden</h2>
            <p className="text-sm text-gray-500 max-w-md mb-6">
              Sie haben noch keine Solaranlage konfiguriert. Starten Sie den Konfigurator, um Ihr persönliches Angebot zu erhalten.
            </p>
            <Link
              to="/konfigurator"
              className="flex items-center gap-2 bg-[#F5A623] text-[#1A3A5C] px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#E09000] transition-all"
            >
              <Zap className="w-4 h-4" />
              Zum Konfigurator
            </Link>
          </div>
        ) : (
          <>
            {/* Project Info Bar */}
            <div className="bg-[#1A3A5C]/20 border border-[#1A3A5C]/30 rounded-xl p-4 mb-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#1A3A5C] flex items-center justify-center">
                  <Sun className="w-5 h-5 text-[#F5A623]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Projekt #{project.id.slice(0, 8)}</p>
                  <p className="text-xs text-gray-500">
                    {project.zip} · {project.kwp} kWp · {statusLabels[project.status] || project.status}
                  </p>
                </div>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full bg-white/5 ${statusColors[project.status] || 'text-gray-400'}`}>
                {statusLabels[project.status] || project.status}
              </span>
            </div>

            {/* TOP ROW: Solar Panel Monitoring + Monthly Generation */}
            <div className="grid grid-cols-12 gap-5 mb-5">
              {/* Solar Panel Monitoring */}
              <div className="col-span-7 bg-[#1A1A1A] rounded-2xl p-5 border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-white">Solar Panel Monitoring</h2>
                  <button className="flex items-center gap-1.5 text-xs text-gray-500 bg-white/5 px-3 py-1.5 rounded-lg">
                    Projekt {project.id.slice(0, 6)} <ChevronDown className="w-3 h-3" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {/* Stats Grid */}
                  <div className="col-span-2 grid grid-cols-2 gap-3">
                    <div className="bg-[#252525] rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-green-400" />
                        <span className="text-[10px] text-gray-500">Status</span>
                      </div>
                      <p className="text-lg font-bold text-white">{statusLabels[project.status] || 'Aktiv'}</p>
                    </div>
                    <div className="bg-[#252525] rounded-xl p-3">
                      <span className="text-[10px] text-gray-500">Kapazität</span>
                      <p className="text-lg font-bold text-white">{project.kwp || 0} <span className="text-xs text-gray-500 font-normal">kWp</span></p>
                    </div>
                    <div className="bg-[#252525] rounded-xl p-3">
                      <span className="text-[10px] text-gray-500">Investition</span>
                      <p className="text-lg font-bold text-white">{project.investment?.toLocaleString() || 0} <span className="text-xs text-gray-500 font-normal">€</span></p>
                    </div>
                    <div className="bg-[#252525] rounded-xl p-3">
                      <span className="text-[10px] text-gray-500">Amortisation</span>
                      <p className="text-lg font-bold text-white">{project.amortization || 0} <span className="text-xs text-gray-500 font-normal">Jahre</span></p>
                    </div>
                    <div className="bg-[#252525] rounded-xl p-3">
                      <span className="text-[10px] text-gray-500">Ersparnis/Jahr</span>
                      <p className="text-lg font-bold text-white">{project.annual_savings?.toLocaleString() || 0} <span className="text-xs text-gray-500 font-normal">€</span></p>
                    </div>
                    <div className="bg-[#252525] rounded-xl p-3">
                      <span className="text-[10px] text-gray-500">Autarkie</span>
                      <p className="text-lg font-bold text-white">{project.autarky || 0} <span className="text-xs text-gray-500 font-normal">%</span></p>
                    </div>
                    <div className="bg-[#252525] rounded-xl p-3 col-span-1">
                      <span className="text-[10px] text-gray-500">Gewinn nach 20 Jahren</span>
                      <p className="text-2xl font-bold text-[#F5A623]">{project.profit_20_years?.toLocaleString() || 0} <span className="text-xs text-gray-500 font-normal">€</span></p>
                    </div>
                    <div className="bg-[#252525] rounded-xl p-3 flex flex-col justify-center">
                      <span className="text-[10px] text-gray-500">Notizen</span>
                      <p className="text-xs text-gray-400 line-clamp-2">{project.notes || 'Keine Notizen'}</p>
                    </div>
                  </div>

                  {/* 3D Solar Panel Image */}
                  <div className="flex items-center justify-center">
                    <img src="/images/hero-bg.jpg" alt="Solar Panel" className="w-full h-full object-cover rounded-xl opacity-80" />
                  </div>
                </div>
              </div>

              {/* Monthly Generation */}
              <div className="col-span-5 bg-[#1A1A1A] rounded-2xl p-5 border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-white">Monatliche Erzeugung</h2>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-[#F5A623]" /> ~{Math.round((project.kwp || 0) * 100)} kWh
                  </span>
                </div>
                <p className="text-[10px] text-gray-600 mb-4">Geschätzte Werte basierend auf Ihrer Konfiguration</p>

                {/* Month Cards */}
                <div className="grid grid-cols-4 gap-3 mb-5">
                  {monthlyData.map((m, i) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={i}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                          m.active
                            ? 'bg-[#1A3A5C] border border-[#1A3A5C]'
                            : 'bg-[#252525] border border-transparent hover:border-white/10'
                        }`}
                      >
                        <span className="text-xs text-gray-400">{m.month}</span>
                        <Icon className={`w-5 h-5 ${m.active ? 'text-[#F5A623]' : 'text-gray-500'}`} />
                        <span className={`text-xs font-semibold ${m.active ? 'text-[#F5A623]' : 'text-gray-400'}`}>{m.value} kWh</span>
                      </button>
                    );
                  })}
                </div>

                {/* Summary */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Systemleistung</span>
                    <span className="text-xs text-white">{project.kwp} kWp</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Jährliche Ersparnis</span>
                    <span className="text-xs text-white">{project.annual_savings?.toLocaleString()} €</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Amortisation</span>
                    <span className="text-xs text-white font-semibold">{project.amortization} Jahre</span>
                  </div>
                </div>
              </div>
            </div>

            {/* BOTTOM ROW: Chart + Documents */}
            <div className="grid grid-cols-12 gap-5">
              {/* Energy Produced Chart */}
              <div className="col-span-7 bg-[#1A1A1A] rounded-2xl p-5 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-semibold text-white">Energy Produced</h2>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-[#F5A623]" /> ~{Math.round((project.kwp || 0) * 900)} kWh/Jahr
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-600 mt-0.5">Geschätzte Ertragsprognose</p>
                  </div>
                  <button className="flex items-center gap-1 text-xs text-gray-500 bg-white/5 px-3 py-1.5 rounded-lg">
                    Jährlich <ChevronDown className="w-3 h-3" />
                  </button>
                </div>

                {/* Chart */}
                <svg viewBox={`0 0 ${padLeft + chartW + 10} ${padTop + chartH + 40}`} className="w-full h-[360px]" preserveAspectRatio="xMidYMid meet">
                  {/* Grid lines */}
                  {[0, 50, 100, 150, 200, 250, 300, 350].map((val) => (
                    <line key={val} x1={padLeft} y1={yScale(val)} x2={padLeft + chartW} y2={yScale(val)} stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray={val === 0 ? 'none' : '4 4'} />
                  ))}

                  {/* Produced Area + Line */}
                  <defs>
                    <linearGradient id="producedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F5A623" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#F5A623" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={buildArea(producedPoints)} fill="url(#producedGrad)" />
                  <path d={buildPath(producedPoints)} fill="none" stroke="#F5A623" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                  {/* Consumed Line */}
                  <path d={buildPath(consumedPoints)} fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                  {/* Dots on produced line */}
                  {producedPoints.map((p, i) => (
                    <circle key={i} cx={xScale(i, producedPoints.length)} cy={yScale(p)} r="3" fill="#F5A623" />
                  ))}

                  {/* Dots on consumed line */}
                  {consumedPoints.map((p, i) => (
                    <circle key={i} cx={xScale(i, consumedPoints.length)} cy={yScale(p)} r="3" fill="#3B82F6" />
                  ))}

                  {/* Y Axis Labels */}
                  {[0, 50, 100, 150, 200, 250, 300, 350].map((val) => (
                    <text key={val} x={padLeft - 6} y={yScale(val) + 4} textAnchor="end" className="text-[10px] fill-gray-500">{val}</text>
                  ))}

                  {/* X Axis Labels */}
                  {months.map((m, i) => (
                    <text key={i} x={xScale(i, months.length)} y={padTop + chartH + 22} textAnchor="middle" className="text-[10px] fill-gray-500">{m}</text>
                  ))}
                </svg>

                {/* Legend */}
                <div className="flex items-center gap-6 mt-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-[#F5A623] rounded-full" />
                    <span className="text-xs text-gray-500">Energy Produced</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-blue-500 rounded-full" />
                    <span className="text-xs text-gray-500">Energy Consumption</span>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="col-span-5 bg-[#1A1A1A] rounded-2xl p-5 border border-white/5">
                <h2 className="text-base font-semibold text-white mb-4">Dokumente</h2>

                {documents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <FileText className="w-8 h-8 text-gray-600 mb-2" />
                    <p className="text-sm text-gray-500">Noch keine Dokumente vorhanden</p>
                    <p className="text-xs text-gray-600 mt-1">Dokumente werden hier angezeigt, sobald verfügbar</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {documents.map((doc, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-[#252525]">
                        <div className="w-10 h-10 rounded-lg bg-[#1A3A5C]/30 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-[#F5A623]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{doc.title}</p>
                          <p className="text-[11px] text-gray-500">
                            {doc.meta || doc.type} · <span className={doc.status === 'signed' ? 'text-green-400' : doc.status === 'pending' ? 'text-yellow-400' : 'text-gray-400'}>{doc.status_text}</span>
                          </p>
                        </div>
                        {doc.is_downloadable && (
                          <button className="text-[#F5A623] hover:text-[#E09000] transition-colors">
                            <ArrowUpRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
    </>
  );
}
