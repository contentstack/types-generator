---
name: dev-workflow
description: Branches, build/test commands, PR and release workflow for @contentstack/types-generator.
---

# Development workflow – types-generator

## When to use

- Local build and test before a PR
- Understanding CI vs release branches

## Branches and CI

- **Node.js workflow** (`.github/workflows/node.js.yml`) runs on **push** and **pull_request** for **`master`** and **`development`**.
- **Release / publish** (`.github/workflows/release.yml`) runs on **push** to **`main`** (Node **22.x**), autotag, npm publish, GitHub release.

CI and release default branches may differ (`master`/`development` vs `main`); follow team branch protection.

## Local commands

| Command | Purpose |
| --- | --- |
| `npm run build` | **tsup** (`prepare` also runs build) |
| `npm test` | Jest for `tests/` with `NODE_OPTIONS=--experimental-vm-modules` |
| `npm run test:unit:report:json` | Unit tests under `tests/unit` with coverage (CI) |

## Pull requests

- **`npm run build`** and **`npm test`** should pass.
- PRs from forks may lack CI secrets; integration jobs may fail only on secrets—coordinate with maintainers.

## Releases

- Version in **`package.json`** is the publish source of truth.
- Publishing is automated from **`main`** (tag prefix **`v`**, npm, GitHub release).
