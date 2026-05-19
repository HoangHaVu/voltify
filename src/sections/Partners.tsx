import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Placeholder logos as SVG components
function Logo1() { return <svg viewBox="0 0 120 30" className="h-5 opacity-50"><text x="0" y="22" className="text-sm font-bold fill-gray-500">LOGO</text></svg>; }
function Logo2() { return <svg viewBox="0 0 120 30" className="h-5 opacity-50"><text x="0" y="22" className="text-sm font-bold fill-gray-500">IPSUM</text></svg>; }
function Logo3() { return <svg viewBox="0 0 120 30" className="h-5 opacity-50"><text x="0" y="22" className="text-sm font-bold fill-gray-500">ACME</text></svg>; }
function Logo4() { return <svg viewBox="0 0 120 30" className="h-5 opacity-50"><text x="0" y="22" className="text-sm font-bold fill-gray-500">GLOBE</text></svg>; }
function Logo5() { return <svg viewBox="0 0 120 30" className="h-5 opacity-50"><text x="0" y="22" className="text-sm font-bold fill-gray-500">TECH</text></svg>; }
function Logo6() { return <svg viewBox="0 0 120 30" className="h-5 opacity-50"><text x="0" y="22" className="text-sm font-bold fill-gray-500">ENERGY</text></svg>; }

const logos = [Logo1, Logo2, Logo3, Logo4, Logo5, Logo6];

export default function Partners() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.partners-heading', { y: 20, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.6,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 85%' }
      });
      gsap.fromTo('.partner-logo', { opacity: 0 }, {
        opacity: 0.5, duration: 0.4, stagger: 0.1,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-16 bg-white">
      <div className="max-w-[1280px] mx-auto px-6 flex flex-col md:flex-row items-center gap-8 md:gap-16">
        <h4 className="partners-heading text-lg font-medium text-black whitespace-nowrap opacity-0">
          Unterstützt von den weltweit<br />führenden Venture-Capital-Investoren
        </h4>
        <div className="flex items-center gap-8 md:gap-12 flex-wrap justify-center">
          {logos.map((Logo, i) => (
            <div key={i} className="partner-logo opacity-0">
              <Logo />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
