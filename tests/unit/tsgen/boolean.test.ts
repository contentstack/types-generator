const testData = require("./boolean.ct");

import NullDocumentationGenerator from "../../../src/generateTS/docgen/nulldoc";
import tsgenFactory from "../../../src/generateTS/factory";

const tsgen = tsgenFactory({
  docgen: new NullDocumentationGenerator(),
  naming: {
    prefix: "I",
  },
});

describe("builtin boolean field", () => {
  const result = tsgen(testData.builtinBoolean);

  test("metadata", () => {
    const types = result.metadata.types;
    expect([...types.contentstack]).toHaveLength(0);
    expect([...types.globalFields]).toHaveLength(0);
    expect(types.javascript).toContain("boolean");
  });

  test("definition", () => {
    expect(result.definition).toMatchInlineSnapshot(`
      "export interface IBoolean
      {
      _version?: number;
      title: string;
      boolean: boolean;
      }"
    `);
  });
});
