const testData = require("./references.ct");

import NullDocumentationGenerator from "../../../src/generateTS/docgen/nulldoc";
import tsgenFactory from "../../../src/generateTS/factory";

const tsgen = tsgenFactory({
  docgen: new NullDocumentationGenerator(),
  naming: {
    prefix: "I",
  },
});

describe("references", () => {
  const result = tsgen(testData.references);

  test("metadata", () => {
    const contentTypes = [...result.metadata.dependencies.contentTypes];

    expect(contentTypes).toEqual(
      expect.arrayContaining(["IReferenceChild", "IBoolean", "IBuiltinExample"])
    );
  });

  test("definition", () => {
    expect(result.definition).toMatchInlineSnapshot(`
      "export interface IReferenceParent
      {
      /** Version */
      _version: number;
      title: string  ;
      url: string  ;
      single_reference: (IReferenceChild)[]  ;
      multiple_reference?: (IReferenceChild | IBoolean | IBuiltinExample)[]  ;
      }"
    `);
  });
});
