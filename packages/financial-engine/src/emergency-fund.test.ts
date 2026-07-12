import { describe, expect, it } from 'vitest';
import { assessEmergencyFund } from './emergency-fund';

describe('assessEmergencyFund', () => {
  it('reports a gap when underfunded', () => {
    const result = assessEmergencyFund(
      { minorUnits: 100_000, currency: 'USD' },
      { minorUnits: 200_000, currency: 'USD' },
      6,
    );
    expect(result.targetAmount).toEqual({ minorUnits: 1_200_000, currency: 'USD' });
    expect(result.gap).toEqual({ minorUnits: 1_100_000, currency: 'USD' });
    expect(result.isFullyFunded).toBe(false);
    expect(result.monthsCovered).toBeCloseTo(0.5);
  });

  it('reports fully funded when current meets or exceeds target', () => {
    const result = assessEmergencyFund(
      { minorUnits: 1_200_000, currency: 'USD' },
      { minorUnits: 200_000, currency: 'USD' },
      6,
    );
    expect(result.isFullyFunded).toBe(true);
    expect(result.gap.minorUnits).toBeLessThanOrEqual(0);
  });

  it('handles zero essential expenses as infinite months covered', () => {
    const result = assessEmergencyFund(
      { minorUnits: 500_00, currency: 'USD' },
      { minorUnits: 0, currency: 'USD' },
      3,
    );
    expect(result.monthsCovered).toBe(Number.POSITIVE_INFINITY);
    expect(result.isFullyFunded).toBe(true);
  });

  it('handles a zero current balance', () => {
    const result = assessEmergencyFund(
      { minorUnits: 0, currency: 'USD' },
      { minorUnits: 100_000, currency: 'USD' },
      3,
    );
    expect(result.monthsCovered).toBe(0);
    expect(result.isFullyFunded).toBe(false);
  });

  it('rejects a non-positive target months value', () => {
    expect(() =>
      assessEmergencyFund(
        { minorUnits: 0, currency: 'USD' },
        { minorUnits: 100, currency: 'USD' },
        0,
      ),
    ).toThrow(RangeError);
  });
});
