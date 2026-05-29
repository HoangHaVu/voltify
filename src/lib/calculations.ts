import type { WizardData } from '../pages/Configurator';
import type { ROICalculations } from '../services/leads';
import type { Lead } from '../services/data';
import { getGrantSubsidyTotal } from '../data/grants';
import { getIrradiationByZip } from '../data/plzIrradiation';
import { computeLeadScore } from '../utils/leadScore';

const PERFORMANCE_RATIO = 0.80; // Systemwirkungsgrad inkl. Wechselrichter
const FEED_IN_TARIFF = 0.082;   // €/kWh, EEG 2024 (< 10 kWp)
const INVEST_PER_KWP = 1800;    // €/kWp (realistischer Marktpreis)
const BATTERY_ADDON = 6000;     // € für Batteriespeicher
const CONSTRUCTION_ADDON = 2000; // € für Altbausanierung (vor 1980)

// Lebenszykluskosten
const MAINTENANCE_PER_YEAR = 200;         // €/Jahr (Inspektion + Reinigung)
const INVERTER_REPLACEMENT_YEAR = 12;     // Jahr
const INVERTER_REPLACEMENT_COST = 2000;   // €
const BATTERY_REPLACEMENT_YEAR = 12;      // Jahr
const BATTERY_REPLACEMENT_COST = 6000;    // €

// Orientierungsfaktor — Voltify verwendet Himmelsrichtungen (S, SO, SW, O, W, N)
const ORIENTATION_FACTOR: Record<string, number> = {
  'S': 1.0,
  'SO': 0.95, 'SW': 0.95,
  'O': 0.85, 'W': 0.85,
  'NO': 0.88, 'NW': 0.88,
  'N': 0.65,
};

// Quadratischer Abfall vom Optimum (32°); Min-Faktor 0.80
function getRoofAngleFactor(angle: number): number {
  const diff = Math.abs(angle - 32);
  return Math.max(0.80, 1.0 - (diff * diff) / 5000);
}

// Verschattungsfaktor
function getShadingFactor(shading: string): number {
  if (shading === 'strong' || shading === 'stark') return 0.85;
  if (shading === 'partial' || shading === 'teilweise') return 0.93;
  return 1.0;
}

export interface ExtendedROICalculations extends ROICalculations {
  grantSavings: number;
  effectiveInvestment: number;
  annualYield: number;
  adjustedConsumption: number;
  selfConsumedEnergy: number;
  gridFeedIn: number;
  irradiation: number;
  selfConsumptionRate: number;
  chartData: { year: number; value: number }[];
  // Realistische Werte mit Folgekosten
  annualSavingsRealistic: number;
  amortizationRealistic: number;
  profit20YearsRealistic: number;
  totalFollowUpCosts: number;
  chartDataRealistic: { year: number; value: number }[];
}

export function calculateROI(data: WizardData): ExtendedROICalculations {
  const consumption = Math.max(0, Number(data.consumption) || 4000);
  const roofArea = Math.max(0, Number(data.roofArea) || 50);
  const storageKwh = data.storageSize !== '' && data.storageSize !== undefined ? Number(data.storageSize) : 10;
  const hasBattery = storageKwh > 0;
  const electricityPrice = Math.max(0, Number(data.electricityPrice) || 0.32);

  // Einstrahlung basierend auf PLZ
  const irradiation = getIrradiationByZip(data.zipCode);

  // Ausrichtungsfaktor
  const orientationFactor = ORIENTATION_FACTOR[data.roofOrientation] ?? 1.0;

  // Neigungsfaktor
  const roofAngleFactor = getRoofAngleFactor(data.roofTilt);

  // Verschattungsfaktor
  const shadingFactor = getShadingFactor(data.shading);

  // Systemleistung in kWp — NUR durch Dachfläche begrenzt (realistisch!)
  const kwp = Math.round(roofArea * 0.18 * orientationFactor * shadingFactor * 10) / 10;

  // Zukünftiger Verbrauch durch E-Auto und Wärmepumpe
  const adjustedConsumption = consumption
    + (data.futureCar ? 2500 : 0)
    + (data.heatPump ? 3000 : 0);

  // Jährlicher Ertrag
  const annualYield = Math.round(kwp * irradiation * PERFORMANCE_RATIO * roofAngleFactor);

  // Eigenverbrauchsrate abhängig vom Gebäudetyp und Speicher
  const isCommercial = data.buildingType === 'gewerbe' || data.buildingType === 'firmengebaeude';
  const selfConsumptionRate = isCommercial
    ? (hasBattery ? 0.80 : 0.60)
    : (hasBattery ? 0.65 : 0.30);

  // Selbst verbrauchte Energie (max. angepasster Verbrauch)
  const selfConsumedEnergy = Math.min(
    Math.round(annualYield * selfConsumptionRate),
    adjustedConsumption
  );

  // Einspeisung ins Netz
  const gridFeedIn = annualYield - selfConsumedEnergy;

  // Autarkiegrad
  const autarky = Math.min(100, Math.round((selfConsumedEnergy / adjustedConsumption) * 100));

  // Investition
  const batteryAddon = hasBattery ? BATTERY_ADDON : 0;
  const constructionAddon = data.constructionYear === 'pre1980' ? CONSTRUCTION_ADDON : 0;
  const investment = Math.round(kwp * INVEST_PER_KWP) + batteryAddon + constructionAddon;

  // Förderungen
  const grantSavings = getGrantSubsidyTotal(data.zipCode);
  const effectiveInvestment = Math.max(0, investment - grantSavings);

  // Jährliche Ersparnis = Eigenverbrauch * Strompreis + Einspeisung * EEG-Vergütung
  const annualSavings = Math.round(
    selfConsumedEnergy * electricityPrice + gridFeedIn * FEED_IN_TARIFF
  );

  const amortization = annualSavings > 0 ? Math.round(effectiveInvestment / annualSavings) : 0;
  const profit20Years = Math.round(annualSavings * 20 - effectiveInvestment);

  // Chart-Daten für Amortisationsgraph (optimistisch — ohne Folgekosten)
  const chartData = Array.from({ length: 21 }, (_, year) => ({
    year,
    value: annualSavings * year - effectiveInvestment,
  }));

  // Realistische Berechnung mit Folgekosten
  const totalFollowUpCosts =
    MAINTENANCE_PER_YEAR * 20 +
    INVERTER_REPLACEMENT_COST +
    (hasBattery ? BATTERY_REPLACEMENT_COST : 0);

  let cumulativeRealistic = -effectiveInvestment;
  let amortizationRealistic = 0;
  const chartDataRealistic = Array.from({ length: 21 }, (_, year) => {
    if (year === 0) return { year, value: cumulativeRealistic };
    let net = annualSavings - MAINTENANCE_PER_YEAR;
    if (year === INVERTER_REPLACEMENT_YEAR) {
      net -= INVERTER_REPLACEMENT_COST;
      if (hasBattery) net -= BATTERY_REPLACEMENT_COST;
    }
    cumulativeRealistic += net;
    if (cumulativeRealistic >= 0 && amortizationRealistic === 0) {
      amortizationRealistic = year;
    }
    return { year, value: Math.round(cumulativeRealistic) };
  });

  const annualSavingsRealistic = annualSavings - MAINTENANCE_PER_YEAR;
  const profit20YearsRealistic = chartDataRealistic[20]?.value ?? 0;

  // Lead Score (0-100)
  const score = computeLeadScore({
    kwp,
    investment,
    zip: data.zipCode,
    isOwner: data.ownership === 'eigentümer' || data.ownership === 'eigentuemer',
    hasBattery,
    area: roofArea,
    planningHorizon: '',
  });

  return {
    kwp,
    investment,
    annualSavings,
    amortization,
    autarky,
    profit20Years,
    score,
    grantSavings,
    effectiveInvestment,
    annualYield,
    adjustedConsumption,
    selfConsumedEnergy,
    gridFeedIn,
    irradiation,
    selfConsumptionRate,
    chartData,
    annualSavingsRealistic,
    amortizationRealistic,
    profit20YearsRealistic,
    totalFollowUpCosts,
    chartDataRealistic,
  };
}

