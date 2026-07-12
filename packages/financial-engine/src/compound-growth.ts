import Decimal from 'decimal.js';
import type { Money } from '@excellent-wealth/types';

export interface CompoundGrowthInput {
  readonly principal: Money;
  /** Regular contribution added at the end of each compounding period. */
  readonly contributionPerPeriod: Money;
  /** Nominal annual interest rate as a percentage, e.g. 7 for 7%. */
  readonly annualRatePercent: number;
  /** Number of times interest compounds per year (e.g. 12 for monthly). */
  readonly compoundingPeriodsPerYear: number;
  readonly years: number;
}

export interface CompoundGrowthResult {
  readonly futureValue: Money;
  readonly totalContributions: Money;
  readonly totalGrowth: Money;
}

/**
 * Projects the future value of a principal plus periodic contributions under
 * compound interest. This is an educational simulation of a fixed rate of
 * return — it is not a prediction or guarantee of actual investment
 * performance, which fluctuates and can result in losses.
 *
 * Uses decimal.js throughout so repeated compounding over long horizons does
 * not accumulate binary floating-point rounding error.
 */
export function projectCompoundGrowth(input: CompoundGrowthInput): CompoundGrowthResult {
  const { principal, contributionPerPeriod, annualRatePercent, compoundingPeriodsPerYear, years } =
    input;

  if (compoundingPeriodsPerYear <= 0 || !Number.isFinite(compoundingPeriodsPerYear)) {
    throw new RangeError('compoundingPeriodsPerYear must be a positive finite number');
  }
  if (years < 0 || !Number.isFinite(years)) {
    throw new RangeError('years must be a non-negative finite number');
  }
  if (principal.currency !== contributionPerPeriod.currency) {
    throw new RangeError('principal and contributionPerPeriod must share the same currency');
  }

  const totalPeriods = Math.round(compoundingPeriodsPerYear * years);
  const periodicRate = new Decimal(annualRatePercent).div(100).div(compoundingPeriodsPerYear);
  const onePlusRate = periodicRate.plus(1);

  let balance = new Decimal(principal.minorUnits);
  const contribution = new Decimal(contributionPerPeriod.minorUnits);

  for (let period = 0; period < totalPeriods; period += 1) {
    balance = balance.times(onePlusRate).plus(contribution);
  }

  const totalContributions = contribution.times(totalPeriods);
  const finalBalance = balance.toDecimalPlaces(0, Decimal.ROUND_HALF_EVEN);
  const totalGrowth = finalBalance
    .minus(new Decimal(principal.minorUnits))
    .minus(totalContributions);

  return {
    futureValue: { minorUnits: finalBalance.toNumber(), currency: principal.currency },
    totalContributions: {
      minorUnits: totalContributions.toDecimalPlaces(0, Decimal.ROUND_HALF_EVEN).toNumber(),
      currency: principal.currency,
    },
    totalGrowth: {
      minorUnits: totalGrowth.toDecimalPlaces(0, Decimal.ROUND_HALF_EVEN).toNumber(),
      currency: principal.currency,
    },
  };
}
