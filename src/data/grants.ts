export interface Grant {
  id: string;
  title: string;
  description: string;
  type: 'national' | 'regional';
  highlight: string;
  icon: string;
  url: string;
  subsidyAmount?: number;
}

export const NATIONAL_GRANTS: Grant[] = [
  {
    id: 'mwst',
    title: '0 % Mehrwertsteuer',
    description:
      'Seit dem 01.01.2023 entfällt die Umsatzsteuer auf Lieferung und Installation von PV-Anlagen und Batteriespeichern auf Wohngebäuden bundesweit.',
    type: 'national',
    highlight: '~19 % Sofortersparnis',
    icon: 'percent',
    url: 'https://www.bundesregierung.de',
  },
  {
    id: 'eeg',
    title: 'EEG Einspeisevergütung',
    description:
      'Für eingespeisten Strom erhältst du 20 Jahre lang eine staatlich garantierte Vergütung von 8,2 ct/kWh (bis 10 kWp) bzw. 7,1 ct/kWh (bis 40 kWp).',
    type: 'national',
    highlight: '20 Jahre garantiert',
    icon: 'zap',
    url: 'https://www.bundesnetzagentur.de',
  },
  {
    id: 'kfw270',
    title: 'KfW 270 – Erneuerbare Energien',
    description:
      'Zinsgünstiger Kredit der KfW-Bank für Errichtung, Erweiterung und Erwerb von PV-Anlagen. Finanzierung bis 150 Mio. €, Laufzeit bis 30 Jahre.',
    type: 'national',
    highlight: 'Kredit ab 5,21 % eff. p.a.',
    icon: 'landmark',
    url: 'https://www.kfw.de',
  },
];

