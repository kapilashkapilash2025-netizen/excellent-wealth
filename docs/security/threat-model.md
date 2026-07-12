# Threat Model — Excellent Wealth

Status: living document, initial draft for Version 0.1. Will be revised as
authentication, the API, and data storage are implemented in Version 0.2+.

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

## Key threats and planned mitigations

| Threat                                  | Mitigation (planned/implemented)                                                                                            |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Credential stuffing / brute force login | Rate limiting on auth endpoints, account lockout considerations, strong password policy (`packages/validation/src/auth.ts`) |
| Password database compromise            | Salted, adaptive password hashing (argon2id or bcrypt) — never plaintext or fast unsalted hashes                            |
| Session hijacking                       | Short-lived, `HttpOnly`, `Secure`, `SameSite` session cookies; server-side session expiry                                   |
| Cross-site scripting (XSS)              | React's default output encoding; strict Content-Security-Policy headers; no `dangerouslySetInnerHTML` with user input       |
| Cross-site request forgery (CSRF)       | `SameSite=Strict/Lax` cookies plus CSRF tokens on state-changing requests once the API exists                               |
| SQL injection                           | Prisma parameterised queries exclusively; no raw string-interpolated SQL                                                    |
| Broken access control (IDOR)            | Every API query scoped to the authenticated user's ID at the data-access layer, verified by authorization tests             |
| Sensitive data in logs                  | Structured logging with an explicit denylist of fields (passwords, tokens, full account numbers)                            |
| Dependency vulnerabilities              | Dependabot + `pnpm audit` in CI; version pinning with verification before upgrading                                         |
| Secrets committed to git                | `.env` gitignored, `.env.example` contains no real secrets, secret-scanning enabled on the repository                       |
| Data loss                               | Documented backup strategy once a database exists (Version 0.2)                                                             |
| Unauthorized data export                | Exports scoped to the authenticated user; rate-limited; audit-logged                                                        |

## Explicit non-goals for this project

- This project does not claim regulatory compliance (e.g. PCI-DSS, SOC 2) —
  see the financial disclaimer in [README.md](../../README.md).
- This project does not process live payment card data.

## Review cadence

This document is reviewed at every major version milestone (see
[ROADMAP.md](../../ROADMAP.md)) and whenever authentication, session, or
data-access logic changes materially.
