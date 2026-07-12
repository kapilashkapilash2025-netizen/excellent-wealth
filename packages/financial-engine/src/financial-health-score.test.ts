import { describe, expect, it } from 'vitest';
import { calculateFinancialHealthScore } from './financial-health-score';

describe('calculateFinancialHealthScore', () => {
  it('scores a strong financial position highly', () => {
    const result = calculateFinancialHealthScore({
      savingsRatePercent: 25,
      debtToIncomeRatioPercent: 10,
      emergencyFundMonthsCovered: 6,
      emergencyFundTargetMonths: 6,
    });
    expect(result.overallScore).toBeGreaterThan(80);
  });

  it('scores a weak financial position lowly', () => {
    const result = calculateFinancialHealthScore({
      savingsRatePercent: 0,
      debtToIncomeRatioPercent: 50,
      emergencyFundMonthsCovered: 0,
      emergencyFundTargetMonths: 6,
    });
    expect(result.overallScore).toBeLessThan(30);
  });

  it('treats a null savings rate as a zero-scoring component with an explanation', () => {
    const result = calculateFinancialHealthScore({
      savingsRatePercent: null,
      debtToIncomeRatioPercent: null,
      emergencyFundMonthsCovered: 3,
      emergencyFundTargetMonths: 6,
    });
    const savings = result.components.find((c) => c.label === 'Savings rate');
    expect(savings?.score).toBe(0);
    expect(savings?.explanation).toMatch(/no income/i);
  });

  it('always includes a disclaimer', () => {
    const result = calculateFinancialHealthScore({
      savingsRatePercent: 10,
      debtToIncomeRatioPercent: 20,
      emergencyFundMonthsCovered: 3,
      emergencyFundTargetMonths: 6,
    });
    expect(result.disclaimer.length).toBeGreaterThan(0);
  });

  it('clamps the overall score between 0 and 100 even with extreme inputs', () => {
    const result = calculateFinancialHealthScore({
      savingsRatePercent: 500,
      debtToIncomeRatioPercent: -50,
      emergencyFundMonthsCovered: 1000,
      emergencyFundTargetMonths: 6,
    });
    expect(result.overallScore).toBeLessThanOrEqual(100);
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
  });
});
