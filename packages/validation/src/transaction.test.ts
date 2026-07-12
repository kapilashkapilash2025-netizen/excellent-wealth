import { describe, expect, it } from 'vitest';
import { transactionInputSchema } from './transaction';

const validTransaction = {
  accountId: 'acct_123',
  direction: 'expense' as const,
  amount: { minorUnits: 2500, currency: 'USD' as const },
  categoryId: 'cat_groceries',
  occurredOn: '2026-02-15',
  description: 'Weekly groceries',
  tags: ['food'],
  notes: null,
  isRecurring: false,
};

describe('transactionInputSchema', () => {
  it('accepts a valid transaction', () => {
    expect(transactionInputSchema.safeParse(validTransaction).success).toBe(true);
  });

  it('accepts a valid leap-year date', () => {
    const result = transactionInputSchema.safeParse({
      ...validTransaction,
      occurredOn: '2024-02-29',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid calendar date', () => {
    const result = transactionInputSchema.safeParse({
      ...validTransaction,
      occurredOn: '2025-02-30',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a zero amount', () => {
    const result = transactionInputSchema.safeParse({
      ...validTransaction,
      amount: { minorUnits: 0, currency: 'USD' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects a negative amount', () => {
    const result = transactionInputSchema.safeParse({
      ...validTransaction,
      amount: { minorUnits: -100, currency: 'USD' },
    });
    expect(result.success).toBe(false);
  });

  it('defaults optional fields when omitted', () => {
    const {
      categoryId: _categoryId,
      notes: _notes,
      tags: _tags,
      isRecurring: _isRecurring,
      ...minimal
    } = validTransaction;
    const result = transactionInputSchema.safeParse(minimal);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toEqual([]);
      expect(result.data.isRecurring).toBe(false);
      expect(result.data.categoryId).toBeNull();
    }
  });

  it('rejects a description exceeding the max length', () => {
    const result = transactionInputSchema.safeParse({
      ...validTransaction,
      description: 'a'.repeat(281),
    });
    expect(result.success).toBe(false);
  });
});
