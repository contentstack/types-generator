const testData = require("./global.fields.ct");

import NullDocumentationGenerator from "../../../src/generateTS/docgen/nulldoc";
import tsgenFactory from "../../../src/generateTS/factory";

const tsgen = tsgenFactory({
  docgen: new NullDocumentationGenerator(),
  naming: {
    prefix: "I",
  },
});

describe("global fields", () => {
  let result: any;
  const globalFields: Array<any> = [];
  const definitions: Array<any> = [];

  for (const contentType of testData.globalFields) {
    const tsgenResult = tsgen(contentType);

    if (tsgenResult.isGlobalField) {
      globalFields.push(tsgenResult.definition);
    } else {
      definitions.push(tsgenResult.definition);

      tsgenResult.metadata.types.globalFields.forEach((field: string) => {
        globalFields.push(
          tsgenResult.metadata.dependencies.globalFields[field].definition
        );
      });
    }
  }

  test("metadata", () => {
    expect(globalFields[0]).toEqual(expect.stringContaining("INewGlobal"));
  });

  test("global field definition", () => {
    expect(globalFields[0]).toMatchInlineSnapshot(`
      "export interface INewGlobal
      {
      /** Version */
      _version: number;
      single_line_textbox?: string;
      }"
    `);
  });

  test("content type definition", () => {
    expect(definitions[0]).toMatchInlineSnapshot(`
      "export interface IHome
      {
      /** Version */
      _version: number;
      title: string;
      taxonomies?: ITaxonomy[];
      }"
    `);
  });
});
