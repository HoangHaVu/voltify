import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, CheckCircle, ArrowRight, AlertCircle, Phone, Mail, Building2, MapPin, MessageSquare, User, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import SEO from '../components/seo/SEO';

export default function BetaSignupPage() {
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [zip, setZip] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showCalendly, setShowCalendly] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const { error: dbError } = await supabase.from('beta_requests').insert({
        company_name: companyName.trim(),
        contact_name: contactName.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        zip: zip.trim() || null,
        message: message.trim() || null,
      });

      if (dbError) throw new Error(dbError.message);

      // E-Mail-Benachrichtigung fire-and-forget
      supabase.functions.invoke('notify-beta', {
        body: { company_name: companyName, contact_name: contactName, email, phone, zip, message },
      }).catch(() => {/* ignorieren — Daten sind in DB */});

      // Calendly Modal öffnen statt success-screen
      setShowCalendly(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Etwas ist schiefgelaufen. Bitte versuche es erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calendly Script laden, wenn Modal sichtbar
  useEffect(() => {
    if (!showCalendly) return;

    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [showCalendly]);

  return (
    <>
      <SEO title="Beta-Programm" description="Werde einer der ersten Voltify-Beta-Partner. Kostenloser Zugang, persönliches Onboarding." canonical="/beta" noindex />
      <div className="min-h-screen flex">
        {/* LEFT — Beta Formular */}
        <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col justify-between p-8 md:p-12 lg:p-16 bg-white">
          {/* Logo */}
          <button onClick={() => navigate('/')} className="flex items-center gap-2 mb-12 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-[#F5A623] flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#1A3A5C]" fill="currentColor" />
            </div>
            <span className="text-lg font-medium text-[#1A3A5C]">Voltify</span>
          </button>

          {/* Form */}
          <div className="flex-1 flex flex-col justify-center max-w-[420px] mx-auto w-full">
            {success ? (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-[#1A3A5C]">Dankeschön für die Anfrage!</h2>
                <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
                  Wir werden uns in Kürze bei Ihnen telefonisch melden.
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="mt-4 bg-[#1A3A5C] text-white font-medium px-6 py-3 rounded-xl hover:bg-[#0F2440] transition-colors"
                >
                  Zurück zur Startseite
                </button>
              </div>
            ) : (
              <>
                <span className="inline-flex items-center gap-1.5 bg-[#F5A623]/10 text-[#F5A623] text-xs font-bold px-3 py-1 rounded-full mb-3">
                  🚀 Nur noch 10 Plätze verfügbar
                </span>
                <h1 className="text-3xl md:text-4xl font-semibold text-[#1A3A5C] mb-3">Jetzt Beta-Partner werden</h1>
                <p className="text-gray-500 text-sm mb-8">Hinterlasse deine Kontaktdaten — wir melden uns persönlich bei dir. Als Beta-Partner sicherst du dir dauerhaft <span className="text-[#F5A623] font-bold">20% Gründerrabatt</span> auf jeden Tarif.</p>

                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-gray-700">Firma *</label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          required
                          value={companyName}
                          onChange={e => setCompanyName(e.target.value)}
                          placeholder="Mustermann GmbH"
                          className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-3 text-sm text-[#1A3A5C] placeholder:text-gray-400 focus:outline-none focus:border-[#1A3A5C] focus:ring-1 focus:ring-[#1A3A5C] transition-all"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-gray-700">Name *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          required
                          value={contactName}
                          onChange={e => setContactName(e.target.value)}
                          placeholder="Max Mustermann"
                          className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-3 text-sm text-[#1A3A5C] placeholder:text-gray-400 focus:outline-none focus:border-[#1A3A5C] focus:ring-1 focus:ring-[#1A3A5C] transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-700">
                      Handynummer <span className="text-[#F5A623] font-bold">— für Rückruf (empfohlen)</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F5A623]" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+49 171 1234567"
                        className="w-full border-2 border-[#F5A623]/30 rounded-xl pl-9 pr-3 py-3 text-sm text-[#1A3A5C] placeholder:text-gray-400 focus:outline-none focus:border-[#F5A623] focus:ring-1 focus:ring-[#F5A623] transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-gray-700">E-Mail *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="max@firma.de"
                          className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-3 text-sm text-[#1A3A5C] placeholder:text-gray-400 focus:outline-none focus:border-[#1A3A5C] focus:ring-1 focus:ring-[#1A3A5C] transition-all"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-gray-700">PLZ</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={zip}
                          onChange={e => setZip(e.target.value)}
                          placeholder="12345"
                          className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-3 text-sm text-[#1A3A5C] placeholder:text-gray-400 focus:outline-none focus:border-[#1A3A5C] focus:ring-1 focus:ring-[#1A3A5C] transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-700">
                      Kurze Nachricht <span className="font-normal text-gray-400">(optional)</span>
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                      <textarea
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="z.B. Wie viele Leads habt ihr pro Monat?"
                        rows={3}
                        className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-3 text-sm text-[#1A3A5C] placeholder:text-gray-400 focus:outline-none focus:border-[#1A3A5C] focus:ring-1 focus:ring-[#1A3A5C] transition-all resize-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#F5A623] text-[#1A3A5C] font-medium py-3 rounded-xl hover:bg-[#E09000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <Zap className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Anfragen
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-gray-400">
                    Kein Abo · Keine Kreditkarte · Jederzeit kündbar
                  </p>
                </form>
              </>
            )}
          </div>

          {/* Bottom */}
          <p className="text-center text-sm text-gray-500 mt-8">
            Bereits registriert? <button onClick={() => navigate('/login')} className="text-[#1A3A5C] font-medium hover:underline cursor-pointer">Jetzt anmelden.</button>
          </p>
        </div>

        {/* RIGHT — Beta Benefits */}
        <div className="hidden lg:flex lg:w-[55%] xl:w-[60%] bg-gradient-to-br from-[#1A3A5C] via-[#0F2440] to-black items-center justify-center p-12 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-20 right-20 w-72 h-72 bg-[#F5A623]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#1A3A5C]/40 rounded-full blur-3xl" />

          <div className="relative max-w-[540px] w-full">
            {/* Tagline */}
            <div className="inline-flex items-center gap-2 bg-[#F5A623]/20 border border-[#F5A623]/30 rounded-full px-3 py-1 text-xs font-bold text-[#F5A623] uppercase tracking-widest mb-6">
              ⭐ Beta-Programm — Limitiert
            </div>
            <h2 className="text-3xl font-semibold text-white mb-2 leading-snug">
              Werde einer der ersten<br />10 Voltify-Partner
            </h2>
            <p className="text-white/60 text-sm mb-8">Kein Account-Setup, kein Passwort. Wir melden uns persönlich bei dir.</p>

            {/* Benefits Cards */}
            <div className="space-y-4">
              {[
                { icon: '🎯', title: 'Kostenloser Zugang', text: '30 Tage vollständiger Zugriff ohne Kreditkarte.' },
                { icon: '💰', title: '20% Gründerrabatt', text: 'Dauerhafter Rabatt auf jeden Tarif — auch nach der Beta.' },
                { icon: '📞', title: 'Persönliches Onboarding', text: 'Wir richten alles gemeinsam mit dir ein.' },
                { icon: '💡', title: 'Direkter Einfluss', text: 'Dein Feedback formt das Produkt. Video-Testimonial erwünscht.' },
              ].map(item => (
                <div key={item.title} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 flex items-start gap-4">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="font-bold text-white text-sm">{item.title}</p>
                    <p className="text-white/50 text-xs mt-0.5">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-white">30</p>
                <p className="text-[10px] text-white/50">Tage kostenlos</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-[#F5A623]">-20%</p>
                <p className="text-[10px] text-white/50">Dauerhafter Rabatt</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-white">1:1</p>
                <p className="text-[10px] text-white/50">Onboarding</p>
              </div>
            </div>
          </div>
        </div>

        {/* Calendly Modal Overlay */}
        {showCalendly && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-bold text-[#1A3A5C]">Termin vereinbaren</h2>
                  <p className="text-sm text-gray-500 mt-1">Wähle einen Termin für dein Onboarding</p>
                </div>
                <button
                  onClick={() => setShowCalendly(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  aria-label="Schließen"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Calendly Widget */}
              <div className="flex-1 overflow-y-auto p-6">
                <div
                  className="calendly-inline-widget"
                  data-url="https://calendly.com/contact-vu-studio/30min"
                  style={{ minWidth: '320px', height: '630px' }}
                />
              </div>

              {/* Footer Info */}
              <div className="border-t border-gray-200 bg-gray-50 p-4 text-center">
                <p className="text-xs text-gray-500">
                  Nach der Terminbuchung erhältst du eine Bestätigungsemail mit Zoom-Link.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
