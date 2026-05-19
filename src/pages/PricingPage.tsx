import { Link } from 'react-router-dom';
import {
  Check, Zap, Crown, Building2, ArrowRight, Sun,
  Users, BarChart3, FileText, Shield, Headphones,
} from 'lucide-react';

const TIERS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '149',
    period: '/ Monat',
    users: '1 Nutzer',
    description: 'Ideal für Einzelunternehmer, die ihre ersten Leads digital verwalten möchten.',
    icon: Zap,
    color: '#F5A623',
    features: [
      'Lead-Management (unbegrenzt)',
      'Kalender & Terminplanung',
      'Grundlegende Reports',
      'E-Mail-Benachrichtigungen',
      '1 Mitarbeiter',
      'Community Support',
    ],
    excluded: [
      'Team-Verwaltung',
      'Erweiterte Analytics',
      'API & Webhooks',
      'Prioritäts-Support',
    ],
    cta: 'Kostenlos testen',
    popular: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '299',
    period: '/ Monat',
    users: '5 Nutzer',
    description: 'Für wachsende Teams, die professionelle Prozesse und Teamarbeit brauchen.',
    icon: Crown,
    color: '#F5A623',
    features: [
      'Alles aus Starter',
      'Team-Verwaltung (5 Nutzer)',
      'Erweiterte Reports & KPIs',
      'Angebots- & Rechnungs-PDFs',
      'Rabatt-Code System',
      'Pipeline-Ansicht',
      'E-Mail-Versand',
      'Prioritäts-Support',
    ],
    excluded: [
      'API & Webhooks',
      'Dedizierter Account Manager',
    ],
    cta: '14 Tage kostenlos testen',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '599',
    period: '/ Monat',
    users: 'Unbegrenzte Nutzer',
    description: 'Für etablierte Unternehmen mit komplexen Anforderungen und White-Labeling.',
    icon: Building2,
    color: '#F5A623',
    features: [
      'Alles aus Professional',
      'Unbegrenzte Nutzer',
      'API & Webhooks',
      'White-Label Branding',
      'Benutzerdefinierte Workflows',
      'Erweiterte Berechtigungen',
      'Dedizierter Account Manager',
      'SLA-Garantie',
      'Onboarding-Support',
    ],
    excluded: [],
    cta: 'Enterprise-Anfrage',
    popular: false,
  },
];

