import { generateTS } from "../../../src/generateTS/index";
import {
  AxiosInstance,
  HttpClientParams,
  httpClient,
} from "@contentstack/core";
import { contentTypes, globalFields } from "../mock";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

describe("generateTS function", () => {
  let client: AxiosInstance;
  let mockClient: MockAdapter;
  let clientConfig: HttpClientParams;

  beforeEach(() => {
    jest.clearAllMocks();
    clientConfig = {
      apiKey: "API_KEY",
      accessToken: "DELIVERY_TOKEN",
    };
    client = httpClient(clientConfig);
    mockClient = new MockAdapter(axios);
  });

  it("generates type definitions", async () => {
    const token = "DELIVERY_TOKEN";
    const apiKey = "API_KEY";
    const environment = "development";
    const region = "US";
    const tokenType = "delivery";
    const branch = "main";

    mockClient.onGet(`/content_types`).reply(200, contentTypes);

    mockClient.onGet(`/global_fields`).reply(200, globalFields);

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

    mockClient.onGet(`/content_types`).reply(200, contentTypes);

    mockClient.onGet(`/global_fields`).reply(200, globalFields);

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

    mockClient.onGet(`/content_types`).reply(200, contentTypes);

    mockClient.onGet(`/global_fields`).reply(200, globalFields);

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

    mockClient.onGet(`/content_types`).reply(200, contentTypes);

    mockClient.onGet(`/global_fields`).reply(200, globalFields);

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
  let client: AxiosInstance;
  let mockClient: MockAdapter;
  let clientConfig: HttpClientParams;

  beforeEach(() => {
    jest.clearAllMocks();
    clientConfig = {
      apiKey: "API_KEY",
      accessToken: "DELIVERY_TOKEN",
    };
    client = httpClient(clientConfig);
    mockClient = new MockAdapter(axios);
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
      expect(err.error_message).toEqual("Something went wrong");
    }
  });

  it("Check for empty content-type response", async () => {
    const token = "your-token";
    const apiKey = "your-api-key";
    const environment = "development";
    const region = "US";
    const tokenType = "delivery";
    const branch = "main";

    mockClient.onGet(`/content_types`).reply(200, { content_types: [] });
    mockClient.onGet(`/global_fields`).reply(200, globalFields);

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

    mockClient.onGet(`/content_types`).reply(401);

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

    mockClient.onGet(`/content_types`).reply(401);

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

  it("Check for default error", async () => {
    const token = "your-token";
    const apiKey = "your-api-key";
    const environment = "development";
    const region = "AZURE_NA";
    const tokenType = "delivery";
    const branch = "mai";

    mockClient.onGet(`/content_types`).reply(422, {
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

    mockClient.onGet(`/content_types`).reply(200, contentTypes);

    mockClient.onGet(`/global_fields`).reply(200, { global_fields: [] });

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

    mockClient.onGet(`/content_types`).reply(200, contentTypes);

    mockClient.onGet(`/global_fields`).reply(401);

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
