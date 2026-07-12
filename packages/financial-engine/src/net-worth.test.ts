import { describe, expect, it } from 'vitest';
import type { Asset, Liability } from '@excellent-wealth/types';
import { calculateNetWorth } from './net-worth';

function asset(minorUnits: number): Asset {
  return {
    id: 'asset-1',
    userId: 'user-1',
    name: 'Test asset',
    assetClass: 'cash',
    value: { minorUnits, currency: 'USD' },
    asOf: '2026-01-01',
  };
}

function liability(minorUnits: number): Liability {
  return {
    id: 'liability-1',
    userId: 'user-1',
    name: 'Test liability',
    liabilityClass: 'loan',
    balance: { minorUnits, currency: 'USD' },
    annualInterestRatePercent: 5,
    minimumPayment: { minorUnits: 0, currency: 'USD' },
    asOf: '2026-01-01',
  };
}

describe('calculateNetWorth', () => {
  it('returns zero for empty datasets', () => {
    const result = calculateNetWorth([], [], 'USD');
    expect(result.totalAssets.minorUnits).toBe(0);
    expect(result.totalLiabilities.minorUnits).toBe(0);
    expect(result.netWorth.minorUnits).toBe(0);
  });

  it('computes positive net worth when assets exceed liabilities', () => {
    const result = calculateNetWorth([asset(100_000)], [liability(30_000)], 'USD');
    expect(result.netWorth).toEqual({ minorUnits: 70_000, currency: 'USD' });
  });

  it('computes negative net worth when liabilities exceed assets', () => {
    const result = calculateNetWorth([asset(10_000)], [liability(50_000)], 'USD');
    expect(result.netWorth).toEqual({ minorUnits: -40_000, currency: 'USD' });
  });

  it('handles very large portfolios', () => {
    const result = calculateNetWorth(
      [asset(10_000_000_00), asset(5_000_000_00)],
      [liability(2_000_000_00)],
      'USD',
    );
    expect(result.netWorth).toEqual({ minorUnits: 13_000_000_00, currency: 'USD' });
  });
});
