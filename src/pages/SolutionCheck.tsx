// PROJECT: Voltify | PURPOSE: Geführter Lösungs-Check für Installateure (Schmerz → Modul → Demo + Call)
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, ArrowLeft, Zap, CheckCircle, Sparkles, Calendar, Loader2, Check,
} from 'lucide-react';
import SEO from '../components/seo/SEO';
import { supabase } from '../lib/supabase';
import { BETA, BETA_COPY } from '../lib/betaConfig';
import {
  IDENTITY_QUESTION, INSTALLER_QUESTIONS, PRIORITY_QUESTION, VOLUME_QUESTION,
  evaluateCheck, type CheckAnswers, type CheckQuestion, type CheckResult, type CheckRole,
} from '../lib/solutionCheck';

type Phase = 'q' | 'contact' | 'result';

// Baut den Fragen-Fluss abhängig von der Rolle (Beta: voller Pfad nur für Installateure).
function buildQuestions(role?: CheckRole): CheckQuestion[] {
  if (role === 'installer') {
    return [IDENTITY_QUESTION, ...INSTALLER_QUESTIONS, PRIORITY_QUESTION, VOLUME_QUESTION];
  }
  return [IDENTITY_QUESTION];
}

const NAVY = '#1A3A5C';
const ACCENT = '#F5A623';

export default function SolutionCheck() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('q');
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<CheckAnswers>({});
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [result, setResult] = useState<CheckResult | null>(null);

  const flow = buildQuestions(answers.role);
  const q = flow[qIndex];
  const isInstaller = answers.role === 'installer';
  const progress = phase === 'result' ? 100 : Math.round(((qIndex + (phase === 'contact' ? 1 : 0)) / (flow.length + 1)) * 100);

  function selectOption(qid: keyof CheckAnswers, value: string) {
    const next = { ...answers, [qid]: value };
    setAnswers(next);
    // Nicht-Installateur nach Identitätsfrage → direkt zum Kontakt (Beta-Scope)
    if (qid === 'role' && value !== 'installer') { setPhase('contact'); return; }
    const nextFlow = buildQuestions(next.role);
    if (qIndex < nextFlow.length - 1) setQIndex(qIndex + 1);
    else setPhase('contact');
  }

  function goBack() {
    if (phase === 'result') return;
    if (phase === 'contact') {
      setPhase('q');
      setQIndex(Math.max(0, buildQuestions(answers.role).length - 1));
      return;
    }
    if (qIndex > 0) setQIndex(qIndex - 1);
    else navigate('/');
  }

  async function submit() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSubmitError('Bitte gib eine gültige E-Mail-Adresse ein.');
      return;
    }
    setSubmitError('');
    setSubmitting(true);
    const res = isInstaller ? evaluateCheck(answers) : null;
    // fire-and-forget Persistenz — darf das Ergebnis nie blockieren
    void supabase.from('solution_check_responses').insert({
      role: answers.role ?? null,
      answers,
      recommended_module: res?.hero.key ?? null,
      name: name || null,
      email,
    }).then(() => {});
    setResult(res);
    setPhase('result');
    setSubmitting(false);
  }

  return (
    <>
      <SEO
        title="Lösungs-Check für Solarteure"
        description="In 60 Sekunden herausfinden, welcher Teil von Voltify deinem Solar-Geschäft am meisten bringt — inkl. passender Demo."
        canonical="/check"
        noindex
      />
      <div className="min-h-screen bg-gradient-to-b from-[#F8FAFC] to-white flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-5 py-4 max-w-3xl mx-auto w-full">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: ACCENT }}>
              <Zap className="w-4 h-4" style={{ color: NAVY }} fill="currentColor" />
            </div>
            <span className="font-bold text-lg" style={{ color: NAVY }}>Voltify</span>
          </Link>
          {/* Fluchtweg für die Entschlossenen */}
          <Link to="/konfigurator?demo=1" className="text-sm text-gray-400 hover:text-[#1A3A5C] transition-colors">
            Ich weiß schon was ich will → Demo
          </Link>
        </header>

        {/* Progress */}
        <div className="max-w-3xl mx-auto w-full px-5">
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, backgroundColor: ACCENT }} />
          </div>
        </div>

        <main className="flex-1 max-w-3xl mx-auto w-full px-5 py-8 md:py-12">
          {phase === 'q' && q && (
            <QuestionView
              key={q.id}
              question={q}
              selected={answers[q.id] as string | undefined}
              onSelect={(v) => selectOption(q.id, v)}
              onSkip={q.optional ? () => setPhase('contact') : undefined}
              onBack={goBack}
            />
          )}

          {phase === 'contact' && (
            <ContactView
              name={name} email={email}
              onName={setName} onEmail={setEmail}
              submitting={submitting} error={submitError}
              onSubmit={submit} onBack={goBack}
            />
          )}

          {phase === 'result' && (
            <ResultView result={result} name={name} isInstaller={isInstaller} />
          )}
        </main>
      </div>
    </>
  );
}

