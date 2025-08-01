const testData = require("./jsdoc.ct");

import JSDocumentationGenerator from "../../../src/generateTS/docgen/jsdoc";
import tsgenFactory from "../../../src/generateTS/factory";

const tsgen = tsgenFactory({
  docgen: new JSDocumentationGenerator(),
});

describe("jsdoc", () => {
  const result = tsgen(testData.jsdoc);

  test("definition", () => {
    expect(result.definition).toMatchInlineSnapshot(`
      "/** Content Type Description */
      export interface Jsdoc
      {
      /** Version */
      _version?: number;
      /** Name */
      title: string;
      /** Age */
      current_age?: number | null;
      /** City */
      current_city?: string;
      /** State */
      current_state?: string;
      }"
    `);
  });
});
