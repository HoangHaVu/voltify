import { describe, it, expect, beforeEach, vi } from 'vitest';

// Minimaler localStorage-Mock für Tests
const store: Record<string, string> = {};
Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
  },
  writable: true,
});

beforeEach(() => {
  Object.keys(store).forEach((key) => delete store[key]);
});
import {
  buildDefaultLineItems,
  calculateDraftTotals,
  generateOfferNumber,
  loadOfferPrices,
  DEFAULT_PRICES,
} from '../../src/services/offers';
import type { Lead } from '../../src/services/data';

function makeLead(overrides: Partial<Lead> = {}): Lead {
  return {
    id: '00000000-0000-0000-0000-000000000001',
    first_name: 'Max',
    last_name: 'Mustermann',
    email: 'max@example.de',
    phone: null,
    zip: '80331',
    installer_id: null,
    building_type: 'efh',
    ownership: 'eigentuemer',
    roof_orientation: 'sued',
    roof_tilt: 30,
    roof_area: 60,
    shading: 'none',
    construction_year: 'after2010',
    consumption: 4000,
    has_e_car: false,
    has_heat_pump: false,
    has_battery: false,
    electricity_price: 0.32,
    kwp: 8.5,
    investment: 15000,
    annual_savings: 2500,
    amortization: 8,
    autarky: 75,
    profit_20_years: 35000,
    score: 85,
    planning_horizon: 'sofort',
    needs_financing: false,
    wants_zoom_call: false,
    status: 'neu',
    offer_status: 'created',
    offer_sent_at: null,
    offer_viewed_at: null,
    payment_1_paid: false,
    payment_2_paid: false,
    payment_3_paid: false,
    discount_code: null,
    discount_percentage: null,
    discount_status: 'none',
    final_price: null,
    discount_note: null,
    discount_requested_at: null,
    discount_resolved_at: null,
    site_visit_date: null,
    site_visit_notes: null,
    site_visit_done: false,
    roof_area_measured: null,
    roof_angle: null,
    shading_issues: null,
    source: 'direct',
    module_layout: null,
    created_at: '2025-01-01T00:00:00.000Z',
    ...overrides,
  } as Lead;
}

describe('buildDefaultLineItems', () => {
  it('erzeugt Module, Wechselrichter, Montage und Elektro aus Lead-Daten', () => {
    const lead = makeLead({ kwp: 10, has_battery: false });
    const items = buildDefaultLineItems(lead);

    expect(items).toHaveLength(4);
    expect(items[0].category).toBe('module');
    expect(items[0].quantity).toBe(10);
    expect(items[0].unit_price).toBe(DEFAULT_PRICES.modulePerKwp);
    expect(items[0].total_price).toBe(10 * DEFAULT_PRICES.modulePerKwp);

    expect(items[1].category).toBe('inverter');
    expect(items[2].category).toBe('mounting');
    expect(items[3].category).toBe('electrical');
  });

  it('fügt einen Speicher hinzu, wenn has_battery true ist', () => {
    const lead = makeLead({ kwp: 5, has_battery: true });
    const items = buildDefaultLineItems(lead);

    const storage = items.find((i) => i.category === 'storage');
    expect(storage).toBeDefined();
    expect(storage!.quantity).toBe(10);
    expect(storage!.unit_price).toBe(DEFAULT_PRICES.storagePerKwh);
  });

  it('erzeugt keine Positionen ohne kWp', () => {
    const lead = makeLead({ kwp: null });
    const items = buildDefaultLineItems(lead);

    expect(items.some((i) => i.category === 'module')).toBe(false);
    expect(items.some((i) => i.category === 'inverter')).toBe(false);
    expect(items.some((i) => i.category === 'mounting')).toBe(true);
  });
});

describe('calculateDraftTotals', () => {
  it('summiert die total_price aller Positionen', () => {
    const items = [
      { total_price: 1000 },
      { total_price: 2500 },
      { total_price: 500 },
    ];
    expect(calculateDraftTotals(items).subtotal).toBe(4000);
  });

  it('gibt 0 zurück, wenn keine Positionen vorhanden sind', () => {
    expect(calculateDraftTotals([]).subtotal).toBe(0);
  });
});

describe('generateOfferNumber', () => {
  it('enthält Präfix, Datum und Lead-Kürzel', () => {
    const lead = makeLead({ id: 'abcd1234-0000-0000-0000-000000000000' });
    const num = generateOfferNumber(lead);
    expect(num.startsWith('ANG-')).toBe(true);
    expect(num.includes('ABCD')).toBe(true);
  });
});

describe('loadOfferPrices', () => {
  it('gibt Default-Preise zurück, wenn keine Einstellungen gespeichert sind', () => {
    localStorage.removeItem('voltify_settings_v1');
    expect(loadOfferPrices()).toEqual(DEFAULT_PRICES);
  });

  it('liest Preise aus localStorage-Einstellungen', () => {
    localStorage.setItem('voltify_settings_v1', JSON.stringify({
      modulePricePerKwp: '1500',
      inverterPricePerKwp: '300',
      storagePricePerKwh: '900',
      mountingFixed: '3000',
      electricalFixed: '2000',
      scaffoldingFixed: '1500',
      travelFixed: '100',
      vatRate: '19',
    }));
    const prices = loadOfferPrices();
    expect(prices.modulePerKwp).toBe(1500);
    expect(prices.inverterPerKwp).toBe(300);
    expect(prices.storagePerKwh).toBe(900);
    expect(prices.mountingFixed).toBe(3000);
    expect(prices.electricalFixed).toBe(2000);
    expect(prices.scaffoldingFixed).toBe(1500);
    expect(prices.travelFixed).toBe(100);
    expect(prices.vatRate).toBe(19);
  });
});
