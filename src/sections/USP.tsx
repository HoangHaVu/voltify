import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CheckCircle, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const checklist = [
  'Wechselrichter-Installation',
  'Batteriespeicher-Lösungen',
  'Solarfinanzierung',
  'Bewährte Erfolgsbilanz',
  'Kundenorientierter Ansatz',
  '24/7 Telefon- & Chat-Support',
];

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const numberRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Number count-up
      const numEl = numberRef.current;
      if (numEl) {
        gsap.fromTo(numEl, { innerText: '0' }, {
          innerText: '13',
          duration: 1.5,
          ease: 'power2.out',
          snap: { innerText: 1 },
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
        });
      }

      gsap.fromTo('.about-img', { scale: 0.9, opacity: 0 }, {
        scale: 1, opacity: 1, duration: 0.8,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' }
      });

      gsap.fromTo('.about-badge', { opacity: 0 }, {
        opacity: 1, duration: 0.5, delay: 0.3,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' }
      });

      gsap.fromTo('.check-item', { y: 20, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.4, stagger: 0.1,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 60%' }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={sectionRef} className="py-24 md:py-32 bg-[#F5F5F5]">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left - Big Number */}
          <div className="lg:col-span-3 flex flex-col justify-center">
            <div ref={numberRef} className="text-[120px] md:text-[160px] font-semibold text-black leading-none tracking-tighter">
              13
            </div>
            <p className="text-black text-base mt-2">
              Wir haben Unternehmen bei der<br />Einwerbung von über 15 Mio. $ Finanzierung unterstützt
            </p>
          </div>

          {/* Center - Image with rotating badge */}
          <div className="lg:col-span-4 relative">
            <div className="about-img rounded-2xl overflow-hidden opacity-0">
              <img
                src="/images/about-image.jpg"
                alt="Installation von Solarpanelen"
                className="w-full aspect-[4/5] object-cover"
              />
            </div>
            {/* Rotating Badge */}
            <div className="about-badge absolute -top-4 -left-4 w-[100px] h-[100px] opacity-0">
              <div className="relative w-full h-full animate-spin-slow">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <defs>
                    <path id="circlePath" d="M 50,50 m -35,0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" />
                  </defs>
                  <circle cx="50" cy="50" r="48" fill="#1A3A5C" />
                  <text className="text-[9px] font-semibold uppercase fill-white tracking-widest">
                    <textPath href="#circlePath">
                      Über uns ★ Über uns ★ Über uns ★
                    </textPath>
                  </text>
                </svg>
              </div>
            </div>
          </div>

          {/* Right - Checklist */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <h3 className="text-2xl font-medium text-black mb-6">
              Umfassende Solarlösungen
            </h3>
            <div className="flex flex-col gap-4 mb-8">
              {checklist.map((item, i) => (
                <div key={i} className="check-item flex items-center gap-3 opacity-0">
                  <CheckCircle className="w-5 h-5 text-[#F5A623] flex-shrink-0" />
                  <span className="text-black text-sm">{item}</span>
                </div>
              ))}
            </div>
            <a
              href="#about"
              className="inline-flex items-center gap-2 bg-[#F5A623] text-[#1A3A5C] text-sm font-medium px-6 py-3.5 rounded-full hover:bg-[#E09000] transition-all duration-250 hover:scale-[1.02] group w-fit"
            >
              Über uns
              <span className="w-7 h-7 bg-[#1A3A5C] rounded-full flex items-center justify-center group-hover:bg-[#0F2440] transition-colors">
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
