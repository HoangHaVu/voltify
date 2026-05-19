import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { User, MessageCircle, ArrowRight, Zap } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const posts = [
  {
    img: '/images/blog-1.jpg',
    author: 'Voltify',
    readTime: '4 Min. Lesedauer',
    title: 'Wie eine überzeugende Solar-Website mehr Leads generiert',
  },
  {
    img: '/images/blog-2.jpg',
    author: 'Voltify',
    readTime: '3 Min. Lesedauer',
    title: 'Solar-Website-Design-Trends, die Sie 2025 beobachten sollten',
  },
  {
    img: '/images/blog-3.jpg',
    author: 'Voltify',
    readTime: '2 Min. Lesedauer',
    title: 'Erstellen Sie eine beeindruckende Online-Präsenz für Solarlösungen',
  },
];

export default function News() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.news-card', { y: 40, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.7, stagger: 0.15,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' }
      });
      gsap.fromTo('.news-btn', { y: 20, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.5, delay: 0.5,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="news" ref={sectionRef} className="py-24 md:py-32 bg-white">
      <div className="max-w-[1280px] mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-black" />
            <span className="text-xs font-semibold uppercase tracking-widest text-black">Blog</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-medium text-black leading-tight tracking-tight mb-4">
            Aktuelles aus der Solar-Branche
          </h2>
          <p className="text-gray-500 text-base max-w-[560px] mx-auto leading-relaxed">
            Tipps, Trends und Insights rund um Solarenergie, Digitalisierung und nachhaltiges Geschaeftswachstum.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {posts.map((post, i) => (
            <article
              key={i}
              className="news-card group cursor-pointer opacity-0"
            >
              {/* Image */}
              <div className="relative rounded-2xl overflow-hidden mb-4">
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={post.img}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                {/* Author badge strip */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-[#1A3A5C] via-[#0F2440] to-black px-4 py-2 flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-white" />
                    <span className="text-xs font-medium text-white">{post.author}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-white" />
                    <span className="text-xs font-medium text-white">{post.readTime}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <h3 className="text-lg font-medium text-black leading-snug mb-3 group-hover:text-gray-700 transition-colors">
                {post.title}
              </h3>
              <span className="inline-flex items-center gap-2 text-sm text-black font-medium group-hover:gap-3 transition-all">
                Mehr lesen <ArrowRight className="w-4 h-4" />
              </span>
            </article>
          ))}
        </div>

        {/* More news button */}
        <div className="text-center">
          <a
            href="#news"
            className="news-btn inline-flex items-center gap-2 bg-[#F5A623] text-[#1A3A5C] text-sm font-medium px-6 py-3.5 rounded-full hover:bg-[#E09000] transition-all duration-250 hover:scale-[1.02] group opacity-0"
          >
            Weitere Neuigkeiten
            <span className="w-7 h-7 bg-[#1A3A5C] rounded-full flex items-center justify-center group-hover:bg-[#0F2440] transition-colors group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
