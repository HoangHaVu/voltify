// GHI (Global Horizontal Irradiance) in kWh/m²/Jahr nach PLZ-Präfix (erste 2 Ziffern)
// Quellen: DWD Klimaatlas, PVGIS EU-Kommission — Deutschland-Durchschnittswerte pro Region

const PLZ_IRRADIATION: Record<string, number> = {
  // Sachsen, Thüringen, Brandenburg
  '00': 950, '01': 960, '02': 940, '03': 950, '04': 960,
  '06': 990, '07': 1010, '08': 1020, '09': 1030,
  // Berlin, Brandenburg
  '10': 980, '11': 970, '12': 980, '13': 970, '14': 970, '15': 960,
  // Mecklenburg-Vorpommern
  '16': 960, '17': 920, '18': 910, '19': 900,
  // Hamburg, Schleswig-Holstein (niedrigster Ertrag)
  '20': 940, '21': 940, '22': 940, '23': 920, '24': 930, '25': 920,
  // Niedersachsen, Bremen
  '26': 950, '27': 960, '28': 960, '29': 970,
  // Niedersachsen, Sachsen-Anhalt, Hessen (Nord)
  '30': 1000, '31': 990, '32': 1000, '33': 990, '34': 1010,
  '35': 1020, '36': 1030, '37': 1010,
  '38': 1010, '39': 1010,
  // NRW
  '40': 1000, '41': 1000, '42': 1000, '43': 1010, '44': 1010,
  '45': 1000, '46': 1000, '47': 1010, '48': 1010, '49': 1010,
  // NRW, Rheinland-Pfalz, Saarland
  '50': 1020, '51': 1030, '52': 1020, '53': 1030, '54': 1040,
  '55': 1050, '56': 1040, '57': 1030, '58': 1010, '59': 1010,
  // Hessen, Rheinland-Pfalz
  '60': 1050, '61': 1060, '63': 1060, '64': 1060, '65': 1060,
  '66': 1060, '67': 1070, '68': 1080, '69': 1080,
  // Baden-Württemberg (hoher Ertrag)
  '70': 1100, '71': 1090, '72': 1100, '73': 1090, '74': 1100,
  '75': 1100, '76': 1110, '77': 1100, '78': 1100, '79': 1120,
  // Bayern (höchster Ertrag)
  '80': 1150, '81': 1150, '82': 1160, '83': 1170, '84': 1170,
  '85': 1160, '86': 1150, '87': 1170, '88': 1130, '89': 1120,
  '90': 1100, '91': 1100, '92': 1090, '93': 1110, '94': 1130,
  // Bayern, Thüringen, Sachsen (Ost)
  '95': 1090, '96': 1080, '97': 1080, '98': 1050, '99': 1040,
};

const DEFAULT_IRRADIATION = 1000;

export function getIrradiationByZip(zip: string): number {
  if (!zip || zip.length < 2) return DEFAULT_IRRADIATION;
  return PLZ_IRRADIATION[zip.substring(0, 2)] ?? DEFAULT_IRRADIATION;
}

// Regionsbeschreibung für UI-Feedback
export function getRegionLabel(zip: string): string {
  if (!zip || zip.length < 1) return '';
  const prefix = parseInt(zip.substring(0, 1), 10);
  if (prefix <= 1) return 'Ost/Mitte';
  if (prefix === 2) return 'Nord';
  if (prefix <= 3) return 'Mitte';
  if (prefix <= 5) return 'West/Mitte';
  if (prefix === 6) return 'Rhein-Main';
  if (prefix === 7) return 'Südwest';
  if (prefix <= 9) return 'Bayern';
  return '';
}