// ── Einzelne Frage (Single-Select, Auto-Advance) ──
function QuestionView({
  question, selected, onSelect, onSkip, onBack,
}: {
  question: CheckQuestion;
  selected?: string;
  onSelect: (v: string) => void;
  onSkip?: () => void;
  onBack: () => void;
}) {
  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#1A3A5C] mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Zurück
      </button>
      <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: NAVY }}>{question.question}</h1>
      {question.subline && <p className="text-gray-500 mb-8">{question.subline}</p>}
      <div className="flex flex-col gap-3">
        {question.options.map((opt) => {
          const active = selected === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onSelect(opt.value)}
              className={`group flex items-center justify-between gap-3 text-left px-5 py-4 rounded-2xl border-2 transition-all ${
                active ? 'border-[#F5A623] bg-[#F5A623]/5' : 'border-gray-200 bg-white hover:border-[#1A3A5C]/30 hover:bg-gray-50'
              }`}
            >
              <span className="font-medium" style={{ color: NAVY }}>{opt.label}</span>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                active ? 'bg-[#F5A623] text-white' : 'bg-gray-100 text-transparent group-hover:bg-gray-200'
              }`}>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </button>
          );
        })}
      </div>
      {onSkip && (
        <button onClick={onSkip} className="mt-6 text-sm text-gray-400 hover:text-[#1A3A5C] transition-colors">
          Überspringen
        </button>
      )}
    </div>
  );
}

// ── Kontakt-Step ──
function ContactView({
  name, email, onName, onEmail, submitting, error, onSubmit, onBack,
}: {
  name: string; email: string;
  onName: (v: string) => void; onEmail: (v: string) => void;
  submitting: boolean; error: string;
  onSubmit: () => void; onBack: () => void;
}) {
  return (
    <div className="max-w-lg">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#1A3A5C] mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Zurück
      </button>
      <span className="inline-flex items-center gap-1.5 bg-[#F5A623]/10 text-[#B8780A] text-xs font-bold px-3 py-1 rounded-full mb-3">
        <Sparkles className="w-3.5 h-3.5" /> Fast geschafft
      </span>
      <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: NAVY }}>Wohin schicken wir deine Auswertung?</h1>
      <p className="text-gray-500 mb-8">Du siehst dein Ergebnis sofort — und bekommst es zusätzlich per E-Mail.</p>
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium text-gray-600 mb-1.5 block">Dein Name (optional)</label>
          <input
            value={name} onChange={(e) => onName(e.target.value)}
            placeholder="Max Mustermann"
            className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-[#1A3A5C] focus:outline-none focus:border-[#F5A623]/60"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600 mb-1.5 block">E-Mail-Adresse *</label>
          <input
            type="email" value={email} onChange={(e) => onEmail(e.target.value)}
            placeholder="max@solar-betrieb.de"
            className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-[#1A3A5C] focus:outline-none focus:border-[#F5A623]/60"
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          onClick={onSubmit} disabled={submitting}
          className="flex items-center justify-center gap-2 bg-[#1A3A5C] text-white font-bold py-3.5 rounded-xl hover:bg-[#13304d] transition-colors disabled:opacity-60"
        >
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Auswertung anzeigen <ArrowRight className="w-4 h-4" /></>}
        </button>
        <p className="text-xs text-gray-400 text-center">Keine Werbung. Nur deine Auswertung + ein optionales Gesprächsangebot.</p>
      </div>
    </div>
  );
}

// ── Auswertung ──
function ResultView({ result, name, isInstaller }: { result: CheckResult | null; name: string; isInstaller: boolean }) {
  const greeting = name ? `${name}, ` : '';

  // Nicht-Installateur (Beta-Scope) → direktes Gesprächsangebot
  if (!isInstaller || !result) {
    return (
      <div className="text-center max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-full bg-[#F5A623]/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-[#F5A623]" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: NAVY }}>Danke{name ? `, ${name}` : ''}!</h1>
        <p className="text-gray-500 mb-8">
          Der geführte Check ist gerade auf Installateure zugeschnitten — aber für Vertriebsagenturen haben wir
          eine eigene Lösung. Lass uns am besten kurz direkt sprechen.
        </p>
        <BookingCta />
      </div>
    );
  }

  const { hero, reasons, alsoRelevant, timeSavedHint } = result;
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1.5 bg-[#F5A623]/10 text-[#B8780A] text-xs font-bold px-3 py-1 rounded-full mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Deine Auswertung
        </span>
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: NAVY }}>
          {greeting}dein größter Hebel ist <span style={{ color: ACCENT }}>{hero.name}</span>
        </h1>
      </div>

      {/* Hero-Karte */}
      <div className="bg-white rounded-2xl border-2 border-[#F5A623]/30 p-6 mb-5 shadow-sm">
        <p className="text-gray-600 mb-5">{hero.tagline}</p>
        {reasons.length > 0 && (
          <div className="flex flex-col gap-2 mb-5">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Warum genau das</p>
            {reasons.map((r, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#F5A623] mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">{r}</span>
              </div>
            ))}
          </div>
        )}
        {timeSavedHint && (
          <div className="bg-[#1A3A5C]/5 rounded-xl p-3 mb-5 text-sm text-[#1A3A5C]">💡 {timeSavedHint}</div>
        )}
        <Link
          to={hero.demoHref}
          className="flex items-center justify-center gap-2 bg-[#1A3A5C] text-white font-bold py-3.5 rounded-xl hover:bg-[#13304d] transition-colors"
        >
          {hero.demoLabel} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Flywheel-Andeutung */}
      {alsoRelevant.length > 0 && (
        <div className="bg-gray-50 rounded-2xl p-5 mb-5">
          <p className="text-sm text-gray-600 mb-3">
            <span className="font-semibold" style={{ color: NAVY }}>Das hängt zusammen:</span> Bei dir greift mehr als ein Baustein.
            Voltify ist eine Plattform — du startest mit dem größten Hebel, der Rest wächst mit.
          </p>
          <div className="flex flex-wrap gap-2">
            {alsoRelevant.map((m) => (
              <span key={m.key} className="text-xs font-medium bg-white border border-gray-200 text-gray-500 px-3 py-1.5 rounded-full">
                + {m.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Booking */}
      <BookingCta />
    </div>
  );
}

function BookingCta() {
  return (
    <div className="bg-gradient-to-br from-[#1A3A5C] to-[#0F2440] rounded-2xl p-6 text-center">
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div><p className="text-lg font-bold text-white">{BETA.freeMonths} Mo.</p><p className="text-[10px] text-white/50">Kostenlos</p></div>
        <div><p className="text-lg font-bold text-[#F5A623]">-{BETA.discountPercent}%</p><p className="text-[10px] text-white/50">Dauerhaft</p></div>
        <div><p className="text-lg font-bold text-white">{BETA.callMinutes} min</p><p className="text-[10px] text-white/50">Demo-Call</p></div>
      </div>
      <p className="text-white/80 text-sm mb-4">{BETA_COPY.spotsBadge} — lass uns deine Situation in einem kurzen Call durchgehen.</p>
      <a
        href={BETA.calendlyUrl} target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 bg-[#F5A623] text-[#1A3A5C] font-bold py-3.5 rounded-xl hover:bg-[#E09000] transition-colors"
      >
        <Calendar className="w-4 h-4" /> Kostenlosen Demo-Call buchen
      </a>
    </div>
  );
}
