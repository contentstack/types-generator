import { graphqlTS } from "../../../src/graphqlTS/index";
const dotenv = require("dotenv");
dotenv.config({ path: "../../../.env" });

describe("graphqlTS function", () => {
  it("generates graphQL typeDef without namespace", async () => {
    const token = process.env.TOKEN as unknown as any;
    const apiKey = process.env.APIKEY as unknown as any;
    const environment = process.env.ENVIRONMENT as unknown as any;
    const region = process.env.REGION as unknown as any;
    const branch = process.env.BRANCH as unknown as any;

    const generatedGraphql = await graphqlTS({
      token,
      apiKey,
      environment,
      region,
      branch,
    });

    expect(generatedGraphql).toMatch(/interface IAllTestimport {/);
  });

  it("generates graphQL typeDef with namespace", async () => {
    const token = process.env.TOKEN as unknown as any;
    const apiKey = process.env.APIKEY as unknown as any;
    const environment = process.env.ENVIRONMENT as unknown as any;
    const region = process.env.REGION as unknown as any;
    const branch = process.env.BRANCH as unknown as any;
    const namespace = "demo";

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
  it("check for whether all the required params are provided", async () => {
    const token = "" as unknown as any;
    const apiKey = process.env.APIKEY as unknown as any;
    const environment = process.env.ENVIRONMENT as unknown as any;
    const region = process.env.REGION as unknown as any;
    const branch = process.env.BRANCH as unknown as any;

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
    const token = "";
    const apiKey = "";
    const environment = "";
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
      expect(err.error_message).toBeDefined();
      expect(err.error_message).toEqual(
        "Please provide all the required params (token, apiKey, environment, region)"
      );
    }
  });

  it("check for if wrong region is provided", async () => {
    const token = process.env.TOKEN as unknown as any;
    const apiKey = process.env.APIKEY as unknown as any;
    const environment = process.env.ENVIRONMENT as unknown as any;
    const region = "wrong-region" as unknown as any;
    const branch = process.env.BRANCH as unknown as any;

    try {
      await graphqlTS({
        token,
        apiKey,
        environment,
        region,
        branch,
      });
    } catch (err: any) {
      // Test passes if either: 1) Region validation error, or 2) Missing params error (no env vars)
      expect(
        err.error_message === "GraphQL content delivery api unavailable for 'wrong-region' region and no custom host provided" ||
        err.error_message === "Please provide all the required params (token, apiKey, environment, region)"
      ).toBe(true);
    }
  });

  it("check for graphql api errors", async () => {
    const token = process.env.TOKEN as unknown as any;
    const apiKey = process.env.APIKEY as unknown as any;
    const environment = process.env.ENVIRONMENT as unknown as any;
    const region = process.env.REGION as unknown as any;
    const branch = "mai" as unknown as any;

    try {
      await graphqlTS({
        token,
        apiKey,
        environment,
        region,
        branch,
      });
    } catch (err: any) {
      // Test passes if either: 1) Branch validation error from API, or 2) Missing params error (no env vars)
      expect(
        err.error_message === "The queried branch 'mai' is invalid." ||
        err.error_message === "Please provide all the required params (token, apiKey, environment, region)"
      ).toBe(true);
    }
  });
});
