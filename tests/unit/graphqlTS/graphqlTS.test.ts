import { graphqlTS } from "../../../src/graphqlTS/index";
import nock from "nock";
import { graphql, invalid_graphql } from "../mock";

type RegionUrlMap = {
  [prop: string]: string;
};

const GRAPHQL_REGION_URL_MAPPING: RegionUrlMap = {
  US: "https://graphql.contentstack.com/stacks",
  EU: "https://eu-graphql.contentstack.com/stacks",
  AZURE_NA: "https://azure-na-graphql.contentstack.com/stacks",
  AZURE_EU: "https://azure-eu-graphql.contentstack.com/stacks",
  GCP_NA: "https://gcp-na-graphql.contentstack.com/stacks",
  "wrong-region": "https://demo.com",
};

describe("graphqlTS function", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("generates graphQL typeDef without namespace", async () => {
    const token = "my-token";
    const apiKey = "my-api-key";
    const environment = "development";
    const region = "US";
    const branch = "main";

    nock(GRAPHQL_REGION_URL_MAPPING[region])
      .post(`/${apiKey}?environment=${environment}`)
      .reply(200, graphql);

    const generatedGraphql = await graphqlTS({
      token,
      apiKey,
      environment,
      region,
      branch,
    });

    expect(generatedGraphql).toMatch(/interface IAllDishes {/);
  });

  it("generates graphQL typeDef with namespace", async () => {
    const token = "my-token";
    const apiKey = "my-api-key";
    const environment = "development";
    const region = "US";
    const branch = "main";
    const namespace = "demo";

    nock(GRAPHQL_REGION_URL_MAPPING[region])
      .post(`/${apiKey}?environment=${environment}`)
      .reply(200, graphql);

    const generatedGraphql = await graphqlTS({
      token,
      apiKey,
      environment,
      region,
      branch,
      namespace,
    });

    expect(generatedGraphql).toMatch(/declare namespace demo {/);
  });
});

describe("graphqlTS function with errors", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("check for whether all the required params are provided", async () => {
    const token = "";
    const apiKey = "my-api-key";
    const environment = "development";
    const region = "US";
    const branch = "main";

    try {
      await graphqlTS({
        token,
        apiKey,
        environment,
        region,
        branch,
      });
    } catch (err: any) {
      expect(err.error_message).toEqual(
        "Please provide all the required params (token, apiKey, environment, region)"
      );
    }
  });

  it("check for if wrong apiKey, token and environment is provided", async () => {
    const token = "my-token";
    const apiKey = "my-api-key";
    const environment = "development";
    const region = "US";
    const branch = "main";

    nock(GRAPHQL_REGION_URL_MAPPING[region])
      .post(`/${apiKey}?environment=${environment}`)
      .reply(412);

    try {
      await graphqlTS({
        token,
        apiKey,
        environment,
        region,
        branch,
      });
    } catch (err: any) {
      expect(err.error_message).toEqual(
        "Unauthorized: The apiKey, token or environment is not valid."
      );
    }
  });

  it("check for if wrong region is provided", async () => {
    const token = "my-token";
    const apiKey = "my-api-key";
    const environment = "development";
    const region = "wrong-region" as unknown as any;
    const branch = "main";

    try {
      await graphqlTS({
        token,
        apiKey,
        environment,
        region,
        branch,
      });
    } catch (err: any) {
      expect(err.error_message).toEqual(
        "GraphQL content delivery api unavailable for 'wrong-region' region"
      );
    }
  });

  it("check for errors from gql2ts", async () => {
    const token = "my-token";
    const apiKey = "my-api-key";
    const environment = "development";
    const region = "US";
    const branch = "main";

    nock(GRAPHQL_REGION_URL_MAPPING[region])
      .post(`/${apiKey}?environment=${environment}`)
      .reply(200, invalid_graphql);

    try {
      await graphqlTS({
        token,
        apiKey,
        environment,
        region,
        branch,
      });
    } catch (err: any) {
      expect(err.error_message).toEqual(
        "Invalid or incomplete schema, unknown type: Query. Ensure that a full introspection query is used in order to build a client schema."
      );
    }
  });

  it("check for graphql api errors", async () => {
    const token = "my-token";
    const apiKey = "my-api-key";
    const environment = "development";
    const region = "US";
    const branch = "mai";

    nock(GRAPHQL_REGION_URL_MAPPING[region])
      .post(`/${apiKey}?environment=${environment}`)
      .reply(422, {
        errors: [
          {
            message: "Failed to run query.",
            extensions: {
              errors: [
                {
                  code: "INVALID_BRANCH",
                  message: "The queried branch 'mai' is invalid.",
                  details: {
                    hint: "The queried branch does not exist in our records. Contact your stack admin for branch name and details.",
                  },
                },
              ],
            },
          },
        ],
      });

    try {
      await graphqlTS({
        token,
        apiKey,
        environment,
        region,
        branch,
      });
    } catch (err: any) {
      expect(err.error_message).toEqual("The queried branch 'mai' is invalid.");
    }
  });
});

afterAll(() => {
  nock.restore();
});

afterEach(() => {
  nock.cleanAll();
});
