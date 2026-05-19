import { Link } from 'react-router-dom';
import { Zap, Shield, Mail, ExternalLink } from 'lucide-react';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-10">
    <h2 className="text-xl font-bold text-[#1A3A5C] mb-4">{title}</h2>
    <div className="text-gray-600 leading-relaxed space-y-3">{children}</div>
  </section>
);

export default function Datenschutz() {
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
          <span className="inline-flex items-center gap-1.5 bg-[#F5A623]/10 text-[#1A3A5C] text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
            <Shield className="w-3 h-3" />
            Rechtliches
          </span>
          <h1 className="text-3xl font-bold text-[#1A3A5C] mb-3">Datenschutzerklärung</h1>
          <p className="text-gray-500">Stand: Mai 2026</p>
        </div>

        <Section title="§ 1 Verantwortlicher">
          <p>Verantwortlich für die Verarbeitung personenbezogener Daten auf dieser Website ist:</p>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 font-medium text-[#1A3A5C] mt-3">
            <p>Voltify GmbH</p>
            <p>Musterstraße 1</p>
            <p>80331 München</p>
            <p className="mt-2 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-[#F5A623]" />
              <a href="mailto:datenschutz@voltify.de" className="text-[#F5A623] hover:underline">datenschutz@voltify.de</a>
            </p>
          </div>
        </Section>

        <Section title="§ 2 Welche Daten erheben wir?">
          <p>Wir erheben und verarbeiten folgende personenbezogene Daten:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>
              <strong>Konfigurations-Daten:</strong> Postleitzahl, Gebäudetyp, Dachfläche,
              Dachausrichtung, Dachneigung, Jahresstromverbrauch, Speicher-Präferenz.
              Diese Daten werden ausschließlich zur Berechnung der Wirtschaftlichkeitsanalyse
              verwendet und nicht dauerhaft gespeichert, solange kein Angebot angefordert wird.
            </li>
            <li>
              <strong>Lead-Formular:</strong> Vorname, Nachname, E-Mail-Adresse, Telefonnummer
              (optional) sowie die Angabe, ob eine Zoom-Beratung gewünscht wird. Diese Daten
              werden bei der Angebotsanforderung in unserer Datenbank gespeichert.
            </li>
            <li>
              <strong>Konto-Daten:</strong> Bei freiwilliger Registrierung zusätzlich
              E-Mail-Adresse und Passwort (verschlüsselt gespeichert, niemals im Klartext).
            </li>
            <li>
              <strong>Technische Daten:</strong> IP-Adresse, Browser-Typ, Zugriffszeiten
              (Serverlog — automatisch durch den Hosting-Anbieter erhoben).
            </li>
          </ul>
        </Section>

        <Section title="§ 3 Zweck und Rechtsgrundlage der Verarbeitung">
          <p>Wir verarbeiten deine Daten auf Basis folgender Rechtsgrundlagen der DSGVO:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>
              <strong>Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung):</strong> Verarbeitung
              deiner Kontaktdaten zur Erstellung und Übermittlung eines individuellen
              PV-Angebots.
            </li>
            <li>
              <strong>Art. 6 Abs. 1 lit. a DSGVO (Einwilligung):</strong> Verarbeitung deiner
              Daten zur Durchführung der Wirtschaftlichkeitsberechnung nach ausdrücklicher
              Zustimmung im Formular.
            </li>
            <li>
              <strong>Art. 6 Abs. 1 lit. f DSGVO (berechtigte Interessen):</strong> Technische
              Protokollierung zur Sicherstellung des Betriebs und zur Missbrauchsprävention.
            </li>
          </ul>
        </Section>

        <Section title="§ 4 Speicherdauer">
          <p>Deine Daten werden gelöscht, sobald der Zweck der Verarbeitung entfällt und keine
          gesetzlichen Aufbewahrungspflichten entgegenstehen:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>
              <strong>Lead-Daten:</strong> Werden gespeichert, solange eine aktive
              Geschäftsbeziehung besteht oder bis du die Löschung anforderst, spätestens
              jedoch nach 3 Jahren ohne Kontakt.
            </li>
            <li>
              <strong>Konto-Daten:</strong> Werden nach Löschung deines Kontos innerhalb von
              30 Tagen entfernt.
            </li>
            <li>
              <strong>Serverprotokolle:</strong> Werden nach 7 Tagen automatisch gelöscht.
            </li>
          </ul>
        </Section>

        <Section title="§ 5 Weitergabe an Dritte">
          <p>
            Deine personenbezogenen Daten werden ausschließlich an geprüfte, regionale
            Installationsbetriebe weitergegeben, die dein Angebot erstellen. Diese Betriebe
            sind vertraglich zur DSGVO-konformen Verarbeitung verpflichtet.
          </p>
          <p>
            Eine Weitergabe an sonstige Dritte, insbesondere zu Werbezwecken, findet
            nicht statt.
          </p>
        </Section>

        <Section title="§ 6 Auftragsverarbeitung — Supabase">
          <p>
            Wir nutzen <strong>Supabase</strong> (Supabase Inc., 970 Toa Payoh North, Singapur)
            als Datenbankdienstleister. Die Daten werden dabei ausschließlich auf
            <strong> EU-Servern in Frankfurt am Main (AWS eu-central-1)</strong> gespeichert
            und verarbeitet. Mit Supabase besteht ein Auftragsverarbeitungsvertrag (AVV) gemäß
            Art. 28 DSGVO.
          </p>
        </Section>

        <Section title="§ 7 Deine Rechte">
          <p>Du hast gegenüber uns folgende Rechte hinsichtlich deiner personenbezogenen Daten:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li><strong>Recht auf Auskunft</strong> — Art. 15 DSGVO</li>
            <li><strong>Recht auf Berichtigung</strong> — Art. 16 DSGVO</li>
            <li><strong>Recht auf Löschung</strong> ("Recht auf Vergessenwerden") — Art. 17 DSGVO</li>
            <li><strong>Recht auf Einschränkung der Verarbeitung</strong> — Art. 18 DSGVO</li>
            <li><strong>Recht auf Datenübertragbarkeit</strong> — Art. 20 DSGVO</li>
            <li><strong>Widerspruchsrecht</strong> — Art. 21 DSGVO</li>
            <li><strong>Recht auf Widerruf einer Einwilligung</strong> — Art. 7 Abs. 3 DSGVO</li>
          </ul>
          <p className="mt-3">
            Zur Ausübung deiner Rechte wende dich per E-Mail an:
            <a href="mailto:datenschutz@voltify.de" className="text-[#F5A623] font-semibold hover:underline ml-1">
              datenschutz@voltify.de
            </a>
          </p>
        </Section>

        <Section title="§ 8 Beschwerderecht bei der Aufsichtsbehörde">
          <p>
            Du hast das Recht, dich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung
            deiner personenbezogenen Daten zu beschweren. Die zuständige Behörde für Bayern ist:
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 font-medium text-[#1A3A5C] mt-3">
            <p>Bayerisches Landesamt für Datenschutzaufsicht (BayLDA)</p>
            <p>Promenade 18</p>
            <p>91522 Ansbach</p>
            <p className="mt-2">
              <a href="https://www.lda.bayern.de" target="_blank" rel="noopener noreferrer" className="text-[#F5A623] hover:underline inline-flex items-center gap-1">
                www.lda.bayern.de <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>
        </Section>

        <Section title="§ 9 Cookies und lokaler Speicher">
          <p>
            Diese Website verwendet <strong>keine Tracking-Cookies</strong> und kein
            Google Analytics. Wir nutzen ausschließlich technisch notwendige
            Session-Cookies, die für den sicheren Login und die Aufrechterhaltung
            deiner Sitzung erforderlich sind (Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO).
          </p>
          <p>
            Der Browser-LocalStorage wird temporär genutzt, um deine Konfiguration während
            des Wizard-Flows zwischenzuspeichern. Diese Daten verlassen deinen Browser nicht
            und werden nach dem Schließen des Tabs gelöscht.
          </p>
        </Section>

        <div className="mt-12 pt-8 border-t border-gray-200 text-xs text-gray-400">
          Diese Datenschutzerklärung wurde zuletzt am <strong>01. Mai 2026</strong> aktualisiert.
          Wir behalten uns vor, diese bei Bedarf anzupassen.
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
