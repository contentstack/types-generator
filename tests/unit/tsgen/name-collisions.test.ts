const testData = require("./name-collisions.ct");

import NullDocumentationGenerator from "../../../src/generateTS/docgen/nulldoc";
import tsgenFactory from "../../../src/generateTS/factory";
import { generateTSFromContentTypes } from "../../../src/generateTS/index";

const interfaceNames = (output: string) =>
  [...output.matchAll(/export interface (\w+)/g)].map((m) => m[1]);

describe("interface name collisions", () => {
  test("a modular block named `file` does not reuse the builtin File name", () => {
    const tsgen = tsgenFactory({ docgen: new NullDocumentationGenerator() });
    const result = tsgen(testData.blockVsBuiltin);

    // The block interface must not be called `File` — that name is taken by the
    // builtin emitted in stack/builtins.ts.
    expect(result.definition).not.toMatch(/export interface File\b/);
    expect(result.definition).toMatch(/export interface File1\b/);
  });
});

describe("DX-10385: content type UID vs modular block UID", () => {
  test("emits no duplicate interface names", async () => {
    const output = await generateTSFromContentTypes({
      contentTypes: [testData.formCT, testData.formBasicCT],
      prefix: "",
      includeDocumentation: false,
    });

    const names = interfaceNames(output);
    const duplicates = names.filter((n, i) => names.indexOf(n) !== i);
    expect(duplicates).toEqual([]);
  });

  test("the content type keeps the `Form` name; the block is renamed", async () => {
    const output = await generateTSFromContentTypes({
      contentTypes: [testData.formCT, testData.formBasicCT],
      prefix: "",
      includeDocumentation: false,
    });

    // The top-level content type must keep its name — customers import it.
    expect(output).toMatch(/export interface Form\s*\{[^}]*heading\?: string/);
    // The derived block interface takes the suffixed name.
    expect(output).toMatch(/export interface Form1\b/);
    expect(output).toMatch(/form\?: Form1\[\]/);
  });

  test("order does not matter — the colliding content type may come second", async () => {
    const output = await generateTSFromContentTypes({
      contentTypes: [testData.formBasicCT, testData.formCT],
      prefix: "",
      includeDocumentation: false,
    });

    const names = interfaceNames(output);
    const duplicates = names.filter((n, i) => names.indexOf(n) !== i);
    expect(duplicates).toEqual([]);
  });
});

const text = (uid: string) => ({ uid, data_type: "text", multiple: false });
const ct = (uid: string, schema: any[]) => ({
  uid,
  title: uid,
  schema_type: "content_type",
  schema,
});
const blocksField = (uid: string, innerField: string) => ({
  uid,
  data_type: "blocks",
  multiple: true,
  blocks: [{ uid: "banner", title: "Banner", schema: [text(innerField)] }],
});

describe("builtin names are reserved, including the unprefixed ones", () => {
  // BuildTuple / TuplePrefixes / MaxTuple are emitted by stack/builtins.ts WITHOUT the
  // naming prefix, so they are easy to miss when the reserved list is maintained by
  // hand. The names are now read from builtins.ts so that this cannot drift again.
  it.each(["build_tuple", "tuple_prefixes", "max_tuple", "file", "link"])(
    "a modular block named `%s` does not reuse the builtin name",
    async (blockFieldUid) => {
      const output = await generateTSFromContentTypes({
        contentTypes: [
          ct("page", [text("title"), blocksField(blockFieldUid, "label")]),
        ] as any,
        prefix: "",
        includeDocumentation: false,
      });

      const declared = [
        ...output.matchAll(/(?:export\s+)?(?:interface|type)\s+(\w+)/g),
      ].map((m) => m[1]);
      const duplicates = declared.filter((n, i) => declared.indexOf(n) !== i);
      expect(duplicates).toEqual([]);
    }
  );
});