const REGIONAL_GRANTS: Record<string, Grant[]> = {
  '0': [
    {
      id: 'sab',
      title: 'SAB Sachsen Solar',
      description: 'Die Sächsische Aufbaubank (SAB) fördert Photovoltaikanlagen und Batteriespeicher mit zinsgünstigen Darlehen und Zuschüssen.',
      type: 'regional',
      highlight: 'Zuschuss bis 5.000 €',
      icon: 'sun',
      url: 'https://www.sab.de',
      subsidyAmount: 3000,
    },
    {
      id: 'thuefonds',
      title: 'ThüringenFonds Solar',
      description: 'Die Thüringer Aufbaubank (TAB) unterstützt Investitionen in erneuerbare Energien mit günstigen Darlehen.',
      type: 'regional',
      highlight: 'Darlehen ab 1,5 % p.a.',
      icon: 'trees',
      url: 'https://www.aufbaubank.de',
    },
  ],
  '1': [
    {
      id: 'bene',
      title: 'BENE Berlin SolarPLUS',
      description: 'Das Berliner Programm für Nachhaltige Entwicklung fördert PV-Anlagen mit Speicher mit einem direkten Investitionszuschuss.',
      type: 'regional',
      highlight: 'Zuschuss bis 10.000 €',
      icon: 'building',
      url: 'https://www.ibb.de',
      subsidyAmount: 5000,
    },
    {
      id: 'ilb',
      title: 'ILB Brandenburg Solar',
      description: 'Die Investitionsbank des Landes Brandenburg bietet zinsgünstige Darlehen für Photovoltaik- und Speicheranlagen.',
      type: 'regional',
      highlight: 'Darlehen ab 2,0 % p.a.',
      icon: 'forest',
      url: 'https://www.ilb.de',
    },
  ],
  '2': [
    {
      id: 'hamburgenergie',
      title: 'IFB Hamburg Solar',
      description: 'Die Investitions- und Förderbank Hamburg unterstützt PV-Anlagen auf Wohn- und Gewerbegebäuden mit Investitionszuschüssen.',
      type: 'regional',
      highlight: 'Zuschuss bis 2.500 €',
      icon: 'waves',
      url: 'https://www.ifbhh.de',
      subsidyAmount: 1500,
    },
    {
      id: 'eksh',
      title: 'EKSH Schleswig-Holstein',
      description: 'Die Gesellschaft für Energie und Klimaschutz SH fördert innovative Energieprojekte inkl. PV-Anlagen mit Zuschüssen.',
      type: 'regional',
      highlight: 'Zuschuss bis 3.000 €',
      icon: 'wind',
      url: 'https://www.eksh.org',
      subsidyAmount: 1500,
    },
  ],
  '3': [
    {
      id: 'nbank',
      title: 'NBank Energieeinsparung',
      description: 'Die Investitions- und Förderbank Niedersachsen fördert Photovoltaikanlagen auf privaten Wohngebäuden mit zinsgünstigen Darlehen.',
      type: 'regional',
      highlight: 'Darlehen ab 1,8 % p.a.',
      icon: 'leaf',
      url: 'https://www.nbank.de',
    },
  ],
  '4': [
    {
      id: 'progress-nrw',
      title: 'progres.nrw Klimaschutztechnik',
      description: 'Das NRW-Förderprogramm unterstützt Investitionen in klimaschützende Technologien inkl. PV-Anlagen und Batteriespeicher.',
      type: 'regional',
      highlight: 'Zuschuss bis 7.500 €',
      icon: 'factory',
      url: 'https://www.nrwbank.de',
      subsidyAmount: 4000,
    },
  ],
  '5': [
    {
      id: 'progress-nrw-5',
      title: 'progres.nrw Klimaschutztechnik',
      description: 'Das NRW-Förderprogramm unterstützt Investitionen in klimaschützende Technologien inkl. PV-Anlagen und Batteriespeicher.',
      type: 'regional',
      highlight: 'Zuschuss bis 7.500 €',
      icon: 'factory',
      url: 'https://www.nrwbank.de',
      subsidyAmount: 4000,
    },
    {
      id: 'kef-rlp',
      title: 'KEF Rheinland-Pfalz',
      description: 'Die Klimaschutz- und Energieagentur Rheinland-Pfalz fördert PV-Anlagen und Speicher mit Direktzuschüssen.',
      type: 'regional',
      highlight: 'Zuschuss bis 4.000 €',
      icon: 'castle',
      url: 'https://www.isb.rlp.de',
      subsidyAmount: 2000,
    },
  ],
  '6': [
    {
      id: 'huk',
      title: 'Hessen-Umwelt-Kredit',
      description: 'Die WIBank Hessen bietet über den Hessen-Umwelt-Kredit zinsgünstige Darlehen für PV-Anlagen auf Wohngebäuden.',
      type: 'regional',
      highlight: 'Darlehen ab 1,25 % p.a.',
      icon: 'git-branch',
      url: 'https://www.wibank.de',
    },
    {
      id: 'kef-rlp-6',
      title: 'KEF Rheinland-Pfalz',
      description: 'Die Klimaschutz- und Energieagentur RLP fördert PV-Anlagen und Speicher mit Direktzuschüssen.',
      type: 'regional',
      highlight: 'Zuschuss bis 4.000 €',
      icon: 'castle',
      url: 'https://www.isb.rlp.de',
      subsidyAmount: 2000,
    },
  ],
  '7': [
    {
      id: 'lbank',
      title: 'L-Bank Energiesparen Plus',
      description: 'Die Staatsbank für Baden-Württemberg fördert über "Energiesparen Plus" PV-Anlagen und Speicher mit attraktiven Darlehen.',
      type: 'regional',
      highlight: 'Darlehen ab 1,0 % p.a.',
      icon: 'castle',
      url: 'https://www.l-bank.de',
    },
  ],
  '8': [
    {
      id: 'bayernfonds',
      title: 'BayernFonds Solaroffensive',
      description: 'Die LfA Förderbank Bayern unterstützt die Installation von PV-Anlagen und Speichern mit günstigen Krediten.',
      type: 'regional',
      highlight: 'Kredit ab 0,95 % p.a.',
      icon: 'sun',
      url: 'https://www.lfa.de',
    },
  ],
  '9': [
    {
      id: 'bayernfonds-9',
      title: 'BayernFonds Solaroffensive',
      description: 'Die LfA Förderbank Bayern unterstützt PV-Anlagen und Speicher mit günstigen Krediten für Privatpersonen.',
      type: 'regional',
      highlight: 'Kredit ab 0,95 % p.a.',
      icon: 'sun',
      url: 'https://www.lfa.de',
    },
  ],
};

export function getRegionalGrants(zip: string): Grant[] {
  if (!zip || zip.length < 1) return [];
  return REGIONAL_GRANTS[zip[0]] ?? [];
}

export function getGrantSubsidyTotal(zip: string): number {
  return getRegionalGrants(zip).reduce((sum, g) => sum + (g.subsidyAmount ?? 0), 0);
}

export function getStateLabel(zip: string): string {
  if (!zip || zip.length < 1) return 'Deutschland';
  const labels: Record<string, string> = {
    '0': 'Sachsen / Thüringen',
    '1': 'Berlin / Brandenburg',
    '2': 'Hamburg / Schleswig-Holstein',
    '3': 'Niedersachsen / Hessen',
    '4': 'Nordrhein-Westfalen',
    '5': 'NRW / Rheinland-Pfalz',
    '6': 'Hessen / Rheinland-Pfalz',
    '7': 'Baden-Württemberg',
    '8': 'Bayern',
    '9': 'Bayern / Franken',
  };
  return labels[zip[0]] ?? 'Deutschland';
}
