import * as argon2 from 'argon2';
import { env } from '../config/env.js';

/**
 * Argon2id parameters. These follow OWASP's current baseline recommendation
 * (m=19 MiB, t=2, p=1) for interactive login — tuned for a web request
 * budget rather than maximum resistance, since this API must respond within
 * a normal HTTP timeout.
 */
const ARGON2_OPTIONS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 19 * 1024,
  timeCost: 2,
  parallelism: 1,
};

function pepperSecret(): Buffer | undefined {
  return env.PASSWORD_PEPPER.length > 0 ? Buffer.from(env.PASSWORD_PEPPER, 'utf8') : undefined;
}

/** Hashes a plaintext password with Argon2id. Never log the input or output. */
export async function hashPassword(plainTextPassword: string): Promise<string> {
  const secret = pepperSecret();
  return argon2.hash(plainTextPassword, secret ? { ...ARGON2_OPTIONS, secret } : ARGON2_OPTIONS);
}

/**
 * Verifies a plaintext password against a stored Argon2id hash. Returns
 * false (rather than throwing) for a malformed hash so callers can treat
 * "wrong password" and "corrupt hash" identically without branching.
 */
export async function verifyPassword(hash: string, plainTextPassword: string): Promise<boolean> {
  const secret = pepperSecret();
  try {
    return await argon2.verify(hash, plainTextPassword, secret ? { secret } : undefined);
  } catch {
    return false;
  }
}
