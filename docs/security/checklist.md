# Security Checklist — Excellent Wealth

Use this checklist when reviewing any change that touches authentication,
data access, or financial data handling. Status reflects Version 0.1; most
items are not yet applicable until `apps/api` exists (Version 0.2).

## Authentication & sessions

- [ ] Passwords hashed with an adaptive, salted algorithm (argon2id/bcrypt) — not implemented yet
- [ ] Password policy enforced client- and server-side (`packages/validation/src/auth.ts` — implemented client-side schema)
- [ ] Login attempts rate-limited per account and per IP — not implemented yet
- [ ] Sessions expire server-side and on logout — not implemented yet
- [ ] Session cookies are `HttpOnly`, `Secure`, `SameSite` — not implemented yet

## Input handling

- [x] All financial and auth form inputs validated with Zod (`packages/validation`)
- [ ] All API request bodies validated with the same schemas server-side — not implemented yet
- [x] Money values are integer minor-units + currency code, never raw floats (`packages/types`, `packages/financial-engine`)

## Web application

- [x] Skip-to-content link and semantic landmarks for keyboard/screen-reader users
- [x] `prefers-reduced-motion` respected in global styles
- [ ] Content-Security-Policy and other secure headers configured — not implemented yet
- [ ] CORS policy scoped to known origins only — not implemented yet

## Data & infrastructure

- [ ] Database queries scoped to authenticated user ID at the query layer — not implemented yet
- [ ] Audit logging for sensitive changes (password change, data export, deletion) — not implemented yet
- [ ] Backup strategy documented — not implemented yet
- [x] `.env` is gitignored; `.env.example` contains no real secrets

## Supply chain

- [x] Dependabot configuration present (`.github/dependabot.yml`)
- [ ] CI dependency review / audit step passing — pending CI wiring
- [ ] CodeQL or equivalent static analysis enabled — pending
