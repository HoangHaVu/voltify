// PROJECT: Voltify | PURPOSE: Single Source of Truth für alle Beta-Programm-Werte
// Wird in LandingPage, BetaSignupPage, Konfigurator-Demo & Step9 verwendet.
// Eine Änderung hier aktualisiert den gesamten Funnel — keine Inkonsistenzen mehr.

export const BETA = {
  /** Verfügbare Beta-Plätze (Scarcity-Trigger) */
  spotsLeft: 5,
  /** Kostenlose Test-Monate */
  freeMonths: 3,
  /** Dauerhafter Gründerrabatt in Prozent */
  discountPercent: 30,
  /** Dauer des Demo-Calls in Minuten */
  callMinutes: 30,
  /** Calendly-Buchungslink für den Demo-Call */
  calendlyUrl: 'https://calendly.com/contact-vu-studio/30min',
} as const;

/** Vorformatierte Strings für die häufigsten Copy-Bausteine */
export const BETA_COPY = {
  spotsBadge: `Nur noch ${BETA.spotsLeft} Plätze verfügbar`,
  freeTrial: `${BETA.freeMonths} Monate kostenlos`,
  discount: `-${BETA.discountPercent}% Gründerrabatt`,
  call: `${BETA.callMinutes} min Demo-Call`,
} as const;
