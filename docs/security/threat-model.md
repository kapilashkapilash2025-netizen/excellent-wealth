# Threat Model — Excellent Wealth

Status: living document. Initial draft in Version 0.1; updated in Version
0.2 now that `apps/api` authentication exists. Revised further as
authorization, business-data endpoints, and deployment infrastructure are
added in future milestones.

## Assets to protect

- User account credentials (never plaintext passwords)
- Financial data: transactions, accounts, balances, goals, notes
- Session tokens / cookies
- Aggregate business-finance data for business users

## Actors

- **Legitimate user** — owns their own financial data.
- **Malicious external attacker** — no valid credentials; attacks over the
  network (credential stuffing, injection, CSRF, XSS).
- **Malicious authenticated user** — has valid credentials for their own
  account but attempts to access another user's data (broken access control).
- **Compromised dependency** — a supply-chain risk via a malicious or
  vulnerable npm package.
- **Insider with repository or infrastructure access** — out of scope for
  application-level mitigations, covered by operational access controls.

## Key threats and mitigations

| Threat                                  | Mitigation                                                                                                                                                                              | Status                                                                                                      |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Credential stuffing / brute force login | Strict rate limiting on `/auth/login` and `/auth/register` (10/min), account lockout after 5 failed attempts for 15 minutes, strong password policy (`packages/validation/src/auth.ts`) | ✅ Implemented (`apps/api/src/modules/auth`)                                                                |
| Password database compromise            | Argon2id (salted, adaptive) via `src/security/password.ts`, tuned to OWASP's interactive-login baseline; optional `PASSWORD_PEPPER`                                                     | ✅ Implemented                                                                                              |
| Session hijacking                       | Opaque, high-entropy session tokens; only an HMAC-SHA256 hash is stored; `HttpOnly`, `SameSite=Lax`, `Secure`-in-production cookies; server-side expiry and revocation                  | ✅ Implemented — see [ADR 0004](../decisions/0004-server-side-sessions.md)                                  |
| Cross-site scripting (XSS)              | React's default output encoding on the frontend; `@fastify/helmet` secure headers on the API                                                                                            | 🚧 Partial — no explicit Content-Security-Policy tuning yet                                                 |
| Cross-site request forgery (CSRF)       | `SameSite=Lax` cookies as the primary mitigation; no separate CSRF token yet                                                                                                            | 🚧 Partial — see [ADR 0004 CSRF assumptions](../decisions/0004-server-side-sessions.md#csrf-assumptions)    |
| SQL injection                           | Prisma parameterised queries exclusively; no raw string-interpolated SQL anywhere in `apps/api`                                                                                         | ✅ Implemented, tested (`tests/security/auth-security.test.ts`)                                             |
| Account enumeration                     | Login returns an identical `401 AUTH_INVALID_CREDENTIALS` for unknown email, wrong password, and locked account; timing kept uniform by always running a real Argon2id verify           | ✅ Implemented, tested                                                                                      |
| Broken access control (IDOR)            | No cross-user data endpoints exist yet beyond `/auth/me` (which only ever returns the authenticated caller's own record)                                                                | ⬜ Not yet applicable — revisit when Version 0.3 (transactions) introduces per-user data endpoints          |
| Sensitive data in logs                  | Pino `redact` config covering password/token fields at both top-level and nested paths (`src/config/logger.ts`), verified by a dedicated test                                           | ✅ Implemented, tested                                                                                      |
| Dependency vulnerabilities              | Dependabot (`.github/dependabot.yml`); CodeQL static analysis (`.github/workflows/codeql.yml`)                                                                                          | 🚧 Partial — no `pnpm audit` CI step yet                                                                    |
| Secrets committed to git                | `.env` and `apps/api/.env` gitignored; `.env.example` and `apps/api/.env.test` contain only placeholder/non-secret values                                                               | ✅ Implemented                                                                                              |
| Data loss                               | No backup strategy documented yet                                                                                                                                                       | ⬜ Not implemented — planned for a hardening milestone once real user data exists in a deployed environment |
| Unauthorized data export                | No data-export endpoint exists yet                                                                                                                                                      | ⬜ Not applicable yet — planned per [ROADMAP.md](../../ROADMAP.md) Module J                                 |
| Oversized/malformed request abuse       | 100 KiB JSON body limit; malformed JSON mapped to a safe generic `400`, never a stack trace                                                                                             | ✅ Implemented, tested                                                                                      |

## Explicit non-goals for this project

- This project does not claim regulatory compliance (e.g. PCI-DSS, SOC 2) —
  see the financial disclaimer in [README.md](../../README.md).
- This project does not process live payment card data.

## Review cadence

This document is reviewed at every major version milestone (see
[ROADMAP.md](../../ROADMAP.md)) and whenever authentication, session, or
data-access logic changes materially.
