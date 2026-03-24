# `@contentstack/types-generator`

**Purpose:** Library for generating TypeScript type definitions from Contentstack stack content types (via the Delivery SDK) and from GraphQL schema (introspection over the Contentstack GraphQL endpoint).

- **Repository:** [github.com/contentstack/types-generator](https://github.com/contentstack/types-generator)
- **Homepage:** [https://github.com/contentstack/types-generator](https://github.com/contentstack/types-generator)

## Tech stack

| Area | Details |
| --- | --- |
| Language | TypeScript **5.9** (`strict` in [tsconfig.json](tsconfig.json)) |
| Runtime | Node (CI on **18.x** and **20.x**; release workflow uses **22.x**) |
| Build | **tsup** → `dist/` ([tsup.config.ts](tsup.config.ts)): entries `index` ([src/index.ts](src/index.ts)), `web` ([src/web.ts](src/web.ts)) |
| Tests | **Jest** + **ts-jest** ([jest.config.js](jest.config.js)); `dotenv/config` in setup |
| Main dependencies | `@contentstack/delivery-sdk`, `axios`, `@gql2ts/from-schema`, `lodash`, `async`, `prettier` |

This package targets **Content Delivery (CDA)** and **GraphQL** only—not the Management API (CMA).

## Public API and source layout

- **Package entry:** `main` / `module` / `types` point to `./dist/*` (see [package.json](package.json)).
- **Exports:** `generateTS`, `graphqlTS`, and related symbols from [src/index.ts](src/index.ts) (re-exports from [src/generateTS/](src/generateTS/) and [src/graphqlTS/](src/graphqlTS/)).
- **Key paths:** [src/sdk/](src/sdk/) (Delivery SDK wiring), [src/types/](src/types/), [src/format/](src/format/), [src/logger/](src/logger/), [src/constants/](src/constants/).

## Common commands

| Command | Purpose |
| --- | --- |
| `npm run build` | Run `tsup` (also runs on `npm run prepare`) |
| `npm test` | Jest with `--testPathPattern=tests` and `NODE_OPTIONS=--experimental-vm-modules` |
| `npm run test:unit:report:json` | Unit tests under `tests/unit` with coverage and JSON reports (used in CI) |

There is **no ESLint** script in this package; rely on TypeScript strictness and project conventions.

## Credentials and integration tests

Integration tests need a live stack. Set a **`.env`** at the repo root (see integration tests under `tests/integration/`) or export variables in your shell. Typical names:

`TOKEN`, `APIKEY`, `ENVIRONMENT`, `REGION`, `TOKENTYPE`, `BRANCH`

CI injects these from GitHub Actions secrets (see [.github/workflows/node.js.yml](.github/workflows/node.js.yml)), including `TOKEN_WITH_NO_CT` and `APIKEY_WITH_NO_CT` where tests require them.

---

## AI guidance index

- [Cursor rules (overview)](.cursor/rules/README.md) — when each rule applies and how to reference it.
- [Skills index](skills/README.md) — deeper checklists and package mental model.
