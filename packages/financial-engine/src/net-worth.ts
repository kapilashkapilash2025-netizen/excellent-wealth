import type { Asset, CurrencyCode, Liability, Money } from '@excellent-wealth/types';
import { subtractMoney, sumMoney } from './money';

export interface NetWorthResult {
  readonly totalAssets: Money;
  readonly totalLiabilities: Money;
  readonly netWorth: Money;
}

/**
 * Computes total assets, total liabilities, and net worth for a single
 * currency. Assets and liabilities in other currencies must be converted
 * before calling this function — mixing currencies here would silently
 * misrepresent net worth.
 */
export function calculateNetWorth(
  assets: readonly Asset[],
  liabilities: readonly Liability[],
  currency: CurrencyCode,
): NetWorthResult {
  const totalAssets = sumMoney(
    assets.map((asset) => asset.value),
    currency,
  );
  const totalLiabilities = sumMoney(
    liabilities.map((liability) => liability.balance),
    currency,
  );
  const netWorth = subtractMoney(totalAssets, totalLiabilities);

  return { totalAssets, totalLiabilities, netWorth };
}
