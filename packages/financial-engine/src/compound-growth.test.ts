import { describe, expect, it } from 'vitest';
import { projectCompoundGrowth } from './compound-growth';

describe('projectCompoundGrowth', () => {
  it('returns the principal unchanged over zero years', () => {
    const result = projectCompoundGrowth({
      principal: { minorUnits: 100_000, currency: 'USD' },
      contributionPerPeriod: { minorUnits: 0, currency: 'USD' },
      annualRatePercent: 7,
      compoundingPeriodsPerYear: 12,
      years: 0,
    });
    expect(result.futureValue).toEqual({ minorUnits: 100_000, currency: 'USD' });
  });

  it('compounds a principal with no contributions', () => {
    // $10,000 at 12% annual, compounded monthly (1% per period) for 1 year:
    // 10000 * 1.01^12 ≈ 11268.25
    const result = projectCompoundGrowth({
      principal: { minorUnits: 1_000_000, currency: 'USD' },
      contributionPerPeriod: { minorUnits: 0, currency: 'USD' },
      annualRatePercent: 12,
      compoundingPeriodsPerYear: 12,
      years: 1,
    });
    expect(result.futureValue.minorUnits).toBe(1_126_825);
  });

  it('accounts for periodic contributions', () => {
    const result = projectCompoundGrowth({
      principal: { minorUnits: 0, currency: 'USD' },
      contributionPerPeriod: { minorUnits: 10_000, currency: 'USD' },
      annualRatePercent: 0,
      compoundingPeriodsPerYear: 12,
      years: 1,
    });
    // With 0% interest, future value is simply the sum of 12 contributions.
    expect(result.futureValue).toEqual({ minorUnits: 120_000, currency: 'USD' });
    expect(result.totalContributions).toEqual({ minorUnits: 120_000, currency: 'USD' });
    expect(result.totalGrowth).toEqual({ minorUnits: 0, currency: 'USD' });
  });

  it('handles a zero principal and zero rate over many years without drift', () => {
    const result = projectCompoundGrowth({
      principal: { minorUnits: 0, currency: 'USD' },
      contributionPerPeriod: { minorUnits: 0, currency: 'USD' },
      annualRatePercent: 0,
      compoundingPeriodsPerYear: 12,
      years: 50,
    });
    expect(result.futureValue).toEqual({ minorUnits: 0, currency: 'USD' });
  });

  it('handles very long horizons (retirement-scale projections)', () => {
    const result = projectCompoundGrowth({
      principal: { minorUnits: 10_000_00, currency: 'USD' },
      contributionPerPeriod: { minorUnits: 500_00, currency: 'USD' },
      annualRatePercent: 6,
      compoundingPeriodsPerYear: 12,
      years: 40,
    });
    expect(result.futureValue.minorUnits).toBeGreaterThan(0);
    expect(Number.isFinite(result.futureValue.minorUnits)).toBe(true);
  });

  it('rejects a negative years value', () => {
    expect(() =>
      projectCompoundGrowth({
        principal: { minorUnits: 100_000, currency: 'USD' },
        contributionPerPeriod: { minorUnits: 0, currency: 'USD' },
        annualRatePercent: 5,
        compoundingPeriodsPerYear: 12,
        years: -1,
      }),
    ).toThrow(RangeError);
  });

  it('rejects mismatched currencies between principal and contribution', () => {
    expect(() =>
      projectCompoundGrowth({
        principal: { minorUnits: 100_000, currency: 'USD' },
        contributionPerPeriod: { minorUnits: 100, currency: 'EUR' },
        annualRatePercent: 5,
        compoundingPeriodsPerYear: 12,
        years: 1,
      }),
    ).toThrow(RangeError);
  });
});
