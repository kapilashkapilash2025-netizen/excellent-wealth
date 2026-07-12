import { z } from 'zod';
import { moneySchema } from './currency';

export const transactionInputSchema = z.object({
  accountId: z.string().min(1, 'accountId is required'),
  direction: z.enum(['income', 'expense']),
  amount: moneySchema.refine((money) => money.minorUnits > 0, {
    message: 'amount must be greater than zero; use the direction field for sign',
  }),
  categoryId: z.string().min(1).nullable().default(null),
  occurredOn: z.string().date('occurredOn must be a valid ISO 8601 date (YYYY-MM-DD)'),
  description: z.string().trim().min(1).max(280),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  notes: z.string().trim().max(2000).nullable().default(null),
  isRecurring: z.boolean().default(false),
});

export type TransactionInput = z.infer<typeof transactionInputSchema>;
