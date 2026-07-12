# apps/api

Excellent Wealth's backend API — Fastify + TypeScript + Prisma + PostgreSQL.

Version 0.2 implements the authentication foundation: registration, login,
logout, the current-user endpoint, opaque server-side sessions, Argon2id
password hashing, rate limiting, account lockout, and an audit-event
foundation. See:

- [docs/api/authentication.md](../../docs/api/authentication.md) — endpoint reference, session lifecycle, what's not implemented yet
- [docs/api/error-responses.md](../../docs/api/error-responses.md) — response envelope and error codes
- [docs/development/api-setup.md](../../docs/development/api-setup.md) — local setup and commands
- [docs/development/database-setup.md](../../docs/development/database-setup.md) — PostgreSQL setup and troubleshooting
- [docs/decisions/0003-api-framework.md](../../docs/decisions/0003-api-framework.md) — why Fastify
- [docs/decisions/0004-server-side-sessions.md](../../docs/decisions/0004-server-side-sessions.md) — why opaque sessions

Financial data endpoints (transactions, budgets, etc.) are not implemented
yet — see [ROADMAP.md](../../ROADMAP.md) for what's next.
