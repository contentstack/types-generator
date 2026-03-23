# Cursor rules for `@contentstack/types-generator`

This folder contains project-specific rules for AI assistants and developers. Each file lists its scope in YAML frontmatter (`description`, `globs`, `alwaysApply`).


| Rule file                                                      | `alwaysApply` | Globs                                                   | When it applies                                                   | Related skill                                                                  |
| -------------------------------------------------------------- | ------------- | ------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| [dev-workflow.mdc](dev-workflow.mdc)                           | No            | `package.json`, `package-lock.json`, `.github/workflows/**/*`, `jest.config.js`, `tsup.config.ts`, `AGENTS.md` | Branch strategy, build/test commands, PR and release expectations | [testing](../../skills/testing/SKILL.md), [code-review](../../skills/code-review/SKILL.md) |
| [typescript.mdc](typescript.mdc)                               | No            | `src/**/*.ts`, `tests/**/*.ts`                          | Editing or adding TypeScript in this package                      | [typescript-types-generator](../../skills/typescript-types-generator/SKILL.md) |
| [contentstack-delivery-cda.mdc](contentstack-delivery-cda.mdc) | No            | `src/sdk/**`, `src/generateTS/**`, `src/graphqlTS/**`   | Delivery SDK, regions, stack config, GraphQL introspection/axios  | [typescript-types-generator](../../skills/typescript-types-generator/SKILL.md) |
| [testing.mdc](testing.mdc)                                     | No            | `tests/**`, `jest.config.js`                            | Writing or running Jest tests, env for live tests                 | [testing](../../skills/testing/SKILL.md)                                       |
| [code-review.mdc](code-review.mdc)                             | **Yes**       | —                                                       | Every change: API docs, compatibility, errors, security, tests    | [code-review](../../skills/code-review/SKILL.md)                               |


## Referencing rules in Cursor

- Use **@** in chat and pick a rule file (e.g. `@contentstack-delivery-cda`, `@dev-workflow`) to focus the model on Delivery/GraphQL or workflow context.
- Rules with `alwaysApply: true` are included automatically; others apply when matching files are in context or when @-mentioned.

