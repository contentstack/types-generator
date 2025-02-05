const testData = require("./json-rte.ct");

import NullDocumentationGenerator from "../../../src/generateTS/docgen/nulldoc";
import tsgenFactory from "../../../src/generateTS/factory";

const tsgen = tsgenFactory({
  docgen: new NullDocumentationGenerator(),
});

describe("JSON RTE", () => {
  const result = tsgen(testData.jsonRTEContentType);

  test("definition", () => {
    expect(result.definition).toMatchInlineSnapshot(`
    "export interface Home
    {
    /** Version */
    _version: number;
    json_rte?: {
          type: string;
          uid: string;
          _version: number;
          attrs: Record<string, any>;
          children: JSONRTENode[];
        };
    }"
    `);
  });
});
