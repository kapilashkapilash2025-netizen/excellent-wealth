# Security Checklist — Excellent Wealth

Use this checklist when reviewing any change that touches authentication,
data access, or financial data handling. Status reflects Version 0.2.

## Authentication & sessions

- [x] Passwords hashed with an adaptive, salted algorithm — Argon2id (`apps/api/src/security/password.ts`)
- [x] Password policy enforced client- and server-side (`packages/validation/src/auth.ts`, reused by `apps/api`)
- [x] Login and registration attempts rate-limited per client — 10/min, layered on a 100/min general API limit (`apps/api/src/middleware/rate-limit.ts`)
- [x] Sessions expire server-side and on logout — opaque tokens, hashed at rest, revoked on logout (`apps/api/src/security/session.ts`, `auth.repository.ts`)
- [x] Session cookies are `HttpOnly`, `Secure` (production), `SameSite=Lax` (`apps/api/src/security/session.ts`)
- [x] Account lockout after repeated failed logins — 5 attempts, 15-minute lock (`apps/api/src/modules/auth/auth.service.ts`)
- [x] Login response identical for unknown email / wrong password / locked account (account-enumeration resistance), verified by test

## Input handling

- [x] All financial and auth form inputs validated with Zod (`packages/validation`)
- [x] All API request bodies validated with the same shared schemas server-side (`apps/api/src/modules/auth/auth.schemas.ts`)
- [x] Unknown top-level JSON fields rejected on auth endpoints (`.strict()` schemas), verified by test
- [x] Money values are integer minor-units + currency code, never raw floats (`packages/types`, `packages/financial-engine`)

## Web application

- [x] Skip-to-content link and semantic landmarks for keyboard/screen-reader users
- [x] `prefers-reduced-motion` respected in global styles
- [ ] Content-Security-Policy tuned beyond Helmet's defaults — not implemented yet
- [x] CORS policy scoped to a configured origin allowlist (`apps/api/src/app.ts`, `config/env.ts`), verified by test

## Data & infrastructure

- [x] Database queries scoped appropriately — no cross-user data endpoints exist yet beyond `/auth/me`, which only ever returns the authenticated caller's own record
- [x] Audit logging for registration, login (success/failure), lockout, and logout (`apps/api/src/security/audit.ts`, `audit_events` table)
- [ ] Backup strategy documented — not implemented yet
- [x] `.env` / `apps/api/.env` gitignored; `.env.example` / `apps/api/.env.test` contain no real secrets
- [x] Secrets (passwords, session tokens) never appear in logs — Pino redact config, verified by test (`apps/api/src/config/logger.ts`)
- [x] Stack traces and raw internal error messages never reach a client response, in any environment — verified by test (`apps/api/tests/security/error-handler.test.ts`)
- [x] Environment variables validated at startup; API fails fast with a clear, secret-free error on misconfiguration (`apps/api/src/config/env.ts`)
- [x] Request bodies capped at 100 KiB; oversized payloads rejected with `413`, verified by test

## Supply chain

- [x] Dependabot configuration present (`.github/dependabot.yml`)
- [x] CodeQL static analysis enabled (`.github/workflows/codeql.yml`)
- [ ] `pnpm audit` (or equivalent) as an explicit CI step — not implemented yet
