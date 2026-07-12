import { describe, expect, it } from 'vitest';
import { displayNameSchema, timezoneSchema } from './locale.js';

describe('timezoneSchema', () => {
  it('accepts well-known IANA time zones', () => {
    expect(timezoneSchema.safeParse('Asia/Colombo').success).toBe(true);
    expect(timezoneSchema.safeParse('UTC').success).toBe(true);
    expect(timezoneSchema.safeParse('America/New_York').success).toBe(true);
  });

  it('rejects a made-up time zone name', () => {
    expect(timezoneSchema.safeParse('Not/AZone').success).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(timezoneSchema.safeParse('').success).toBe(false);
  });
});

describe('displayNameSchema', () => {
  it('trims surrounding whitespace', () => {
    const result = displayNameSchema.safeParse('  Test User  ');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('Test User');
    }
  });

  it('rejects an empty display name', () => {
    expect(displayNameSchema.safeParse('   ').success).toBe(false);
  });

  it('rejects a display name over 120 characters', () => {
    expect(displayNameSchema.safeParse('a'.repeat(121)).success).toBe(false);
  });
});
