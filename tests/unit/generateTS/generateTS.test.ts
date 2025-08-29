import { generateTS } from "../../../src/generateTS/index";
import {
  AxiosInstance,
  HttpClientParams,
  httpClient,
} from "@contentstack/core";
import { contentTypes, globalFields } from "../mock";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

// Mock the Contentstack SDK
jest.mock("../../../src/sdk/utils", () => ({
  initializeContentstackSdk: jest.fn(),
}));

describe("generateTS function", () => {
  let client: AxiosInstance;
  let mockClient: MockAdapter;
  let clientConfig: HttpClientParams;
  let mockStack: any;

  beforeEach(() => {
    jest.clearAllMocks();
    clientConfig = {
      apiKey: "API_KEY",
      accessToken: "DELIVERY_TOKEN",
    };
    client = httpClient(clientConfig);
    mockClient = new MockAdapter(axios);

    // Setup mock stack
    mockStack = {
      contentType: jest.fn().mockReturnValue({
        _queryParams: {},
        find: jest.fn(),
      }),
      globalField: jest.fn().mockReturnValue({
        find: jest.fn(),
      }),
    };

    // Mock the SDK initialization
    const { initializeContentstackSdk } = require("../../../src/sdk/utils");
    initializeContentstackSdk.mockReturnValue(mockStack);
  });

  it("generates type definitions", async () => {
    const token = "DELIVERY_TOKEN";
    const apiKey = "API_KEY";
    const environment = "development";
    const region = "US";
    const tokenType = "delivery";
    const branch = "main";

    // Mock the content type query
    const mockContentTypeQuery = {
      _queryParams: {},
      find: jest.fn().mockResolvedValue(contentTypes),
    };
    mockStack.contentType.mockReturnValue(mockContentTypeQuery);

    // Mock the global field query
    const mockGlobalFieldQuery = {
      find: jest.fn().mockResolvedValue(globalFields),
    };
    mockStack.globalField.mockReturnValue(mockGlobalFieldQuery);

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

    // Mock the content type query
    const mockContentTypeQuery = {
      _queryParams: {},
      find: jest.fn().mockResolvedValue(contentTypes),
    };
    mockStack.contentType.mockReturnValue(mockContentTypeQuery);

    // Mock the global field query
    const mockGlobalFieldQuery = {
      find: jest.fn().mockResolvedValue(globalFields),
    };
    mockStack.globalField.mockReturnValue(mockGlobalFieldQuery);

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

    // Mock the content type query
    const mockContentTypeQuery = {
      _queryParams: {},
      find: jest.fn().mockResolvedValue(contentTypes),
    };
    mockStack.contentType.mockReturnValue(mockContentTypeQuery);

    // Mock the global field query
    const mockGlobalFieldQuery = {
      find: jest.fn().mockResolvedValue(globalFields),
    };
    mockStack.globalField.mockReturnValue(mockGlobalFieldQuery);

    const generatedTS = await generateTS({
      token,
      apiKey,
      environment,
      region,
      tokenType,
      prefix,
    });

    expect(generatedTS).toEqual(expect.stringContaining("interface")); // Check for Output is not undefined
    expect(generatedTS).toEqual(expect.stringContaining("Dishes")); // Check for whether typeDef of Content type is included
    expect(generatedTS).toEqual(expect.stringContaining("Seo")); // Check for whether typeDef of Global Fields is included
    expect(generatedTS).toEqual(expect.stringContaining("testDishes")); // Check for whether prefix is added
  });

  it("generates type definitions with system fields", async () => {
    const token = "valid-token";
    const apiKey = "your-api-key";
    const environment = "development";
    const region = "US";
    const tokenType = "delivery";
    const systemFields = true;

    // Mock the content type query
    const mockContentTypeQuery = {
      _queryParams: {},
      find: jest.fn().mockResolvedValue(contentTypes),
    };
    mockStack.contentType.mockReturnValue(mockContentTypeQuery);

    // Mock the global field query
    const mockGlobalFieldQuery = {
      find: jest.fn().mockResolvedValue(globalFields),
    };
    mockStack.globalField.mockReturnValue(mockGlobalFieldQuery);

    const generatedTS = await generateTS({
      token,
      apiKey,
      environment,
      region,
      tokenType,
      systemFields,
    });

    expect(generatedTS).toEqual(expect.stringContaining("interface")); // Check for Output is not undefined
    expect(generatedTS).toEqual(expect.stringContaining("Dishes")); // Check for whether typeDef of Content type is included
    expect(generatedTS).toEqual(expect.stringContaining("Seo")); // Check for whether typeDef of Global Fields is included
    expect(generatedTS).toEqual(expect.stringContaining("SystemFields")); // Check for whether system fields are included
  });
});

