import { Link } from 'react-router-dom';
import { Sun, ArrowLeft } from 'lucide-react';

const SECTIONS = [
  {
    id: '1',
    title: 'Geltungsbereich',
    content: [
      'Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung der Softwareplattform Voltify sowie für alle damit verbundenen Dienstleistungen.',
      'Mit der Registrierung oder Nutzung unserer Plattform akzeptieren Sie diese AGB in vollem Umfang. Abweichende Bedingungen des Nutzers werden nicht anerkannt.',
      'Voltify ist eine Softwarelösung zur Lead-Erfassung, Angebots- und Projektmanagement für Installateure und Projektentwickler im Bereich erneuerbare Energien.',
    ],
  },
  {
    id: '2',
    title: 'Vertragsschluss & Registrierung',
    content: [
      'Die Registrierung auf Voltify ist kostenlos und erfolgt durch Angabe einer gültigen E-Mail-Adresse und Erstellung eines Passworts.',
      'Der Vertrag kommt mit erfolgreicher Registrierung zustande. Es besteht kein Anspruch auf Abschluss eines Vertrags.',
      'Jeder Nutzer ist verpflichtet, wahrheitsgemäße Angaben zu machen und diese bei Änderungen zeitnah zu aktualisieren.',
      'Die Übertragung von Zugangsdaten an Dritte ist untersagt. Jeder Nutzer haftet für die sichere Aufbewahrung seiner Anmeldedaten.',
    ],
  },
  {
    id: '3',
    title: 'Leistungsbeschreibung',
    content: [
      'Voltify stellt eine cloudbasierte Softwareplattform zur Verfügung, die folgende Funktionen umfasst: Lead-Management, Kalender & Terminplanung, Angebots- und Rechnungsgenerierung, Teamverwaltung, Reporting sowie einen öffentlichen Solar-Konfigurator.',
      'Die Verfügbarkeit der Plattform wird mit 99,5% pro Monat angestrebt. Wartungsarbeiten werden möglichst außerhalb der Geschäftszeiten durchgeführt und im Voraus angekündigt.',
      'Voltify behält sich das Recht vor, Funktionen zu erweitern, zu ändern oder einzustellen, sofern dies die vertragsgemäße Nutzung nicht wesentlich beeinträchtigt.',
    ],
  },
  {
    id: '4',
    title: 'Preise & Zahlungsbedingungen',
    content: [
      'Die Nutzung von Voltify erfolgt auf Basis der gewählten Tarife (Starter, Professional, Enterprise). Alle Preise verstehen sich monatlich in Euro zuzüglich der gesetzlich geltenden Umsatzsteuer.',
      'Die Abrechnung erfolgt monatlich im Voraus. Bei Vertragsbeginn wird der anteilige Betrag für den laufenden Monat berechnet.',
      'Die Zahlung erfolgt per SEPA-Lastschrift oder Überweisung auf das von Voltify angegebene Konto innerhalb von 14 Tagen nach Rechnungsstellung.',
      'Bei Zahlungsverzug nach erfolgter Mahnung behält sich Voltify vor, den Zugang zur Plattform vorübergehend zu sperren.',
    ],
  },
  {
    id: '5',
    title: 'Datenschutz & Datensicherheit',
    content: [
      'Die Erhebung, Verarbeitung und Nutzung personenbezogener Daten erfolgt gemäß unserer Datenschutzerklärung und den geltenden Datenschutzgesetzen (DSGVO).',
      'Voltify ergreift angemessene technische und organisatorische Maßnahmen zum Schutz der gespeicherten Daten vor Verlust, Manipulation und unbefugtem Zugriff.',
      'Nutzerdaten werden ausschließlich auf Servern innerhalb der EU gespeichert. Eine Datenweitergabe an Dritte erfolgt nur im gesetzlich erlaubten Rahmen oder mit ausdrücklicher Einwilligung des Nutzers.',
    ],
  },
  {
    id: '6',
    title: 'Rechte & Pflichten des Nutzers',
    content: [
      'Der Nutzer erhält ein nicht übertragbares, zeitlich auf die Vertragslaufzeit beschränktes Nutzungsrecht an der Plattform.',
      'Es ist untersagt, die Plattform für rechtswidrige Zwecke zu nutzen, Viren oder schädliche Software hochzuladen oder die Sicherheit der Plattform zu gefährden.',
      'Der Nutzer ist verantwortlich für die von ihm eingegebenen Inhalte (Kundendaten, Angebote, Rechnungen) und stellt Voltify von entsprechenden Drittforderungen frei.',
      'Eine automatisierte oder manuelle Datenerfassung (Scraping) der Plattform ist ohne ausdrückliche Genehmigung untersagt.',
    ],
  },
  {
    id: '7',
    title: 'Haftung',
    content: [
      'Voltify haftet unbeschränkt für Vorsatz und grobe Fahrlässigkeit, sowie für die Verletzung des Lebens, des Körpers oder der Gesundheit.',
      'Bei leichter Fahrlässigkeit haftet Voltify nur bei Verletzung wesentlicher Vertragspflichten (Kardinalpflichten). Die Haftung ist in diesem Fall auf den vorhersehbaren, typischerweise eintretenden Schaden begrenzt.',
      'Voltify übernimmt keine Haftung für die Richtigkeit von Berechnungen des Solar-Konfigurators. Alle Angaben zu Ersparnis, Amortisation und Gewinn sind Prognosen auf Basis von Standardannahmen.',
      'Eine Haftung für Datenverlust ist auf die Kosten einer angemessenen Datenwiederherstellung beschränkt, sofern der Verlust nicht vorsätzlich oder grob fahrlässig verursacht wurde.',
    ],
  },
  {
    id: '8',
    title: 'Vertragslaufzeit & Kündigung',
    content: [
      'Der Vertrag läuft auf unbestimmte Zeit und kann von beiden Parteien jederzeit zum Ende des laufenden Abrechnungszeitraums gekündigt werden.',
      'Die Kündigung erfolgt schriftlich per E-Mail an kontakt@voltify.de oder über die Kündigungsfunktion in den Account-Einstellungen.',
      'Nach Kündigung werden die Nutzerdaten 90 Tage aufbewahrt und anschließend DSGVO-konform gelöscht. Der Nutzer ist für einen rechtzeitigen Export seiner Daten verantwortlich.',
      'Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt.',
    ],
  },
  {
    id: '9',
    title: 'Änderung der AGB',
    content: [
      'Voltify behält sich das Recht vor, diese AGB jederzeit zu ändern. Änderungen werden dem Nutzer per E-Mail mitgeteilt und gelten als akzeptiert, sofern der Nutzer nicht innerhalb von 14 Tagen widerspricht.',
      'Bei wesentlichen Änderungen wird der Nutzer gesondert auf das Widerspruchsrecht hingewiesen.',
    ],
  },
  {
    id: '10',
    title: 'Schlussbestimmungen',
    content: [
      'Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.',
      'Gerichtsstand für alle Streitigkeiten aus diesem Vertrag ist der Sitz von Voltify GmbH, sofern der Nutzer Kaufmann ist.',
      'Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt der Vertrag im Übrigen wirksam. Die unwirksame Bestimmung wird durch eine wirksame ersetzt, die dem wirtschaftlichen Zweck möglichst nahekommt.',
    ],
  },
];

