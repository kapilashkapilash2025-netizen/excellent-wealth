import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/app.js';
import { prisma } from '../../src/database/prisma.js';

/** Deletes all rows in dependency order. Only ever point this at a test database. */
export async function resetDatabase(): Promise<void> {
  await prisma.session.deleteMany();
  await prisma.auditEvent.deleteMany();
  await prisma.user.deleteMany();
}

export async function createTestApp(): Promise<FastifyInstance> {
  return buildApp();
}

/** Parses the raw session token out of a Set-Cookie header value. */
export function extractSessionToken(
  setCookieHeader: string | string[] | undefined,
  cookieName: string,
): string | undefined {
  const headers = Array.isArray(setCookieHeader)
    ? setCookieHeader
    : setCookieHeader
      ? [setCookieHeader]
      : [];
  for (const header of headers) {
    const match = header.match(new RegExp(`${cookieName}=([^;]+)`));
    if (match?.[1]) {
      return match[1];
    }
  }
  return undefined;
}
