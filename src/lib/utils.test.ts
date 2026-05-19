import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn (className merge)', () => {
  it('merged einfache Klassen', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('entfernt duplikate mit tailwind-merge', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('ignoriert false, null und undefined', () => {
    expect(cn('foo', false && 'bar', null, undefined, 'baz')).toBe('foo baz');
  });

  it('handled bedingte Klassen', () => {
    const isActive = true;
    expect(cn('base', isActive && 'active')).toBe('base active');
  });

  it('handled verschachtelte clsx Arrays', () => {
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz');
  });
});
