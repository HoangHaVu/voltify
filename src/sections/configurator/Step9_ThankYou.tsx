import { CheckCircle, Mail, FileText, Phone, ArrowRight, RotateCcw, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BETA, BETA_COPY } from '../../lib/betaConfig';

interface Props {
  /** Demo-Modus: Konfigurator wird von einem Installateur getestet (pre-launch).
   *  Pivotiert das Ende zum Beta-CTA statt zur Endkunden-Bestätigung. */
  demoMode?: boolean;
}

const nextSteps = [
  {
    icon: FileText,
    title: 'Prüfung der Daten',
    desc: 'Die Konfiguration wird innerhalb von 24 Stunden analysiert.',
    time: '24h',
  },
  {
    icon: Mail,
    title: 'Persönliches Angebot',
    desc: 'Ein maßgeschneidertes Angebot landet per E-Mail beim Kunden.',
    time: '48h',
  },
  {
    icon: Phone,
    title: 'Kostenlose Beratung',
    desc: 'Bei Fragen folgt ein telefonischer Rückruf — unverbindlich.',
    time: '72h',
  },
];

export default function Step9_ThankYou({ demoMode = true }: Props) {
  const navigate = useNavigate();

  // ─── DEMO-MODUS: Installateur am Wow-Punkt → Beta-Pivot ───
  if (demoMode) {
    return (
      <div className="flex flex-col items-center text-center py-8">
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-[#F5A623]/10 flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-[#F5A623]" />
        </div>

        {/* Heading — pivot zur Installateur-Perspektive */}
        <span className="inline-flex items-center gap-1.5 bg-[#F5A623]/10 text-[#F5A623] text-xs font-bold px-3 py-1 rounded-full mb-3">
          <Zap className="w-3.5 h-3.5" fill="currentColor" /> {BETA_COPY.spotsBadge}
        </span>
        <h2 className="text-2xl md:text-3xl font-semibold text-[#1A3A5C] mb-2">
          Stark, oder? Das war die Kundensicht.
        </h2>
        <p className="text-gray-500 text-sm max-w-[440px] mb-8">
          Genau so konfigurieren deine Kunden ihre Anlage — und du bekommst den Lead
          mit allen Daten frei Haus. Willst du das auf <span className="font-semibold text-[#1A3A5C]">deiner</span> Webseite?
        </p>

        {/* Beta Value Card */}
        <div className="w-full max-w-[440px] bg-gradient-to-br from-[#1A3A5C] to-[#0F2440] rounded-2xl p-6 mb-6 text-left">
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="text-center">
              <p className="text-xl font-bold text-white">{BETA.freeMonths} Mo.</p>
              <p className="text-[10px] text-white/50">Kostenlos</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-[#F5A623]">-{BETA.discountPercent}%</p>
              <p className="text-[10px] text-white/50">Dauerhaft</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-white">{BETA.callMinutes} min</p>
              <p className="text-[10px] text-white/50">Demo-Call</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/beta')}
            className="w-full flex items-center justify-center gap-2 bg-[#F5A623] text-[#1A3A5C] font-bold py-3.5 rounded-xl hover:bg-[#E09000] transition-colors"
          >
            Beta-Partner werden <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Endkunden-Automatik als Beweis */}
        <div className="w-full max-w-[440px] mb-8">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">
            Was danach automatisch für deinen Kunden passiert
          </p>
          <div className="flex flex-col gap-2">
            {nextSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/60 backdrop-blur-sm border border-gray-200 text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#1A3A5C] flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#1A3A5C]">{step.title}</p>
                    <p className="text-xs text-gray-500">{step.desc}</p>
                  </div>
                  <span className="text-[10px] bg-[#F5A623]/10 text-[#F5A623] px-1.5 py-0.5 rounded font-medium shrink-0">~{step.time}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Secondary CTA */}
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#1A3A5C] transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Demo nochmal durchklicken
        </button>
      </div>
    );
  }

  // ─── ECHTBETRIEB: Endkunde hat konfiguriert (eingebettet beim Installateur) ───
  return (
    <div className="flex flex-col items-center text-center py-8">
      <div className="w-20 h-20 rounded-full bg-[#F5A623]/10 flex items-center justify-center mb-6">
        <CheckCircle className="w-10 h-10 text-[#F5A623]" />
      </div>
      <h2 className="text-2xl md:text-3xl font-semibold text-[#1A3A5C] mb-2">Vielen Dank!</h2>
      <p className="text-gray-500 text-sm max-w-[400px] mb-8">
        Ihre Anfrage wurde erfolgreich übermittelt. Wir erstellen jetzt Ihr individuelles Solarangebot.
      </p>
      <div className="w-full max-w-[500px] flex flex-col gap-4 mb-10">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Was passiert als Nächstes?</p>
        {nextSteps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div
              key={i}
              className="flex items-start gap-4 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-gray-200 text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-[#1A3A5C] flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-[#1A3A5C]">{step.title}</p>
                  <span className="text-[10px] bg-[#F5A623]/10 text-[#F5A623] px-1.5 py-0.5 rounded font-medium">~{step.time}</span>
                </div>
                <p className="text-xs text-gray-500">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
      <button
        onClick={() => navigate('/')}
        className="text-sm text-gray-400 hover:text-[#1A3A5C] transition-colors"
      >
        Zurück zur Startseite
      </button>
    </div>
  );
}
