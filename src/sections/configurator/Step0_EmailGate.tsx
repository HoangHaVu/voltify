// PROJECT: Voltify | PURPOSE: Lead-Capture vor dem Konfigurator (E-Mail + Vorname)
import { useState } from 'react';
import { Zap, ArrowRight } from 'lucide-react';
import type { TenantBranding } from '../../hooks/useTenantBranding';

interface Props {
  onSubmit: (firstName: string, email: string) => void;
  onSkip: () => void;
  branding?: TenantBranding;
}

export default function Step0_EmailGate({ onSubmit, onSkip, branding }: Props) {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail]         = useState('');
  const [error, setError]         = useState('');

  const primary = branding?.primaryColor || '#1A3A5C';
  const accent  = branding?.accentColor  || '#F5A623';
  const name    = branding?.firmenname   || 'Voltify';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Bitte gib eine gültige E-Mail-Adresse ein.');
      return;
    }
    setError('');
    onSubmit(firstName.trim(), email.trim());
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: `linear-gradient(135deg, ${primary}ee, ${primary}aa, ${primary}cc)` }}
    >
      <div className="w-full max-w-md">
        {/* Logo / Firmenname */}
        <div className="flex items-center gap-2 mb-10 justify-center">
          {branding?.isTenant && branding.logoDataUrl ? (
            <img src={branding.logoDataUrl} alt={name} className="h-9 object-contain" />
          ) : (
            <>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ backgroundColor: accent }}
              >
                <Zap className="w-5 h-5" style={{ color: primary }} fill="currentColor" />
              </div>
              <span className="text-xl font-semibold text-white">{name}</span>
            </>
          )}
          {branding?.isTenant && !branding.logoDataUrl && (
            <span className="text-xl font-semibold text-white">{name}</span>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: accent }}>
            Kostenloser Konfigurator
          </p>
          <h1 className="text-2xl font-bold text-white mb-2">
            Dein persönliches Solar-Angebot in 8 Schritten
          </h1>
          <p className="text-white/60 text-sm mb-8">
            Ergebnis: ROI-Analyse, Förderungen und ein druckfertiges Angebot — in unter 5 Minuten.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/70 text-sm mb-1.5">Vorname</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Max"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none transition-colors"
                style={{ outlineColor: accent }}
              />
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-1.5">
                E-Mail-Adresse <span style={{ color: accent }}>*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="max@beispiel.de"
                required
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none transition-colors"
              />
              {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full font-semibold rounded-lg px-6 py-3.5 flex items-center justify-center gap-2 transition-colors hover:opacity-90"
              style={{ backgroundColor: accent, color: primary }}
            >
              Konfigurator starten
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-white/30 text-xs mt-4">
            Keine Werbung · Nur dein Angebot ·{' '}
            <button
              onClick={onSkip}
              className="underline hover:text-white/60 transition-colors"
            >
              Ohne Angabe fortfahren
            </button>
          </p>
        </div>

        {/* Powered by Voltify — nur wenn Tenant und poweredByVoltify=true */}
        {branding?.isTenant && branding.poweredByVoltify && (
          <p className="text-center text-white/20 text-[10px] mt-4">
            Powered by Voltify
          </p>
        )}
      </div>
    </div>
  );
}
