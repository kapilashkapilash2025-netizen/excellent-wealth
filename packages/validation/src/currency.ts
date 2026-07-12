import { z } from 'zod';

export const currencyCodeSchema = z.enum([
  'USD',
  'EUR',
  'GBP',
  'INR',
  'JPY',
  'AUD',
  'CAD',
  'SGD',
  'AED',
  'ZAR',
]);

export const moneySchema = z.object({
  minorUnits: z.number().int().finite(),
  currency: currencyCodeSchema,
});

export type MoneyInput = z.infer<typeof moneySchema>;
