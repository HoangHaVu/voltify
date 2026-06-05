// PROJECT: Voltify | PURPOSE: Lead-Capture vor dem Konfigurator (E-Mail + Vorname)
import { useState } from 'react';
import { Zap, ArrowRight } from 'lucide-react';

interface Props {
  onSubmit: (firstName: string, email: string) => void;
  onSkip: () => void;
}

export default function Step0_EmailGate({ onSubmit, onSkip }: Props) {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail]         = useState('');
  const [error, setError]         = useState('');

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F2440] via-[#1A3A5C] to-[#0F2440] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10 justify-center">
          <div className="w-9 h-9 rounded-full bg-[#F5A623] flex items-center justify-center">
            <Zap className="w-5 h-5 text-[#1A3A5C]" fill="currentColor" />
          </div>
          <span className="text-xl font-semibold text-white">Voltify</span>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
          <p className="text-[#F5A623] text-xs font-semibold uppercase tracking-widest mb-3">
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
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#F5A623] transition-colors"
              />
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-1.5">
                E-Mail-Adresse <span className="text-[#F5A623]">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="max@beispiel.de"
                required
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#F5A623] transition-colors"
              />
              {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-[#F5A623] hover:bg-[#e09520] text-[#1A3A5C] font-semibold rounded-lg px-6 py-3.5 flex items-center justify-center gap-2 transition-colors"
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
      </div>
    </div>
  );
}
