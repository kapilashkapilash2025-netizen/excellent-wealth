import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from '../../src/security/password.js';

describe('password service', () => {
  it('hashes a password to an argon2id hash string', async () => {
    const hash = await hashPassword('Str0ngPassphrase');
    expect(hash).toMatch(/^\$argon2id\$/);
  });

  it('produces a different hash each time (unique salt)', async () => {
    const [a, b] = await Promise.all([
      hashPassword('Str0ngPassphrase'),
      hashPassword('Str0ngPassphrase'),
    ]);
    expect(a).not.toBe(b);
  });

  it('verifies a correct password against its hash', async () => {
    const hash = await hashPassword('Str0ngPassphrase');
    expect(await verifyPassword(hash, 'Str0ngPassphrase')).toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const hash = await hashPassword('Str0ngPassphrase');
    expect(await verifyPassword(hash, 'WrongPassphrase')).toBe(false);
  });

  it('returns false rather than throwing for a malformed hash', async () => {
    await expect(verifyPassword('not-a-real-hash', 'anything')).resolves.toBe(false);
  });

  it('never returns the plaintext password inside the hash', async () => {
    const hash = await hashPassword('SuperSecretValue1');
    expect(hash).not.toContain('SuperSecretValue1');
  });
});
