import { describe, it, expect } from 'vitest';
import { calculateGrid } from '@/lib/moduleLayout';

describe('calculateGrid', () => {
  it('returns correct module count for 5 kWp', () => {
    const result = calculateGrid(5.0, 60, 'S');
    expect(result.moduleCount).toBe(13); // Math.round(5000/400) = 12.5 → 13
  });

  it('returns correct module count for 10 kWp', () => {
    const result = calculateGrid(10.0, 100, 'S');
    expect(result.moduleCount).toBe(25); // Math.round(10000/400)
  });

  it('places exactly moduleCount modules in modulesPx', () => {
    const result = calculateGrid(8.4, 80, 'SW');
    expect(result.modulesPx.length).toBe(result.moduleCount);
  });

  it('rows * cols >= moduleCount', () => {
    const result = calculateGrid(12.0, 120, 'O');
    expect(result.rows * result.cols).toBeGreaterThanOrEqual(result.moduleCount);
  });

  it('all modules have positive width and height', () => {
    const result = calculateGrid(6.0, 70, 'W');
    result.modulesPx.forEach((m) => {
      expect(m.w).toBeGreaterThan(0);
      expect(m.h).toBeGreaterThan(0);
    });
  });

  it('grid is centered: first module x is positive', () => {
    const result = calculateGrid(5.0, 60, 'S');
    expect(result.modulesPx[0].x).toBeGreaterThan(0);
    expect(result.modulesPx[0].y).toBeGreaterThan(0);
  });

  it('grid fits within canvas (640px) for typical roof', () => {
    const result = calculateGrid(10.0, 90, 'S');
    const lastModule = result.modulesPx[result.modulesPx.length - 1];
    expect(lastModule.x + lastModule.w).toBeLessThanOrEqual(640);
    expect(lastModule.y + lastModule.h).toBeLessThanOrEqual(640);
  });

  it('handles very small system (0.8 kWp) without crashing', () => {
    const result = calculateGrid(0.8, 10, 'N');
    expect(result.moduleCount).toBe(2);
    expect(result.modulesPx.length).toBe(2);
  });

  it('module width is larger than height (landscape orientation)', () => {
    const result = calculateGrid(5.0, 60, 'S');
    expect(result.moduleW).toBeGreaterThan(result.moduleH);
  });

  it('larger roof area produces smaller pixel modules (lower density)', () => {
    const small = calculateGrid(5.0, 40, 'S');
    const large = calculateGrid(5.0, 200, 'S');
    expect(small.moduleW).toBeGreaterThan(large.moduleW);
  });

  it('orientation parameter does not crash for all 8 directions', () => {
    const dirs = ['S', 'SO', 'SW', 'O', 'W', 'NO', 'NW', 'N'];
    dirs.forEach((d) => {
      expect(() => calculateGrid(5.0, 60, d)).not.toThrow();
    });
  });
});
