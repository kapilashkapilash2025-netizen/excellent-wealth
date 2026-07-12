import { env } from './env.js';

/**
 * Fields that must never reach a log line, in any nested location. Pino's
 * redact walks these paths on every log call and replaces the value with
 * "[Redacted]" rather than omitting the key, so redaction is visible in
 * output rather than silently absent.
 */
const REDACT_PATHS = [
  'req.headers.cookie',
  'req.headers.authorization',
  'req.body.password',
  'req.body.confirmPassword',
  'body.password',
  'body.confirmPassword',
  // Pino's `*.foo` wildcard only matches `foo` nested one level down — it
  // does not also match a bare top-level `foo` key, so both forms are
  // listed explicitly for every sensitive field.
  'password',
  'confirmPassword',
  'passwordHash',
  'tokenHash',
  'sessionToken',
  '*.password',
  '*.confirmPassword',
  '*.passwordHash',
  '*.tokenHash',
  '*.sessionToken',
];

export const loggerConfig = {
  level: env.LOG_LEVEL,
  redact: {
    paths: REDACT_PATHS,
    censor: '[Redacted]',
  },
};
