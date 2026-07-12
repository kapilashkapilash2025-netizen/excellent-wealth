import { describe, expect, it } from 'vitest';
import {
  CurrencyMismatchError,
  addMoney,
  isNegative,
  isZero,
  roundHalfToEven,
  scaleMoney,
  subtractMoney,
  sumMoney,
  toMajorUnits,
} from './money';

describe('addMoney', () => {
  it('adds two amounts in the same currency', () => {
    expect(
      addMoney({ minorUnits: 500, currency: 'USD' }, { minorUnits: 250, currency: 'USD' }),
    ).toEqual({ minorUnits: 750, currency: 'USD' });
  });

  it('throws CurrencyMismatchError for mismatched currencies', () => {
    expect(() =>
      addMoney({ minorUnits: 500, currency: 'USD' }, { minorUnits: 250, currency: 'EUR' }),
    ).toThrow(CurrencyMismatchError);
  });

  it('handles negative amounts', () => {
    expect(
      addMoney({ minorUnits: -500, currency: 'USD' }, { minorUnits: 200, currency: 'USD' }),
    ).toEqual({ minorUnits: -300, currency: 'USD' });
  });

  it('handles very large amounts without precision loss', () => {
    const large = 9_007_199_254_740_000; // within Number.MAX_SAFE_INTEGER range
    expect(
      addMoney({ minorUnits: large, currency: 'USD' }, { minorUnits: 0, currency: 'USD' }),
    ).toEqual({ minorUnits: large, currency: 'USD' });
  });
});

describe('subtractMoney', () => {
  it('can produce a negative result', () => {
    expect(
      subtractMoney({ minorUnits: 100, currency: 'USD' }, { minorUnits: 300, currency: 'USD' }),
    ).toEqual({ minorUnits: -200, currency: 'USD' });
  });
});

describe('sumMoney', () => {
  it('returns zero for an empty list', () => {
    expect(sumMoney([], 'USD')).toEqual({ minorUnits: 0, currency: 'USD' });
  });

  it('sums a list of amounts', () => {
    const amounts = [
      { minorUnits: 100, currency: 'USD' as const },
      { minorUnits: 200, currency: 'USD' as const },
      { minorUnits: 300, currency: 'USD' as const },
    ];
    expect(sumMoney(amounts, 'USD')).toEqual({ minorUnits: 600, currency: 'USD' });
  });
});

describe('roundHalfToEven', () => {
  it('rounds .5 down when the floor is even', () => {
    expect(roundHalfToEven(2.5)).toBe(2);
  });

  it('rounds .5 up when the floor is odd', () => {
    expect(roundHalfToEven(3.5)).toBe(4);
  });

  it('rounds values below .5 down', () => {
    expect(roundHalfToEven(2.4)).toBe(2);
  });

  it('rounds values above .5 up', () => {
    expect(roundHalfToEven(2.6)).toBe(3);
  });
});

describe('scaleMoney', () => {
  it('scales an amount by a factor', () => {
    expect(scaleMoney({ minorUnits: 1000, currency: 'USD' }, 3)).toEqual({
      minorUnits: 3000,
      currency: 'USD',
    });
  });

  it('rejects non-finite factors', () => {
    expect(() => scaleMoney({ minorUnits: 1000, currency: 'USD' }, Number.NaN)).toThrow(RangeError);
  });

  it('handles a zero amount', () => {
    expect(scaleMoney({ minorUnits: 0, currency: 'USD' }, 6)).toEqual({
      minorUnits: 0,
      currency: 'USD',
    });
  });
});

describe('isNegative / isZero', () => {
  it('identifies negative amounts', () => {
    expect(isNegative({ minorUnits: -1, currency: 'USD' })).toBe(true);
    expect(isNegative({ minorUnits: 0, currency: 'USD' })).toBe(false);
  });

  it('identifies zero amounts', () => {
    expect(isZero({ minorUnits: 0, currency: 'USD' })).toBe(true);
    expect(isZero({ minorUnits: 1, currency: 'USD' })).toBe(false);
  });
});

describe('toMajorUnits', () => {
  it('converts cents to dollars for a 2-decimal currency', () => {
    expect(toMajorUnits({ minorUnits: 12345, currency: 'USD' }, 2)).toBeCloseTo(123.45);
  });

  it('converts yen with zero minor-unit digits', () => {
    expect(toMajorUnits({ minorUnits: 500, currency: 'JPY' }, 0)).toBe(500);
  });
});
