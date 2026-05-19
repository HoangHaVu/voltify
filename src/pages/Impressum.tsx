import { Link } from 'react-router-dom';
import { Zap, Mail, ExternalLink } from 'lucide-react';

export default function Impressum() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#F5A623] flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#1A3A5C]" fill="currentColor" />
            </div>
            <span className="text-lg font-semibold text-[#1A3A5C]">Voltify</span>
          </Link>
          <Link to="/" className="text-sm text-gray-500 hover:text-[#1A3A5C] transition-colors">
            Zurück zur Startseite
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <span className="inline-flex items-center gap-1.5 bg-[#1A3A5C]/10 text-[#1A3A5C] text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
            Rechtliches
          </span>
          <h1 className="text-3xl font-bold text-[#1A3A5C] mb-3">Impressum</h1>
          <p className="text-gray-500">Angaben gemäß § 5 TMG</p>
        </div>

        <div className="space-y-10">
          {/* Angaben gemäß § 5 TMG */}
          <section>
            <h2 className="text-xl font-bold text-[#1A3A5C] mb-4">Betreiber der Website</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-[#1A3A5C]">
              <p className="font-bold text-lg mb-2">Voltify GmbH</p>
              <p>Musterstraße 1</p>
              <p>80331 München</p>
              <p className="mt-3">Handelsregister: HRB 123456</p>
              <p>Registergericht: Amtsgericht München</p>
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                <p className="flex items-center gap-2">
                  <span className="text-gray-500">Vertreten durch:</span>
                  <span className="font-medium">Max Mustermann (Geschäftsführer)</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#F5A623]" />
                  <a href="mailto:kontakt@voltify.de" className="text-[#F5A623] hover:underline">kontakt@voltify.de</a>
                </p>
              </div>
            </div>
          </section>

          {/* Umsatzsteuer */}
          <section>
            <h2 className="text-xl font-bold text-[#1A3A5C] mb-4">Umsatzsteuer-ID</h2>
            <p className="text-gray-600">
              Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:
            </p>
            <p className="font-mono text-[#1A3A5C] bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mt-2 inline-block">
              DE123456789
            </p>
          </section>

          {/* Verantwortlich für Inhalte */}
          <section>
            <h2 className="text-xl font-bold text-[#1A3A5C] mb-4">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-[#1A3A5C]">
              <p className="font-medium">Max Mustermann</p>
              <p>Musterstraße 1</p>
              <p>80331 München</p>
            </div>
          </section>

          {/* Streitschlichtung */}
          <section>
            <h2 className="text-xl font-bold text-[#1A3A5C] mb-4">Streitschlichtung</h2>
            <p className="text-gray-600 leading-relaxed">
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
            </p>
            <a
              href="https://ec.europa.eu/consumers/odr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[#F5A623] hover:underline mt-2"
            >
              https://ec.europa.eu/consumers/odr <ExternalLink className="w-3 h-3" />
            </a>
            <p className="text-gray-600 leading-relaxed mt-3">
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>

          {/* Haftung für Inhalte */}
          <section>
            <h2 className="text-xl font-bold text-[#1A3A5C] mb-4">Haftung für Inhalte</h2>
            <p className="text-gray-600 leading-relaxed">
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten
              nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als
              Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
              Informationen zu überwachen oder nach Umständen zu forschen, die auf eine
              rechtswidrige Tätigkeit hinweisen.
            </p>
            <p className="text-gray-600 leading-relaxed mt-3">
              Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach
              den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung
              ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung
              möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese
              Inhalte umgehend entfernen.
            </p>
          </section>

          {/* Haftung für Links */}
          <section>
            <h2 className="text-xl font-bold text-[#1A3A5C] mb-4">Haftung für Links</h2>
            <p className="text-gray-600 leading-relaxed">
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir
              keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine
              Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige
              Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden
              zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft.
              Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.
            </p>
          </section>

          {/* Urheberrecht */}
          <section>
            <h2 className="text-xl font-bold text-[#1A3A5C] mb-4">Urheberrecht</h2>
            <p className="text-gray-600 leading-relaxed">
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten
              unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung,
              Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes
              bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
              Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen
              Gebrauch gestattet.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 text-xs text-gray-400">
          Quelle: <a href="https://www.e-recht24.de" target="_blank" rel="noopener noreferrer" className="text-[#F5A623] hover:underline">e-recht24.de</a>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-3xl mx-auto px-6 flex items-center justify-between text-sm text-gray-500">
          <p>© 2026 Voltify GmbH</p>
          <div className="flex items-center gap-4">
            <Link to="/impressum" className="hover:text-[#1A3A5C] transition-colors">Impressum</Link>
            <Link to="/datenschutz" className="hover:text-[#1A3A5C] transition-colors">Datenschutz</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
