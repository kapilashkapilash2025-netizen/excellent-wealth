# Project Status

Last updated: 2026-07-12

## Current version

**Version 0.2 — Authentication foundation** (complete)

## Completed modules

- Monorepo scaffold and shared tooling configuration (Version 0.1)
- `packages/types`, `packages/financial-engine`, `packages/validation`,
  `packages/ui`, `apps/web` landing page (Version 0.1)
- `apps/api`: Fastify + TypeScript backend with a modular
  config/database/modules/middleware/security/shared structure
- Prisma schema and initial migration: `User`, `Session`, `AuditEvent`
- Authentication endpoints: register, login, logout, current-user
  (`/api/v1/auth/*`) — see [docs/api/authentication.md](api/authentication.md)
- Argon2id password hashing, opaque server-side sessions (HMAC-hashed at
  rest), account lockout, account-enumeration-resistant login errors
- Rate limiting (general + strict auth-endpoint limits)
- Centralised typed errors and standard response envelope
- Environment validation (fails fast, never logs secret values)
- Structured logging with password/token redaction
- Audit-event foundation (registration, login, lockout, logout)
- Health/readiness endpoints (`/health`, `/ready`)
- Docker Compose for local PostgreSQL; CI extended with a
  Postgres-backed integration/security test job
- ADRs 0003 (Fastify) and 0004 (server-side sessions)

## Active module

None — between milestones. Next up is Version 0.3 (transactions).

## Known issues / limitations

- No email verification, password reset, or "log out all devices" yet —
  the schema/session design supports the latter, but there's no endpoint.
- No CSRF token beyond `SameSite=Lax` (see
  [ADR 0004](decisions/0004-server-side-sessions.md#csrf-assumptions)).
- No Content-Security-Policy tuning beyond Helmet's defaults.
- `apps/api`'s `build` script produces a `dist/` via `tsc` as a type-check
  gate, but it isn't yet a self-contained deployable artifact — workspace
  packages are still consumed from TypeScript source, so `start` runs via
  `tsx` rather than `node dist/server.js`. See
  [docs/development/api-setup.md](development/api-setup.md).
- No `pnpm audit` (or equivalent) step in CI yet.
- No backup strategy documented for the database.
- `packages/analytics` (explainable insight engine) is still unbuilt —
  planned for Version 0.8.
- Playwright end-to-end tests are still not set up.

## Test status

- `packages/*` and `apps/web`: unit/component tests passing (`pnpm test`,
  no database required).
- `apps/api`: 81 tests passing — 27 unit (no database), 36 integration and
  18 security (both require a real PostgreSQL database; run
  `pnpm --filter @excellent-wealth/api test:integration` and `test:security`
  after `docker compose up -d postgres` and applying migrations — see
  [docs/development/api-setup.md](development/api-setup.md)).
- A real bug was caught and fixed during this milestone:
  `@fastify/rate-limit`'s `errorResponseBuilder` throws its return value
  directly, so a plain object without `.statusCode` was misclassified as a
  500 instead of a 429 — fixed and regression-tested. See CHANGELOG.md.

## Security status

- Threat model, data-flow overview, and security checklist updated for
  Version 0.2 (see [docs/security](security)) — most authentication-related
  mitigations are now implemented and tested, not just planned.
- No known committed secrets; `.env` / `apps/api/.env` gitignored,
  `.env.example` / `apps/api/.env.test` contain no real secrets.
- Not third-party audited. See
  [docs/api/authentication.md#known-limitations](api/authentication.md#known-limitations).

## Documentation status

- README, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, ROADMAP, CHANGELOG:
  updated for Version 0.2.
- `docs/api/authentication.md`, `docs/api/error-responses.md`,
  `docs/development/database-setup.md`, `docs/development/api-setup.md`:
  new this milestone.
- ADRs 0001–0004 present.

## Next recommended tasks

1. Begin Version 0.3: transaction CRUD, categories, search/filter, CSV
   import/export.
2. Add a `pnpm audit` (or `osv-scanner`) CI step.
3. Revisit CSRF protection and Content-Security-Policy tuning as the
   frontend starts making authenticated requests to `apps/api`.
4. Consider a database backup strategy before any real user data exists in
   a deployed environment.
