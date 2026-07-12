import type { Money } from './money';

export type AssetClass =
  'cash' | 'bank_account' | 'property' | 'vehicle' | 'business_ownership' | 'investment' | 'custom';

export type LiabilityClass = 'loan' | 'credit_card' | 'mortgage' | 'custom';

export interface Asset {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly assetClass: AssetClass;
  readonly value: Money;
  readonly asOf: string; // ISO 8601 date
}

export interface Liability {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly liabilityClass: LiabilityClass;
  readonly balance: Money;
  readonly annualInterestRatePercent: number;
  readonly minimumPayment: Money;
  readonly asOf: string; // ISO 8601 date
}

export type TransactionDirection = 'income' | 'expense';

export interface Transaction {
  readonly id: string;
  readonly userId: string;
  readonly accountId: string;
  readonly direction: TransactionDirection;
  readonly amount: Money;
  readonly categoryId: string | null;
  readonly occurredOn: string; // ISO 8601 date
  readonly description: string;
  readonly tags: readonly string[];
  readonly notes: string | null;
  readonly isRecurring: boolean;
}

export type GoalKind =
  'emergency_fund' | 'education' | 'home' | 'business' | 'retirement' | 'custom';

export interface FinancialGoal {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly kind: GoalKind;
  readonly targetAmount: Money;
  readonly currentAmount: Money;
  readonly targetDate: string | null; // ISO 8601 date
}
