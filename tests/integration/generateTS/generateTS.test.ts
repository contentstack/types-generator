import { generateTS } from "../../../src/generateTS/index";
import { contentTypes, globalFields } from "../mock";
import nock from "nock";

type RegionUrlMap = {
  [prop: string]: string;
};

const REGION_URL_MAPPING: RegionUrlMap = {
  US: "https://cdn.contentstack.io",
  EU: "https://eu-cdn.contentstack.com",
  AZURE_NA: "https://azure-na-cdn.contentstack.com",
  AZURE_EU: "https://azure-eu-cdn.contentstack.com",
  GCP_NA: "https://gcp-na-cdn.contentstack.com",
};

describe("generateTS function", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("generates type definitions", async () => {
    const token = "valid-token";
    const apiKey = "your-api-key";
    const environment = "development";
    const region = "US";
    const tokenType = "delivery";
    const branch = "main";

    nock(REGION_URL_MAPPING[region])
      .get(`/v3/content_types/?environment=${environment}`)
      .reply(200, contentTypes);

    nock(REGION_URL_MAPPING[region])
      .get("/v3/global_fields?include_branch=false")
      .reply(200, globalFields);

    const generatedTS = await generateTS({
      token,
      apiKey,
      environment,
      region,
      tokenType,
      branch,
    });

    expect(generatedTS).toEqual(expect.stringContaining("interface")); // Check for Output is not undefined
    expect(generatedTS).toEqual(expect.stringContaining("Dishes")); // Check for whether typeDef of Content type is included
    expect(generatedTS).toEqual(expect.stringContaining("Seo")); // Check for whether typeDef of Global Fields is included
    expect(generatedTS).toMatch(/\/\*\*.*\*\/\n\s*(export)/); // Check for is Documentation Generated
  });

  it("generates type definitions without Documentation", async () => {
    const token = "valid-token";
    const apiKey = "your-api-key";
    const environment = "development";
    const region = "US";
    const tokenType = "delivery";
    const includeDocumentation = false;

    nock(REGION_URL_MAPPING[region])
      .get(`/v3/content_types/?environment=${environment}`)
      .reply(200, contentTypes);

    nock(REGION_URL_MAPPING[region])
      .get("/v3/global_fields?include_branch=false")
      .reply(200, globalFields);

    const generatedTS = await generateTS({
      token,
      apiKey,
      environment,
      region,
      tokenType,
      includeDocumentation,
    });

    expect(generatedTS).toEqual(expect.stringContaining("interface")); // Check for Output is not undefined
    expect(generatedTS).toEqual(expect.stringContaining("Dishes")); // Check for whether typeDef of Content type is included
    expect(generatedTS).toEqual(expect.stringContaining("Seo")); // Check for whether typeDef of Global Fields is included
    expect(generatedTS).not.toMatch(/\/\*\*.*\*\/\n\s*(export)/); // Check for No Documentation is generated
  });

  it("generates type definitions with prefix", async () => {
    const token = "valid-token";
    const apiKey = "your-api-key";
    const environment = "development";
    const region = "US";
    const tokenType = "delivery";
    const prefix = "test";

    nock(REGION_URL_MAPPING[region])
      .get(`/v3/content_types/?environment=${environment}`)
      .reply(200, contentTypes);

    nock(REGION_URL_MAPPING[region])
      .get("/v3/global_fields?include_branch=false")
      .reply(200, globalFields);

    const generatedTS = await generateTS({
      token,
      apiKey,
      environment,
      region,
      tokenType,
      prefix,
    });

    expect(generatedTS).toEqual(expect.stringContaining("interface")); // Check for Output is not undefined
    expect(generatedTS).toMatch(/(?!Dishes)testDishes/); // Check for whether typeDef of Content type is included with test prefix
    expect(generatedTS).toMatch(/(?!Seo)testSeo/); // Check for whether typeDef of Global Fields is included with test prefix
    expect(generatedTS).toMatch(/\/\*\*.*\*\/\n\s*(export)/); // Check for Documentation is generated
  });

  it("generates type definitions with system fields", async () => {
    const token = "valid-token";
    const apiKey = "your-api-key";
    const environment = "development";
    const region = "US";
    const tokenType = "delivery";
    const systemFields = true;

    nock(REGION_URL_MAPPING[region])
      .get(`/v3/content_types/?environment=${environment}`)
      .reply(200, contentTypes);

    nock(REGION_URL_MAPPING[region])
      .get("/v3/global_fields?include_branch=false")
      .reply(200, globalFields);

    const generatedTS = await generateTS({
      token,
      apiKey,
      environment,
      region,
      tokenType,
      systemFields,
    });

    expect(generatedTS).toEqual(expect.stringContaining("interface")); // Check for Output is not undefined
    expect(generatedTS).toMatch(/Dishes/); // Check for whether typeDef of Content type is included
    expect(generatedTS).toMatch(/Seo/); // Check for whether typeDef of Global Fields is included
    expect(generatedTS).toMatch(/export interface SystemFields \{\n/); // Check for whether System Fields are Created
    expect(generatedTS).toMatch(/extends SystemFields \{\n/); // Check for whether interfaces have extended system fields interface
    expect(generatedTS).toMatch(/\/\*\*.*\*\/\n\s*(export)/); // Check for Documentation is generated
  });
});

describe("generateTS function with errors", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Check for if all the required fields are provided", async () => {
    const token = "";
    const apiKey = "your-api-key";
    const environment = "development";
    const region = "US";
    const tokenType = "delivery";
    const branch = "main";

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
    const token = "your-token";
    const apiKey = "your-api-key";
    const environment = "development";
    const region = "demo" as unknown as any;
    const tokenType = "delivery";
    const branch = "main";

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
        "Please provide a valid region, supported regions are :  (US, EU, AZURE_NA, AZURE_EU, GCP_NA)"
      );
    }
  });

  it("Check for empty content-type response", async () => {
    const token = "your-token";
    const apiKey = "your-api-key";
    const environment = "development";
    const region = "US";
    const tokenType = "delivery";
    const branch = "main";

    nock(REGION_URL_MAPPING[region])
      .get(`/v3/content_types/?environment=${environment}`)
      .reply(200, { content_types: [] });

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
    const token = "your-token";
    const apiKey = "your-api-key";
    const environment = "development";
    const region = "GCP_NA";
    const tokenType = "delivery";
    const branch = "main";

    nock(REGION_URL_MAPPING[region])
      .get(`/v3/content_types/?environment=${environment}`)
      .reply(401);

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
        "Unauthorized: The apiKey, token or region is not valid."
      );
    }
  });

  it("Check for invalid delivery token", async () => {
    const token = "your-token";
    const apiKey = "your-api-key";
    const environment = "development";
    const region = "AZURE_EU";
    const tokenType = "delivery";
    const branch = "main";

    nock(REGION_URL_MAPPING[region])
      .get(`/v3/content_types/?environment=${environment}`)
      .reply(412);

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
        "Invalid Credentials: Please check the provided apiKey, token and region."
      );
    }
  });

  it("Check for default error", async () => {
    const token = "your-token";
    const apiKey = "your-api-key";
    const environment = "development";
    const region = "AZURE_NA";
    const tokenType = "delivery";
    const branch = "mai";

    nock(REGION_URL_MAPPING[region])
      .get(`/v3/content_types/?environment=${environment}`)
      .reply(422, {
        error_message:
          "Access denied. You have insufficient permissions to perform operation on this branch 'mai'.",
        error_code: 901,
      });

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
        "Something went wrong, Access denied. You have insufficient permissions to perform operation on this branch 'mai'."
      );
    }
  });

  it("Check for TSGEN factory error", async () => {
    const token = "your-token";
    const apiKey = "your-api-key";
    const environment = "development";
    const region = "EU";
    const tokenType = "delivery";
    const branch = "main";

    nock(REGION_URL_MAPPING[region])
      .get(`/v3/content_types/?environment=${environment}`)
      .reply(200, contentTypes);

    nock(REGION_URL_MAPPING[region])
      .get("/v3/global_fields?include_branch=false")
      .reply(200, { global_fields: [] });

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
        "Something went wrong, Schema not found for global field 'global_field. Did you forget to include it?"
      );
    }
  });

  it("Check for global fields error", async () => {
    const token = "your-token";
    const apiKey = "your-api-key";
    const environment = "development";
    const region = "US";
    const tokenType = "delivery";
    const branch = "main";

    nock(REGION_URL_MAPPING[region])
      .get(`/v3/content_types/?environment=${environment}`)
      .reply(200, contentTypes);

    nock(REGION_URL_MAPPING[region])
      .get("/v3/global_fields?include_branch=false")
      .reply(401);

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
        "Unauthorized: The apiKey, token or region is not valid."
      );
    }
  });
});

afterAll(() => {
  nock.restore();
});

afterEach(() => {
  nock.cleanAll();
});
