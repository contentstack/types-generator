const testData = require("./number.ct");

import NullDocumentationGenerator from "../../../src/generateTS/docgen/nulldoc";
import tsgenFactory from "../../../src/generateTS/factory";

const tsgen = tsgenFactory({
  docgen: new NullDocumentationGenerator(),
});

describe("builtin number field", () => {
  const result = tsgen(testData.builtinNumber);

  test("metadata", () => {
    const types = result.metadata.types;
    expect([...types.contentstack]).toHaveLength(0);
    expect([...types.globalFields]).toHaveLength(0);
    expect(types.javascript).toContain("number");
  });

  test("definition", () => {
    expect(result.definition).toMatchInlineSnapshot(`
      "export interface Number
      {
      _version?: number;
      title: string;
      url: string;
      number?: number | null;
      number_required: number;
      number_multiple?: number[] | null;
      number_multiple_max_limit?: MaxTuple<number, 10> | null;
      number_required_multiple_max_limit: MaxTuple<number, 3>;
      }"
    `);
  });
});
