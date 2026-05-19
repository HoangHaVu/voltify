import { getIrradiationByZip } from '../data/plzIrradiation';

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

export function getScoreResult(score: number): ScoreResult {
  if (score >= 70) {
    return { score, tier: 'heiss', label: 'Heiß', color: 'text-[#F5A623]', bgColor: 'bg-[#F5A623]/10 border-[#F5A623]/30' };
  }
  if (score >= 40) {
    return { score, tier: 'warm', label: 'Warm', color: 'text-[#1A3A5C]', bgColor: 'bg-[#1A3A5C]/10 border-[#1A3A5C]/30' };
  }
  return { score, tier: 'kalt', label: 'Kalt', color: 'text-gray-500', bgColor: 'bg-gray-100 border-gray-300' };
}
