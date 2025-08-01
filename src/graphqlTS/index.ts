import { schemaToInterfaces, generateNamespace } from "@gql2ts/from-schema";
import { GraphQLBase } from "../types";
import { introspectionQuery } from "./queries";
import axios from "axios";
import { cliux } from "@contentstack/cli-utilities";

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
}: GraphQLBase) {
  try {
    if (!token || !apiKey || !environment || !region) {
      cliux.print("Missing required parameters", {
        color: "red",
        bold: true,
      });
      cliux.print("Required: token, apiKey, environment, region", {
        color: "yellow",
      });
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
      cliux.print(`Unsupported region: ${region}`, {
        color: "red",
        bold: true,
      });
      cliux.print(
        "🌍 Supported regions: US, EU, AU, AZURE_NA, AZURE_EU, GCP_NA, GCP_EU",
        { color: "yellow" }
      );
      cliux.print("Or provide a custom host", { color: "yellow" });
      throw {
        type: "validation",
        error_message: `GraphQL content delivery api unavailable for '${region}' region and no custom host provided`,
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
    if (error.response.status === 412) {
      throw {
        error_message:
          "Unauthorized: The apiKey, token or environment is not valid.",
      };
    } else {
      let details = "";
      if (
        error.response.data.errors[0]?.extensions?.errors?.[0]?.code ===
        "SCHEMA_BUILD_ERROR"
      ) {
        details = error.response.data.errors[0].extensions.errors[0].details
          .map((element: { error: string }) => element.error)
          .join("\n");
      }
      throw {
        error_message: details
          ? details
          : error.response.data.errors[0]?.extensions?.errors[0].message,
      };
    }
  }
}
