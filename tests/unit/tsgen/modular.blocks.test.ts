const testData = require("./modular.blocks.ct");

import NullDocumentationGenerator from "../../../src/generateTS/docgen/nulldoc";
import tsgenFactory from "../../../src/generateTS/factory";

const tsgen = tsgenFactory({
  docgen: new NullDocumentationGenerator(),
});

describe("modular blocks", () => {
  const result = tsgen(testData.modularBlocks);

  test("metadata", () => {
    const types = result.metadata.types;
    expect([...types.contentstack]).toHaveLength(0);
    expect([...types.globalFields]).toHaveLength(0);
  });

  test("definition", () => {
    expect(result.definition).toMatchInlineSnapshot(`
      "export interface ModularBlocks {
      string_block: {
       single_line?: string;
      multi_line?: string;
      markdown?: string;
      rich_text_editor?: string; }
      string_block_with_options: {
       single_line_textbox_required: string;
      single_line_textbox_multiple?: string[]; }
      boolean_block: {
       boolean: boolean; }
      }

      export interface ModularBlocks
      {
      _version?: number;
      title: string;
      url: string;
      modular_blocks?: ModularBlocks[];
      }"
    `);
  });
});

describe("modular blocks with system fields", () => {
  const tsgenWithSystemFields = tsgenFactory({
    docgen: new NullDocumentationGenerator(),
    systemFields: true,
  });

  const result = tsgenWithSystemFields(testData.modularBlocks);

  test("modular block interfaces extend SystemFields", () => {
    expect(result.definition).toContain(
      "export interface ModularBlocks extends SystemFields {"
    );
  });

  test("content type interface extends SystemFields", () => {
    expect(result.definition).toContain(
      "export interface ModularBlocks extends SystemFields {"
    );
  });

  test("modular block interface contains all expected fields", () => {
    expect(result.definition).toContain("string_block:");
    expect(result.definition).toContain("string_block_with_options:");
    expect(result.definition).toContain("boolean_block:");
  });
});

describe("modular blocks with system fields and prefix", () => {
  const tsgenWithSystemFieldsAndPrefix = tsgenFactory({
    docgen: new NullDocumentationGenerator(),
    systemFields: true,
    naming: {
      prefix: "I",
    },
  });

  const result = tsgenWithSystemFieldsAndPrefix(testData.modularBlocks);

  test("modular block interfaces extend prefixed SystemFields", () => {
    expect(result.definition).toContain(
      "export interface IModularBlocks extends ISystemFields {"
    );
  });
});
