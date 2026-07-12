# ADR 0002: Decimal-Safe Money Representation

## Status

Accepted — 2026-07-12

## Context

Floating-point numbers cannot exactly represent most decimal fractions
(`0.1 + 0.2 !== 0.3` in IEEE 754 double precision). Using `number` directly
for currency amounts risks silent rounding errors that compound across
transactions, budgets, and multi-year growth projections — unacceptable for a
financial application.

## Decision

- Money is represented as `{ minorUnits: number (integer), currency: CurrencyCode }`
  (see `packages/types/src/money.ts`) — e.g. `{ minorUnits: 12345, currency: 'USD' }`
  for $123.45. Integer arithmetic on minor units (cents) is exact for
  addition, subtraction, and comparison.
- Operations that involve rates and exponents — compound growth,
  amortisation — use [`decimal.js`](https://github.com/MikeMcl/decimal.js)
  internally (see `packages/financial-engine/src/compound-growth.ts`) rather
  than native floating-point math, because these calculations chain many
  multiplications where float error would otherwise accumulate visibly over
  long time horizons.
- Rounding uses banker's rounding (round-half-to-even) via
  `roundHalfToEven` / `Decimal.ROUND_HALF_EVEN`, to avoid systematically
  biasing sums upward or downward across many transactions.
- Combining two `Money` values in different currencies throws
  `CurrencyMismatchError` rather than silently producing a nonsensical
  result; currency conversion must be an explicit, separate step.

## Consequences

- All monetary code must go through `packages/financial-engine`'s money
  helpers or `decimal.js` directly — using raw `+`/`-`/`*` on currency
  amounts represented as JavaScript floats is disallowed and should be
  flagged in code review.
- Currency amounts are only converted to a display-friendly major-unit
  number (e.g. cents → dollars) at the presentation layer, via
  `toMajorUnits`, and never for further calculation.
- This adds a small amount of ceremony (constructing `Money` objects, handling
  `CurrencyMismatchError`) in exchange for eliminating an entire class of
  rounding and cross-currency bugs.
