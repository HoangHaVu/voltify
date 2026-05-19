import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { User, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const members = [
  { name: 'James Carter', role: 'Geschäftsführer', img: '/images/team-james.jpg' },
  { name: 'Emily Johnson', role: 'Technische Leiterin', img: '/images/team-emily.jpg' },
  { name: 'Michael Brown', role: 'Produktdirektor', img: '/images/team-michael.jpg' },
  { name: 'Sarah Davis', role: 'Marketingleiterin', img: '/images/team-sarah.jpg' },
];

export default function Team() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.team-info', { y: 30, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.6,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' }
      });
      gsap.fromTo('.team-card', { y: 40, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.7, stagger: 0.12,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="team" ref={sectionRef} className="py-24 md:py-32 bg-[#F5F5F5]">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Info Card */}
          <div className="team-info lg:w-[240px] flex-shrink-0 bg-gradient-to-br from-[#1A3A5C] via-[#0F2440] to-black rounded-2xl p-8 flex flex-col justify-between opacity-0">
            <div>
              <div className="w-10 h-10 rounded-full bg-[#F5A623] flex items-center justify-center mb-6">
                <User className="w-5 h-5 text-[#1A3A5C]" />
              </div>
              <h3 className="text-2xl font-medium text-white leading-tight mb-2">
                Unsere preisgekrönten<br />Referenten & Mentoren
              </h3>
            </div>
            <a
              href="#team"
              className="inline-flex items-center gap-2 bg-[#1A3A5C] text-white text-sm font-medium px-5 py-3 rounded-full hover:bg-[#0F2440] transition-all mt-6 w-fit group"
            >
              Alle Mitglieder anzeigen
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* Team Cards */}
          <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {members.map((m, i) => (
              <div
                key={i}
                className="team-card bg-white rounded-2xl overflow-hidden hover:-translate-y-1 transition-transform duration-300 opacity-0"
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={m.img}
                    alt={m.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h4 className="text-sm font-medium text-black">{m.name}</h4>
                  <p className="text-xs text-gray-500">{m.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
