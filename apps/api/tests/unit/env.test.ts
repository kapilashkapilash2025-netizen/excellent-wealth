import { describe, expect, it } from 'vitest';
import { getAllowedOrigins, loadEnv } from '../../src/config/env.js';

const VALID_ENV = {
  NODE_ENV: 'test',
  API_PORT: '4000',
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
  WEB_ORIGIN: 'http://localhost:3000',
  SESSION_COOKIE_NAME: 'excellent_wealth_session',
  SESSION_SECRET: 'a'.repeat(32),
  SESSION_TTL_HOURS: '168',
  PASSWORD_PEPPER: '',
  LOG_LEVEL: 'info',
} as const;

describe('loadEnv', () => {
  it('accepts a fully valid environment', () => {
    expect(() => loadEnv(VALID_ENV)).not.toThrow();
  });

  it('applies defaults for optional variables', () => {
    const { API_PORT: _API_PORT, SESSION_COOKIE_NAME: _SESSION_COOKIE_NAME, ...rest } = VALID_ENV;
    const env = loadEnv(rest);
    expect(env.API_PORT).toBe(4000);
    expect(env.SESSION_COOKIE_NAME).toBe('excellent_wealth_session');
  });

  it('fails fast when DATABASE_URL is missing', () => {
    const { DATABASE_URL: _DATABASE_URL, ...rest } = VALID_ENV;
    expect(() => loadEnv(rest)).toThrow(/DATABASE_URL/);
  });

  it('rejects a non-postgresql DATABASE_URL', () => {
    expect(() => loadEnv({ ...VALID_ENV, DATABASE_URL: 'mysql://localhost/db' })).toThrow(
      /postgresql/,
    );
  });

  it('rejects a SESSION_SECRET shorter than 32 characters', () => {
    expect(() => loadEnv({ ...VALID_ENV, SESSION_SECRET: 'too-short' })).toThrow(/SESSION_SECRET/);
  });

  it('rejects an invalid NODE_ENV value', () => {
    expect(() => loadEnv({ ...VALID_ENV, NODE_ENV: 'staging' })).toThrow();
  });

  it('never includes the SESSION_SECRET value itself in the error message', () => {
    try {
      loadEnv({ ...VALID_ENV, SESSION_SECRET: 'short', WEB_ORIGIN: '' });
      throw new Error('expected loadEnv to throw');
    } catch (error) {
      expect(String(error)).not.toContain('short');
    }
  });

  it('coerces a numeric string API_PORT to a number', () => {
    const env = loadEnv({ ...VALID_ENV, API_PORT: '5050' });
    expect(env.API_PORT).toBe(5050);
  });
});

describe('getAllowedOrigins', () => {
  it('splits a comma-separated WEB_ORIGIN into a trimmed list', () => {
    const env = loadEnv({
      ...VALID_ENV,
      WEB_ORIGIN: 'http://localhost:3000, https://excellentwealth.example ',
    });
    expect(getAllowedOrigins(env)).toEqual([
      'http://localhost:3000',
      'https://excellentwealth.example',
    ]);
  });

  it('returns a single-item list for a single origin', () => {
    const env = loadEnv(VALID_ENV);
    expect(getAllowedOrigins(env)).toEqual(['http://localhost:3000']);
  });
});
