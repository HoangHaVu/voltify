import { supabase } from '../lib/supabase';

export interface LeadContact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  wantsZoomCall: boolean;
}

export interface WizardData {
  zip: string;
  buildingType: string;
  ownership: 'eigentümer' | 'mieter' | string;
  roofTilt: number;
  roofOrientation: string;
  roofArea: number;
  shading: 'keine' | 'teilweise' | 'stark' | 'none' | 'partial' | 'strong' | string;
  consumption: number;
  consumptionMethod: 'upload' | 'manual' | 'preset' | string;
  householdSize: string;
  storageSize: number;
  wallbox: boolean;
  futureCar: boolean;
  heatPump: boolean;
  backupPower: boolean;
  energyApp: boolean;
  electricityPrice: number;
  constructionYear: string;
  planningHorizon?: 'sofort' | '3monate' | '12monate' | string;
  needsFinancing?: boolean;
}

export interface ROICalculations {
  kwp: number;
  investment: number;
  annualSavings: number;
  amortization: number;
  autarky: number;
  profit20Years: number;
  score: number;
}

export async function submitLead(
  contact: LeadContact,
  data: WizardData,
  calc: ROICalculations,
  installerId?: string,
): Promise<void> {
  const { error } = await supabase.from('leads').insert({
    first_name: contact.firstName,
    last_name: contact.lastName,
    email: contact.email,
    phone: contact.phone || null,
    wants_zoom_call: contact.wantsZoomCall,
    zip: data.zip,
    building_type: data.buildingType || null,
    ownership: data.ownership || null,
    roof_tilt: data.roofTilt || null,
    roof_orientation: data.roofOrientation || null,
    roof_area: data.roofArea || null,
    shading: data.shading || null,
    consumption: data.consumption || null,
    consumption_method: data.consumptionMethod || null,
    household_size: data.householdSize || null,
    has_e_car: data.futureCar || false,
    has_heat_pump: data.heatPump || false,
    has_battery: (Number(data.storageSize) || 0) > 0,
    wallbox: data.wallbox || false,
    backup_power: data.backupPower || false,
    energy_app: data.energyApp || false,
    electricity_price: data.electricityPrice || null,
    planning_horizon: data.planningHorizon || null,
    needs_financing: data.needsFinancing ?? null,
    kwp: calc.kwp,
    investment: calc.investment,
    annual_savings: calc.annualSavings,
    amortization: calc.amortization,
    autarky: calc.autarky,
    profit_20_years: calc.profit20Years,
    score: calc.score,
    ...(installerId ? { installer_id: installerId } : {}),
  });

  if (error) throw new Error(error.message);
}

export async function triggerWebhook(leadId: string, installerId: string): Promise<void> {
  try {
    await supabase.functions.invoke('forward-lead', {
      body: { lead_id: leadId, installer_id: installerId },
    });
  } catch {
    // Fire-and-forget
  }
}
