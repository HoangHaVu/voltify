// PROJECT: Voltify | PURPOSE: Lösungs-Check — Schmerz-Diagnose → Modul-Empfehlung (Installateur-Pfad)
// Fragt nach der Welt des Installateurs (nie nach Modulen). Die Übersetzung Schmerz→Modul
// passiert in evaluateCheck(). Persistierte Antworten = Founder-Learning-Datensatz.

export type CheckRole = 'installer' | 'agency' | 'other';
export type ModuleKey = 'lead-funnel' | 'crm' | 'offer';

export interface CheckOption {
  value: string;
  label: string;
  // Signalisiert akuten Schmerz für dieses Modul (für Begründung + Founder-Daten)
  painFor?: ModuleKey;
}

export interface CheckQuestion {
  id: keyof CheckAnswers;
  question: string;
  subline?: string;
  optional?: boolean;
  options: CheckOption[];
}

export interface CheckAnswers {
  role?: CheckRole;
  leads?: string;
  offers?: string;
  manage?: string;
  priority?: ModuleKey;
  volume?: string;
}

// ── Frage 1: Identität (routet den Rest; Beta = nur Installateur-Pfad aktiv) ──
export const IDENTITY_QUESTION: CheckQuestion = {
  id: 'role',
  question: 'Was beschreibt dich am besten?',
  subline: 'Damit der Check zu deinem Geschäft passt.',
  options: [
    { value: 'installer', label: 'Installateur / Solarteur — ich installiere selbst' },
    { value: 'agency', label: 'Vertriebsagentur — ich generiere Leads & gebe sie an Partner' },
    { value: 'other', label: 'Etwas anderes' },
  ],
};

// ── Frage 2–4: Diagnose (Installateur-Pfad) ──
export const INSTALLER_QUESTIONS: CheckQuestion[] = [
  {
    id: 'leads',
    question: 'Wie kommst du heute an neue Anfragen?',
    subline: 'Dein wichtigster Wachstums-Hebel.',
    options: [
      { value: 'referral', label: 'Vor allem über Empfehlungen / Mundpropaganda', painFor: 'lead-funnel' },
      { value: 'website', label: 'Über meine eigene Website' },
      { value: 'bought', label: 'Ich kaufe Leads über Portale ein' },
      { value: 'too-few', label: 'Ehrlich gesagt: zu wenige oder unzuverlässig', painFor: 'lead-funnel' },
    ],
  },
  {
    id: 'offers',
    question: 'Wie erstellst du heute deine Angebote?',
    options: [
      { value: 'manual', label: 'Per Hand, Word oder Excel', painFor: 'offer' },
      { value: 'software', label: 'Mit einer anderen Software' },
      { value: 'supplier', label: 'Mein Großhändler macht das für mich' },
      { value: 'too-slow', label: 'Dauert mir zu lang / sieht unprofessionell aus', painFor: 'offer' },
    ],
  },
  {
    id: 'manage',
    question: 'Wo verwaltest du Anfragen & Kunden?',
    options: [
      { value: 'head', label: 'Im Kopf, auf Zetteln oder in WhatsApp', painFor: 'crm' },
      { value: 'excel', label: 'In einer Excel-Tabelle', painFor: 'crm' },
      { value: 'crm', label: 'In einer richtigen CRM-Software' },
      { value: 'lost', label: 'Anfragen gehen verloren / Follow-ups vergesse ich', painFor: 'crm' },
    ],
  },
];

// ── Frage 5: Priorität (bestimmt das Hero-Modul + welche Demo) ──
export const PRIORITY_QUESTION: CheckQuestion = {
  id: 'priority',
  question: 'Wenn du EIN Problem sofort lösen könntest — welches?',
  subline: 'Das bestimmt, wo du den größten Hebel hast.',
  options: [
    { value: 'lead-funnel', label: 'Mehr & bessere Anfragen bekommen' },
    { value: 'offer', label: 'Schneller & professioneller anbieten' },
    { value: 'crm', label: 'Den Überblick über meine Kunden behalten' },
  ],
};

// ── Frage 6: Quantifizierer (optional, überspringbar) ──
export const VOLUME_QUESTION: CheckQuestion = {
  id: 'volume',
  question: 'Wie viele Angebote schreibst du ungefähr pro Monat?',
  subline: 'Optional — hilft uns, deine Zeitersparnis konkret zu schätzen.',
  optional: true,
  options: [
    { value: '0-5', label: 'Bis zu 5' },
    { value: '6-15', label: '6 bis 15' },
    { value: '16-30', label: '16 bis 30' },
    { value: '30+', label: 'Mehr als 30' },
  ],
};

export interface ModuleInfo {
  key: ModuleKey;
  name: string;
  tagline: string;
  demoHref: string;
  demoLabel: string;
}

