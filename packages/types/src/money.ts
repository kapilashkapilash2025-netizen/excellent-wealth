/**
 * Money is always represented as an integer number of minor units (e.g. cents)
 * alongside its ISO 4217 currency code. Never use floating-point numbers to
 * represent currency amounts — see docs/decisions for the rationale.
 */
export interface Money {
  /** Integer amount in the currency's smallest unit (e.g. cents for USD). */
  readonly minorUnits: number;
  /** ISO 4217 currency code, e.g. "USD", "EUR", "INR". */
  readonly currency: CurrencyCode;
}

export type CurrencyCode =
  'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY' | 'AUD' | 'CAD' | 'SGD' | 'AED' | 'ZAR';

/** Number of decimal places each supported currency uses (ISO 4217 minor units). */
export const CURRENCY_MINOR_UNIT_DIGITS: Record<CurrencyCode, number> = {
  USD: 2,
  EUR: 2,
  GBP: 2,
  INR: 2,
  JPY: 0,
  AUD: 2,
  CAD: 2,
  SGD: 2,
  AED: 2,
  ZAR: 2,
};
