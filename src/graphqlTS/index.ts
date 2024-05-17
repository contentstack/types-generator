import { schemaToInterfaces, generateNamespace } from "@gql2ts/from-schema";
import { GraphQLBase } from "../types";
import { introspectionQuery } from "./queries";
import axios from "axios";

type RegionUrlMap = {
  [prop: string]: string;
};

const GRAPHQL_REGION_URL_MAPPING: RegionUrlMap = {
  US: "https://graphql.contentstack.com/stacks",
  EU: "https://eu-graphql.contentstack.com/stacks",
  AZURE_NA: "https://azure-na-graphql.contentstack.com/stacks",
  AZURE_EU: "https://azure-eu-graphql.contentstack.com/stacks",
  GCP_NA: "https://gcp-na-graphql.contentstack.com/stacks",
};

export async function graphqlTS({
  apiKey,
  token,
  region,
  environment,
  branch,
  namespace,
}: GraphQLBase) {
  try {
    if (!token || !apiKey || !environment || !region) {
      throw {
        type: "validation",
        error_message:
          "Please provide all the required params (token, apiKey, environment, region)",
      };
    }
    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `${GRAPHQL_REGION_URL_MAPPING[region]}/${apiKey}`,
      headers: {
        access_token: token,
        branch: "",
      },
      data: {
        query: introspectionQuery,
      },
      params: {
        environment: environment,
      },
    };
    if (branch) {
      config.headers.branch = branch;
    }

    if (!GRAPHQL_REGION_URL_MAPPING[region]) {
      throw {
        type: "validation",
        error_message: `GraphQL content delivery api unavailable for '${region}' region`,
      };
    }

    const result = await axios.request(config);

    let schema: string;
    if (namespace) {
      schema = generateNamespace(namespace, result?.data);
    } else {
      schema = schemaToInterfaces(result?.data);
    }
    return schema;
  } catch (error: any) {
    if (error.type === "validation") {
      throw { error_message: error.error_message };
    }

    if (error.message && !error.response) {
      throw { error_message: error.message };
    }
    if (error.response.status === 401) {
      throw {
        error_message:
          "Unauthorized: The apiKey, token or environment is not valid.",
      };
    } else {
      throw {
        error_message:
          error.response.data.errors[0]?.extensions?.errors[0].message,
      };
    }
  }
}
