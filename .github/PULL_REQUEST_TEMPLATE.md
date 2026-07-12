## Summary

<!-- What does this change do, and why? Link related issues. -->

## Type of change

- [ ] feat — new feature
- [ ] fix — bug fix
- [ ] docs — documentation only
- [ ] refactor — no behavior change
- [ ] test — adding or correcting tests
- [ ] security — security-relevant change
- [ ] a11y — accessibility improvement
- [ ] chore / ci / build — tooling or infrastructure

## Test plan

<!-- How was this verified? Include commands run and their results. -->

- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm test` passes
- [ ] `pnpm build` passes
- [ ] New/changed behavior has test coverage
- [ ] Documentation updated if architecture or usage changed

## Financial calculation checklist (if applicable)

- [ ] Money handled as integer minor units or via `decimal.js` — no raw floats
- [ ] Edge cases tested: zero, negative, very large values, currency mismatch
- [ ] No projection or simulation is presented as a guaranteed outcome

## Security checklist (if applicable)

- [ ] No secrets, credentials, or tokens included in this change
- [ ] Input validated at the boundary (Zod schema or equivalent)
- [ ] No sensitive data added to logs
