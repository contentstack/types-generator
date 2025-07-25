const testData = require("./taxonomies.ct");

import NullDocumentationGenerator from "../../../src/generateTS/docgen/nulldoc";
import tsgenFactory from "../../../src/generateTS/factory";

const tsgen = tsgenFactory({
  docgen: new NullDocumentationGenerator(),
  naming: {
    prefix: "I",
  },
});

describe("builtin taxonomies field", () => {
  const result = tsgen(testData.builtinTaxonomies);

  test("metadata", () => {
    const types = result.metadata.types;
    expect([...types.contentstack]).toHaveLength(1);
    expect([...types.globalFields]).toHaveLength(0);
    expect([...types.contentstack]).toEqual(
      expect.arrayContaining(["ITaxonomy"])
    );
  });

  test("definition", () => {
    expect(result.definition).toMatchInlineSnapshot(`
      "export interface ITaxonomy
      {
      _version?: number;
      title: string;
      boolean: boolean;
      taxonomies?: ITaxonomy[];
      }"
    `);
  });
});
