// PROJECT: Voltify | PURPOSE: Pro-Installateur ROI-Annahmen (?i=slug) für den Konfigurator laden
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getFunnelSource } from '../lib/funnelTracking';
import type { CalcAssumptions } from '../lib/calculations';

// Lädt die in den Einstellungen hinterlegten ROI-Annahmen des Installateurs.
// Kein Slug oder kein Eintrag → leeres Objekt → calculateROI nutzt globale Defaults.
export function useInstallerCalcAssumptions(): CalcAssumptions {
  const [assumptions, setAssumptions] = useState<CalcAssumptions>({});

  useEffect(() => {
    const { installerSlug } = getFunnelSource();
    if (!installerSlug) return;

    supabase
      .rpc('get_installer_calc_assumptions', { p_slug: installerSlug })
      .then(({ data }) => {
        if (data && typeof data === 'object') {
          setAssumptions(data as CalcAssumptions);
        }
      });
  }, []);

  return assumptions;
}
