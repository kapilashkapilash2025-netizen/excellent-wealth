import { describe, expect, it } from 'vitest';
import {
  computeSessionExpiry,
  generateSessionToken,
  hashIpAddress,
  hashSessionToken,
} from '../../src/security/session.js';

describe('generateSessionToken', () => {
  it('generates a non-empty, URL-safe token', () => {
    const token = generateSessionToken();
    expect(token.length).toBeGreaterThan(20);
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('generates a different token on each call', () => {
    const a = generateSessionToken();
    const b = generateSessionToken();
    expect(a).not.toBe(b);
  });
});

describe('hashSessionToken', () => {
  it('is deterministic for the same token', () => {
    const token = generateSessionToken();
    expect(hashSessionToken(token)).toBe(hashSessionToken(token));
  });

  it('produces different hashes for different tokens', () => {
    const a = hashSessionToken(generateSessionToken());
    const b = hashSessionToken(generateSessionToken());
    expect(a).not.toBe(b);
  });

  it('never returns the raw token as its own hash', () => {
    const token = generateSessionToken();
    expect(hashSessionToken(token)).not.toBe(token);
  });

  it('produces a 64-character hex digest (SHA-256/HMAC-SHA256)', () => {
    const hash = hashSessionToken(generateSessionToken());
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('computeSessionExpiry', () => {
  it('adds SESSION_TTL_HOURS worth of milliseconds to the given time', () => {
    const now = new Date('2026-01-01T00:00:00.000Z');
    const expiry = computeSessionExpiry(now);
    expect(expiry.getTime()).toBeGreaterThan(now.getTime());
  });
});

describe('hashIpAddress', () => {
  it('is deterministic and never returns the raw IP', () => {
    const hash = hashIpAddress('203.0.113.42');
    expect(hash).not.toContain('203.0.113.42');
    expect(hash).toBe(hashIpAddress('203.0.113.42'));
  });
});
