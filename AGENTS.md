# @contentstack/types-generator – Agent guide

**Universal entry point** for contributors and AI agents. Detailed conventions live in **`skills/*/SKILL.md`**.

## What this repo is

| Field | Detail |
| --- | --- |
| **Name:** | [contentstack/types-generator](https://github.com/contentstack/types-generator) |
| **Purpose:** | Library that generates TypeScript types from Contentstack stack content types (Delivery SDK) and from GraphQL schema (introspection). |
| **Out of scope (if any):** | **Management API (CMA)** client behavior—this package targets **CDA** and **GraphQL** only. |

## Tech stack (at a glance)

| Area | Details |
| --- | --- |
| **Language** | TypeScript **5.9** (`strict` in [tsconfig.json](tsconfig.json)) |
| **Build** | **tsup** → `dist/` ([tsup.config.ts](tsup.config.ts)); entries include [src/index.ts](src/index.ts), [src/web.ts](src/web.ts) |
| **Tests** | Jest + ts-jest ([jest.config.js](jest.config.js)); `dotenv/config` in setup |
| **Lint / coverage** | No ESLint script; rely on TypeScript strictness and project conventions |
| **Other** | `@contentstack/delivery-sdk`, `axios`, `@gql2ts/from-schema`, `lodash`, `async`, `prettier` |

## Commands (quick reference)

| Command type | Command |
| --- | --- |
| **Build** | `npm run build` |
| **Test** | `npm test` |
| **Lint** | _(not configured)_ |

CI: [.github/workflows/node.js.yml](.github/workflows/node.js.yml); release: [.github/workflows/release.yml](.github/workflows/release.yml).

## Credentials and integration tests

Set a **`.env`** at the repo root or export variables (see `tests/integration/`). Typical names: `TOKEN`, `APIKEY`, `ENVIRONMENT`, `REGION`, `TOKENTYPE`, `BRANCH`. CI injects secrets including `TOKEN_WITH_NO_CT` and `APIKEY_WITH_NO_CT` where needed.

## Where the documentation lives: skills

| Skill | Path | What it covers |
| --- | --- | --- |
| Development workflow | [skills/dev-workflow/SKILL.md](skills/dev-workflow/SKILL.md) | Branches, CI, build/test, PRs, releases |
| TypeScript types generator | [skills/typescript-types-generator/SKILL.md](skills/typescript-types-generator/SKILL.md) | `generateTS` vs `graphqlTS`, SDK and GraphQL behavior |
| Testing | [skills/testing/SKILL.md](skills/testing/SKILL.md) | Jest layout, `.env`, fixtures |
| Code review | [skills/code-review/SKILL.md](skills/code-review/SKILL.md) | PR checklist, terminology, semver |

An index with “when to use” hints is in [skills/README.md](skills/README.md).

## Using Cursor (optional)

If you use **Cursor**, [.cursor/rules/README.md](.cursor/rules/README.md) only points to **`AGENTS.md`**—same docs as everyone else.
