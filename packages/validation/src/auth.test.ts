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
});

describe('loginInputSchema', () => {
  it('rejects an empty password', () => {
    const result = loginInputSchema.safeParse({ email: 'user@example.com', password: '' });
    expect(result.success).toBe(false);
  });
});
