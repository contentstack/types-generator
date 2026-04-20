---
name: typescript-types-generator
description: Mental model for @contentstack/types-generator — generateTS, graphqlTS, Delivery SDK, and where to change code.
---

# TypeScript types generator skill

Package **`@contentstack/types-generator`**. Entry [`src/index.ts`](../../src/index.ts) re-exports **`generateTS`** and **`graphqlTS`**.

Scope: **SDK-facing library code** (no separate `samples/` tree). This package is **not** a CMA (Management) client.

## Delivery (CDA) and SDK

- **Token type:** Only **`TOKEN_TYPE.DELIVERY`** is defined ([`src/constants/index.ts`](../../src/constants/index.ts)). `generateTS` validates `tokenType` and uses the **Delivery SDK** for content types and global fields.
- **SDK entry:** [`initializeContentstackSdk`](../../src/sdk/utils.ts) wraps **`@contentstack/delivery-sdk`** (`Contentstack.stack` with `deliveryToken`, `environment`, `region` or `host`, optional `branch`).
- **Regions:** Map string constants in **`REGIONS`** to **`Region`** enum; **custom** regions require **`host`** (see `isCustomRegion` in [`src/sdk/utils.ts`](../../src/sdk/utils.ts)).
- **Errors:** Validation failures often use **`{ type: "validation", error_message: string }`** or helpers in [`generateTS/shared/utils.ts`](../../src/generateTS/shared/utils.ts). Preserve stable `type` / message shapes for callers.

Prefer official **Content Delivery API** documentation—not Management API patterns—when unsure.

## `generateTS` (REST / content types)

1. **Validation** — Required params include token, `tokenType`, `apiKey`, `environment`, `region` ([`src/generateTS/index.ts`](../../src/generateTS/index.ts)).
2. **SDK** — [`initializeContentstackSdk`](../../src/sdk/utils.ts) fetches content types and global fields.
3. **Generation** — `tsgenFactory` / [`factory.ts`](../../src/generateTS/factory.ts); docgen under [`docgen/`](../../src/generateTS/docgen/); builtins in [`stack/builtins.ts`](../../src/generateTS/stack/builtins.ts).
4. **Formatting** — [`src/format/index.ts`](../../src/format/index.ts) + **Prettier**.
5. **Errors** — Helpers in [`generateTS/shared/utils.ts`](../../src/generateTS/shared/utils.ts).

**Where to change:** New field types or schema handling → `factory.ts`, schema/docgen modules. Connection issues → `sdk/utils.ts`.

## `graphqlTS` (GraphQL)

1. **Validation** — Requires token, `apiKey`, `environment`, `region` (optional `host`, `branch`, `namespace`).
2. **HTTP** — **axios** POST to region GraphQL URLs or to `https://${host}/...` when `host` is set ([`src/graphqlTS/index.ts`](../../src/graphqlTS/index.ts)).
3. **Schema** — Introspection in [`queries.ts`](../../src/graphqlTS/queries.ts); **`@gql2ts/from-schema`** (`schemaToInterfaces`, `generateNamespace`). Align URL and headers (`access_token`, `branch`) with Contentstack GraphQL docs for the region.

**Where to change:** Endpoint or headers → `graphqlTS/index.ts`; introspection shape → queries + gql2ts usage.

## Shared pieces

- **Constants / messages:** [`src/constants/`](../../src/constants/)
- **Logger:** [`src/logger/`](../../src/logger/)
- **Types:** [`src/types/`](../../src/types/)

## Secondary entry

- [`src/web.ts`](../../src/web.ts) re-exports from `generateTS` only (see [`tsup.config.ts`](../../tsup.config.ts)).
