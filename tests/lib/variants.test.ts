import { describe, it, expect } from 'vitest';
import { generateStorageVariants } from '../../src/lib/calculations';
import type { Lead } from '../../src/services/data';

function makeLead(overrides: Partial<Lead> = {}): Lead {
  return {
    id: 'test-lead',
    first_name: 'Max',
    last_name: 'Mustermann',
    email: 'max@example.com',
    phone: null,
    zip: '80331', // München — hohe Einstrahlung
    building_type: 'efh',
    ownership: 'eigentuemer',
    roof_orientation: 'S',
    roof_tilt: 30,
    roof_area: 60,
    shading: 'none',
    construction_year: 'after2010',
    consumption: 4500,
    has_e_car: false,
    has_heat_pump: false,
    has_battery: false,
    electricity_price: 0.32,
    kwp: null,
    investment: null,
    annual_savings: null,
    amortization: null,
    autarky: null,
    profit_20_years: null,
    score: null,
    planning_horizon: null,
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
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  } as Lead;
}

describe('generateStorageVariants', () => {
  it('generiert genau 3 Varianten', () => {
    const lead = makeLead();
    const variants = generateStorageVariants(lead);
    expect(variants).toHaveLength(3);
  });

  it('erste Variante ist "Einstieg" ohne Speicher', () => {
    const lead = makeLead();
    const variants = generateStorageVariants(lead);
    expect(variants[0].variant_key).toBe('einstieg');
    expect(variants[0].storage_kwh).toBe(0);
    expect(variants[0].has_wallbox).toBe(false);
    expect(variants[0].is_recommended).toBe(false);
  });

  it('zweite Variante ist "Optimal" mit 10 kWh + Empfohlen-Badge', () => {
    const lead = makeLead();
    const variants = generateStorageVariants(lead);
    expect(variants[1].variant_key).toBe('optimal');
    expect(variants[1].storage_kwh).toBe(10);
    expect(variants[1].has_wallbox).toBe(false);
    expect(variants[1].is_recommended).toBe(true);
  });

  it('dritte Variante ist "Zukunftssicher" mit 15 kWh + Wallbox', () => {
    const lead = makeLead();
    const variants = generateStorageVariants(lead);
    expect(variants[2].variant_key).toBe('zukunftssicher');
    expect(variants[2].storage_kwh).toBe(15);
    expect(variants[2].has_wallbox).toBe(true);
  });

  it('Einstieg hat niedrigste Investition', () => {
    const lead = makeLead();
    const variants = generateStorageVariants(lead);
    expect(variants[0].investment).toBeLessThan(variants[1].investment!);
    expect(variants[1].investment).toBeLessThan(variants[2].investment!);
  });

  it('Zukunftssicher hat höchste Autarkie', () => {
    const lead = makeLead();
    const variants = generateStorageVariants(lead);
    expect(variants[2].autarky).toBeGreaterThanOrEqual(variants[1].autarky!);
    expect(variants[1].autarky).toBeGreaterThanOrEqual(variants[0].autarky!);
  });

  it('Gewerbe-Lead: höhere Eigenverbrauchsrate auch ohne Speicher', () => {
    const lead = makeLead({ building_type: 'gewerbe', consumption: 8000, roof_area: 120 });
    const variants = generateStorageVariants(lead);
    // Gewerbe ohne Speicher = 60%, mit Speicher = 80%
    expect(variants[0].autarky).toBeGreaterThan(50);
    expect(variants[1].autarky).toBeGreaterThanOrEqual(variants[0].autarky!);
  });

  it('kleines Dach: geringere kWp, aber Varianten-Struktur bleibt', () => {
    const lead = makeLead({ roof_area: 25 });
    const variants = generateStorageVariants(lead);
    expect(variants[0].kwp).toBeLessThan(5);
    expect(variants[2].kwp).toBeLessThan(5);
    // Trotz kleinem Dach: 3 Varianten mit aufsteigendem Speicher
    expect(variants[0].storage_kwh).toBe(0);
    expect(variants[2].storage_kwh).toBe(15);
  });
});