describe("generateTS function with errors", () => {
  let client: AxiosInstance;
  let mockClient: MockAdapter;
  let clientConfig: HttpClientParams;
  let mockStack: any;

  beforeEach(() => {
    jest.clearAllMocks();
    clientConfig = {
      apiKey: "API_KEY",
      accessToken: "DELIVERY_TOKEN",
    };
    client = httpClient(clientConfig);
    mockClient = new MockAdapter(axios);

    // Setup mock stack
    mockStack = {
      contentType: jest.fn().mockReturnValue({
        _queryParams: {},
        find: jest.fn(),
      }),
      globalField: jest.fn().mockReturnValue({
        find: jest.fn(),
      }),
    };

    // Mock the SDK initialization
    const { initializeContentstackSdk } = require("../../../src/sdk/utils");
    initializeContentstackSdk.mockReturnValue(mockStack);
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
    const region = "wrong-region";
    const tokenType = "delivery";
    const branch = "main";

    // Mock SDK initialization to fail for invalid region
    const { initializeContentstackSdk } = require("../../../src/sdk/utils");
    initializeContentstackSdk.mockImplementation(() => {
      throw {
        type: "validation",
        error_message:
          "Something went wrong while initializing Contentstack SDK.",
      };
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
        "Something went wrong while initializing Contentstack SDK."
      );
    }

    // Restore the mock for other tests
    initializeContentstackSdk.mockReturnValue(mockStack);
  });

  it("Check for empty content-type response", async () => {
    const token = "your-token";
    const apiKey = "your-api-key";
    const environment = "development";
    const region = "US";
    const tokenType = "delivery";
    const branch = "main";

    // Mock empty content types
    const mockContentTypeQuery = {
      _queryParams: {},
      find: jest.fn().mockResolvedValue({ content_types: [] }),
    };
    mockStack.contentType.mockReturnValue(mockContentTypeQuery);

    // Mock global fields
    const mockGlobalFieldQuery = {
      find: jest.fn().mockResolvedValue(globalFields),
    };
    mockStack.globalField.mockReturnValue(mockGlobalFieldQuery);

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

    // Mock API error
    const mockContentTypeQuery = {
      _queryParams: {},
      find: jest.fn().mockRejectedValue(new Error('{"status": 401}')),
    };
    mockStack.contentType.mockReturnValue(mockContentTypeQuery);

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

    // Mock API error
    const mockContentTypeQuery = {
      _queryParams: {},
      find: jest.fn().mockRejectedValue(new Error('{"status": 401}')),
    };
    mockStack.contentType.mockReturnValue(mockContentTypeQuery);

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

    // Mock API error with custom message
    const mockContentTypeQuery = {
      _queryParams: {},
      find: jest
        .fn()
        .mockRejectedValue(
          new Error(
            '{"status": 422, "error_message": "Access denied. You have insufficient permissions to perform operation on this branch \'mai\'.", "error_code": 901}'
          )
        ),
    };
    mockStack.contentType.mockReturnValue(mockContentTypeQuery);

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

    // Mock content types
    const mockContentTypeQuery = {
      _queryParams: {},
      find: jest.fn().mockResolvedValue(contentTypes),
    };
    mockStack.contentType.mockReturnValue(mockContentTypeQuery);

    // Mock empty global fields
    const mockGlobalFieldQuery = {
      find: jest.fn().mockResolvedValue({ global_fields: [] }),
    };
    mockStack.globalField.mockReturnValue(mockGlobalFieldQuery);

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
        "Something went wrong, Schema not found for global field 'global_field'. Did you forget to include it?"
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

    // Mock content types
    const mockContentTypeQuery = {
      _queryParams: {},
      find: jest.fn().mockResolvedValue(contentTypes),
    };
    mockStack.contentType.mockReturnValue(mockContentTypeQuery);

    // Mock global fields API error
    const mockGlobalFieldQuery = {
      find: jest.fn().mockRejectedValue(new Error('{"status": 401}')),
    };
    mockStack.globalField.mockReturnValue(mockGlobalFieldQuery);

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
