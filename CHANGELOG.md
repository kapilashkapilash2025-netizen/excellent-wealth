# Changelog

All notable changes to Excellent Wealth are documented here. Format loosely
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions
correspond to the milestones in [ROADMAP.md](ROADMAP.md).

## [Unreleased] — Version 0.2: Authentication foundation

### Added

- `apps/api`: a Fastify + TypeScript backend (see
  [ADR 0003](docs/decisions/0003-api-framework.md)) with a modular
  `config/database/modules/middleware/security/shared` structure.
- Prisma schema and initial migration: `User`, `Session`, and `AuditEvent`
  models with enums, unique constraints, indexes, and cascade/restrict
  delete behavior tuned per security requirements.
- `POST /api/v1/auth/register`, `POST /api/v1/auth/login`,
  `POST /api/v1/auth/logout`, `GET /api/v1/auth/me` — see
  [docs/api/authentication.md](docs/api/authentication.md).
- Argon2id password hashing (`src/security/password.ts`) and opaque,
  HMAC-hashed server-side sessions (`src/security/session.ts`) — see
  [ADR 0004](docs/decisions/0004-server-side-sessions.md).
- Account lockout after 5 failed logins (15-minute lock), failed-attempt
  tracking, and account-enumeration-resistant generic login errors.
- Rate limiting: 100 req/min general, 10 req/min on login/registration.
- Centralised typed error classes and a standard `{ success, data }` /
  `{ success: false, error }` response envelope
  (`src/shared/errors.ts`, `src/shared/responses.ts`) — see
  [docs/api/error-responses.md](docs/api/error-responses.md).
- Structured logging (Pino via Fastify) with redaction of password/token
  fields; environment validation at startup via Zod
  (`src/config/env.ts`) that fails fast with a secret-free error message.
- Audit-event foundation: every registration, login (success/failure),
  lockout, and logout is recorded.
- `GET /health` and `GET /ready` (database-connectivity) endpoints.
- Extended `@excellent-wealth/validation`'s registration schema with
  `currency` and `timezone` fields (IANA zone validated via `Intl`), and
  made auth schemas `.strict()` to reject unknown fields.
- 81 backend tests: unit (password, session, env, error mapping), API
  integration (register/login/logout/me against a real PostgreSQL
  database), and security tests (no password/token leakage, redacted
  logs, hidden stack traces, oversized-payload rejection, CORS allowlist
  enforcement, SQL-injection-shaped input handled as inert data, rate
  limiting).
- `docker-compose.yml` for local PostgreSQL; CI extended with a
  Postgres-service-backed integration/security test job
  (`.github/workflows/ci.yml`).
- Documentation: `docs/api/authentication.md`,
  `docs/api/error-responses.md`, `docs/development/database-setup.md`,
  `docs/development/api-setup.md`, ADRs 0003–0004; threat model,
  data-flow overview, and security checklist updated to reflect what's
  actually implemented.

### Fixed

- `@fastify/rate-limit`'s `errorResponseBuilder` throws its return value
  directly rather than sending it as a response — a plain object without a
  `statusCode` was being misclassified as an unexpected error and returned
  as `500` instead of `429`. Fixed by having the builder return a
  `RateLimitError` instance; regression-tested in
  `tests/integration/login.test.ts`.
- Pino's `*.field` redaction wildcard only matches a field nested one level
  down, not a bare top-level key — `sessionToken`/`tokenHash` logged at the
  top level would have leaked. Added explicit top-level redact paths
  alongside the wildcard ones; regression-tested in
  `tests/security/auth-security.test.ts`.

## [Unreleased] — Version 0.1: Repository foundation

### Added

- Monorepo scaffold: `apps/web`, `apps/api` (placeholder), `apps/docs`
  (placeholder), `packages/{types,validation,financial-engine,ui,analytics,config}`,
  `database/*`, `tests/*`, `docs/*`.
- Shared TypeScript configuration (`packages/config`) and ESLint flat config.
- `@excellent-wealth/types`: `Money`, `CurrencyCode`, and core domain entity
  types (Asset, Liability, Transaction, FinancialGoal).
- `@excellent-wealth/financial-engine`: decimal-safe money arithmetic, net
  worth, savings rate, debt-to-income ratio, compound growth projection,
  emergency fund assessment, and an explainable financial health score — each
  with unit tests covering zero, negative, large, and currency-mismatch cases.
- `@excellent-wealth/validation`: Zod schemas for currency/money, transactions,
  registration, and login, with unit tests.
- `@excellent-wealth/ui`: accessible `Button`, `Card`, and `Disclaimer`
  components with component tests.
- `apps/web`: responsive, accessible landing page (Next.js + Tailwind) with
  the Excellent Wealth brand palette (dark navy, neon-blue accent, restrained
  maroon), skip-to-content link, and reduced-motion support.
- Governance and security documentation: `SECURITY.md`, threat model,
  data-flow overview, security checklist, ADRs 0001–0002.
- Project governance docs: `PROJECT_STATUS.md`, `COMMIT_ROADMAP.md`,
  `FEATURE_MATRIX.md`, `QUALITY_SCORECARD.md`.
