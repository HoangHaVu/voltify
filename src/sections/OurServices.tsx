import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Zap, ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const cards = [
  { img: '/images/service-rooftop.jpg', title: 'Solaranlage auf dem Dach', icon: '/icons/rooftop.svg' },
  { img: '/images/service-maintenance.jpg', title: 'Wartung von Solaranlagen', icon: '/icons/maint.svg' },
  { img: '/images/service-offgrid.jpg', title: 'Off-Grid-Solarinstallation', icon: '/icons/offgrid.svg' },
];

export default function OurServices() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.os-text', { y: 30, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.6,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' }
      });
      gsap.fromTo('.os-card', { y: 50, opacity: 0, scale: 0.95 }, {
        y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.15,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 65%' }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="services" ref={sectionRef} className="py-24 md:py-32 bg-white">
      <div className="max-w-[1280px] mx-auto px-6">
        {/* Header */}
        <div className="os-text mb-12 opacity-0">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-black" />
            <span className="text-xs font-semibold uppercase tracking-widest text-black">Unsere Services</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-medium text-black leading-tight tracking-tight max-w-[600px] mb-4">
            Maßgeschneiderte Solaranlagen, die zu Ihnen passen
          </h2>
          <p className="text-gray-600 text-base max-w-[600px]">
            Unser Team entwirft und installiert maßgeschneiderte Solaranlagen basierend auf Ihrem individuellen Energieverbrauch, Grundstückslayout und Budget – für maximale Effizienz, langfristige Einsparungen und Unabhängigkeit von Energieversorgern.
          </p>
        </div>

        {/* Cards with nav */}
        <div className="relative">
          <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {cards.map((card, i) => (
              <div
                key={i}
                className="os-card group relative flex-shrink-0 w-[300px] md:w-[360px] rounded-2xl overflow-hidden snap-start opacity-0 cursor-pointer"
              >
                <div className="aspect-[3/4] relative overflow-hidden">
                  <img
                    src={card.img}
                    alt={card.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Arrow icon top-right for middle card */}
                  {i === 1 && (
                    <div className="absolute top-4 right-4 w-10 h-10 bg-[#F5A623] rounded-full flex items-center justify-center">
                      <ArrowUpRight className="w-4 h-4 text-[#1A3A5C]" />
                    </div>
                  )}

                  {/* Bottom content */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="w-10 h-10 mb-3">
                      <SunMiniIcon />
                    </div>
                    <h3 className="text-xl font-medium text-white leading-snug">{card.title}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation arrows */}
          <button className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 rounded-full border border-gray-200 bg-white items-center justify-center hover:bg-gray-50 transition-colors z-10">
            <ChevronLeft className="w-5 h-5 text-black" />
          </button>
          <button className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 rounded-full bg-[#F5A623] items-center justify-center hover:bg-[#E09000] transition-colors z-10">
            <ChevronRight className="w-5 h-5 text-[#1A3A5C]" />
          </button>
        </div>
      </div>
    </section>
  );
}

function SunMiniIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="text-white">
      <circle cx="20" cy="20" r="6" stroke="currentColor" strokeWidth="2" />
      <path d="M20 6V10M20 30V34M6 20H10M30 20H34M10.3 10.3L13.1 13.1M26.9 26.9L29.7 29.7M10.3 29.7L13.1 26.9M26.9 13.1L29.7 10.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
