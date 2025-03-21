const testData = require("./options.ct");

import NullDocumentationGenerator from "../../../src/generateTS/docgen/nulldoc";
import tsgenFactory from "../../../src/generateTS/factory";

const tsgen = tsgenFactory({
  docgen: new NullDocumentationGenerator(),
});

describe("all options", () => {
  const result = tsgen(testData.options);

  test("definition", () => {
    expect(result.definition).toMatchInlineSnapshot(`
      "export interface Options
      {
      /** Version */
      _version: number;
      title: string;
      url: string;
      single_line_textbox_not_required?: string;
      single_line_textbox_required: string;
      single_line_textbox_multiple?: string[];
      single_line_textbox_multiple_max_limit?: MaxTuple<string, 5>;
      }"
    `);
  });
});
