import type { Money } from '@excellent-wealth/types';
import { scaleMoney, subtractMoney } from './money';

export interface EmergencyFundAssessment {
  readonly targetAmount: Money;
  readonly currentAmount: Money;
  readonly gap: Money;
  readonly monthsCovered: number;
  readonly isFullyFunded: boolean;
}

/**
 * Assesses an emergency fund against a target of `targetMonths` worth of
 * essential monthly expenses (commonly 3–6 months).
 */
export function assessEmergencyFund(
  currentAmount: Money,
  essentialMonthlyExpenses: Money,
  targetMonths: number,
): EmergencyFundAssessment {
  if (targetMonths <= 0 || !Number.isFinite(targetMonths)) {
    throw new RangeError('targetMonths must be a positive finite number');
  }
  if (currentAmount.currency !== essentialMonthlyExpenses.currency) {
    throw new RangeError('currentAmount and essentialMonthlyExpenses must share the same currency');
  }

  const targetAmount = scaleMoney(essentialMonthlyExpenses, targetMonths);
  // Positive gap = shortfall (target exceeds current). Zero or negative = fully funded.
  const gap = subtractMoney(targetAmount, currentAmount);

  const monthsCovered =
    essentialMonthlyExpenses.minorUnits === 0
      ? Number.POSITIVE_INFINITY
      : currentAmount.minorUnits / essentialMonthlyExpenses.minorUnits;

  return {
    targetAmount,
    currentAmount,
    gap,
    monthsCovered,
    isFullyFunded: gap.minorUnits <= 0,
  };
}
