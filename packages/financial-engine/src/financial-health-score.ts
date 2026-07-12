export interface FinancialHealthInputs {
  /** Savings rate as a percentage, e.g. 20 for 20%. Null if income is zero. */
  readonly savingsRatePercent: number | null;
  /** Debt-to-income ratio as a percentage. Null if income is zero. */
  readonly debtToIncomeRatioPercent: number | null;
  /** Emergency fund coverage in months (may exceed the target). */
  readonly emergencyFundMonthsCovered: number;
  /** Emergency fund target in months, used to normalise coverage into a score. */
  readonly emergencyFundTargetMonths: number;
}

export interface FinancialHealthScoreComponent {
  readonly label: string;
  readonly score: number; // 0-100
  readonly weight: number; // 0-1, all components sum to 1
  readonly observedValue: number | null;
  readonly explanation: string;
}

export interface FinancialHealthScoreResult {
  readonly overallScore: number; // 0-100
  readonly components: readonly FinancialHealthScoreComponent[];
  readonly disclaimer: string;
}

const DISCLAIMER =
  'This score is an educational, rules-based estimate derived from the figures you provided. ' +
  'It is not personalised financial advice and does not guarantee any financial outcome.';

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, value));
}

/**
 * Produces an explainable financial health score in the range 0-100 from
 * three weighted, transparently-computed components. Every component
 * exposes its observed input and a plain-language explanation so the score
 * is never a black box.
 */
export function calculateFinancialHealthScore(
  inputs: FinancialHealthInputs,
): FinancialHealthScoreResult {
  const savingsComponent: FinancialHealthScoreComponent = {
    label: 'Savings rate',
    weight: 0.4,
    observedValue: inputs.savingsRatePercent,
    score:
      inputs.savingsRatePercent === null ? 0 : clampScore((inputs.savingsRatePercent / 20) * 100),
    explanation:
      inputs.savingsRatePercent === null
        ? 'No income was provided, so a savings rate could not be calculated.'
        : `A savings rate of ${inputs.savingsRatePercent.toFixed(1)}% is scored against a 20% benchmark.`,
  };

  const debtComponent: FinancialHealthScoreComponent = {
    label: 'Debt-to-income ratio',
    weight: 0.35,
    observedValue: inputs.debtToIncomeRatioPercent,
    score:
      inputs.debtToIncomeRatioPercent === null
        ? 100
        : clampScore(100 - (inputs.debtToIncomeRatioPercent / 36) * 100),
    explanation:
      inputs.debtToIncomeRatioPercent === null
        ? 'No income was provided, so a debt-to-income ratio could not be calculated.'
        : `A debt-to-income ratio of ${inputs.debtToIncomeRatioPercent.toFixed(1)}% is scored against a 36% caution threshold.`,
  };

  const emergencyFundComponent: FinancialHealthScoreComponent = {
    label: 'Emergency fund coverage',
    weight: 0.25,
    observedValue: inputs.emergencyFundMonthsCovered,
    score: clampScore((inputs.emergencyFundMonthsCovered / inputs.emergencyFundTargetMonths) * 100),
    explanation: `${inputs.emergencyFundMonthsCovered.toFixed(1)} months of essential expenses are covered, against a ${inputs.emergencyFundTargetMonths}-month target.`,
  };

  const components = [savingsComponent, debtComponent, emergencyFundComponent];
  const overallScore = clampScore(
    components.reduce((sum, component) => sum + component.score * component.weight, 0),
  );

  return { overallScore, components, disclaimer: DISCLAIMER };
}
