# tests/security

`apps/api`'s security tests actually live at
[apps/api/tests/security](../../apps/api/tests/security) (password/token
leakage, log redaction, error-handler stack-trace hiding, CORS allowlist
enforcement, rate limiting, oversized-payload rejection, SQL-injection-shaped
input handling — see [docs/api/authentication.md](../../docs/api/authentication.md)).
This directory is reserved for security tests that span more than one
app/package — currently empty.
