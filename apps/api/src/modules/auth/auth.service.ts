import type { Prisma, User } from '@prisma/client';
import { prisma } from '../../database/prisma.js';
import { hashPassword, verifyPassword } from '../../security/password.js';
import {
  computeSessionExpiry,
  generateSessionToken,
  hashIpAddress,
  hashSessionToken,
} from '../../security/session.js';
import { recordAuditEvent } from '../../security/audit.js';
import { AuthenticationError, ConflictError } from '../../shared/errors.js';
import {
  createUser,
  findUserByEmailNormalized,
  incrementFailedLoginAttempts,
  lockUserUntil,
  normalizeEmail,
  recordSuccessfulLogin,
} from '../users/user.repository.js';
import { toSafeUser } from '../users/user.types.js';
import { createSession, findSessionWithUserByTokenHash, revokeSession } from './auth.repository.js';
import type {
  AuthResult,
  LoginUserInput,
  RegisterUserInput,
  RequestMetadata,
} from './auth.types.js';

const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const ACCOUNT_LOCK_DURATION_MINUTES = 15;

// Computed once and reused so a login attempt against a non-existent email
// still pays the same Argon2id cost as a real one — this keeps response
// timing from leaking whether an account exists.
const dummyHashPromise = hashPassword('a-fixed-dummy-password-used-only-for-timing-parity-00');

async function issueSession(
  client: Prisma.TransactionClient | typeof prisma,
  user: User,
  metadata: RequestMetadata,
): Promise<{ rawToken: string }> {
  const rawToken = generateSessionToken();
  const tokenHash = hashSessionToken(rawToken);
  await createSession(client, {
    userId: user.id,
    tokenHash,
    expiresAt: computeSessionExpiry(),
    ipHash: metadata.ipAddress ? hashIpAddress(metadata.ipAddress) : null,
    userAgent: metadata.userAgent ?? null,
  });
  return { rawToken };
}

export async function registerUser(
  input: RegisterUserInput,
  metadata: RequestMetadata,
): Promise<AuthResult> {
  const emailNormalized = normalizeEmail(input.email);
  const existing = await findUserByEmailNormalized(prisma, emailNormalized);
  if (existing) {
    await recordAuditEvent(prisma, {
      eventType: 'USER_REGISTERED',
      outcome: 'FAILURE',
      requestId: metadata.requestId,
      metadata: { reason: 'duplicate_email' },
    });
    throw new ConflictError('Unable to complete registration with the provided details.');
  }

  const passwordHash = await hashPassword(input.password);

  const { user, rawToken } = await prisma.$transaction(async (tx) => {
    const createdUser = await createUser(tx, {
      email: input.email,
      passwordHash,
      displayName: input.displayName,
      currency: input.currency,
      timezone: input.timezone,
    });
    const { rawToken: token } = await issueSession(tx, createdUser, metadata);
    await recordAuditEvent(tx, {
      userId: createdUser.id,
      eventType: 'USER_REGISTERED',
      outcome: 'SUCCESS',
      requestId: metadata.requestId,
    });
    return { user: createdUser, rawToken: token };
  });

  return { user: toSafeUser(user), rawSessionToken: rawToken };
}

async function handleFailedLogin(user: User, metadata: RequestMetadata): Promise<void> {
  const updated = await incrementFailedLoginAttempts(prisma, user.id);
  if (updated.failedLoginAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
    const lockedUntil = new Date(Date.now() + ACCOUNT_LOCK_DURATION_MINUTES * 60_000);
    await lockUserUntil(prisma, user.id, lockedUntil);
    await recordAuditEvent(prisma, {
      userId: user.id,
      eventType: 'ACCOUNT_LOCKED',
      outcome: 'FAILURE',
      requestId: metadata.requestId,
      metadata: { lockedUntil: lockedUntil.toISOString() },
    });
  }
  await recordAuditEvent(prisma, {
    userId: user.id,
    eventType: 'LOGIN_FAILED',
    outcome: 'FAILURE',
    requestId: metadata.requestId,
    metadata: { reason: 'bad_password', failedLoginAttempts: updated.failedLoginAttempts },
  });
}

export async function loginUser(
  input: LoginUserInput,
  metadata: RequestMetadata,
): Promise<AuthResult> {
  const emailNormalized = normalizeEmail(input.email);
  const user = await findUserByEmailNormalized(prisma, emailNormalized);

  // Always run a verify, even for a non-existent user, to keep timing
  // uniform across the "unknown email" and "wrong password" branches.
  const hashToVerify = user?.passwordHash ?? (await dummyHashPromise);
  const passwordMatches = await verifyPassword(hashToVerify, input.password);

  if (!user) {
    await recordAuditEvent(prisma, {
      eventType: 'LOGIN_FAILED',
      outcome: 'FAILURE',
      requestId: metadata.requestId,
      metadata: { reason: 'unknown_email' },
    });
    throw new AuthenticationError();
  }

  const isLocked = user.lockedUntil !== null && user.lockedUntil.getTime() > Date.now();
  if (isLocked) {
    await recordAuditEvent(prisma, {
      userId: user.id,
      eventType: 'LOGIN_FAILED',
      outcome: 'FAILURE',
      requestId: metadata.requestId,
      metadata: { reason: 'account_locked' },
    });
    throw new AuthenticationError();
  }

  if (!passwordMatches) {
    await handleFailedLogin(user, metadata);
    throw new AuthenticationError();
  }

  if (user.status !== 'ACTIVE') {
    await recordAuditEvent(prisma, {
      userId: user.id,
      eventType: 'LOGIN_FAILED',
      outcome: 'FAILURE',
      requestId: metadata.requestId,
      metadata: { reason: 'inactive_account' },
    });
    throw new AuthenticationError();
  }

  const { rawToken } = await issueSession(prisma, user, metadata);
  await recordSuccessfulLogin(prisma, user.id);
  await recordAuditEvent(prisma, {
    userId: user.id,
    eventType: 'LOGIN_SUCCEEDED',
    outcome: 'SUCCESS',
    requestId: metadata.requestId,
  });

  return { user: toSafeUser(user), rawSessionToken: rawToken };
}

/** Idempotent: succeeds even if the token is missing, already revoked, or unknown. */
export async function logoutUser(
  rawToken: string | undefined,
  metadata: RequestMetadata,
): Promise<void> {
  if (!rawToken) {
    return;
  }
  const tokenHash = hashSessionToken(rawToken);
  const session = await findSessionWithUserByTokenHash(prisma, tokenHash);
  if (!session) {
    return;
  }
  await revokeSession(prisma, session.id);
  await recordAuditEvent(prisma, {
    userId: session.userId,
    eventType: 'LOGOUT',
    outcome: 'SUCCESS',
    requestId: metadata.requestId,
  });
}
