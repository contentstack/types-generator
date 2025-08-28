const testData = require("./references.ct");

import NullDocumentationGenerator from "../../../src/generateTS/docgen/nulldoc";
import tsgenFactory from "../../../src/generateTS/factory";

const tsgen = tsgenFactory({
  docgen: new NullDocumentationGenerator(),
  naming: {
    prefix: "I",
  },
});

const tsgenWithReferencedEntry = tsgenFactory({
  docgen: new NullDocumentationGenerator(),
  naming: {
    prefix: "I",
  },
  includeReferencedEntry: true,
});

describe("references", () => {
  describe("with ReferencedEntry disabled (default)", () => {
    const result = tsgen(testData.references);

    test("metadata", () => {
      const contentTypes = [...result.metadata.dependencies.contentTypes];

      expect(contentTypes).toEqual(
        expect.arrayContaining([
          "IReferenceChild",
          "IBoolean",
          "IBuiltinExample",
        ])
      );
    });

    test("definition", () => {
      expect(result.definition).toMatchInlineSnapshot(`
        "export interface IReferenceParent
        {
        _version?: number;
        title: string;
        url: string;
        single_reference: IReferenceChild[];
        multiple_reference?: IReferenceChild | IBoolean | IBuiltinExample[];
        }"
      `);
    });
  });

  describe("with ReferencedEntry enabled", () => {
    const result = tsgenWithReferencedEntry(testData.references);

    test("metadata", () => {
      const contentTypes = [...result.metadata.dependencies.contentTypes];

      expect(contentTypes).toEqual(
        expect.arrayContaining([
          "IReferenceChild",
          "IBoolean",
          "IBuiltinExample",
        ])
      );
    });

    test("definition", () => {
      expect(result.definition).toMatchInlineSnapshot(`
        "export interface IReferenceParent
        {
        _version?: number;
        title: string;
        url: string;
        single_reference: (IReferenceChild | IReferencedEntry)[];
        multiple_reference?: (IReferenceChild | IBoolean | IBuiltinExample | IReferencedEntry)[];
        }"
      `);
    });
  });
});
