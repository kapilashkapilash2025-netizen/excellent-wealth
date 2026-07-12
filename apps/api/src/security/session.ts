import { createHash, createHmac, randomBytes } from 'node:crypto';
import type { FastifyReply } from 'fastify';
import { env, isProduction } from '../config/env.js';

const RAW_TOKEN_BYTES = 32; // 256 bits of entropy — opaque, unguessable.

/** Generates a new cryptographically random, opaque session token. */
export function generateSessionToken(): string {
  return randomBytes(RAW_TOKEN_BYTES).toString('base64url');
}

/**
 * Derives the storage hash for a session token. Keyed with SESSION_SECRET
 * (HMAC-SHA256) rather than plain SHA-256, so a stolen database dump alone
 * cannot be used to forge session lookups without also knowing the secret.
 * The raw token itself is never persisted.
 */
export function hashSessionToken(rawToken: string): string {
  return createHmac('sha256', env.SESSION_SECRET).update(rawToken).digest('hex');
}

/** Computes the session expiry timestamp from the configured TTL. */
export function computeSessionExpiry(now: Date = new Date()): Date {
  return new Date(now.getTime() + env.SESSION_TTL_HOURS * 60 * 60 * 1000);
}

/**
 * Hashes a client IP address for abuse investigation without retaining the
 * raw address indefinitely. Not used for authentication decisions.
 */
export function hashIpAddress(ip: string): string {
  return createHash('sha256').update(ip).digest('hex');
}

/**
 * Sets the session cookie. `secure` is forced on in production (requires
 * HTTPS) and relaxed in development so http://localhost works. See
 * docs/decisions/0004-server-side-sessions.md for the SameSite/CSRF
 * reasoning.
 */
export function setSessionCookie(reply: FastifyReply, rawToken: string): void {
  reply.setCookie(env.SESSION_COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: Math.round(env.SESSION_TTL_HOURS * 60 * 60),
  });
}

/** Clears the session cookie with matching attributes so browsers actually drop it. */
export function clearSessionCookie(reply: FastifyReply): void {
  reply.clearCookie(env.SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
  });
}
