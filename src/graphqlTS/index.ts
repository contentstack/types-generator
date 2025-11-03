import { schemaToInterfaces, generateNamespace } from "@gql2ts/from-schema";
import { GraphQLBase } from "../types";
import { introspectionQuery } from "./queries";
import axios from "axios";
import { createLogger } from "../logger";
import { ERROR_MESSAGES } from "../constants";

type RegionUrlMap = {
  [prop: string]: string;
};

const GRAPHQL_REGION_URL_MAPPING: RegionUrlMap = {
  US: "https://graphql.contentstack.com/stacks",
  EU: "https://eu-graphql.contentstack.com/stacks",
  AU: "https://au-graphql.contentstack.com/stacks",
  AZURE_NA: "https://azure-na-graphql.contentstack.com/stacks",
  AZURE_EU: "https://azure-eu-graphql.contentstack.com/stacks",
  GCP_NA: "https://gcp-na-graphql.contentstack.com/stacks",
  GCP_EU: "https://gcp-eu-graphql.contentstack.com/stacks",
};

export async function graphqlTS({
  apiKey,
  token,
  region,
  environment,
  branch,
  namespace,
  host,
  logger: loggerInstance,
}: GraphQLBase) {
  const logger = createLogger(loggerInstance);
  try {
    if (!token || !apiKey || !environment || !region) {
      logger.error(ERROR_MESSAGES.MISSING_REQUIRED_PARAMS);
      logger.warn(ERROR_MESSAGES.REQUIRED_PARAMS_LIST);
      throw {
        type: "validation",
        error_message:
          "Please provide all the required params (token, apiKey, environment, region)",
      };
    }
    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: host
        ? `https://${host}/stacks/${apiKey}`
        : `${GRAPHQL_REGION_URL_MAPPING[region]}/${apiKey}`,
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

    if (!GRAPHQL_REGION_URL_MAPPING[region] && !host) {
      logger.error(ERROR_MESSAGES.UNSUPPORTED_REGION(region));
      logger.warn(ERROR_MESSAGES.SUPPORTED_REGIONS);
      logger.warn(ERROR_MESSAGES.CUSTOM_HOST_OPTION);
      throw {
        type: "validation",
        error_message: ERROR_MESSAGES.GRAPHQL_API_UNAVAILABLE(region),
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

    if (error.response?.status === 412) {
      throw {
        error_message: ERROR_MESSAGES.INVALID_CREDENTIALS_GRAPHQL,
      };
    } else {
      let details = "";
      // Add proper null checks before accessing array elements
      if (
        error.response?.data?.errors &&
        Array.isArray(error.response.data.errors) &&
        error.response.data.errors.length > 0 &&
        error.response.data.errors[0]?.extensions?.errors &&
        Array.isArray(error.response.data.errors[0].extensions.errors) &&
        error.response.data.errors[0].extensions.errors.length > 0 &&
        error.response.data.errors[0].extensions.errors[0]?.code ===
          "SCHEMA_BUILD_ERROR"
      ) {
        details =
          error.response.data.errors[0].extensions.errors[0].details
            ?.map((element: { error: string }) => element.error)
            .join("\n") || "";
      }

      // Safely access the error message with proper null checks
      const errorMessage =
        error.response?.data?.errors?.[0]?.extensions?.errors?.[0]?.message;

      throw {
        error_message:
          details || errorMessage || ERROR_MESSAGES.GRAPHQL_SCHEMA_ERROR,
      };
    }
  }
}
