const testData = require("./initialization.ct");

import NullDocumentationGenerator from "../../../src/generateTS/docgen/nulldoc";
import tsgenFactory from "../../../src/generateTS/factory";

describe("initialization", () => {
  test("default naming convention", () => {
    const tsgen = tsgenFactory({
      docgen: new NullDocumentationGenerator(),
      naming: {
        prefix: "I",
      },
    });

    const result = tsgen(testData.defaultSingleContentBlock);
    const metadata = result.metadata;

    expect(metadata.name).toBe("IMetadataSingleContentBlock");
  });

  test("custom prefix", () => {
    const tsgen = tsgenFactory({
      docgen: new NullDocumentationGenerator(),
      naming: {
        prefix: "UserPrefix",
      },
    });

    const result = tsgen(testData.defaultSingleContentBlock);
    const metadata = result.metadata;

    expect(metadata.name).toBe("UserPrefixMetadataSingleContentBlock");
  });
});
