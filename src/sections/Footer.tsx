import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin, Dribbble, ArrowRight } from 'lucide-react';

const usefulLinks = [
  { label: 'Home', href: '/' },
  { label: 'Preise', href: '/preise' },
  { label: 'Solar-Konfigurator', href: '/konfigurator' },
  { label: 'Datenschutz', href: '/datenschutz' },
  { label: 'Impressum', href: '/impressum' },
  { label: 'AGB', href: '/agb' },
];

export default function Footer() {
  const [email, setEmail] = useState('');

  return (
    <footer id="contact" className="bg-gradient-to-b from-[#0F172A] to-black pt-16 md:pt-20 pb-8">
      <div className="max-w-[1280px] mx-auto px-6">
        {/* Top Row - Logo + Contact Boxes */}
        <div className="flex flex-col lg:flex-row gap-6 mb-16">
          {/* Logo */}
          <div className="flex items-center gap-2 lg:mr-auto">
            <div className="w-10 h-10 rounded-full bg-[#F5A623] flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#1A3A5C]" fill="currentColor" />
            </div>
            <span className="text-xl font-medium text-white">Voltify</span>
          </div>

          {/* Contact Boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 max-w-[700px]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#F5A623] rounded-xl flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-[#1A3A5C]" />
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-0.5">Telefonnummer</div>
                <div className="text-sm text-white">+123-456-7890</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#F5A623] rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-[#1A3A5C]" />
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-0.5">E-Mail</div>
                <div className="text-sm text-white">info@voltify.com</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#F5A623] rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-[#1A3A5C]" />
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-0.5">Unsere Adresse</div>
                <div className="text-sm text-white">East Street, USA 550</div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Row - 4 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* About */}
          <div>
            <h4 className="text-base font-medium text-white mb-4">Über Voltify</h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              Voltify ist die All-in-One Software für Solar-Installateure. Verwalte Leads, erstelle Angebote und Rechnungen, und skaliere dein Geschäft — alles an einem Ort.
            </p>
          </div>

          {/* Useful Links */}
          <div>
            <h4 className="text-base font-medium text-white mb-4">Links</h4>
            <div className="flex flex-col gap-3">
              {usefulLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-base font-medium text-white mb-4">Kontakt</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#F5A623] flex-shrink-0" />
                <span className="text-sm text-gray-400">kontakt@voltify.de</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#F5A623] flex-shrink-0" />
                <span className="text-sm text-gray-400">+49 89 12345678</span>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-base font-medium text-white mb-4">Newsletter</h4>
            <p className="text-sm text-gray-400 mb-4">
              Melde dich für unseren Newsletter an und erhalte die neuesten Updates.
            </p>
            <div className="flex">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ihre E-Mail-Adresse"
                className="flex-1 bg-transparent border border-gray-700 rounded-l-full px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#F5A623]"
              />
              <button className="bg-[#F5A623] text-[#1A3A5C] text-sm font-medium px-5 py-2.5 rounded-r-full hover:bg-[#E09000] transition-colors flex items-center gap-1">
                Anmelden
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link to="/datenschutz" className="text-xs text-gray-500 hover:text-white transition-colors">Datenschutz</Link>
            <Link to="/agb" className="text-xs text-gray-500 hover:text-white transition-colors">AGB</Link>
            <Link to="/impressum" className="text-xs text-gray-500 hover:text-white transition-colors">Impressum</Link>
          </div>

          <p className="text-xs text-gray-500">
            © 2025 Voltify GmbH. Alle Rechte vorbehalten.
          </p>

          <div className="flex items-center gap-4">
            <a href="#" className="text-gray-500 hover:text-white transition-colors"><Facebook className="w-4 h-4" /></a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors"><Twitter className="w-4 h-4" /></a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors"><Instagram className="w-4 h-4" /></a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors"><Linkedin className="w-4 h-4" /></a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors"><Dribbble className="w-4 h-4" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
