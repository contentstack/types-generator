import { generateTSFromContentTypes } from "../../../src/generateTS/index";
import { ContentType } from "../../../src/types/schema";
import { contentTypes, globalFields } from "../mock";

describe("generateTSFromContentTypes function", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("generates type definitions with prefix, documentation and systemFields", async () => {
    const prefix = "test";
    const includeDocumentation = true;
    const systemFields = true;
    const { content_types } = contentTypes;

    let schemas: ContentType[] = [];
    schemas = schemas.concat(
      (globalFields as any).global_fields as ContentType
    );
    schemas = schemas.map((schema) => ({
      ...schema,
      schema_type: "global_field",
    }));

    schemas = schemas.concat(content_types);

    const generatedTSfromCT = await generateTSFromContentTypes({
      contentTypes: schemas,
      prefix,
      includeDocumentation,
      systemFields,
    });

    expect(generatedTSfromCT).toEqual(expect.stringContaining("interface")); // Check for Output is not undefined
    expect(generatedTSfromCT).toMatch(/(?!Dishes)testDishes/); // Check for whether typeDef of Content type is included with test prefix
    expect(generatedTSfromCT).toMatch(/(?!Seo)testSeo/); // Check for whether typeDef of Global Fields is included with test prefix
    expect(generatedTSfromCT).toMatch(/export interface testSystemFields \{\n/); // Check for whether System Fields are Created with test prefix
    expect(generatedTSfromCT).toMatch(/extends testSystemFields \{\n/); // Check for whether interfaces have extended testSystemFields interface
    expect(generatedTSfromCT).toMatch(/\/\*\*.*\*\/\n\s*(export)/); // Check for is Documentation Generated
  });
});
