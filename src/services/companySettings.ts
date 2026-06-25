// PROJECT: Voltify | PURPOSE: Company-Settings DB <-> localStorage-Cache (WL2, Source of Truth = DB)
import { supabase } from '../lib/supabase';

// Gemeinsamer Cache-Key — historisch von AdminSettings/OfferBuilder/Dashboard/LeadDetails genutzt.
export const COMPANY_SETTINGS_KEY = 'voltify_settings_v1';

// Für welche Profil-Zeile gelten die Company-Settings?
// Owner/Agency: eigene id. Mitarbeiter: die des Inhabers (ownerId).
export function settingsOwnerId(user: { id: string; ownerId: string | null }): string {
  return user.ownerId ?? user.id;
}

// Hydratisiert den localStorage-Cache aus der DB (bei Login aufgerufen).
// Best-effort: schlägt der Read fehl (RLS/offline), bleibt der vorhandene Cache erhalten.
export async function hydrateCompanySettingsCache(ownerId: string): Promise<void> {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('company_settings')
      .eq('id', ownerId)
      .single();
    if (data?.company_settings) {
      localStorage.setItem(COMPANY_SETTINGS_KEY, JSON.stringify(data.company_settings));
    }
  } catch {
    /* Cache behalten — Hydration darf nie blockieren */
  }
}

// Lädt die Settings für die Bearbeitung (AdminSettings): DB bevorzugt, sonst null.
export async function fetchCompanySettings<T = Record<string, unknown>>(
  ownerId: string,
): Promise<T | null> {
  const { data } = await supabase
    .from('profiles')
    .select('company_settings')
    .eq('id', ownerId)
    .single();
  return (data?.company_settings as T) ?? null;
}

// Persistiert Settings: DB (Source of Truth) + localStorage-Cache.
export async function persistCompanySettings(ownerId: string, settings: unknown): Promise<void> {
  localStorage.setItem(COMPANY_SETTINGS_KEY, JSON.stringify(settings));
  await supabase.from('profiles').update({ company_settings: settings }).eq('id', ownerId);
}