/**
 * Berechnet ROI-Werte neu basierend auf aktualisierten Lead-Daten.
 * Nutzt gemessene Werte (roof_area_measured) wenn vorhanden, sonst originale Werte.
 */
export function recalculateLead(lead: Lead): Partial<Lead> {
  const consumption = lead.consumption || 4000;
  const roofArea = lead.roof_area_measured ?? lead.roof_area ?? 50;
  const hasBattery = lead.has_battery || false;
  const electricityPrice = lead.electricity_price || 0.32;

  // Einstrahlung basierend auf PLZ
  const irradiation = getIrradiationByZip(lead.zip || '');

  // Ausrichtungsfaktor (Lead speichert als String)
  const orientationFactor = ORIENTATION_FACTOR[lead.roof_orientation || 'S'] ?? 1.0;

  // Neigungsfaktor
  const roofAngleFactor = getRoofAngleFactor(lead.roof_tilt || 30);

  // Verschattungsfaktor
  const shadingFactor = getShadingFactor(lead.shading || 'none');

  // Systemleistung
  const kwp = Math.round(roofArea * 0.18 * orientationFactor * shadingFactor * 10) / 10;

  // Zukünftiger Verbrauch
  const adjustedConsumption = consumption
    + (lead.has_e_car ? 2500 : 0)
    + (lead.has_heat_pump ? 3000 : 0);

  // Jährlicher Ertrag
  const annualYield = Math.round(kwp * irradiation * PERFORMANCE_RATIO * roofAngleFactor);

  // Eigenverbrauchsrate
  const isCommercial = lead.building_type === 'gewerbe' || lead.building_type === 'firmengebaeude';
  const selfConsumptionRate = isCommercial
    ? (hasBattery ? 0.80 : 0.60)
    : (hasBattery ? 0.65 : 0.30);

  const selfConsumedEnergy = Math.min(
    Math.round(annualYield * selfConsumptionRate),
    adjustedConsumption
  );

  const gridFeedIn = annualYield - selfConsumedEnergy;
  const autarky = Math.min(100, Math.round((selfConsumedEnergy / adjustedConsumption) * 100));

  // Investition
  const batteryAddon = hasBattery ? BATTERY_ADDON : 0;
  const investment = Math.round(kwp * INVEST_PER_KWP) + batteryAddon;

  const grantSavings = getGrantSubsidyTotal(lead.zip || '');
  const effectiveInvestment = Math.max(0, investment - grantSavings);

  const annualSavings = Math.round(
    selfConsumedEnergy * electricityPrice + gridFeedIn * FEED_IN_TARIFF
  );

  const amortization = annualSavings > 0 ? Math.round(effectiveInvestment / annualSavings) : 0;
  const profit20Years = Math.round(annualSavings * 20 - effectiveInvestment);

  // Lead Score (0-100)
  const score = computeLeadScore({
    kwp,
    investment,
    zip: lead.zip || '',
    isOwner: true,
    hasBattery,
    area: roofArea,
    planningHorizon: '',
  });

  return {
    kwp,
    investment,
    annual_savings: annualSavings,
    amortization,
    autarky,
    profit_20_years: profit20Years,
    score,
  };
}
