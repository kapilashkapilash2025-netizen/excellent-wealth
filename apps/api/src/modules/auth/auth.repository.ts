import type { Prisma, PrismaClient, Session, User } from '@prisma/client';

type Client = PrismaClient | Prisma.TransactionClient;

export interface CreateSessionInput {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  ipHash?: string | null;
  userAgent?: string | null;
}

export async function createSession(client: Client, input: CreateSessionInput): Promise<Session> {
  return client.session.create({
    data: {
      userId: input.userId,
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt,
      ipHash: input.ipHash ?? null,
      // Cap defensively even though the column already limits length, so an
      // oversized header can never reach the database layer as an error.
      userAgent: input.userAgent ? input.userAgent.slice(0, 300) : null,
    },
  });
}

export async function findSessionWithUserByTokenHash(
  client: Client,
  tokenHash: string,
): Promise<(Session & { user: User }) | null> {
  return client.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  });
}

export async function revokeSession(client: Client, sessionId: string): Promise<void> {
  await client.session.updateMany({
    where: { id: sessionId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function touchSessionLastUsed(
  client: Client,
  sessionId: string,
  when: Date = new Date(),
): Promise<void> {
  await client.session.update({ where: { id: sessionId }, data: { lastUsedAt: when } });
}
