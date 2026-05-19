import { describe, it, expect } from 'vitest';
import { computeLeadScore, getScoreResult } from '@/utils/leadScore';

describe('computeLeadScore', () => {
  it('berechnet Score 0 für leere Parameter', () => {
    const score = computeLeadScore({});
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('berechnet höheren Score für größere Anlagen', () => {
    const small = computeLeadScore({ kwp: 5 });
    const large = computeLeadScore({ kwp: 15 });
    expect(large).toBeGreaterThan(small);
  });

  it('berechnet höheren Score für höhere Investition', () => {
    const low = computeLeadScore({ investment: 5000 });
    const high = computeLeadScore({ investment: 25000 });
    expect(high).toBeGreaterThan(low);
  });

  it('gibt Bonus für Eigentümer', () => {
    const owner = computeLeadScore({ isOwner: true });
    const notOwner = computeLeadScore({ isOwner: false });
    expect(owner).toBeGreaterThan(notOwner);
  });

  it('gibt Bonus für Speicher', () => {
    const withBattery = computeLeadScore({ hasBattery: true });
    const withoutBattery = computeLeadScore({ hasBattery: false });
    expect(withBattery).toBeGreaterThan(withoutBattery);
  });

  it('gibt Bonus für sofortige Planung', () => {
    const sofort = computeLeadScore({ planningHorizon: 'sofort' });
    const dreiMonate = computeLeadScore({ planningHorizon: '3monate' });
    const unbekannt = computeLeadScore({ planningHorizon: 'unbekannt' });
    expect(sofort).toBeGreaterThan(dreiMonate);
    expect(dreiMonate).toBeGreaterThanOrEqual(unbekannt);
  });

  it('begrenzt Score auf maximal 100', () => {
    const maxScore = computeLeadScore({
      kwp: 30,
      investment: 50000,
      zip: '80331',
      isOwner: true,
      hasBattery: true,
      planningHorizon: 'sofort',
    });
    expect(maxScore).toBeLessThanOrEqual(100);
  });
});

describe('getScoreResult', () => {
  it('gibt heiß für Score >= 70', () => {
    const result = getScoreResult(75);
    expect(result.tier).toBe('heiss');
    expect(result.label).toBe('Heiß');
  });

  it('gibt warm für Score zwischen 40 und 69', () => {
    const result = getScoreResult(50);
    expect(result.tier).toBe('warm');
    expect(result.label).toBe('Warm');
  });

  it('gibt kalt für Score < 40', () => {
    const result = getScoreResult(30);
    expect(result.tier).toBe('kalt');
    expect(result.label).toBe('Kalt');
  });

  it('gibt korrekte Farben zurück', () => {
    const heiss = getScoreResult(80);
    expect(heiss.color).toContain('#F5A623');

    const warm = getScoreResult(50);
    expect(warm.color).toContain('#1A3A5C');

    const kalt = getScoreResult(20);
    expect(kalt.color).toContain('gray');
  });
});
