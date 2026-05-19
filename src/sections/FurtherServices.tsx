import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Zap, ArrowUpRight, Sun, Wind, Home } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const cards = [
  {
    icon: Sun,
    title: 'Solar-Wartungsservices',
    desc: 'Laufende Wartung fuer langfristige Effizienz, Sicherheit und Systemzuverlaessigkeit.',
    limeButton: false,
  },
  {
    icon: Wind,
    title: 'Windturbinen-Reparaturservices',
    desc: 'Fachgerechte Diagnose und Reparaturen, damit Ihre Windenergieanlagen reibungslos laufen.',
    limeButton: true,
  },
  {
    icon: Home,
    title: 'Dach-Solarinstallation',
    desc: 'Massgeschneiderte Dach-Solarloesungen, die Ihre Einsparungen maximieren und den Energieertrag optimieren.',
    limeButton: false,
  },
];

export default function FurtherServices() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.fs-label', { y: 20, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.5,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' }
      });
      gsap.fromTo('.fs-heading', { y: 30, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.6, delay: 0.1,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' }
      });
      gsap.fromTo('.fs-card', { y: 40, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.7, stagger: 0.15,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 md:py-28 bg-white">
      <div className="max-w-[1280px] mx-auto px-6">
        {/* Header */}
        <div className="max-w-[700px] mx-auto text-center mb-16">
          <div className="fs-label flex items-center justify-center gap-2 mb-4 opacity-0">
            <Zap className="w-4 h-4 text-black" />
            <span className="text-xs font-semibold uppercase tracking-widest text-black">Further Services</span>
          </div>
          <h2 className="fs-heading text-4xl md:text-5xl font-medium text-black leading-tight tracking-tight opacity-0">
            Ueber 10 Jahre Erfahrung in der Solarbranche
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <div
              key={i}
              className="fs-card group bg-white border border-gray-200 rounded-2xl p-8 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 opacity-0"
            >
              <card.icon className="w-12 h-12 text-black stroke-[1.5] mb-6" />
              <h3 className="text-xl font-medium text-black mb-3">{card.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-8">{card.desc}</p>
              <button
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  card.limeButton
                    ? 'bg-[#F5A623] hover:bg-[#E09000]'
                    : 'border border-gray-200 hover:border-gray-300'
                }`}
              >
                <ArrowUpRight className={`w-4 h-4 ${card.limeButton ? 'text-[#1A3A5C]' : 'text-black'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
