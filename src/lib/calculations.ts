import type { WizardData } from '../pages/Configurator';
import type { ROICalculations } from '../services/leads';
import type { Lead } from '../services/data';
import { getGrantSubsidyTotal } from '../data/grants';

export interface ExtendedROICalculations extends ROICalculations {
  grantSavings: number;
  effectiveInvestment: number;
}

export function calculateROI(data: WizardData): ExtendedROICalculations {
  const consumption = Number(data.consumption) || 4000;
  const roofArea = Number(data.roofArea) || 50;
  const storageKwh = Number(data.storageSize) || 10;

  // Einstrahlungsfaktor basierend auf Dachausrichtung
  const orientationFactor: Record<string, number> = {
    'S': 1.0, 'Süd': 1.0,
    'SO': 0.95, 'Süd-Ost': 0.95,
    'SW': 0.95, 'Süd-West': 0.95,
    'O': 0.85, 'Ost': 0.85,
    'W': 0.85, 'West': 0.85,
    'N': 0.65, 'Nord': 0.65,
  };
  const orientationMultiplier = orientationFactor[data.roofOrientation] ?? 1.0;

  // Neigungsfaktor (30° = optimal)
  const tiltDiff = Math.abs(data.roofTilt - 30);
  const tiltMultiplier = Math.max(0.85, 1 - tiltDiff * 0.005);

  // Verschattungsfaktor
  const shadingMultiplier =
    data.shading === 'stark' ? 0.75 :
    data.shading === 'teilweise' ? 0.88 :
    1.0;

  const totalEfficiencyMultiplier = orientationMultiplier * tiltMultiplier * shadingMultiplier;

  const systemPower = Math.min(
    Math.round(roofArea * 0.18 * totalEfficiencyMultiplier),
    Math.round(consumption / 850)
  );
  const investPerKw = 1400;
  const totalInvest = systemPower * investPerKw + storageKwh * 700;

  // Förderungen basierend auf PLZ
  const grantSavings = getGrantSubsidyTotal(data.zipCode);
  const effectiveInvestment = Math.max(0, totalInvest - grantSavings);

  const savingsPerYear = Math.round(consumption * 0.35 * 0.35);
  const amortization = savingsPerYear > 0 ? Math.round((effectiveInvestment / savingsPerYear) * 10) / 10 : 0;
  const profit20Years = savingsPerYear * 20 - effectiveInvestment;
  const autarky = Math.min(50 + storageKwh * 2, 95);

  // Lead Score (0-100)
  let score = 50;
  if (data.ownership === 'eigentümer') score += 20;
  if (consumption > 5000) score += 15;
  if (data.wallbox) score += 10;
  if (data.backupPower) score += 5;
  if (data.energyApp) score += 5;
  if (roofArea > 80) score += 10;
  if (data.shading === 'keine' || data.shading === 'none') score += 5;
  if (orientationMultiplier >= 0.95) score += 5;
  score = Math.min(100, score);

  return {
    kwp: systemPower,
    investment: totalInvest,
    annualSavings: savingsPerYear,
    amortization: Math.round(amortization),
    autarky: Math.round(autarky),
    profit20Years: Math.round(profit20Years),
    score,
    grantSavings,
    effectiveInvestment,
  };
}

/**
 * Berechnet ROI-Werte neu basierend auf aktualisierten Lead-Daten.
 * Nutzt gemessene Werte (roof_area_measured) wenn vorhanden, sonst originale Werte.
 */
export function recalculateLead(lead: Lead): Partial<Lead> {
  const consumption = lead.consumption || 4000;
  const roofArea = lead.roof_area_measured ?? lead.roof_area ?? 50;
  const storageKwh = lead.has_battery ? 10 : 0;

  const systemPower = Math.min(Math.round(roofArea * 0.18), Math.round(consumption / 850));
  const investPerKw = 1400;
  const totalInvest = systemPower * investPerKw + storageKwh * 700;

  const grantSavings = getGrantSubsidyTotal(lead.zip || '');
  const effectiveInvestment = Math.max(0, totalInvest - grantSavings);

  const savingsPerYear = Math.round(consumption * 0.35 * 0.35);
  const amortization = savingsPerYear > 0 ? Math.round((effectiveInvestment / savingsPerYear) * 10) / 10 : 0;
  const profit20Years = savingsPerYear * 20 - effectiveInvestment;
  const autarky = Math.min(50 + storageKwh * 2, 95);

  // Lead Score (0-100)
  let score = 50;
  score += 20; // Eigentümer (Lead = immer Eigentümer)
  if (consumption > 5000) score += 15;
  if (lead.has_e_car) score += 10;
  if (lead.has_battery) score += 5;
  if (lead.has_heat_pump) score += 5;
  if (roofArea > 80) score += 10;
  score = Math.min(100, score);

  return {
    kwp: systemPower,
    investment: totalInvest,
    annual_savings: savingsPerYear,
    amortization: Math.round(amortization),
    autarky: Math.round(autarky),
    profit_20_years: Math.round(profit20Years),
    score,
  };
}
