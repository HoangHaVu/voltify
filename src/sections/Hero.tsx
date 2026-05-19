import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowRight, Star } from 'lucide-react';

const marqueeWords = ['SOLAR', 'GREEN', 'ENERGY', 'FUTURE', 'CLEAN', 'POWER'];

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const descRef = useRef<HTMLParagraphElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      headlineRefs.current.forEach((el, i) => {
        if (el) {
          tl.fromTo(el, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, i * 0.15);
        }
      });

      if (descRef.current) {
        tl.fromTo(descRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, 0.5);
      }

      if (cardRef.current) {
        tl.fromTo(cardRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, 0.7);
      }

      if (marqueeRef.current) {
        tl.fromTo(marqueeRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8 }, 1);
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative min-h-[100dvh] flex flex-col justify-end overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/hero-bg.jpg"
          alt="Solar farm"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Gradient Overlay — schwarz, wie LandingPage-Stil */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/60 via-black/30 to-black/80" />

      {/* Content */}
      <div className="relative z-[2] max-w-[1280px] mx-auto px-6 w-full pb-24 pt-32">
        {/* Headline */}
        <div className="mb-8">
          <div ref={(el) => { headlineRefs.current[0] = el; }} className="opacity-0">
            <h1 className="text-white text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-medium tracking-tight leading-[1.05]">
              Solarenergie
            </h1>
          </div>
          <div ref={(el) => { headlineRefs.current[1] = el; }} className="opacity-0">
            <h1 className="text-white text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-medium tracking-tight leading-[1.05]">
              die die Welt
            </h1>
          </div>
          <div ref={(el) => { headlineRefs.current[2] = el; }} className="opacity-0">
            <h1 className="text-[#F5A623] text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-medium tracking-tight leading-[1.05]">
              voranbringt
            </h1>
          </div>
        </div>

        {/* Two column: description + reviews card */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
          <p
            ref={descRef}
            className="text-white/80 text-base max-w-[480px] leading-relaxed opacity-0"
          >
            Bei Voltify planen und installieren wir Solaranlagen, die Effizienz und langfristigen Wert maximieren. Schließen Sie sich der Energiewende an und übernehmen Sie die Kontrolle über Ihre Energie — heute und für die Zukunft.
          </p>

          {/* Reviews Card */}
          <div
            ref={cardRef}
            className="bg-white rounded-2xl px-5 py-4 shadow-lg flex items-center gap-4 opacity-0 w-fit"
          >
            <span className="text-sm font-medium text-black">Jetzt entdecken</span>
            <a
              href="#explore"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('#explore')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-10 h-10 bg-[#1A3A5C] rounded-full flex items-center justify-center hover:bg-[#0F2440] transition-colors cursor-pointer"
            >
              <ArrowRight className="w-4 h-4 text-white" />
            </a>
            <div className="flex items-center">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center overflow-hidden"
                  >
                    <img src={`/images/team-${['james', 'emily', 'michael', 'sarah'][i - 1]}.jpg`} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="ml-3">
                <div className="text-xs font-semibold text-black">100+ Bewertungen</div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-[#F5A623] text-[#F5A623]" /> 4,96 von 5
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Marquee Strip */}
      <div ref={marqueeRef} className="relative z-[2] pb-8 opacity-0 overflow-hidden">
        <div className="flex whitespace-nowrap">
          <div className="animate-marquee-left flex items-center gap-8 md:gap-12">
            {[...marqueeWords, ...marqueeWords].map((word, i) => (
              <span key={i} className="text-white/15 text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-medium uppercase tracking-wider flex items-center gap-8 md:gap-12 select-none">
                {word}
                <span className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-white/20" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
