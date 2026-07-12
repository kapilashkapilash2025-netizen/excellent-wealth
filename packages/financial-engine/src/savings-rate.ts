import type { Money } from '@excellent-wealth/types';
import { CurrencyMismatchError } from './money';

/**
 * Savings rate = (income - expenses) / income, expressed as a percentage.
 * Returns `null` when income is zero, since the ratio is undefined rather
 * than zero in that case — callers should render this as "not available".
 */
export function calculateSavingsRatePercent(
  monthlyIncome: Money,
  monthlyExpenses: Money,
): number | null {
  if (monthlyIncome.currency !== monthlyExpenses.currency) {
    throw new CurrencyMismatchError(monthlyIncome, monthlyExpenses);
  }
  if (monthlyIncome.minorUnits === 0) {
    return null;
  }
  const saved = monthlyIncome.minorUnits - monthlyExpenses.minorUnits;
  return (saved / monthlyIncome.minorUnits) * 100;
}

/**
 * Debt-to-income ratio = total monthly debt payments / monthly gross income,
 * expressed as a percentage. Returns `null` when income is zero.
 */
export function calculateDebtToIncomeRatioPercent(
  monthlyDebtPayments: Money,
  monthlyGrossIncome: Money,
): number | null {
  if (monthlyDebtPayments.currency !== monthlyGrossIncome.currency) {
    throw new CurrencyMismatchError(monthlyDebtPayments, monthlyGrossIncome);
  }
  if (monthlyGrossIncome.minorUnits === 0) {
    return null;
  }
  return (monthlyDebtPayments.minorUnits / monthlyGrossIncome.minorUnits) * 100;
}