export default function AGB() {
  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#0F0F0F]">
        <div className="max-w-[900px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-[#F5A623]/10 flex items-center justify-center">
              <Sun className="w-5 h-5 text-[#F5A623]" />
            </div>
            <span className="font-black text-lg text-white tracking-tight">Voltify</span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[800px] mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-white mb-2">
            Allgemeine Geschäftsbedingungen
          </h1>
          <p className="text-gray-500 text-sm">
            Stand: Mai 2025 · Voltify GmbH
          </p>
        </div>

        <div className="space-y-8">
          {SECTIONS.map((section) => (
            <section key={section.id} id={`section-${section.id}`}>
              <h2 className="text-lg font-bold text-[#F5A623] mb-3">
                § {section.id} {section.title}
              </h2>
              <div className="space-y-2">
                {section.content.map((paragraph, i) => (
                  <p key={i} className="text-sm text-gray-300 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Contact */}
        <div className="mt-12 pt-8 border-t border-white/5">
          <h2 className="text-lg font-bold text-white mb-3">Kontakt</h2>
          <p className="text-sm text-gray-400 leading-relaxed mb-2">
            Bei Fragen zu diesen AGB können Sie uns jederzeit kontaktieren:
          </p>
          <div className="text-sm text-gray-300 space-y-1">
            <p><strong className="text-white">Voltify GmbH</strong></p>
            <p>E-Mail: <a href="mailto:kontakt@voltify.de" className="text-[#F5A623] hover:underline">kontakt@voltify.de</a></p>
            <p>Web: <a href="https://voltify.de" className="text-[#F5A623] hover:underline">voltify.de</a></p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 px-6">
        <div className="max-w-[800px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© 2025 Voltify GmbH. Alle Rechte vorbehalten.</p>
          <div className="flex gap-4">
            <Link to="/datenschutz" className="hover:text-white transition-colors">Datenschutz</Link>
            <Link to="/impressum" className="hover:text-white transition-colors">Impressum</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
