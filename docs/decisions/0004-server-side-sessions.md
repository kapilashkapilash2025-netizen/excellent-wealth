# ADR 0004: Opaque Server-Side Sessions

## Status

Accepted — 2026-07-12

## Context

Version 0.2 needed an authentication mechanism for `apps/api`. The two
common approaches are (a) self-contained tokens the client can decode (JWTs)
or (b) opaque tokens that mean nothing without a server-side lookup. Given
Excellent Wealth's stated privacy-first posture and the need for
straightforward revocation (logout, account lockout, a future "log out all
devices"), the trade-offs mattered more than they might for a stateless
public API.

## Decision

Use **opaque, server-side sessions** stored in the `sessions` table
(`apps/api/prisma/schema.prisma`), delivered via an `HttpOnly` cookie.

- **Token generation**: 256 bits of randomness from `node:crypto.randomBytes`,
  base64url-encoded (`generateSessionToken` in `src/security/session.ts`).
  The raw token carries no information about the user — it's a lookup key,
  not a credential-bearing structure like a JWT.
- **Storage**: only an HMAC-SHA256 hash of the token (keyed with
  `SESSION_SECRET`) is ever persisted, in `sessions.tokenHash`. A stolen
  database dump alone cannot be replayed as a valid session, and a stolen
  cookie alone cannot be reversed to find other sessions.
- **Revocation is immediate and real**: logout, account lockout, and (in a
  future milestone) "log out all devices" all work by setting `revokedAt` on
  the row — the very next request with that cookie fails at
  `authenticate()` (`src/middleware/authenticate.ts`). A JWT-based design
  would need a denylist to achieve the same thing, which is the same
  server-side state this design already has, minus the complexity of a
  second token format.
- **Session rotation**: a fresh session (fresh token, fresh row) is created
  on every successful login and registration — no session is ever reused
  across authentications.

## Cookie attributes

| Attribute  | Value                                       | Why                                                                                                                                                             |
| ---------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `HttpOnly` | always                                      | JavaScript can never read the token — mitigates XSS token theft.                                                                                                |
| `Secure`   | on in production, off in development        | Allows `http://localhost` during local development; production only ever runs over HTTPS.                                                                       |
| `SameSite` | `Lax`                                       | Cookie is sent on top-level navigations and same-site requests, not on cross-site POSTs from third-party pages — see CSRF assumptions below.                    |
| `Path`     | `/`                                         | The API is served from its own origin (a distinct port from `apps/web`), so a root path doesn't over-share the cookie with unrelated services on a shared host. |
| `maxAge`   | `SESSION_TTL_HOURS` (default 168h / 7 days) | Matches the database `expiresAt` the session row is created with.                                                                                               |
| Domain     | not set (defaults to the exact host)        | No multi-subdomain deployment exists yet; explicit `Domain` handling is deferred — see Known Limitations below.                                                 |

## CSRF assumptions

`SameSite=Lax` blocks the cookie from being attached to cross-site
subresource requests and cross-site `POST`s from third-party pages, which
covers the classic CSRF attack shape (an attacker page auto-submitting a
form to `POST /api/v1/auth/logout` or similar). This project does **not**
yet implement a separate CSRF token — `SameSite=Lax` is treated as the
primary mitigation for this milestone, which is standard practice for a
same-registrable-domain API + frontend pair. A dedicated CSRF token would
be revisited if:

- The API ever needs to serve cross-site (not just cross-port) clients with
  credentialed requests, or
- A state-changing `GET` endpoint is ever introduced (there are none today —
  `GET /api/v1/auth/me` is read-only).

## Consequences

- Every authenticated request costs one indexed database lookup
  (`sessions.tokenHash` is `@unique`). This is an explicit trade-off against
  a JWT's "no lookup needed" property, made in exchange for real revocation
  and no second secret-management surface for signing tokens users can
  decode.
- `lastUsedAt` is only updated when it's stale by more than five minutes
  (`src/middleware/authenticate.ts`), not on every single request, to avoid
  a write on every authenticated call.
- **Known limitation**: cookie `Domain` is not environment-configurable yet
  (no `COOKIE_DOMAIN` variable). A future milestone introducing a separate
  API subdomain in production will need to add this.
- **Known limitation**: there is no explicit CSRF token yet, per the
  assumptions above — revisit if the trust model changes.
