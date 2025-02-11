const testData = require("./custom-field.ct");

import NullDocumentationGenerator from "../../../src/generateTS/docgen/nulldoc";
import tsgenFactory from "../../../src/generateTS/factory";

const tsgen = tsgenFactory({
  docgen: new NullDocumentationGenerator(),
});

describe("JSON RTE", () => {
  const result = tsgen(testData.customField);

  test("metadata", () => {
    const types = result.metadata.types;

    expect([...types.javascript]).toEqual(expect.arrayContaining(["string"]));
  });
  test("definition", () => {
    expect(result.definition).toMatchInlineSnapshot(`
    "export interface Home
    {
    /** Version */
    _version: number;
    title: string;
    custom_key_value_pair?: { value: { key: string; value: string }[] };
    }"
   `);
  });
});
