import { describe, it, expect } from 'vitest';
import { calculateROI } from '@/lib/calculations';
import type { WizardData } from '@/pages/Configurator';

const baseData: WizardData = {
  buildingType: 'einfamilien',
  ownership: 'eigentümer',
  roofTilt: 30,
  roofOrientation: 'S',
  roofArea: '80',
  shading: 'none',
  consumption: '4500',
  consumptionMethod: 'manual',
  storageSize: '10',
  wallbox: false,
  futureCar: false,
  heatPump: false,
  backupPower: false,
  energyApp: false,
  electricityPrice: '0.32',
  constructionYear: 'after2010',
  firstName: 'Max',
  lastName: 'Mustermann',
  email: 'max@test.de',
  phone: '01711234567',
  zipCode: '80331',
  city: 'München',
  company: 'Mustermann GmbH',
  privacyConsent: true,
};

describe('calculateROI', () => {
  it('berechnet ROI mit Standardwerten korrekt', () => {
    const result = calculateROI(baseData);

    expect(result.kwp).toBeGreaterThan(0);
    expect(result.investment).toBeGreaterThan(0);
    expect(result.annualSavings).toBeGreaterThan(0);
    expect(result.amortization).toBeGreaterThan(0);
    expect(result.autarky).toBeGreaterThan(0);
    expect(result.score).toBeGreaterThan(0);
  });

  it('berechnet höheren Score für Eigentümer mit hohem Verbrauch', () => {
    const highValueData: WizardData = {
      ...baseData,
      consumption: '6000',
      wallbox: true,
      backupPower: true,
      energyApp: true,
    };
    const result = calculateROI(highValueData);

    expect(result.score).toBeGreaterThanOrEqual(80);
  });

  it('berechnet niedrigeren Score für Mieter', () => {
    const renterData: WizardData = {
      ...baseData,
      ownership: 'mieter',
      consumption: '3000',
      roofArea: '40',
      wallbox: false,
      backupPower: false,
      energyApp: false,
    };
    const ownerData: WizardData = {
      ...renterData,
      ownership: 'eigentümer',
    };
    const renterResult = calculateROI(renterData);
    const ownerResult = calculateROI(ownerData);

    expect(renterResult.score).toBeLessThan(ownerResult.score);
  });

  it('berechnet kWp basierend auf Dachfläche (mit hohem Verbrauch)', () => {
    const smallRoof: WizardData = { ...baseData, roofArea: '30', consumption: '15000' };
    const largeRoof: WizardData = { ...baseData, roofArea: '150', consumption: '15000' };

    const smallResult = calculateROI(smallRoof);
    const largeResult = calculateROI(largeRoof);

    expect(smallResult.kwp).toBeLessThan(largeResult.kwp);
  });

  it('berechnet Investition basierend auf kWp und Speicher', () => {
    const noStorage: WizardData = { ...baseData, storageSize: '0' };
    const withStorage: WizardData = { ...baseData, storageSize: '15' };

    const noStorageResult = calculateROI(noStorage);
    const withStorageResult = calculateROI(withStorage);

    expect(withStorageResult.investment).toBeGreaterThan(noStorageResult.investment);
  });

  it('berechnet Autarkie basierend auf Speichergröße', () => {
    const noStorage: WizardData = { ...baseData, storageSize: '0' };
    const largeStorage: WizardData = { ...baseData, storageSize: '20' };

    const noStorageResult = calculateROI(noStorage);
    const largeStorageResult = calculateROI(largeStorage);

    expect(largeStorageResult.autarky).toBeGreaterThan(noStorageResult.autarky);
  });

  it('begrenzt Score auf maximal 100', () => {
    const maxData: WizardData = {
      ...baseData,
      consumption: '10000',
      roofArea: '200',
      wallbox: true,
      backupPower: true,
      energyApp: true,
    };
    const result = calculateROI(maxData);

    expect(result.score).toBeLessThanOrEqual(100);
  });
});

