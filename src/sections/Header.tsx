import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Menu, X, ArrowRight, ChevronDown, Zap } from 'lucide-react';

const navLinks = [
  { label: 'Services', href: '#services' },
  { label: 'Ueber uns', href: '#about' },
  { label: 'Neuigkeiten', href: '#news' },
  { label: 'Kontakt', href: '#contact' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * 0.8);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-sm shadow-sm'
            : 'bg-transparent'
        }`}
        style={{ height: 72 }}
      >
        <div className="max-w-[1280px] mx-auto px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <a href="#home" onClick={(e) => { e.preventDefault(); scrollTo('#home'); }} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#F5A623] flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#1A3A5C]" fill="currentColor" />
            </div>
            <span className={`text-lg font-medium transition-colors duration-300 ${scrolled ? 'text-[#1A3A5C]' : 'text-white'}`}>
              Voltify
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => { e.preventDefault(); scrollTo(link.href); }}
                className={`text-sm flex items-center gap-1 transition-colors duration-300 hover:opacity-70 ${
                  scrolled ? 'text-black' : 'text-white'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className={`hidden lg:flex items-center gap-2 text-sm font-medium transition-colors duration-300 hover:opacity-70 ${scrolled ? 'text-[#1A3A5C]' : 'text-white'}`}
            >
              <ArrowLeft className="w-4 h-4" />
              Demo verlassen
            </Link>
            <button
              className={`lg:hidden transition-colors duration-300 ${scrolled ? 'text-[#1A3A5C]' : 'text-white'}`}
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <a
              href="#explore"
              onClick={(e) => { e.preventDefault(); scrollTo('#explore'); }}
              className="hidden lg:flex items-center gap-2 bg-[#F5A623] text-[#1A3A5C] text-sm font-medium px-5 py-2.5 rounded-full hover:bg-[#E09000] transition-all duration-250 hover:scale-[1.02] group"
            >
              Jetzt entdecken
              <span className="w-7 h-7 bg-[#1A3A5C] rounded-full flex items-center justify-center group-hover:bg-[#0F2440] transition-colors">
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </span>
            </a>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-[100] bg-white transition-transform duration-400 ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-end p-6">
          <button onClick={() => setMenuOpen(false)}>
            <X className="w-6 h-6 text-black" />
          </button>
        </div>
        <nav className="flex flex-col items-center gap-8 pt-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => { e.preventDefault(); scrollTo(link.href); }}
              className="text-3xl font-medium text-black hover:text-[#1A3A5C] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </>
  );
}
