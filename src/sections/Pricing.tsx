import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Zap, ArrowRight, Check, X } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const plans = [
  {
    name: 'Basic Plan',
    price: '$49.00',
    period: 'Per Month',
    desc: 'Ideal for early-stage projects or small businesses looking for reliable features, security, and foundational support.',
    features: [
      { text: 'Unlimited User Licenses', included: false },
      { text: 'Dedicated Support Team', included: false },
      { text: 'Custom Solutions & Integrations', included: true },
      { text: 'Advanced Security Features', included: true },
      { text: 'Onboarding & Training Sessions', included: true },
    ],
    bg: 'bg-[#F5F5F5]',
  },
  {
    name: 'Professional Plan',
    price: '$99.00',
    period: 'Per Month',
    desc: 'Best suited for scaling businesses that require advanced integrations, enhanced security, and hands-on assistance.',
    features: [
      { text: 'Unlimited User Licenses', included: false },
      { text: 'Dedicated Support Team', included: true },
      { text: 'Custom Solutions & Integrations', included: true },
      { text: 'Advanced Security Features', included: true },
      { text: 'Onboarding & Training Sessions', included: true },
    ],
    bg: 'bg-white border border-gray-200',
  },
  {
    name: 'Premium Plan',
    price: '$149.00',
    period: 'Per Month',
    desc: 'Built for organizations that require tailored solutions, advanced workflows, and continuous optimization.',
    features: [
      { text: 'Unlimited User Licenses', included: true },
      { text: 'Dedicated Support Team', included: true },
      { text: 'Custom Solutions & Integrations', included: true },
      { text: 'Advanced Security Features', included: true },
      { text: 'Onboarding & Training Sessions', included: true },
    ],
    bg: 'bg-white border border-gray-200',
  },
];

export default function Pricing() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.pricing-left', { y: 30, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.6,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' }
      });
      gsap.fromTo('.pricing-card', { y: 40, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.7, stagger: 0.2,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 65%' }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 md:py-32 bg-white">
      <div className="max-w-[1280px] mx-auto px-6 flex flex-col lg:flex-row gap-12 lg:gap-16">
        {/* Left */}
        <div className="pricing-left lg:w-[40%] opacity-0">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-black" />
            <span className="text-xs font-semibold uppercase tracking-widest text-black">Best Pricing Plans</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-medium text-black leading-tight tracking-tight mb-4">
            Flexible best pricing plans for you
          </h2>
          <p className="text-gray-600 text-base leading-relaxed mb-8">
            Choose a plan that fits your needs today and scales effortlessly as your business grows. Our pricing is simple, transparent, and designed to deliver maximum value—without hidden fees or complexity.
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 bg-[#F5A623] text-[#1A3A5C] text-sm font-medium px-6 py-3.5 rounded-full hover:bg-[#E09000] transition-all duration-250 hover:scale-[1.02] group"
          >
            Get in touch
            <span className="w-7 h-7 bg-[#1A3A5C] rounded-full flex items-center justify-center group-hover:bg-[#0F2440] transition-colors">
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </span>
          </a>
        </div>

        {/* Right - Cards */}
        <div className="lg:w-[60%] flex flex-col gap-6">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`pricing-card ${plan.bg} rounded-2xl p-6 md:p-8 hover:border-[#1A3A5C] transition-colors duration-300 opacity-0`}
            >
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className="md:w-1/2">
                  <h3 className="text-lg font-medium text-black mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-4xl font-semibold text-black">{plan.price}</span>
                    <span className="text-sm text-gray-500">{plan.period}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">{plan.desc}</p>
                  <button className="w-full md:w-auto bg-black text-white text-sm font-medium py-3 px-6 rounded-full hover:bg-gray-800 transition-colors">
                    Purchase plan
                  </button>
                </div>
                <div className="md:w-1/2">
                  <h4 className="text-sm font-medium text-black mb-4">Whats included ?</h4>
                  <div className="flex flex-col gap-3">
                    {plan.features.map((f, j) => (
                      <div key={j} className="flex items-center gap-3">
                        {f.included ? (
                          <Check className="w-4 h-4 text-[#F5A623] flex-shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${f.included ? 'text-black' : 'text-gray-500'}`}>{f.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
