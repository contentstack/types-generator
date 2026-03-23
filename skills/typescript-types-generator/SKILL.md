---

## name: typescript-types-generator
description: Mental model for @contentstack/types-generator — generateTS pipeline, graphqlTS, and where to change code.

# TypeScript types generator skill

Package: `**@contentstack/types-generator**`. Entry: `[src/index.ts](../../src/index.ts)` re-exports `**generateTS**` and `**graphqlTS**`.

## `generateTS` (Delivery / content types)

1. **Validation** — Required params include `**token`**, `**tokenType**`, `**apiKey**`, `**environment**`, `**region**` (`[src/generateTS/index.ts](../../src/generateTS/index.ts)`). Only `**TOKEN_TYPE.DELIVERY**` is supported in constants.
2. **SDK** — `[initializeContentstackSdk](../../src/sdk/utils.ts)` builds a Delivery stack client; fetches content types and global fields.
3. **Generation** — `**tsgenFactory`** / `[factory.ts](../../src/generateTS/factory.ts)` drives type emission; **docgen** picks JSDoc vs null doc via `[docgen/](../../src/generateTS/docgen/)`; **builtins** in `[stack/builtins.ts](../../src/generateTS/stack/builtins.ts)`.
4. **Formatting** — `[src/format/index.ts](../../src/format/index.ts)` + **Prettier** produce the final string.
5. **Errors** — Shared helpers in `[generateTS/shared/utils.ts](../../src/generateTS/shared/utils.ts)`; validation uses `**createValidationError`** where applicable.

**Where to change:** New field types or schema handling → `**factory.ts`**, `**types/schema**`, docgen modules. Connection issues → `**sdk/utils.ts**`.

## `graphqlTS` (GraphQL introspection)

1. **Validation** — Requires `**token`**, `**apiKey**`, `**environment**`, `**region**` (optional `**host**`, `**branch**`, `**namespace**`).
2. **HTTP** — `**axios`** POST to region GraphQL base URLs or custom `**host**` (`[src/graphqlTS/index.ts](../../src/graphqlTS/index.ts)`).
3. **Types** — Introspection query in `[queries.ts](../../src/graphqlTS/queries.ts)`; `**@gql2ts/from-schema`** builds interfaces.

**Where to change:** Endpoint or headers → `**graphqlTS/index.ts`**; introspection shape → **queries** + gql2ts usage.

## Shared pieces

- **Constants / messages:** `[src/constants/](../../src/constants/)`
- **Logger:** `[src/logger/](../../src/logger/)`
- **Types:** `[src/types/](../../src/types/)`

## Secondary entry

- `**src/web.ts`** re-exports from `**generateTS**` only (`[web` bundle in tsup](../../tsup.config.ts))—keep exports minimal and consistent with the main package story.

