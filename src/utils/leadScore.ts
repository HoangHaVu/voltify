import { getIrradiationByZip } from '../data/plzIrradiation';
import type { Lead } from '../services/data';

export type ScoreTier = 'heiss' | 'warm' | 'kalt';

export interface ScoreResult {
  score: number;
  tier: ScoreTier;
  label: string;
  color: string;
  bgColor: string;
}

export interface LeadScoreParams {
  kwp?: number | null;
  investment?: number | null;
  zip?: string | null;
  isOwner?: boolean | null;
  hasBattery?: boolean | null;
  area?: number | null;
  planningHorizon?: string | null;
}

export interface ScoreFactor {
  label: string;
  value: number;      // Tatsächlicher Wert (z.B. 8.5 kWp)
  maxPoints: number;  // Maximal mögliche Punkte
  earned: number;     // Erreichte Punkte
  icon: string;       // Emoji-Icon für UI
}

export interface DetailedScoreResult extends ScoreResult {
  factors: ScoreFactor[];
}

export function computeLeadScore(params: LeadScoreParams): number {
  const { kwp, investment, zip, isOwner, hasBattery, planningHorizon } = params;
  let score = 0;

  if (kwp != null) {
    score += Math.min(25, (kwp / 10) * 25);
  }

  if (investment != null) {
    score += Math.min(20, (investment / 15000) * 20);
  }

  if (zip) {
    const irr = getIrradiationByZip(zip);
    score += Math.min(25, (irr / 1100) * 25);
  } else {
    score += 12;
  }

  if (isOwner === true) score += 20;
  else if (isOwner === false) score += 0;
  else score += 8;

  if (hasBattery === true) score += 10;

  if (planningHorizon === 'sofort') score += 10;
  else if (planningHorizon === '3monate') score += 5;

  return Math.min(100, Math.round(score));
}

export function computeLeadScoreDetailed(params: LeadScoreParams): DetailedScoreResult {
  const { kwp, investment, zip, isOwner, hasBattery, planningHorizon } = params;
  const factors: ScoreFactor[] = [];
  let score = 0;

  // 1. Anlagengröße (kWp) — max 25 Punkte
  let kwpPoints = 0;
  if (kwp != null) {
    kwpPoints = Math.min(25, (kwp / 10) * 25);
    score += kwpPoints;
    factors.push({
      label: 'Anlagengröße',
      value: kwp,
      maxPoints: 25,
      earned: Math.round(kwpPoints),
      icon: '⚡',
    });
  }

  // 2. Investitionsvolumen — max 20 Punkte
  let investPoints = 0;
  if (investment != null) {
    investPoints = Math.min(20, (investment / 15000) * 20);
    score += investPoints;
    factors.push({
      label: 'Investitionsvolumen',
      value: investment,
      maxPoints: 20,
      earned: Math.round(investPoints),
      icon: '💶',
    });
  }

  // 3. PLZ-Einstrahlung — max 25 Punkte
  let irrPoints = 0;
  if (zip) {
    const irr = getIrradiationByZip(zip);
    irrPoints = Math.min(25, (irr / 1100) * 25);
    score += irrPoints;
    factors.push({
      label: 'Sonneneinstrahlung',
      value: irr,
      maxPoints: 25,
      earned: Math.round(irrPoints),
      icon: '☀️',
    });
  } else {
    irrPoints = 12;
    score += irrPoints;
    factors.push({
      label: 'Sonneneinstrahlung (geschätzt)',
      value: 0,
      maxPoints: 25,
      earned: 12,
      icon: '☀️',
    });
  }

  // 4. Eigentumsform — max 20 Punkte
  let ownerPoints = 0;
  if (isOwner === true) { ownerPoints = 20; }
  else if (isOwner === false) { ownerPoints = 0; }
  else { ownerPoints = 8; }
  score += ownerPoints;
  factors.push({
    label: 'Eigentumsform',
    value: isOwner === true ? 1 : isOwner === false ? 0 : 0.5,
    maxPoints: 20,
    earned: ownerPoints,
    icon: '🏠',
  });

  // 5. Batteriespeicher — max 10 Punkte
  let batteryPoints = 0;
  if (hasBattery === true) {
    batteryPoints = 10;
    score += batteryPoints;
    factors.push({
      label: 'Batteriespeicher',
      value: 1,
      maxPoints: 10,
      earned: 10,
      icon: '🔋',
    });
  }

  // 6. Planungshorizont — max 10 Punkte
  let horizonPoints = 0;
  if (planningHorizon === 'sofort') { horizonPoints = 10; }
  else if (planningHorizon === '3monate') { horizonPoints = 5; }
  score += horizonPoints;
  if (planningHorizon) {
    factors.push({
      label: 'Planungshorizont',
      value: planningHorizon === 'sofort' ? 1 : planningHorizon === '3monate' ? 0.5 : 0,
      maxPoints: 10,
      earned: horizonPoints,
      icon: '📅',
    });
  }

  const finalScore = Math.min(100, Math.round(score));
  const base = getScoreResult(finalScore);

  // Faktoren nach Ergebnis sortieren (höchste zuerst)
  factors.sort((a, b) => b.earned - a.earned);

  return { ...base, factors };
}

export function getScoreResult(score: number): ScoreResult {
  if (score >= 70) {
    return { score, tier: 'heiss', label: 'Heiß', color: 'text-[#F5A623]', bgColor: 'bg-[#F5A623]/10 border-[#F5A623]/30' };
  }
  if (score >= 40) {
    return { score, tier: 'warm', label: 'Warm', color: 'text-[#1A3A5C]', bgColor: 'bg-[#1A3A5C]/10 border-[#1A3A5C]/30' };
  }
  return { score, tier: 'kalt', label: 'Kalt', color: 'text-gray-500', bgColor: 'bg-gray-100 border-gray-300' };
}

// Berechnet Score dynamisch aus Lead-Daten (immer aktuell)
export function computeLeadScoreFromLead(lead: Lead): number {
  return computeLeadScore({
    kwp: lead.kwp,
    investment: lead.investment,
    zip: lead.zip,
    isOwner: true, // Leads sind per Default Eigentümer
    hasBattery: lead.has_battery,
    area: lead.roof_area,
    planningHorizon: lead.planning_horizon ?? undefined,
  });
}
