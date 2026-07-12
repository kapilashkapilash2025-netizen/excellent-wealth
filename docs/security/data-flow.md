# Data Flow Overview — Excellent Wealth

Status: initial draft for Version 0.1. `apps/api` and its database do not
exist yet — this describes the intended flow once Version 0.2 lands.

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

## Authenticated data flow (planned, Version 0.2+)

1. Client submits credentials over HTTPS to `apps/api`.
2. `apps/api` verifies credentials against a salted password hash, issues a
   short-lived session, and sets an `HttpOnly`, `Secure`, `SameSite` cookie.
3. Subsequent requests carry the session cookie; `apps/api` resolves the
   authenticated user ID from the session store (not from client-supplied
   input) before touching the database.
4. All database queries are scoped to that user ID at the query layer.
5. Responses are validated against typed Zod schemas before serialization so
   internal fields never leak accidentally.

## Data export / deletion

- Export: authenticated user requests an export of their own data; the
  request is rate-limited and audit-logged; the response contains only that
  user's data.
- Deletion: authenticated user requests account deletion; the request is
  confirmed out-of-band (e.g. re-authentication) before data is purged.

## What never leaves the boundary unencrypted

- Passwords (hashed at rest, never logged, never included in exports)
- Session tokens (never logged)
- Full financial account numbers, where collected (masked in logs and UI)
