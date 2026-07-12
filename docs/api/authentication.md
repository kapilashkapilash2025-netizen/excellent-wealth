# Authentication

Status: Version 0.2 — implemented and tested locally against a real
PostgreSQL database. Not yet deployed anywhere; not security-audited by a
third party. See [Known limitations](#known-limitations) before relying on
this for anything beyond local development.

## Endpoints

All endpoints are under `/api/v1/auth`. See
[docs/api/error-responses.md](error-responses.md) for the shared response
envelope and error codes.

### `POST /api/v1/auth/register`

Request body:

```json
{
  "email": "user@example.com",
  "password": "AtLeast12CharsWithUpperLowerAndDigit1",
  "confirmPassword": "AtLeast12CharsWithUpperLowerAndDigit1",
  "displayName": "Jane Doe",
  "currency": "USD",
  "timezone": "Asia/Colombo"
}
```

`currency` (ISO 4217 code from a fixed supported list — see
`packages/validation/src/currency.ts`) and `timezone` (IANA zone name)
are optional and default to `USD` / `UTC`. Unknown top-level fields are
rejected (`400 VALIDATION_ERROR`).

On success (`201`): creates the user, creates a new session, sets the
session cookie, records a `USER_REGISTERED` audit event, and returns:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "...",
      "displayName": "...",
      "currency": "USD",
      "timezone": "UTC",
      "createdAt": "..."
    }
  }
}
```

A duplicate email returns `409 CONFLICT` with a generic message — it does
not confirm which specific detail conflicted.

### `POST /api/v1/auth/login`

Request body: `{ "email": "...", "password": "..." }`.

On success (`200`): rotates in a brand-new session (never reuses a prior
session's token), resets the failed-attempt counter, records
`lastLoginAt`, and returns the same safe user shape as registration.

On failure (`401 AUTH_INVALID_CREDENTIALS`): the response is identical
whether the email doesn't exist, the password is wrong, or the account is
temporarily locked — this is deliberate (see
[Account lockout](#account-lockout) and
[ADR 0004](../decisions/0004-server-side-sessions.md)). Every attempt runs a
real Argon2id verification (against a precomputed dummy hash when the email
doesn't exist) so response timing doesn't leak account existence.

Rate limited more strictly than general API traffic (see
[Rate limiting](#rate-limiting)).

### `POST /api/v1/auth/logout`

No request body. Always returns `200 { "success": true, "data": { "loggedOut": true } }`
— including when there is no session cookie, the cookie is already invalid,
or logout is called twice in a row. If a valid session is found, it's
revoked server-side (`revokedAt` set) and a `LOGOUT` audit event is
recorded; the cookie is cleared either way.

### `GET /api/v1/auth/me`

Requires a valid, non-expired, non-revoked session cookie for an `ACTIVE`
user. Returns:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "displayName": "Example User",
      "currency": "USD",
      "timezone": "Asia/Colombo",
      "createdAt": "2026-07-01T00:00:00.000Z"
    }
  }
}
```

Returns `401 AUTH_REQUIRED` for a missing cookie, an unknown/invalid token,
an expired session, a revoked session, or a non-`ACTIVE` user account — the
response does not distinguish between these cases.

## Password policy

At least 12 characters, with a lowercase letter, an uppercase letter, and a
digit (`packages/validation/src/auth.ts`). Deliberately does not mandate a
specific special-character set, following current NIST guidance that favors
length over arbitrary composition rules. Passwords are hashed with
**Argon2id** (`src/security/password.ts`), tuned to OWASP's interactive-login
baseline (19 MiB memory, 2 iterations, 1 degree of parallelism). An optional
`PASSWORD_PEPPER` environment variable, if set, is mixed in via Argon2's
`secret` (associated data) parameter as additional defense in depth.

## Session lifecycle

See [ADR 0004](../decisions/0004-server-side-sessions.md) for the full
design rationale. Summary:

- A session is an opaque, cryptographically random 256-bit token. Only its
  HMAC-SHA256 hash is stored (`sessions.tokenHash`) — the raw token is never
  persisted anywhere.
- Sessions expire after `SESSION_TTL_HOURS` (default 168 hours / 7 days).
- A session is created fresh on every registration and login — never reused.
- Logout revokes the session immediately (`revokedAt` set); a revoked
  session cannot be used again even if the cookie is replayed.
- `lastUsedAt` is refreshed at most once every 5 minutes per session, to
  avoid a database write on every single authenticated request.
- "Log out all devices" (revoking every session for a user at once) is not
  implemented yet — the schema supports it (`sessions.userId` is indexed),
  it just doesn't have an endpoint yet. See Known limitations.

## Account lockout

After 5 consecutive failed login attempts for an account, it is locked for
15 minutes (`src/modules/auth/auth.service.ts`). While locked, even the
correct password is rejected with the same generic `401` as any other
failure. The failed-attempt counter resets to zero on the next successful
login. Every failed attempt, lockout event, and successful login is
recorded as an audit event (see below) — the lockout logic itself does not
distinguish "locked" from "wrong password" in its client-facing response,
only in the audit trail.

## Rate limiting

- **General API**: 100 requests/minute per client (`src/middleware/rate-limit.ts`).
- **Login and registration**: 10 requests/minute per client — layered on top
  of the general limit, so these endpoints are always at least as strict.

Exceeding either limit returns `429 RATE_LIMITED`.

## Audit events

Every registration, login (success and failure), lockout, and logout writes
a row to `audit_events` (`userId` nullable for pre-authentication failures
like an unknown email, `eventType`, `outcome`, the request's `requestId`,
and small non-sensitive `metadata` — never passwords or tokens). There is no
API to read these yet; they exist as a foundation for a future admin/audit
view, and for incident investigation via direct database access.

## What is NOT implemented yet

- Email verification (the `emailVerifiedAt` column exists; nothing sets it).
- Password reset.
- "Log out all devices" / listing active sessions.
- CSRF tokens beyond the `SameSite=Lax` cookie attribute (see
  [ADR 0004](../decisions/0004-server-side-sessions.md#csrf-assumptions)).
- Configurable cookie `Domain` for multi-subdomain deployments.
- Any admin surface for reviewing audit events.

## Known limitations

This has been tested locally against a real PostgreSQL instance (unit,
integration, and security test suites — see
[docs/development/api-setup.md](../development/api-setup.md#testing)) but
has **not** been deployed, load-tested, or reviewed by a third-party
security auditor. Do not treat this as a certified-secure implementation —
treat it as a solid, tested foundation for the next milestone.
