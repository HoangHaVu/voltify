import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Zap, Menu, X, ArrowRight, Check, Users, Sun,
  BarChart3, Shield,
  LayoutDashboard, SlidersHorizontal, Globe,
  Clock, FileText, Calendar, MessageSquare,
  TrendingUp, Briefcase
} from 'lucide-react';
import { BETA, BETA_COPY } from '../lib/betaConfig';
import { cacheFunnelSourceFromUrl } from '../lib/funnelTracking';
import ExitIntentModal from '../components/layout/ExitIntentModal';
import { useExitIntent } from '../hooks/useExitIntent';

gsap.registerPlugin(ScrollTrigger);

/* ─── DATA ─── */
const navLinks = [
  { label: 'Produkte', href: '#services' },
  { label: 'Funktionen', href: '#features' },
  { label: 'So funktioniert\'s', href: '#process' },
];

const stats = [
  { value: `${BETA.freeMonths} Monate`, label: 'Kostenlos testen', icon: Clock },
  { value: `${BETA.discountPercent}%`, label: 'Gründerrabatt für Beta-Partner', icon: Zap },
  { value: '50%+', label: 'Weniger Admin-Aufwand', icon: TrendingUp },
  { value: 'Sofort', label: 'Startklar nach Demo-Call', icon: Zap },
];

const steps = [
  { num: '01', title: 'Kunde konfiguriert', desc: 'Der Endkunde füllt den Solar-Konfigurator auf Ihrer Webseite aus — Dach, Verbrauch, Speicher, Förderungen. In 5 Minuten erledigt.' },
  { num: '02', title: 'Angebot generieren', desc: 'Mit einem Klick erstellt Voltify eine professionelle PDF-Kalkulation mit ROI, BAFA-Förderung und Zahlungsplan.' },
  { num: '03', title: 'Per E-Mail versenden', desc: 'Das Angebot wird direkt an den Kunden versendet — mit Ihrem Branding, Ihren Preisen und Ihren AGB.' },
  { num: '04', title: 'Deal abschließen', desc: 'Vom Lead bis zur Rechnung: Jeder Schritt ist nachvollziehbar. Sie sparen 2 Tage Admin-Aufwand pro Angebot.' },
];

interface ServiceItem {
  icon: React.ElementType;
  title: string;
  desc: string;
  features: string[];
  link: string;
  linkLabel: string;
}

const services: ServiceItem[] = [
  {
    icon: SlidersHorizontal,
    title: 'Solar-Konfigurator',
    desc: 'Deine Kunden konfigurieren ihre Anlage selbst — Dach, Verbrauch, Speicher, Förderungen. Du erhältst den Lead mit allen Daten.',
    features: ['9-Schritt-Wizard für Endkunden', 'Automatische ROI-Berechnung', 'BAFA / KfW Förderungen', 'Lead-Erfassung auf deiner Webseite', 'DSGVO-konform'],
    link: '/konfigurator?demo=1',
    linkLabel: 'Jetzt live testen',
  },
  {
    icon: LayoutDashboard,
    title: 'CRM & Dashboard',
    desc: 'Alle Leads, Projekte und Termine an einem Ort. Kanban-Pipeline, Kalender und Team-Verwaltung — speziell für Solar-Betriebe.',
    features: ['Lead-Pipeline (Kanban)', 'Projekt-Tracking', 'Kalender & Termine', 'Team & Rollen', 'Notizen & Kommunikation'],
    link: '/login',
    linkLabel: 'Demo-Account testen',
  },
  {
    icon: Globe,
    title: 'Digitaler Auftritt',
    desc: 'Deine eigene Webseite mit integriertem Konfigurator — unter deiner Domain, mit deinem Logo, deinen Farben und Kontaktdaten.',
    features: ['Eigene Domain', 'Dein Logo & Branding', 'Konfigurator-Einbindung', 'Lead-Weiterleitung', 'DSGVO-konform'],
    link: '/demo',
    linkLabel: 'Demo-Webseite ansehen',
  },
];

