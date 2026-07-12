import type { Money } from '@excellent-wealth/types';

export class CurrencyMismatchError extends Error {
  constructor(a: Money, b: Money) {
    super(`Cannot combine amounts in different currencies: ${a.currency} vs ${b.currency}`);
    this.name = 'CurrencyMismatchError';
  }
}

function assertSameCurrency(a: Money, b: Money): void {
  if (a.currency !== b.currency) {
    throw new CurrencyMismatchError(a, b);
  }
}

/** Adds two Money values. Both must share the same currency. */
export function addMoney(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return { minorUnits: a.minorUnits + b.minorUnits, currency: a.currency };
}

/** Subtracts b from a. Both must share the same currency. Result may be negative. */
export function subtractMoney(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return { minorUnits: a.minorUnits - b.minorUnits, currency: a.currency };
}

/** Sums a list of Money values sharing the same currency. Returns zero for an empty list. */
export function sumMoney(amounts: readonly Money[], currency: Money['currency']): Money {
  return amounts.reduce((total, amount) => addMoney(total, amount), {
    minorUnits: 0,
    currency,
  } satisfies Money);
}

/**
 * Multiplies a Money value by a scalar factor, rounding to the nearest minor
 * unit using banker's rounding to avoid systematic upward or downward bias.
 */
export function scaleMoney(amount: Money, factor: number): Money {
  if (!Number.isFinite(factor)) {
    throw new RangeError(`factor must be a finite number, received: ${factor}`);
  }
  const exact = amount.minorUnits * factor;
  return { minorUnits: roundHalfToEven(exact), currency: amount.currency };
}

/** Rounds half-to-even ("banker's rounding") to minimise cumulative rounding bias. */
export function roundHalfToEven(value: number): number {
  const floor = Math.floor(value);
  const diff = value - floor;
  if (diff < 0.5) return floor;
  if (diff > 0.5) return floor + 1;
  return floor % 2 === 0 ? floor : floor + 1;
}

export function isNegative(amount: Money): boolean {
  return amount.minorUnits < 0;
}

export function isZero(amount: Money): boolean {
  return amount.minorUnits === 0;
}

/** Converts Money to a major-unit decimal number (e.g. cents -> dollars). For display only. */
export function toMajorUnits(amount: Money, minorUnitDigits: number): number {
  return amount.minorUnits / 10 ** minorUnitDigits;
}
