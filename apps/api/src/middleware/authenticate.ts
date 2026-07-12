import type { FastifyReply, FastifyRequest } from 'fastify';
import { env } from '../config/env.js';
import { prisma } from '../database/prisma.js';
import {
  findSessionWithUserByTokenHash,
  touchSessionLastUsed,
} from '../modules/auth/auth.repository.js';
import type { AuthenticatedSession } from '../modules/auth/auth.types.js';
import type { SafeUser } from '../modules/users/user.types.js';
import { toSafeUser } from '../modules/users/user.types.js';
import { hashSessionToken } from '../security/session.js';
import { UnauthenticatedError } from '../shared/errors.js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: SafeUser;
    authSession?: AuthenticatedSession;
  }
}

/** Only re-touch a session's lastUsedAt if it's stale by more than this, to avoid a write per request. */
const LAST_USED_TOUCH_THRESHOLD_MS = 5 * 60 * 1000;

/**
 * Fastify preHandler: resolves the current user from the opaque session
 * cookie. Throws UnauthenticatedError (mapped to 401 by the central error
 * handler) for any missing, invalid, expired, revoked, or disabled-account
 * session, without distinguishing between those cases in the response.
 */
export async function authenticate(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  const rawToken = request.cookies[env.SESSION_COOKIE_NAME];
  if (!rawToken) {
    throw new UnauthenticatedError();
  }

  const tokenHash = hashSessionToken(rawToken);
  const session = await findSessionWithUserByTokenHash(prisma, tokenHash);

  if (!session || session.revokedAt !== null || session.expiresAt.getTime() < Date.now()) {
    throw new UnauthenticatedError();
  }
  if (session.user.status !== 'ACTIVE') {
    throw new UnauthenticatedError();
  }

  request.user = toSafeUser(session.user);
  request.authSession = { sessionId: session.id, userId: session.user.id };

  const isStale =
    !session.lastUsedAt || Date.now() - session.lastUsedAt.getTime() > LAST_USED_TOUCH_THRESHOLD_MS;
  if (isStale) {
    await touchSessionLastUsed(prisma, session.id);
  }
}
