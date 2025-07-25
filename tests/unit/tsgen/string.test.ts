const testData = require("./string.ct");

import NullDocumentationGenerator from "../../../src/generateTS/docgen/nulldoc";
import tsgenFactory from "../../../src/generateTS/factory";

const tsgen = tsgenFactory({
  docgen: new NullDocumentationGenerator(),
});

describe("builtin string fields", () => {
  const result = tsgen(testData.builtinStrings);

  test("metadata", () => {
    const types = result.metadata.types;
    expect([...types.contentstack]).toHaveLength(0);
    expect([...types.globalFields]).toHaveLength(0);
    expect(types.javascript).toContain("string");
  });

  test("definition", () => {
    expect(result.definition).toMatchInlineSnapshot(`
      "export interface BuiltinStrings
      {
      _version?: number;
      title: string;
      single_line?: string;
      multi_line?: string;
      rich_text_editor?: string;
      markdown?: string;
      }"
    `);
  });
});