const FAQS = [
  {
    q: 'Kann ich jederzeit upgraden oder downgraden?',
    a: 'Ja, Sie können jederzeit zwischen den Tarifen wechseln. Die Änderung wird zum nächsten Abrechnungszyklus aktiv.',
  },
  {
    q: 'Gibt es eine Mindestlaufzeit?',
    a: 'Nein, alle Tarife sind monatlich kündbar. Enterprise-Kunden können auch Jahresverträge mit Rabatt abschließen.',
  },
  {
    q: 'Was passiert mit meinen Daten bei Kündigung?',
    a: 'Ihre Daten bleiben 90 Tage nach Kündigung gespeichert, damit Sie genug Zeit für einen Export haben. Danach werden sie DSGVO-konform gelöscht.',
  },
  {
    q: 'Ist der Konfigurator im Starter-Tarif enthalten?',
    a: 'Ja, der Solar-Konfigurator ist in allen Tarifen enthalten. Die Lead-Erfassung und Weiterleitung funktioniert immer.',
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      {/* ── Header ── */}
      <header className="border-b border-white/5 bg-[#0F0F0F]">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-[#F5A623]/10 flex items-center justify-center">
              <Sun className="w-5 h-5 text-[#F5A623]" />
            </div>
            <span className="font-black text-lg text-white tracking-tight">Voltify</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors font-semibold">
              Anmelden
            </Link>
            <Link
              to="/beta"
              className="text-sm font-bold px-4 py-2 bg-[#F5A623] text-[#1A3A5C] rounded-xl hover:bg-[#E09000] transition-colors"
            >
              Kostenlos testen
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="pt-16 pb-12 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5A623]/10 text-[#F5A623] text-xs font-bold mb-6">
            <Zap className="w-3.5 h-3.5" />
            Transparente Preise, keine versteckten Kosten
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            Wähle den passenden<br />
            <span className="text-[#F5A623]">Tarif</span> für dein Team
          </h1>
          <p className="text-gray-400 text-lg max-w-lg mx-auto">
            Starte kostenlos, skaliere mit deinem Geschäft. Alle Tarife inkl. Solar-Konfigurator.
          </p>
        </div>
      </section>

      {/* ── Pricing Cards ── */}
      <section className="pb-20 px-6">
        <div className="max-w-[1100px] mx-auto grid md:grid-cols-3 gap-5">
          {TIERS.map((tier) => {
            const Icon = tier.icon;
            return (
              <div
                key={tier.id}
                className={`relative rounded-2xl border p-6 flex flex-col ${
                  tier.popular
                    ? 'border-[#F5A623]/30 bg-[#1A1A1A] shadow-xl shadow-[#F5A623]/5'
                    : 'border-white/5 bg-[#1A1A1A]/50 hover:bg-[#1A1A1A] transition-colors'
                }`}
              >
                {/* Popular Badge */}
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#F5A623] text-[#1A3A5C] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                      Beliebt
                    </span>
                  </div>
                )}

                {/* Tier Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${tier.color}15` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: tier.color }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">{tier.name}</h3>
                    <p className="text-xs text-gray-500">{tier.users}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm text-gray-400">€</span>
                    <span className="text-4xl font-black text-white">{tier.price}</span>
                    <span className="text-sm text-gray-400">{tier.period}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{tier.description}</p>
                </div>

                {/* Features */}
                <div className="flex-1 space-y-2.5 mb-6">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#F5A623] shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </div>
                  ))}
                  {tier.excluded.map((feature) => (
                    <div key={feature} className="flex items-start gap-2 opacity-40">
                      <div className="w-4 h-4 rounded-full border border-gray-600 shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-500 line-through">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link
                  to="/beta"
                  className={`w-full py-3 rounded-xl text-sm font-bold text-center flex items-center justify-center gap-2 transition-colors ${
                    tier.popular
                      ? 'bg-[#F5A623] text-[#1A3A5C] hover:bg-[#E09000]'
                      : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                  }`}
                >
                  {tier.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Feature Comparison ── */}
      <section className="py-16 px-6 border-t border-white/5">
        <div className="max-w-[900px] mx-auto">
          <h2 className="text-2xl font-black text-white text-center mb-10">
            Funktions-<span className="text-[#F5A623]">Vergleich</span>
          </h2>

          <div className="bg-[#1A1A1A] rounded-2xl border border-white/5 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-4 gap-4 px-6 py-4 bg-white/5 border-b border-white/5 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <span>Funktion</span>
              <span className="text-center">Starter</span>
              <span className="text-center text-[#F5A623]">Professional</span>
              <span className="text-center">Enterprise</span>
            </div>

            {/* Rows */}
            {[
              { label: 'Nutzer', starter: '1', pro: '5', enterprise: 'Unbegrenzt' },
              { label: 'Lead-Management', starter: '✓', pro: '✓', enterprise: '✓' },
              { label: 'Solar-Konfigurator', starter: '✓', pro: '✓', enterprise: '✓' },
              { label: 'Kalender & Termine', starter: '✓', pro: '✓', enterprise: '✓' },
              { label: 'Pipeline-Ansicht', starter: '—', pro: '✓', enterprise: '✓' },
              { label: 'Team-Verwaltung', starter: '—', pro: '✓', enterprise: '✓' },
              { label: 'Angebots-PDF', starter: '—', pro: '✓', enterprise: '✓' },
              { label: 'Rechnungs-PDF', starter: '—', pro: '✓', enterprise: '✓' },
              { label: 'Erweiterte Reports', starter: '—', pro: '✓', enterprise: '✓' },
              { label: 'Rabatt-System', starter: '—', pro: '✓', enterprise: '✓' },
              { label: 'E-Mail-Versand', starter: '—', pro: '✓', enterprise: '✓' },
              { label: 'API & Webhooks', starter: '—', pro: '—', enterprise: '✓' },
              { label: 'White-Label', starter: '—', pro: '—', enterprise: '✓' },
              { label: 'Dedizierter Support', starter: '—', pro: '—', enterprise: '✓' },
            ].map((row, i) => (
              <div
                key={row.label}
                className={`grid grid-cols-4 gap-4 px-6 py-3 text-sm ${
                  i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'
                }`}
              >
                <span className="text-gray-300 font-medium">{row.label}</span>
                <span className="text-center text-gray-500">{row.starter}</span>
                <span className="text-center text-[#F5A623] font-bold">{row.pro}</span>
                <span className="text-center text-gray-500">{row.enterprise}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 px-6 border-t border-white/5">
        <div className="max-w-[700px] mx-auto">
          <h2 className="text-2xl font-black text-white text-center mb-10">
            Häufig gestellte <span className="text-[#F5A623]">Fragen</span>
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-[#1A1A1A] rounded-xl border border-white/5 p-5">
                <h3 className="text-sm font-bold text-white mb-2">{faq.q}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Footer ── */}
      <section className="py-16 px-6 border-t border-white/5">
        <div className="max-w-[600px] mx-auto text-center">
          <h2 className="text-2xl font-black text-white mb-3">
            Bereit, dein Solar-Geschäft zu <span className="text-[#F5A623]">skalieren</span>?
          </h2>
          <p className="text-gray-400 mb-6">
            Starte mit 14 Tagen kostenlos. Keine Kreditkarte nötig.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/beta"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#F5A623] text-[#1A3A5C] rounded-xl text-sm font-bold hover:bg-[#E09000] transition-colors"
            >
              <Zap className="w-4 h-4" />
              Kostenlos testen
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/10 text-white rounded-xl text-sm font-bold hover:bg-white/5 transition-colors"
            >
              Mehr erfahren
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-6 px-6">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© 2025 Voltify GmbH. Alle Rechte vorbehalten.</p>
          <div className="flex gap-4">
            <Link to="/datenschutz" className="hover:text-white transition-colors">Datenschutz</Link>
            <Link to="/impressum" className="hover:text-white transition-colors">Impressum</Link>
            <Link to="/beta" className="hover:text-white transition-colors">Beta-Programm</Link>
            <Link to="/login" className="hover:text-white transition-colors">Anmelden</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