describe('calculateROI — Wirtschaftlichkeitsanalyse & Chart', () => {
  it('chartData enthält 21 Datenpunkte (Jahr 0–20)', () => {
    const result = calculateROI(baseData);
    expect(result.chartData).toHaveLength(21);
    expect(result.chartData[0].year).toBe(0);
    expect(result.chartData[20].year).toBe(20);
  });

  it('chartData[0].value = −effectiveInvestment (Startpunkt vor Ersparnis)', () => {
    const result = calculateROI(baseData);
    expect(result.chartData[0].value).toBe(-result.effectiveInvestment);
  });

  it('chartData[20].value entspricht profit20Years', () => {
    const result = calculateROI(baseData);
    expect(result.chartData[20].value).toBe(result.profit20Years);
  });

  it('profit20Years = annualSavings * 20 − effectiveInvestment', () => {
    const result = calculateROI(baseData);
    expect(result.profit20Years).toBe(result.annualSavings * 20 - result.effectiveInvestment);
  });

  it('effectiveInvestment ist nie negativ', () => {
    const result = calculateROI(baseData);
    expect(result.effectiveInvestment).toBeGreaterThanOrEqual(0);
  });

  it('gridFeedIn + selfConsumedEnergy = annualYield', () => {
    const result = calculateROI(baseData);
    expect(result.gridFeedIn + result.selfConsumedEnergy).toBe(result.annualYield);
  });

  it('selfConsumedEnergy überschreitet nie adjustedConsumption', () => {
    const result = calculateROI(baseData);
    expect(result.selfConsumedEnergy).toBeLessThanOrEqual(result.adjustedConsumption);
  });

  it('höherer Strompreis erhöht annualSavings', () => {
    const low = calculateROI({ ...baseData, electricityPrice: '0.20' });
    const high = calculateROI({ ...baseData, electricityPrice: '0.40' });
    expect(high.annualSavings).toBeGreaterThan(low.annualSavings);
  });

  it('Gewerbe hat höhere selfConsumptionRate als Wohngebäude (ohne Speicher)', () => {
    const residential = calculateROI({ ...baseData, buildingType: 'einfamilien', storageSize: '0' });
    const commercial = calculateROI({ ...baseData, buildingType: 'gewerbe', storageSize: '0' });
    expect(commercial.selfConsumptionRate).toBeGreaterThan(residential.selfConsumptionRate);
  });

  it('E-Auto und Wärmepumpe erhöhen adjustedConsumption', () => {
    const base = calculateROI(baseData);
    const withExtras = calculateROI({ ...baseData, futureCar: true, heatPump: true });
    expect(withExtras.adjustedConsumption).toBe(base.adjustedConsumption + 2500 + 3000);
  });
});

describe('calculateROI — Fallbacks für ungültige Eingaben', () => {
  it('negative Dachfläche → wird auf 0 begrenzt (kWp = 0)', () => {
    const result = calculateROI({ ...baseData, roofArea: '-80' });
    expect(result.kwp).toBe(0);
  });

  it('negativer Stromverbrauch → wird auf 0 begrenzt', () => {
    const result = calculateROI({ ...baseData, consumption: '-1000' });
    expect(result.adjustedConsumption).toBe(0);
  });

  it('negativer Strompreis → auf 0 begrenzt, annualSavings = nur EEG-Einspeisevergütung', () => {
    const result = calculateROI({ ...baseData, electricityPrice: '-0.10' });
    // electricityPrice wird auf 0 begrenzt → nur gridFeedIn * 0.082 zählt
    expect(result.annualSavings).toBe(Math.round(result.gridFeedIn * 0.082));
  });

  it('leere Dachfläche → Fallback auf 50 m² (Default)', () => {
    const empty = calculateROI({ ...baseData, roofArea: '' });
    const fallback = calculateROI({ ...baseData, roofArea: '50' });
    expect(empty.kwp).toBe(fallback.kwp);
  });
});
