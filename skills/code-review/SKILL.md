---
name: code-review
description: PR review checklist for @contentstack/types-generator (API docs, compatibility, errors, tests, CDA/GraphQL terminology).
---

# Code review skill (`@contentstack/types-generator`)

Expanded checklist aligned with [`.cursor/rules/code-review.mdc`](../../.cursor/rules/code-review.mdc).

## Documentation and API surface

- Public exports from [`src/index.ts`](../../src/index.ts) should stay coherent and documented (JSDoc on exported functions where the package documents behavior).
- **`generateTS`** / **`graphqlTS`** options and error behavior should match README and real usage.

## Product terminology

- This library is **Delivery (CDA)** + **GraphQL** only. Do not label features or errors as **CMA** or Management API unless you are explicitly comparing upstream docs—and even then, keep user-facing text accurate to this package.

## Backward compatibility

- Generated TypeScript shape changes can break consumers; treat output as a semver-sensitive API.
- Error objects with **`type`** and **`error_message`** should remain predictable; document intentional changes.

## Error handling

- Prefer existing helpers (**`createValidationError`**, **`createErrorDetails`**) and patterns in [`src/generateTS`](../../src/generateTS) / [`src/graphqlTS`](../../src/graphqlTS).
- SDK initialization errors in [`src/sdk/utils.ts`](../../src/sdk/utils.ts) use **`type: "validation"`**; keep consistency.

## Null and config safety

- Optional **`host`**, **`branch`**, logger instances, and stack parameters must be guarded per **`strictNullChecks`**.

## Dependencies and security

- Justify new runtime dependencies (bundle size, maintenance).
- CI runs SCA (Snyk + policy) on pull requests—consider supply-chain impact of new packages.

## Tests

- **Unit:** [`tests/unit/`](../../tests/unit/) for deterministic logic; use **`.ct.js`** fixtures with matching **`.test.ts`** where applicable.
- **Integration:** [`tests/integration/`](../../tests/integration/) for live stack tests; require documented env vars.

## Optional severity tags

- **Blocker:** breaks consumers, security issue, or wrong API family (e.g. CMA-only assumption).
- **Major:** missing tests for new behavior, unclear errors, semver risk.
- **Minor:** style, small doc gaps, non-user-facing refactors.
