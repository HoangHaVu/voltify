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
  backupPower: false,
  energyApp: false,
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
    const result = calculateROI(renterData);

    expect(result.score).toBeLessThanOrEqual(60);
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
