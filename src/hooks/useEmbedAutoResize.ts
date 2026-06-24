// PROJECT: Voltify | PURPOSE: iframe-Embed-Höhe an die einbettende Seite melden (White-Label)
import { useEffect } from 'react';

// Läuft die App in einem fremden iframe (White-Label-Embed)?
export const isEmbedded =
  typeof window !== 'undefined' && window.parent !== window;

// Postet die tatsächliche Inhaltshöhe per postMessage an die einbettende Seite,
// damit der iframe ohne eigene Scrollbalken mitwächst und -schrumpft.
// Höhe ist nicht sensibel → targetOrigin '*' ist hier bewusst und unkritisch.
export function useEmbedAutoResize(): void {
  useEffect(() => {
    if (!isEmbedded) return;

    const post = () => {
      const height = Math.ceil(document.body.scrollHeight);
      window.parent.postMessage({ type: 'voltify:resize', height }, '*');
    };

    post();
    const ro = new ResizeObserver(post);
    ro.observe(document.body);
    window.addEventListener('load', post);

    return () => {
      ro.disconnect();
      window.removeEventListener('load', post);
    };
  }, []);
}
