import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Plus, Minus, Zap } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const faqs = [
  {
    q: 'Wie lange dauert eine Solarinstallation in der Regel?',
    a: 'Die meisten privaten Solarinstallationen werden innerhalb von 1–3 Tagen abgeschlossen, je nach Systemgröße.',
  },
  {
    q: 'Funktionieren Solarmodule auch an bewölkten Tagen?',
    a: 'Ja, Solarmodule erzeugen auch an bewölkten Tagen Strom, wenn auch mit verringerter Effizienz. Sie können diffuses Sonnenlicht einfangen und weiterhin Energie produzieren, auch wenn die Sonne nicht direkt scheint.',
  },
  {
    q: 'Welche Wartung benötigen Solarsysteme?',
    a: 'Solarsysteme benötigen nur minimale Wartung. In der Regel genügt es, die Module 2–4 Mal pro Jahr zu reinigen und eine jährliche professionelle Inspektion durchführen zu lassen, um das System optimal betreiben zu können.',
  },
  {
    q: 'Was ist eine netzgekoppelte Solarlösung?',
    a: 'Ein netzgekoppeltes Solarsystem ist mit dem Stromnetz verbunden und ermöglicht es Ihnen, bei Bedarf Strom zu beziehen und überschüssige Energie über Net-Metering-Programme zurück ins Netz zu verkaufen.',
  },
];

export default function FAQ() {
  const sectionRef = useRef<HTMLElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.faq-img', { scale: 0.92, opacity: 0 }, {
        scale: 1, opacity: 1, duration: 0.8,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' }
      });
      gsap.fromTo('.faq-item', { y: 20, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.5, stagger: 0.1,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 65%' }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 md:py-32 bg-[#F5F5F5]">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left - Image */}
          <div className="relative">
            <div className="faq-img rounded-2xl overflow-hidden opacity-0">
              <img
                src="/images/faq-image.jpg"
                alt="Solarmodule"
                className="w-full aspect-[4/5] object-cover"
              />
            </div>
            {/* Experience Badge */}
            <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-sm rounded-xl px-5 py-4 shadow-lg">
              <div className="text-3xl font-semibold text-black">10+</div>
              <div className="text-xs text-black/80">Jahre Erfahrung<br />und Expertise</div>
            </div>
          </div>

          {/* Right - FAQ */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-black" />
              <span className="text-xs font-semibold uppercase tracking-widest text-black">Haben Sie Fragen?</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-medium text-black leading-tight tracking-tight mb-8">
              Haben Sie Fragen? Hier einige Antworten für Sie
            </h2>

            <div className="flex flex-col">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className="faq-item border-b border-gray-200 opacity-0"
                >
                  <button
                    className="w-full flex items-center justify-between py-5 text-left"
                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  >
                    <span className="text-base font-medium text-black pr-4">{faq.q}</span>
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                      {openIndex === i ? (
                        <Minus className="w-5 h-5 text-black" />
                      ) : (
                        <Plus className="w-5 h-5 text-black" />
                      )}
                    </span>
                  </button>
                  <div
                    className="overflow-hidden transition-all duration-300"
                    style={{ maxHeight: openIndex === i ? '200px' : '0' }}
                  >
                    <p className="text-sm text-gray-600 leading-relaxed pb-5">{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
