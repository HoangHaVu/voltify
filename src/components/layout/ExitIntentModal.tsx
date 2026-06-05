// PROJECT: Voltify | PURPOSE: Last-Chance-CTA beim Verlassen der Landingpage
// Wird durch useExitIntent ausgelöst. Fängt abspringende Besucher mit dem
// stärksten Angebot (Scarcity + kostenlos + Rabatt) ab.

import { useNavigate } from 'react-router-dom';
import { X, Zap, ArrowRight } from 'lucide-react';
import { BETA, BETA_COPY } from '../../lib/betaConfig';

interface Props {
  onClose: () => void;
}

export default function ExitIntentModal({ onClose }: Props) {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden animate-[fadeIn_0.2s_ease-out]">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-lg transition-colors z-10"
          aria-label="Schließen"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        {/* Top accent */}
        <div className="bg-gradient-to-br from-[#1A3A5C] to-[#0F2440] px-8 pt-8 pb-10 text-center">
          <span className="inline-flex items-center gap-1.5 bg-[#F5A623]/20 border border-[#F5A623]/30 text-[#F5A623] text-xs font-bold px-3 py-1 rounded-full mb-4">
            <Zap className="w-3.5 h-3.5" fill="currentColor" /> {BETA_COPY.spotsBadge}
          </span>
          <h2 className="text-2xl font-bold text-white leading-snug">
            Warte — sichere dir<br />deinen Beta-Platz
          </h2>
        </div>

        {/* Body */}
        <div className="px-8 py-6 text-center -mt-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
            <p className="text-gray-600 text-sm leading-relaxed">
              <span className="font-bold text-[#1A3A5C]">{BETA.freeMonths} Monate komplett kostenlos</span> testen —
              danach dauerhaft <span className="font-bold text-[#F5A623]">{BETA.discountPercent}% Gründerrabatt</span>.
              Nur ein {BETA.callMinutes}-Min Demo-Call, kein Setup-Aufwand.
            </p>
          </div>
          <button
            onClick={() => { onClose(); navigate('/beta'); }}
            className="w-full flex items-center justify-center gap-2 bg-[#F5A623] text-[#1A3A5C] font-bold py-3.5 rounded-xl hover:bg-[#E09000] transition-colors"
          >
            Jetzt Beta-Platz sichern <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Nein danke, ich schaue mich nur um
          </button>
        </div>
      </div>
    </div>
  );
}
