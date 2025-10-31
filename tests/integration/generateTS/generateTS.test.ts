import { generateTS } from "../../../src/generateTS/index";
const dotenv = require("dotenv");
dotenv.config({ path: "../../../.env" });

describe("generateTS function", () => {
  it("generates type definitions", async () => {
    const token = process.env.TOKEN as unknown as any;
    const apiKey = process.env.APIKEY as unknown as any;
    const environment = process.env.ENVIRONMENT as unknown as any;
    const region = process.env.REGION as unknown as any;
    const tokenType = process.env.TOKENTYPE as unknown as any;
    const branch = process.env.BRANCH as unknown as any;

    const generatedTS = await generateTS({
      token,
      apiKey,
      environment,
      region,
      tokenType,
      branch,
    });

    expect(generatedTS).toEqual(expect.stringContaining("interface")); // Check for Output is not undefined
    expect(generatedTS).toEqual(expect.stringContaining("Testimport")); // Check for whether typeDef of Content type is included
    expect(generatedTS).toMatch(/\/\*\*\s*\w+\s*\*\//); // Check for field-level Documentation is generated
  });

  it("generates type definitions without Documentation", async () => {
    const token = process.env.TOKEN as unknown as any;
    const apiKey = process.env.APIKEY as unknown as any;
    const environment = process.env.ENVIRONMENT as unknown as any;
    const region = process.env.REGION as unknown as any;
    const tokenType = process.env.TOKENTYPE as unknown as any;
    const includeDocumentation = false;

    const generatedTS = await generateTS({
      token,
      apiKey,
      environment,
      region,
      tokenType,
      includeDocumentation,
    });

    expect(generatedTS).toEqual(expect.stringContaining("interface")); // Check for Output is not undefined
    expect(generatedTS).toEqual(expect.stringContaining("Testimport")); // Check for whether typeDef of Content type is included
    expect(generatedTS).not.toMatch(/\/\*\*.*\*\/\n\s*(export)/); // Check for No Documentation is generated
  });

  it("generates type definitions with prefix", async () => {
    const token = process.env.TOKEN as unknown as any;
    const apiKey = process.env.APIKEY as unknown as any;
    const environment = process.env.ENVIRONMENT as unknown as any;
    const region = process.env.REGION as unknown as any;
    const tokenType = process.env.TOKENTYPE as unknown as any;
    const prefix = "test";

    const generatedTS = await generateTS({
      token,
      apiKey,
      environment,
      region,
      tokenType,
      prefix,
    });

    expect(generatedTS).toEqual(expect.stringContaining("interface")); // Check for Output is not undefined
    expect(generatedTS).toMatch(/(?!Testimport)testTestimport/); // Check for whether typeDef of Content type is included with test prefix
    expect(generatedTS).toMatch(/\/\*\*\s*\w+\s*\*\//); // Check for field-level Documentation is generated
  });

  it("generates type definitions with system fields", async () => {
    const token = process.env.TOKEN as unknown as any;
    const apiKey = process.env.APIKEY as unknown as any;
    const environment = process.env.ENVIRONMENT as unknown as any;
    const region = process.env.REGION as unknown as any;
    const tokenType = process.env.TOKENTYPE as unknown as any;
    const systemFields = true;

    const generatedTS = await generateTS({
      token,
      apiKey,
      environment,
      region,
      tokenType,
      systemFields,
    });

    expect(generatedTS).toEqual(expect.stringContaining("interface")); // Check for Output is not undefined
    expect(generatedTS).toMatch(/Testimport/); // Check for whether typeDef of Content type is included
    expect(generatedTS).toMatch(/export interface SystemFields \{\n/); // Check for whether System Fields are Created
    expect(generatedTS).toMatch(/extends SystemFields \{\n/); // Check for whether interfaces have extended system fields interface
    expect(generatedTS).toMatch(/\/\*\*\s*\w+\s*\*\//); // Check for field-level Documentation is generated
  });

  it("generates type definitions with editable fields", async () => {
    const token = process.env.TOKEN as unknown as any;
    const apiKey = process.env.APIKEY as unknown as any;
    const environment = process.env.ENVIRONMENT as unknown as any;
    const region = process.env.REGION as unknown as any;
    const tokenType = process.env.TOKENTYPE as unknown as any;
    const isEditableTags = true;

    const generatedTS = await generateTS({
      token,
      apiKey,
      environment,
      region,
      tokenType,
      isEditableTags,
    });

    expect(generatedTS).toEqual(expect.stringContaining("interface")); // Check for Output is not undefined
    expect(generatedTS).toMatch(/Testimport/); // Check for whether typeDef of Content type is included
    expect(generatedTS).toMatch(/export interface CSLPAttribute/); // Check for whether CSLP attribute interface is created
    expect(generatedTS).toMatch(/export type CSLPFieldMapping/); // Check for whether CSLP field mapping type is created
    expect(generatedTS).toMatch(/\$\?\:/); // Check for editable field mappings with $ property
    expect(generatedTS).toMatch(/\?\: CSLPFieldMapping/); // Check for individual field CSLP mappings
    expect(generatedTS).toMatch(/\/\*\*\s*\w+\s*\*\//); // Check for field-level Documentation is generated
  });

  it("generates type definitions with ReferencedEntry enabled", async () => {
    const token = process.env.TOKEN as unknown as any;
    const apiKey = process.env.APIKEY as unknown as any;
    const environment = process.env.ENVIRONMENT as unknown as any;
    const region = process.env.REGION as unknown as any;
    const tokenType = process.env.TOKENTYPE as unknown as any;
    const includeReferencedEntry = true;

    const generatedTS = await generateTS({
      token,
      apiKey,
      environment,
      region,
      tokenType,
      includeReferencedEntry,
    });

    expect(generatedTS).toEqual(expect.stringContaining("interface")); // Check for whether typeDef of Content type is included
    expect(generatedTS).toEqual(expect.stringContaining("Testimport")); // Check for whether typeDef of Content type is included
    expect(generatedTS).toMatch(/ReferencedEntry/); // Check that ReferencedEntry interface is included
    expect(generatedTS).toMatch(/\/\*\*\s*\w+\s*\*\//); // Check for field-level Documentation is generated
  });

  it("generates type definitions without ReferencedEntry (default)", async () => {
    const token = process.env.TOKEN as unknown as any;
    const apiKey = process.env.APIKEY as unknown as any;
    const environment = process.env.ENVIRONMENT as unknown as any;
    const region = process.env.REGION as unknown as any;
    const tokenType = process.env.TOKENTYPE as unknown as any;
    // Don't pass includeReferencedEntry, should default to false

    const generatedTS = await generateTS({
      token,
      apiKey,
      environment,
      region,
      tokenType,
    });

    expect(generatedTS).toEqual(expect.stringContaining("interface")); // Check for Output is not undefined
    expect(generatedTS).toEqual(expect.stringContaining("Testimport")); // Check for whether typeDef of Content type is included
    expect(generatedTS).not.toMatch(/ReferencedEntry/); // Check that ReferencedEntry interface is not included
    expect(generatedTS).toMatch(/\/\*\*\s*\w+\s*\*\//); // Check for field-level Documentation is generated
  });
});

describe("generateTS function with errors", () => {
  it("Check for if all the required fields are provided", async () => {
    const token = "";
    const apiKey = process.env.APIKEY as unknown as any;
    const environment = process.env.ENVIRONMENT as unknown as any;
    const region = process.env.REGION as unknown as any;
    const tokenType = process.env.TOKENTYPE as unknown as any;
    const branch = process.env.BRANCH as unknown as any;

    try {
      await generateTS({
        token,
        apiKey,
        environment,
        region,
        tokenType,
        branch,
      });
    } catch (err: any) {
      expect(err.error_message).toEqual(
        "Please provide all the required params (token, tokenType, apiKey, environment, region)"
      );
    }
  });

  it("Check for Invalid region", async () => {
    const token = process.env.TOKEN as unknown as any;
    const apiKey = process.env.APIKEY as unknown as any;
    const environment = process.env.ENVIRONMENT as unknown as any;
    const region = "wrong" as unknown as any;
    const tokenType = process.env.TOKENTYPE as unknown as any;
    const branch = process.env.BRANCH as unknown as any;

    try {
      await generateTS({
        token,
        apiKey,
        environment,
        region,
        tokenType,
        branch,
      });
    } catch (err: any) {
      expect(err.error_message).toEqual(
        "Something went wrong while initializing Contentstack SDK."
      );
    }
  });

  it("Check for empty content-type response", async () => {
    const token = process.env.TOKEN_WITH_NO_CT as unknown as any;
    const apiKey = process.env.APIKEY_WITH_NO_CT as unknown as any;
    const environment = process.env.ENVIRONMENT as unknown as any;
    const region = process.env.REGION as unknown as any;
    const tokenType = process.env.TOKENTYPE as unknown as any;
    const branch = process.env.BRANCH as unknown as any;

    try {
      await generateTS({
        token,
        apiKey,
        environment,
        region,
        tokenType,
        branch,
      });
    } catch (err: any) {
      expect(err.error_message).toEqual(
        "There are no Content Types in the Stack, please create Content Models to generate type definitions"
      );
    }
  });

  it("Check for invalid api_key", async () => {
    const token = process.env.TOKEN as unknown as any;
    const apiKey = "process.env.APIKEY" as unknown as any;
    const environment = process.env.ENVIRONMENT as unknown as any;
    const region = process.env.REGION as unknown as any;
    const tokenType = process.env.TOKENTYPE as unknown as any;
    const branch = process.env.BRANCH as unknown as any;

    await expect(
      generateTS({
        token,
        apiKey,
        environment,
        region,
        tokenType,
        branch,
      })
    ).rejects.toThrow();
  });

  it("Check for invalid delivery token", async () => {
    const token = "token" as unknown as any;
    const apiKey = process.env.APIKEY as unknown as any;
    const environment = process.env.ENVIRONMENT as unknown as any;
    const region = process.env.REGION as unknown as any;
    const tokenType = process.env.TOKENTYPE as unknown as any;
    const branch = process.env.BRANCH as unknown as any;

    await expect(
      generateTS({
        token,
        apiKey,
        environment,
        region,
        tokenType,
        branch,
      })
    ).rejects.toThrow();
  });

  it("Check for default error with invalid branch", async () => {
    const token = process.env.TOKEN as unknown as any;
    const apiKey = process.env.APIKEY as unknown as any;
    const environment = process.env.ENVIRONMENT as unknown as any;
    const region = process.env.REGION as unknown as any;
    const tokenType = process.env.TOKENTYPE as unknown as any;
    const branch = "mai" as unknown as any;

    await expect(
      generateTS({
        token,
        apiKey,
        environment,
        region,
        tokenType,
        branch,
      })
    ).rejects.toThrow();
  });

  it("Check for default error like Bad-Request", async () => {
    const token = "process.env.TOKEN" as unknown as any;
    const apiKey = process.env.APIKEY as unknown as any;
    const environment = process.env.ENVIRONMENT as unknown as any;
    const region = process.env.REGION as unknown as any;
    const tokenType = process.env.TOKENTYPE as unknown as any;
    const branch = process.env.BRANCH as unknown as any;

    await expect(
      generateTS({
        token,
        apiKey,
        environment,
        region,
        tokenType,
        branch,
      })
    ).rejects.toThrow();
  });
});
