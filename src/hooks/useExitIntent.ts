// PROJECT: Voltify | PURPOSE: Exit-Intent-Erkennung für Last-Chance-CTA
// Feuert einmal pro Session, wenn der Cursor den Viewport oben verlässt
// (typischer "Tab schließen / zurück"-Moment). Nur Desktop — mobil gibt es
// kein verlässliches mouseleave-Signal.

import { useEffect, useState } from 'react';

const SESSION_KEY = 'voltify_exit_intent_shown';

export function useExitIntent(): [boolean, () => void] {
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    // Bereits in dieser Session gezeigt? → nichts tun
    if (sessionStorage.getItem(SESSION_KEY)) return;

    // Touch-Geräte ausschließen (kein sinnvolles Exit-Signal)
    if (typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches) return;

    const handleMouseOut = (e: MouseEvent) => {
      // Nur feuern, wenn der Cursor oben aus dem Fenster fährt
      if (e.clientY <= 0 && !e.relatedTarget) {
        setTriggered(true);
        sessionStorage.setItem(SESSION_KEY, '1');
        document.removeEventListener('mouseout', handleMouseOut);
      }
    };

    // Kleine Verzögerung, damit es nicht direkt beim Laden feuert
    const timer = window.setTimeout(() => {
      document.addEventListener('mouseout', handleMouseOut);
    }, 4000);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  const dismiss = () => setTriggered(false);

  return [triggered, dismiss];
}
