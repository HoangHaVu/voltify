import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Zap } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function Experience() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.exp-label', { y: 20, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.5,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' }
      });
      gsap.fromTo('.exp-heading', { y: 30, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.6, delay: 0.1,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 bg-white">
      <div className="max-w-[700px] mx-auto px-6 text-center">
        <div className="exp-label flex items-center justify-center gap-2 mb-4 opacity-0">
          <Zap className="w-4 h-4 text-black" />
          <span className="text-xs font-semibold uppercase tracking-widest text-black">Weitere Services</span>
        </div>
        <h2 className="exp-heading text-4xl md:text-5xl font-medium text-black leading-tight tracking-tight opacity-0">
          Über 10 Jahre Erfahrung in der Solarbranche
        </h2>
      </div>
    </section>
  );
}