export const MODULES: Record<ModuleKey, ModuleInfo> = {
  'lead-funnel': {
    key: 'lead-funnel',
    name: 'Solar-Konfigurator (Lead-Funnel)',
    tagline: 'Verwandelt Website-Besucher in qualifizierte Anfragen — mit Wirtschaftlichkeits-Analyse, die verkauft.',
    demoHref: '/konfigurator?demo=1',
    demoLabel: 'Lead-Funnel live ausprobieren',
  },
  offer: {
    key: 'offer',
    name: 'Angebots-Konfigurator',
    tagline: 'Professionelle Angebote in Minuten statt Stunden — als PDF, direkt per E-Mail, mit deinem Branding.',
    demoHref: '/login',
    demoLabel: 'Angebots-Konfigurator ansehen',
  },
  crm: {
    key: 'crm',
    name: 'Solar-CRM',
    tagline: 'Jede Anfrage, jeder Kunde, jedes Follow-up an einem Ort — kein Lead geht mehr verloren.',
    demoHref: '/login',
    demoLabel: 'CRM-Demo ansehen',
  },
};

export interface CheckResult {
  hero: ModuleInfo;
  reasons: string[];          // ehrliche Begründung aus den Diagnose-Antworten
  alsoRelevant: ModuleInfo[]; // weitere erkannte Schmerzen → Flywheel-Andeutung
  timeSavedHint?: string;     // nur bei gesetztem volume + zeitbezogenem Schmerz
}

// Begründungs-Texte je (Frage, Antwort) mit Schmerz-Signal.
const REASONS: Partial<Record<keyof CheckAnswers, Record<string, string>>> = {
  leads: {
    'too-few': 'Du bekommst aktuell zu wenige verlässliche Anfragen.',
    referral: 'Du hängst stark an Empfehlungen — planbares Wachstum fehlt.',
  },
  offers: {
    manual: 'Deine Angebote entstehen per Hand — das kostet Zeit und wirkt weniger professionell.',
    'too-slow': 'Angebote zu schreiben dauert dir zu lang oder sieht nicht professionell genug aus.',
  },
  manage: {
    head: 'Anfragen laufen über Zettel/WhatsApp — da geht leicht etwas verloren.',
    excel: 'Du verwaltest Kunden in Excel — fehleranfällig und ohne Erinnerungen.',
    lost: 'Anfragen gehen verloren und Follow-ups vergisst du — bares Geld, das liegen bleibt.',
  },
};

const VOLUME_HOURS: Record<string, string> = {
  '0-5': 'ein paar Stunden im Monat',
  '6-15': 'ca. 3–5 Stunden pro Woche',
  '16-30': 'ca. 6–8 Stunden pro Woche',
  '30+': '10+ Stunden pro Woche',
};

// Übersetzt die Antworten in eine ehrliche Empfehlung.
export function evaluateCheck(answers: CheckAnswers): CheckResult {
  // Hero = explizit gewählte Priorität (Fallback: stärkstes Schmerz-Signal, sonst Lead-Funnel)
  const heroKey: ModuleKey = answers.priority ?? inferHero(answers) ?? 'lead-funnel';
  const hero = MODULES[heroKey];

  // Schmerzsignale aus den Diagnose-Fragen sammeln
  const painModules = collectPainModules(answers);

  const reasons: string[] = [];
  for (const qid of ['leads', 'offers', 'manage'] as const) {
    const val = answers[qid];
    const text = val ? REASONS[qid]?.[val] : undefined;
    if (text) reasons.push(text);
  }

  const alsoRelevant = (['lead-funnel', 'offer', 'crm'] as ModuleKey[])
    .filter((k) => k !== heroKey && painModules.has(k))
    .map((k) => MODULES[k]);

  const timeRelevant = heroKey === 'offer' || heroKey === 'crm' || painModules.has('offer') || painModules.has('crm');
  const timeSavedHint =
    answers.volume && timeRelevant
      ? `Bei deinem Volumen sparst du grob ${VOLUME_HOURS[answers.volume]} — Zeit, die du in Abschlüsse stecken kannst.`
      : undefined;

  return { hero, reasons, alsoRelevant, timeSavedHint };
}

function collectPainModules(answers: CheckAnswers): Set<ModuleKey> {
  const set = new Set<ModuleKey>();
  const lookup: { q: CheckQuestion; val?: string }[] = [
    { q: INSTALLER_QUESTIONS[0], val: answers.leads },
    { q: INSTALLER_QUESTIONS[1], val: answers.offers },
    { q: INSTALLER_QUESTIONS[2], val: answers.manage },
  ];
  for (const { q, val } of lookup) {
    const opt = q.options.find((o) => o.value === val);
    if (opt?.painFor) set.add(opt.painFor);
  }
  return set;
}

// Fallback, falls keine Priorität gesetzt wurde: Modul mit dem stärksten Schmerz.
function inferHero(answers: CheckAnswers): ModuleKey | null {
  const pains = collectPainModules(answers);
  for (const k of ['lead-funnel', 'offer', 'crm'] as ModuleKey[]) {
    if (pains.has(k)) return k;
  }
  return null;
}
