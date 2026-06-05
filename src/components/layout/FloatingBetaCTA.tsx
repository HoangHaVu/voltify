// PROJECT: Voltify | PURPOSE: Schwebender Beta-CTA für Demo-Seiten mit fixed Header
// Sitzt unten rechts, kollidiert nicht mit fixierten Headern. Erscheint nach
// kurzem Scrollen, damit er nicht sofort aufdringlich ist.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, X } from 'lucide-react';
import { BETA_COPY } from '../../lib/betaConfig';

export default function FloatingBetaCTA() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (dismissed || !visible) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[80] animate-[fadeIn_0.3s_ease-out]">
      <div className="relative bg-[#1A3A5C] rounded-2xl shadow-2xl border border-white/10 p-4 pr-10 max-w-[300px]">
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Schließen"
        >
          <X className="w-4 h-4 text-white/60" />
        </button>
        <div className="flex items-center gap-1.5 mb-1.5">
          <Zap className="w-4 h-4 text-[#F5A623]" fill="currentColor" />
          <span className="text-xs font-bold text-[#F5A623]">{BETA_COPY.spotsBadge}</span>
        </div>
        <p className="text-sm text-white font-medium mb-3 leading-snug">
          Gefällt dir die Demo? Hol dir das für dein Geschäft.
        </p>
        <button
          onClick={() => navigate('/beta')}
          className="w-full flex items-center justify-center gap-2 bg-[#F5A623] text-[#1A3A5C] text-sm font-bold py-2.5 rounded-xl hover:bg-[#E09000] transition-colors"
        >
          Beta-Partner werden <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
