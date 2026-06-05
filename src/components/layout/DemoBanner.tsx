// PROJECT: Voltify | PURPOSE: Persistenter Demo-Modus-Banner mit Beta-CTA
// Liegt sticky über Konfigurator & Demo-Website. Signalisiert dem Installateur:
// "Das ist eine Demo deiner Kundensicht — hol dir das für dein Geschäft."

import { useNavigate } from 'react-router-dom';
import { Eye, ArrowRight } from 'lucide-react';
import { BETA_COPY } from '../../lib/betaConfig';

interface Props {
  /** Kontext-Text links — beschreibt, was der Installateur gerade sieht */
  label?: string;
}

export default function DemoBanner({ label = 'Demo-Modus — so erleben deine Kunden Voltify' }: Props) {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-[60] bg-[#1A3A5C] text-white">
      <div className="max-w-[1280px] mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Eye className="w-4 h-4 text-[#F5A623] shrink-0" />
          <p className="text-xs md:text-sm font-medium truncate">
            {label}
          </p>
        </div>
        <button
          onClick={() => navigate('/beta')}
          className="flex items-center gap-1.5 bg-[#F5A623] text-[#1A3A5C] text-xs md:text-sm font-bold px-3 md:px-4 py-1.5 rounded-full hover:bg-[#E09000] transition-colors shrink-0"
        >
          <span className="hidden sm:inline">Für mein Geschäft holen</span>
          <span className="sm:hidden">{BETA_COPY.freeTrial}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
