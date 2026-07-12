import type { User } from '@prisma/client';

/** The subset of a User record that is ever safe to return to a client. */
export interface SafeUser {
  id: string;
  email: string;
  displayName: string;
  currency: string;
  timezone: string;
  createdAt: Date;
}

/** Strips password hash, lockout counters, and other internal fields. */
export function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    currency: user.currency,
    timezone: user.timezone,
    createdAt: user.createdAt,
  };
}
