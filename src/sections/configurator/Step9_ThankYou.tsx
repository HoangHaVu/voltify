import { CheckCircle, Mail, FileText, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Step9_ThankYou() {
  const navigate = useNavigate();

  const nextSteps = [
    {
      icon: FileText,
      title: 'Prüfung Ihrer Daten',
      desc: 'Unsere Experten analysieren Ihre Konfiguration innerhalb von 24 Stunden.',
      time: '24h',
    },
    {
      icon: Mail,
      title: 'Persönliches Angebot',
      desc: 'Sie erhalten ein maßgeschneidertes Angebot per E-Mail mit allen Details.',
      time: '48h',
    },
    {
      icon: Phone,
      title: 'Kostenlose Beratung',
      desc: 'Bei Fragen melden wir uns telefonisch — kostenlos und unverbindlich.',
      time: '72h',
    },
  ];

  return (
    <div className="flex flex-col items-center text-center py-8">
      {/* Success Icon */}
      <div className="w-20 h-20 rounded-full bg-[#F5A623]/10 flex items-center justify-center mb-6">
        <CheckCircle className="w-10 h-10 text-[#F5A623]" />
      </div>

      {/* Heading */}
      <h2 className="text-2xl md:text-3xl font-semibold text-[#1A3A5C] mb-2">
        Vielen Dank!
      </h2>
      <p className="text-gray-500 text-sm max-w-[400px] mb-8">
        Ihre Anfrage wurde erfolgreich übermittelt. Wir erstellen jetzt Ihr individuelles Solarangebot.
      </p>

      {/* Next Steps */}
      <div className="w-full max-w-[500px] flex flex-col gap-4 mb-10">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Was passiert als Nächstes?</p>
        {nextSteps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div
              key={i}
              className="flex items-start gap-4 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-gray-200 text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-[#1A3A5C] flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-[#1A3A5C]">{step.title}</p>
                  <span className="text-[10px] bg-[#F5A623]/10 text-[#F5A623] px-1.5 py-0.5 rounded font-medium">~{step.time}</span>
                </div>
                <p className="text-xs text-gray-500">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-[400px]">
        <button
          onClick={() => navigate('/login')}
          className="flex-1 flex items-center justify-center gap-2 bg-[#1A3A5C] text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-[#0F2440] transition-all"
        >
          Zum Login
        </button>
        <button
          onClick={() => window.location.reload()}
          className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-700 px-5 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all"
        >
          Neue Konfiguration
        </button>
      </div>

      <button
        onClick={() => navigate('/')}
        className="mt-6 text-sm text-gray-400 hover:text-[#1A3A5C] transition-colors"
      >
        Zurück zur Startseite
      </button>
    </div>
  );
}
