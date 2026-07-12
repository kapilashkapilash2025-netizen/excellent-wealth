# Data Flow Overview — Excellent Wealth

Status: updated for Version 0.2. `apps/api` and its PostgreSQL database now
exist and implement the authentication flow described below. Financial-data
endpoints (transactions, budgets, etc.) don't exist yet — those arrive in
Version 0.3+ and will follow the same per-user scoping pattern established
here.

```text
┌──────────────┐      HTTPS       ┌──────────────┐      TLS       ┌──────────────┐
│  apps/web    │ ───────────────▶ │  apps/api    │ ─────────────▶ │  PostgreSQL  │
│  (Next.js)   │ ◀─────────────── │  (Node/TS)   │ ◀───────────── │  (Prisma)    │
└──────────────┘   JSON over      └──────────────┘   parameterised└──────────────┘
                    HTTPS only                        queries only
```

## Local demo mode (privacy-first)

Local demo mode runs entirely client-side: sample data is generated and held
in browser memory / local storage, and no network request carrying financial
data is made to `apps/api`. This lets a prospective user evaluate the product
without creating an account or transmitting any data.

## Authenticated data flow (implemented)

1. Client submits credentials over HTTPS to `apps/api` (`POST /api/v1/auth/login`
   or `/register`).
2. `apps/api` verifies credentials against an Argon2id password hash, issues
   a fresh opaque session (see [ADR 0004](../decisions/0004-server-side-sessions.md)),
   and sets an `HttpOnly`, `SameSite=Lax`, `Secure`-in-production cookie.
3. Subsequent requests carry the session cookie; the `authenticate`
   preHandler (`src/middleware/authenticate.ts`) hashes the cookie's token
   and resolves the user from the session store — never from any
   client-supplied user ID — before the route handler runs.
4. `GET /api/v1/auth/me` returns only the safe user projection
   (`toSafeUser` in `src/modules/users/user.types.ts`) — password hash and
   lockout counters never leave the server.
5. Every registration, login, lockout, and logout event is written to
   `audit_events` with the request ID that produced it, for later
   investigation (no read API for these yet — see
   [docs/api/authentication.md](../api/authentication.md)).

Once Version 0.3+ introduces per-user financial data (transactions,
budgets, etc.), those endpoints will follow the same pattern: resolve the
user from the session, scope every query to that user's ID at the Prisma
query layer, and validate responses through typed schemas before
serialization.

## Data export / deletion

Not implemented yet. Planned per [ROADMAP.md](../../ROADMAP.md) (Module J
for reporting/export; account deletion alongside the user-settings work in
a future milestone). When built: export requests will be rate-limited and
audit-logged and will return only the requesting user's data; deletion
requests will be confirmed out-of-band (e.g. re-authentication) before data
is purged.

## What never leaves the boundary unencrypted

- Passwords (hashed at rest, never logged, never included in exports)
- Session tokens (never logged)
- Full financial account numbers, where collected (masked in logs and UI)