const features = [
  { icon: FileText, title: 'Angebots-PDFs', desc: 'Professionelle Kalkulationen mit Ihrem Branding, Förderungen und Zahlungsplänen — per E-Mail versenden.' },
  { icon: BarChart3, title: 'Umsatz-Reports', desc: 'Verfolgen Sie Conversion-Rate, durchschnittlichen Deal-Wert und Team-Performance in Echtzeit.' },
  { icon: Shield, title: 'DSGVO & Rechtssicherheit', desc: 'AGB-Generator, Datenschutz-Seiten und sichere Datenverarbeitung — alles inklusive.' },
  { icon: Calendar, title: 'Montage-Planung', desc: 'Termine direkt im Kalender planen, Monteure zuweisen und den Projektstatus aktualisieren.' },
  { icon: MessageSquare, title: 'Team-Kommunikation', desc: 'Notizen zu Leads und Projekten hinterlegen — alle Infos zentral, nichts mehr in E-Mails verstreut.' },
  { icon: Briefcase, title: 'Rechnungs-PDFs', desc: 'Abschlags- und Schlussrechnungen mit automatischer Fälligkeitsberechnung und Zahlungsstatus.' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [exitIntent, dismissExitIntent] = useExitIntent();

  // UTM-Params (sl_lead, utm_source, utm_campaign) sofort cachen —
  // damit sie beim späteren Klick auf "Live-Demo ansehen" → /konfigurator noch verfügbar sind.
  useEffect(() => { cacheFunnelSourceFromUrl(); }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.reveal').forEach((el) => {
        gsap.fromTo(el, { y: 30, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%' },
        });
      });
    });

    return () => {
      window.removeEventListener('scroll', onScroll);
      ctx.revert();
    };
  }, []);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Exit-Intent Last-Chance-CTA */}
      {exitIntent && <ExitIntentModal onClose={dismissExitIntent} />}

      {/* ═══════════════ HEADER ═══════════════ */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-[1280px] mx-auto px-6 h-[72px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-[#F5A623] flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#1A3A5C]" fill="currentColor" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-[#1A3A5C]">Voltify</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((l) => (
              <a key={l.label} href={l.href} onClick={(e) => { e.preventDefault(); scrollTo(l.href); }} className="text-sm font-medium text-gray-600 hover:text-[#1A3A5C] transition-colors">
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/beta')}
              className="hidden lg:flex items-center gap-2 bg-[#F5A623] text-[#1A3A5C] text-sm font-bold px-5 py-2.5 rounded-full hover:bg-[#E09000] transition-all"
            >
              Kostenlos testen <ArrowRight className="w-4 h-4" />
            </button>
            <button className="lg:hidden" onClick={() => setMobileOpen(true)}>
              <Menu className="w-6 h-6 text-[#1A3A5C]" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] bg-white">
          <div className="flex justify-end p-6"><button onClick={() => setMobileOpen(false)}><X className="w-6 h-6 text-black" /></button></div>
          <nav className="flex flex-col items-center gap-6 pt-8">
            {navLinks.map((l) => (
              <a key={l.label} href={l.href} onClick={(e) => { e.preventDefault(); scrollTo(l.href); }} className="text-2xl font-medium text-[#1A3A5C]">{l.label}</a>
            ))}
            <button
              onClick={() => { setMobileOpen(false); navigate('/beta'); }}
              className="mt-4 flex items-center gap-2 bg-[#F5A623] text-[#1A3A5C] text-sm font-bold px-6 py-3 rounded-full"
            >
              Kostenlos testen <ArrowRight className="w-4 h-4" />
            </button>
          </nav>
        </div>
      )}

      {/* ═══════════════ HERO ═══════════════ */}
      <section id="home" className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden pt-[72px]">
        <div className="absolute inset-0 z-0">
          <img src="/images/hero-bg.jpg" alt="Solar Anlage" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#E8F4FD]/70 via-[#E8F4FD]/40 to-white" />
        </div>
        <div className="relative z-10 text-center max-w-[840px] mx-auto px-6 py-20">
          <span className="reveal inline-flex items-center gap-2 bg-[#F5A623]/10 backdrop-blur-sm text-sm text-[#1A3A5C] font-bold px-5 py-2 rounded-full border border-[#F5A623]/20 mb-6">
            <Zap className="w-4 h-4 text-[#F5A623]" fill="currentColor" /> 🚀 Beta-Programm — {BETA_COPY.spotsBadge}
          </span>
          <h1 className="reveal text-5xl md:text-6xl lg:text-7xl font-semibold text-[#1A3A5C] leading-[1.05] tracking-tight mb-6">
            Solar-Angebote<br />in <span className="text-[#F5A623]">20 Minuten</span><br />statt 2 Tagen.
          </h1>
          <p className="reveal text-gray-600 text-lg max-w-[600px] mx-auto mb-8 leading-relaxed">
            Die All-in-One-Software für Solo-Solarteure: Deine Kunden konfigurieren selbst, du klickst auf "Versenden". Professionelle Angebots-PDFs mit ROI, Förderungen und Zahlungsplan — automatisch.
          </p>
          <div className="reveal flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/beta')}
              className="inline-flex items-center gap-2 bg-[#F5A623] text-[#1A3A5C] text-base font-bold px-8 py-4 rounded-full hover:bg-[#E09000] transition-all hover:scale-[1.02]"
            >
              Jetzt Beta-Partner werden <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/konfigurator?demo=1')}
              className="inline-flex items-center gap-2 bg-white text-[#1A3A5C] text-base font-medium px-8 py-4 rounded-full border border-gray-200 hover:bg-gray-50 transition-all"
            >
              Live-Demo ansehen
            </button>
          </div>
          <p className="reveal text-xs text-gray-400 mt-4">
            {BETA_COPY.freeTrial} · Keine Kreditkarte · {BETA.callMinutes}-Min Demo-Call
          </p>
        </div>
      </section>


      {/* ═══════════════ STATS ═══════════════ */}
      <section className="py-16 bg-[#F8FAFB]">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="reveal text-3xl md:text-4xl font-semibold text-[#1A3A5C] tracking-tight">Weniger Admin, mehr Abschlüsse</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="reveal bg-white rounded-2xl p-6 text-center border border-gray-100">
                  <div className="w-12 h-12 rounded-xl bg-[#F5A623]/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-[#F5A623]" />
                  </div>
                  <p className="text-3xl font-bold text-[#1A3A5C]">{s.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ SERVICES (3 Produkte) ═══════════════ */}
      <section id="services" className="py-20 md:py-28 bg-white">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-16">
            <span className="reveal text-xs font-semibold text-[#F5A623] uppercase tracking-widest">Unsere Produkte</span>
            <h2 className="reveal text-4xl md:text-5xl font-semibold text-[#1A3A5C] mt-3 tracking-tight">Vom Lead bis zum<br />Angebot — in einem System</h2>
            <p className="reveal text-gray-500 text-base max-w-[600px] mx-auto mt-4 leading-relaxed">
              Der Kunde konfiguriert auf Ihrer Webseite. Sie erhalten den Lead und generieren mit einem Klick eine professionelle PDF-Kalkulation.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="reveal bg-[#F8FAFB] rounded-2xl p-8 border border-gray-100 hover:border-[#1A3A5C]/20 transition-all group">
                  <div className="w-14 h-14 rounded-xl bg-[#F5A623]/10 flex items-center justify-center mb-5 group-hover:bg-[#F5A623]/20 transition-all">
                    <Icon className="w-7 h-7 text-[#F5A623]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#1A3A5C] mb-3">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-6">{s.desc}</p>
                  <ul className="space-y-2 mb-6">
                    {s.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="w-3.5 h-3.5 text-[#F5A623] flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => navigate(s.link)}
                    className="w-full py-3 rounded-xl text-sm font-bold text-center flex items-center justify-center gap-2 transition-colors bg-[#1A3A5C] text-white hover:bg-[#0F2440] cursor-pointer"
                  >
                    {s.linkLabel}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ CRM PREVIEW ═══════════════ */}
      <section id="features" className="py-20 md:py-28 bg-[#F8FAFB]">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="reveal text-xs font-semibold text-[#F5A623] uppercase tracking-widest">CRM-Dashboard</span>
              <h2 className="reveal text-3xl md:text-4xl font-semibold text-[#1A3A5C] mt-3 tracking-tight mb-6">Der Ueberblick, den Sie brauchen</h2>
              <div className="reveal flex flex-col gap-4">
                {[
                  { icon: BarChart3, title: 'Lead-Pipeline', desc: 'Verfolgen Sie jeden Lead vom ersten Kontakt bis zum Abschluss in einer uebersichtlichen Kanban-Ansicht.' },
                  { icon: Calendar, title: 'Terminplanung', desc: 'Planen Sie Besichtigungen, Angebotsgespraeche und Montage-Termine direkt im Kalender.' },
                  { icon: Users, title: 'Team-Verwaltung', desc: 'Weisen Sie Leads an Vertrieb, Projekte an Monteure und behalten Sie alle Zugriffsrechte im Blick.' },
                  { icon: FileText, title: 'Dokumente & Rechnungen', desc: 'Erstellen und versenden Sie Angebots- und Rechnungs-PDFs mit einem Klick — direkt aus dem System.' },
                ].map((f, i) => {
                  const Icon = f.icon;
                  return (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white border border-gray-100">
                      <div className="w-10 h-10 rounded-lg bg-[#F5A623]/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-[#F5A623]" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[#1A3A5C]">{f.title}</h4>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{f.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => navigate('/beta')}
                className="reveal inline-flex items-center gap-2 bg-[#1A3A5C] text-white text-sm font-medium px-6 py-3 rounded-full hover:bg-[#0F2440] transition-all mt-6"
              >
                Jetzt kostenlos testen <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="reveal relative">
              <div className="bg-[#1A1A1A] rounded-2xl p-4 border border-white/10 shadow-2xl">
                <img src="/images/dashboard-bg.jpg" alt="CRM Dashboard Vorschau" className="w-full rounded-xl object-cover aspect-[4/3]" />
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ═══════════════ PROCESS ═══════════════ */}
      <section id="process" className="py-20 md:py-28 bg-white">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-16">
            <span className="reveal text-xs font-semibold text-[#F5A623] uppercase tracking-widest">So funktioniert Voltify</span>
            <h2 className="reveal text-4xl md:text-5xl font-semibold text-[#1A3A5C] mt-3 tracking-tight">Vom Lead bis zur Abrechnung</h2>
            <p className="reveal text-gray-500 text-base max-w-[600px] mx-auto mt-4 leading-relaxed">
              Jeder Schritt ist digitalisiert, nachvollziehbar und skalierbar — damit Sie sich auf das Wesentliche konzentrieren koennen.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={i} className="reveal bg-[#F8FAFB] rounded-2xl p-6 border border-gray-100 hover:border-[#1A3A5C]/20 transition-all relative">
                <span className="absolute -top-3 -left-3 w-10 h-10 bg-[#F5A623] rounded-full flex items-center justify-center text-sm font-bold text-[#1A3A5C]">{s.num}</span>
                <div className="w-12 h-12 rounded-xl bg-[#1A3A5C]/5 flex items-center justify-center mb-4 mt-2">
                  <Sun className="w-6 h-6 text-[#1A3A5C]" />
                </div>
                <h3 className="text-lg font-semibold text-[#1A3A5C] mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ FEATURES (6 Karten) ═══════════════ */}
      <section className="py-20 md:py-28 bg-[#F8FAFB]">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="text-center mb-16">
            <span className="reveal text-xs font-semibold text-[#F5A623] uppercase tracking-widest">Funktionen</span>
            <h2 className="reveal text-4xl md:text-5xl font-semibold text-[#1A3A5C] mt-3 tracking-tight">Alles, was Sie taeglich brauchen</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="reveal bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#1A3A5C]/20 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-[#F5A623]/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-[#F5A623]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1A3A5C] mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA ═══════════════ */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="/images/hero-bg.jpg" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#E8F4FD]/80 via-[#E8F4FD]/60 to-[#E8F4FD]/80" />
        </div>
        <div className="relative z-10 max-w-[640px] mx-auto px-6 text-center">
          <span className="reveal inline-flex items-center gap-2 bg-[#F5A623]/10 text-sm text-[#1A3A5C] font-bold px-4 py-1.5 rounded-full border border-[#F5A623]/20 mb-4">
            <Zap className="w-4 h-4 text-[#F5A623]" fill="currentColor" /> {BETA_COPY.spotsBadge} — Dauerhafter Gründerrabatt
          </span>
          <h2 className="reveal text-4xl md:text-5xl font-semibold text-[#1A3A5C] tracking-tight mb-4">Bereit, dein Solar-Geschäft<br />zu <span className="text-[#F5A623]">skalieren</span>?</h2>
          <p className="reveal text-gray-600 text-base mb-8">{BETA.freeMonths} Monate kostenlos testen. Keine Kreditkarte. Persönlicher Demo-Call. Als Beta-Partner sicherst du dir dauerhaft {BETA.discountPercent}% Rabatt auf jeden Tarif.</p>
          <div className="reveal flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/beta')}
              className="inline-flex items-center gap-2 bg-[#F5A623] text-[#1A3A5C] text-base font-bold px-8 py-4 rounded-full hover:bg-[#E09000] transition-all hover:scale-[1.02]"
            >
              Jetzt Beta-Partner werden <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/konfigurator?demo=1')}
              className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-[#1A3A5C] text-base font-medium px-8 py-4 rounded-full border border-[#1A3A5C]/10 hover:bg-white transition-all"
            >
              Live-Demo ansehen
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="bg-[#1A3A5C] pt-16 pb-8">
        <div className="max-w-[1280px] mx-auto px-6">
          {/* Top */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
            <div>
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-full bg-[#F5A623] flex items-center justify-center">
                  <Zap className="w-4 h-4 text-[#1A3A5C]" fill="currentColor" />
                </div>
                <span className="text-xl font-semibold text-white tracking-tight">Voltify</span>
              </Link>
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Produkt</p>
                  <div className="flex flex-col gap-2">
                    <a href="#services" onClick={(e) => { e.preventDefault(); scrollTo('#services'); }} className="text-sm text-white/70 hover:text-white transition-colors">Produkte</a>
                    <a href="#features" onClick={(e) => { e.preventDefault(); scrollTo('#features'); }} className="text-sm text-white/70 hover:text-white transition-colors">Funktionen</a>
                    <a href="#process" onClick={(e) => { e.preventDefault(); scrollTo('#process'); }} className="text-sm text-white/70 hover:text-white transition-colors">Ablauf</a>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Unternehmen</p>
                  <div className="flex flex-col gap-2">
                    <Link to="/preise" className="text-sm text-white/70 hover:text-white transition-colors">Preise</Link>
                    <Link to="/beta" className="text-sm text-white/70 hover:text-white transition-colors">Beta-Programm</Link>
                    <Link to="/konfigurator?demo=1" className="text-sm text-white/70 hover:text-white transition-colors">Live-Demo</Link>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Account</p>
                  <div className="flex flex-col gap-2">
                    <Link to="/login" className="text-sm text-white/70 hover:text-white transition-colors">Anmelden</Link>
                    <Link to="/datenschutz" className="text-sm text-white/70 hover:text-white transition-colors">Datenschutz</Link>
                    <Link to="/impressum" className="text-sm text-white/70 hover:text-white transition-colors">Impressum</Link>
                  </div>
                </div>
              </div>
            </div>
            {/* Newsletter */}
            <div className="bg-white rounded-2xl p-8">
              <h3 className="text-2xl font-semibold text-[#1A3A5C] mb-2">Neuigkeiten und Updates<br />zu Voltify.</h3>
              <p className="text-sm text-gray-500 mb-6">Erhalten Sie Tipps zur Digitalisierung Ihres Solar-Betriebs.</p>
              <div className="flex">
                <input type="email" placeholder="E-Mail-Adresse" className="flex-1 bg-gray-100 rounded-l-full px-5 py-3 text-sm text-[#1A3A5C] placeholder:text-gray-400 focus:outline-none" />
                <button className="bg-[#1A3A5C] text-white text-sm font-medium px-6 py-3 rounded-r-full hover:bg-[#0F2440] transition-colors">Abonnieren</button>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/40">All-in-One Software fuer Solar-Betriebe. Lead-Management, Konfigurator & digitaler Auftritt.</p>
            <p className="text-xs text-white/40">&copy; 2026 Voltify. Alle Rechte vorbehalten.</p>
            <div className="flex items-center gap-4">
              <Link to="/datenschutz" className="text-xs text-white/40 hover:text-white">Datenschutz</Link>
              <Link to="/agb" className="text-xs text-white/40 hover:text-white">AGB</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
