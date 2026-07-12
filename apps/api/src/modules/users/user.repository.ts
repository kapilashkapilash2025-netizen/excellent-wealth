import type { Prisma, PrismaClient, User } from '@prisma/client';

type Client = PrismaClient | Prisma.TransactionClient;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  displayName: string;
  currency: string;
  timezone: string;
}

export async function findUserByEmailNormalized(
  client: Client,
  emailNormalized: string,
): Promise<User | null> {
  return client.user.findUnique({ where: { emailNormalized } });
}

export async function findUserById(client: Client, id: string): Promise<User | null> {
  return client.user.findUnique({ where: { id } });
}

export async function createUser(client: Client, input: CreateUserInput): Promise<User> {
  const emailNormalized = normalizeEmail(input.email);
  return client.user.create({
    data: {
      email: input.email,
      emailNormalized,
      passwordHash: input.passwordHash,
      displayName: input.displayName,
      currency: input.currency,
      timezone: input.timezone,
    },
  });
}

export async function incrementFailedLoginAttempts(client: Client, userId: string): Promise<User> {
  return client.user.update({
    where: { id: userId },
    data: { failedLoginAttempts: { increment: 1 } },
  });
}

export async function lockUserUntil(
  client: Client,
  userId: string,
  lockedUntil: Date,
): Promise<User> {
  return client.user.update({ where: { id: userId }, data: { lockedUntil } });
}

export async function recordSuccessfulLogin(
  client: Client,
  userId: string,
  when: Date = new Date(),
): Promise<User> {
  return client.user.update({
    where: { id: userId },
    data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: when },
  });
}
