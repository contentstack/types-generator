---
name: testing
description: How to run and write tests for @contentstack/types-generator (Jest, unit vs integration, env, fixtures).
---

# Testing skill (`@contentstack/types-generator`)

## Commands

| Command | What it runs |
| --- | --- |
| `npm test` | Jest with `--testPathPattern=tests` and `NODE_OPTIONS=--experimental-vm-modules` ([`package.json`](../../package.json)). |
| `npm run test:unit:report:json` | Unit tests only (`tests/unit`), coverage (clover + json), `test-results.json` — mirrors CI. |
| `npm run build` | Build first if imports from `dist/` matter (normally tests import `src/`). |

[`jest.config.js`](../../jest.config.js) sets **`setupFiles: ["dotenv/config"]`** so `.env` keys load when present.

## Layout

- **`tests/unit/`** — Fast tests; **`tests/unit/tsgen/`** pairs **`.ct.js`** content-type fixtures with **`.test.ts`** files.
- **`tests/integration/`** — Live API tests (e.g. `generateTS`, `graphqlTS`); need credentials.

## Environment variables (integration)

Common variables read in integration tests:

- **`TOKEN`**, **`APIKEY`**, **`ENVIRONMENT`**, **`REGION`**, **`TOKENTYPE`**, **`BRANCH`**

Some tests use **`TOKEN_WITH_NO_CT`** / **`APIKEY_WITH_NO_CT`** (see CI env in [`.github/workflows/node.js.yml`](../../.github/workflows/node.js.yml)). Integration specs may load **`.env`** from the package root via `dotenv` paths—check the specific test file.

## Mocks

- **`axios-mock-adapter`** and **`nock`** are devDependencies for HTTP mocking when adding unit tests around network code.

## Timeouts and coverage

- Use reasonable async timeouts for integration tests hitting real endpoints.
- CI publishes coverage from **`test:unit:report:json`**; keep new unit code covered when practical.