describe("names that already compile are never renamed", () => {
  // Stacks with several block-vs-block collisions generate valid types today. The
  // suffix counter is shared across all collisions, so the second colliding base name
  // starts at 2 and `Card1` is never produced. That numbering is arbitrary, but it is
  // what has shipped — switching to a per-name counter would rename a live interface.
  test("the shared suffix counter is preserved (Card2, not Card1)", async () => {
    const output = await generateTSFromContentTypes({
      contentTypes: [
        ct("page_a", [text("title"), blocksField("hero", "alpha")]),
        ct("page_b", [text("title"), blocksField("hero", "beta")]),
        ct("page_c", [text("title"), blocksField("card", "gamma")]),
        ct("page_d", [text("title"), blocksField("card", "delta")]),
      ] as any,
      prefix: "",
      includeDocumentation: false,
    });

    expect(interfaceNames(output)).toEqual([
      "PublishDetails",
      "File",
      "Link",
      "Taxonomy",
      "Hero",
      "PageA",
      "Hero1",
      "PageB",
      "Card",
      "PageC",
      "Card2",
      "PageD",
    ]);
  });

  test("a null prefix produces valid output, not `nullFile` builtins", async () => {
    const output = await generateTSFromContentTypes({
      contentTypes: [ct("article", [text("title")])] as any,
      prefix: null as any,
      includeDocumentation: false,
    });

    expect(output).toMatch(/export interface Article\b/);
    // The prefix is normalised at the boundary, so the builtins are not emitted as
    // `nullFile` / `nullLink` against references to a `File` that was never declared.
    expect(output).not.toMatch(/null(File|Link|Taxonomy|PublishDetails)/);
    expect(output).toMatch(/export interface File\b/);
  });

  test("a padded prefix is trimmed consistently across builtins and interfaces", async () => {
    const output = await generateTSFromContentTypes({
      contentTypes: [ct("article", [text("title")])] as any,
      prefix: "  CS  ",
      includeDocumentation: false,
    });

    expect(output).toMatch(/export interface CSArticle\b/);
    expect(output).toMatch(/export interface CSFile\b/);
    expect(output).not.toMatch(/interface\s+\s+CS/);
  });
});

describe("builtins that are not emitted are not reserved", () => {
  // Reserving a name that will not be emitted is not free: the block that wanted it is
  // renamed, AND it consumes the shared suffix counter, shifting every later collision
  // in the batch. Both rename interfaces that compile today.
  test("a block named `system_fields` keeps its name when systemFields is off, and does not shift later suffixes", async () => {
    const output = await generateTSFromContentTypes({
      contentTypes: [
        ct("page_a", [text("title"), blocksField("system_fields", "alpha")]),
        ct("page_b", [text("title"), blocksField("hero", "beta")]),
        ct("page_c", [text("title"), blocksField("hero", "gamma")]),
      ] as any,
      prefix: "",
      systemFields: false,
      includeDocumentation: false,
    });

    // SystemFields is not emitted when systemFields is false, so the block may use it.
    expect(output).toMatch(/export interface SystemFields\b/);
    expect(output).not.toMatch(/export interface SystemFields1\b/);
    // ...and the untouched counter means the later `hero` collision is still Hero1.
    expect(output).toMatch(/export interface Hero1\b/);
    expect(output).not.toMatch(/export interface Hero2\b/);
  });

  test("a block named `system_fields` is renamed when systemFields is on", async () => {
    const output = await generateTSFromContentTypes({
      contentTypes: [
        ct("page_a", [text("title"), blocksField("system_fields", "alpha")]),
      ] as any,
      prefix: "",
      systemFields: true,
      includeDocumentation: false,
    });

    const declared = [
      ...output.matchAll(/(?:export\s+)?(?:interface|type)\s+(\w+)/g),
    ].map((m) => m[1]);
    expect(declared.filter((n, i) => declared.indexOf(n) !== i)).toEqual([]);
  });
});

