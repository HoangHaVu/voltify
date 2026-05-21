import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, Lock } from 'lucide-react';

export default function ExploreSection() {
  const [zipCode, setZipCode] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (zipCode.trim()) {
      navigate('/konfigurator');
    }
  };

  return (
    <section id="explore" className="py-20 md:py-28 bg-white">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div>
            {/* Badge */}
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-black" />
              <span className="text-xs font-semibold uppercase tracking-widest text-black">Solar-Konfigurator</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-medium text-black leading-tight tracking-tight mb-4">
              Dein Weg zur eigenen Solaranlage
            </h2>

            <p className="text-gray-600 text-base leading-relaxed mb-8">
              Nutze unseren Solar-Checker, um herauszufinden, wie viel du mit einer Solaranlage sparen kannst.
              Innerhalb von 2 Minuten erhaeltst du eine erste Einschaetzung – ganz unverbindlich.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="text-sm font-medium text-[#1A3A5C]">Postleitzahl</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="z.B. 10115"
                  maxLength={5}
                  className="flex-1 border border-gray-200 rounded-xl px-5 py-4 text-lg text-[#1A3A5C] placeholder:text-gray-400 focus:outline-none focus:border-[#1A3A5C] focus:ring-2 focus:ring-[#1A3A5C]/10 transition-all"
                />
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 bg-[#F5A623] text-[#1A3A5C] text-sm font-medium px-5 py-4 sm:py-2.5 rounded-full hover:bg-[#E09000] transition-all hover:scale-[1.02] whitespace-nowrap group"
                >
                  Jetzt berechnen
                  <span className="w-7 h-7 bg-[#1A3A5C] rounded-full flex items-center justify-center group-hover:bg-[#0F2440] transition-colors">
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </span>
                </button>
              </div>

              {/* Privacy note */}
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                <Lock className="w-3.5 h-3.5" />
                <span>100% Datenschutz gem. DSGVO – Deine Daten sind bei uns sicher.</span>
              </div>
            </form>
          </div>

          {/* Right: Image */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden">
              <img
                src="/images/configurator-bg.jpg"
                alt="Haus mit Solaranlage"
                className="w-full aspect-[4/3] object-cover"
              />
            </div>
            {/* Floating badge */}
            <div className="absolute bottom-6 left-6 bg-white rounded-xl px-4 py-3 shadow-lg border border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1A3A5C]">Bis zu 80%</p>
                  <p className="text-xs text-gray-500">Stromkosten sparen</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
