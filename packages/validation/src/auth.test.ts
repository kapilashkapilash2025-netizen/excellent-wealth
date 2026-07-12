import { describe, expect, it } from 'vitest';
import { loginInputSchema, passwordSchema, registrationInputSchema } from './auth';

describe('passwordSchema', () => {
  it('accepts a password meeting all requirements', () => {
    expect(passwordSchema.safeParse('Str0ngPassphrase').success).toBe(true);
  });

  it('rejects a password that is too short', () => {
    expect(passwordSchema.safeParse('Sh0rt1').success).toBe(false);
  });

  it('rejects a password with no uppercase letter', () => {
    expect(passwordSchema.safeParse('lowercase0nly1234').success).toBe(false);
  });

  it('rejects a password with no digit', () => {
    expect(passwordSchema.safeParse('NoDigitsHerePlease').success).toBe(false);
  });
});

describe('registrationInputSchema', () => {
  it('accepts matching passwords', () => {
    const result = registrationInputSchema.safeParse({
      email: 'User@Example.com',
      password: 'Str0ngPassphrase',
      confirmPassword: 'Str0ngPassphrase',
      displayName: 'Test User',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('user@example.com');
    }
  });

  it('rejects mismatched passwords', () => {
    const result = registrationInputSchema.safeParse({
      email: 'user@example.com',
      password: 'Str0ngPassphrase',
      confirmPassword: 'Different0Passphrase',
      displayName: 'Test User',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid email', () => {
    const result = registrationInputSchema.safeParse({
      email: 'not-an-email',
      password: 'Str0ngPassphrase',
      confirmPassword: 'Str0ngPassphrase',
      displayName: 'Test User',
    });
    expect(result.success).toBe(false);
  });

  it('defaults currency to USD and timezone to UTC when omitted', () => {
    const result = registrationInputSchema.safeParse({
      email: 'user@example.com',
      password: 'Str0ngPassphrase',
      confirmPassword: 'Str0ngPassphrase',
      displayName: 'Test User',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currency).toBe('USD');
      expect(result.data.timezone).toBe('UTC');
    }
  });

  it('accepts an explicit valid currency and timezone', () => {
    const result = registrationInputSchema.safeParse({
      email: 'user@example.com',
      password: 'Str0ngPassphrase',
      confirmPassword: 'Str0ngPassphrase',
      displayName: 'Test User',
      currency: 'INR',
      timezone: 'Asia/Colombo',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an unsupported currency code', () => {
    const result = registrationInputSchema.safeParse({
      email: 'user@example.com',
      password: 'Str0ngPassphrase',
      confirmPassword: 'Str0ngPassphrase',
      displayName: 'Test User',
      currency: 'XYZ',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid IANA timezone', () => {
    const result = registrationInputSchema.safeParse({
      email: 'user@example.com',
      password: 'Str0ngPassphrase',
      confirmPassword: 'Str0ngPassphrase',
      displayName: 'Test User',
      timezone: 'Not/AZone',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an oversized display name', () => {
    const result = registrationInputSchema.safeParse({
      email: 'user@example.com',
      password: 'Str0ngPassphrase',
      confirmPassword: 'Str0ngPassphrase',
      displayName: 'a'.repeat(121),
    });
    expect(result.success).toBe(false);
  });

  it('rejects unknown fields', () => {
    const result = registrationInputSchema.safeParse({
      email: 'user@example.com',
      password: 'Str0ngPassphrase',
      confirmPassword: 'Str0ngPassphrase',
      displayName: 'Test User',
      isAdmin: true,
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing required fields', () => {
    const result = registrationInputSchema.safeParse({
      email: 'user@example.com',
      password: 'Str0ngPassphrase',
    });
    expect(result.success).toBe(false);
  });
});

describe('loginInputSchema', () => {
  it('rejects an empty password', () => {
    const result = loginInputSchema.safeParse({ email: 'user@example.com', password: '' });
    expect(result.success).toBe(false);
  });
});
