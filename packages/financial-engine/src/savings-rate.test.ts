import { describe, expect, it } from 'vitest';
import { CurrencyMismatchError } from './money';
import { calculateDebtToIncomeRatioPercent, calculateSavingsRatePercent } from './savings-rate';

describe('calculateSavingsRatePercent', () => {
  it('returns null when income is zero', () => {
    expect(
      calculateSavingsRatePercent(
        { minorUnits: 0, currency: 'USD' },
        { minorUnits: 0, currency: 'USD' },
      ),
    ).toBeNull();
  });

  it('computes a positive savings rate', () => {
    const rate = calculateSavingsRatePercent(
      { minorUnits: 500_000, currency: 'USD' },
      { minorUnits: 400_000, currency: 'USD' },
    );
    expect(rate).toBeCloseTo(20);
  });

  it('computes a negative savings rate when expenses exceed income', () => {
    const rate = calculateSavingsRatePercent(
      { minorUnits: 300_000, currency: 'USD' },
      { minorUnits: 450_000, currency: 'USD' },
    );
    expect(rate).toBeCloseTo(-50);
  });

  it('throws on currency mismatch', () => {
    expect(() =>
      calculateSavingsRatePercent(
        { minorUnits: 500_000, currency: 'USD' },
        { minorUnits: 400_000, currency: 'EUR' },
      ),
    ).toThrow(CurrencyMismatchError);
  });
});

describe('calculateDebtToIncomeRatioPercent', () => {
  it('returns null when income is zero', () => {
    expect(
      calculateDebtToIncomeRatioPercent(
        { minorUnits: 100_000, currency: 'USD' },
        { minorUnits: 0, currency: 'USD' },
      ),
    ).toBeNull();
  });

  it('computes the ratio as a percentage', () => {
    const ratio = calculateDebtToIncomeRatioPercent(
      { minorUnits: 150_000, currency: 'USD' },
      { minorUnits: 500_000, currency: 'USD' },
    );
    expect(ratio).toBeCloseTo(30);
  });
});
