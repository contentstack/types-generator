import axios from "axios";
import { StackConnectionConfig } from "../../types";

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

export async function getGlobalFields({
  apiKey,
  token,
  region,
  environment,
  branch,
}: StackConnectionConfig) {
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    port: 443,
    url: `${REGION_URL_MAPPING[region]}/v3/global_fields?include_branch=false`,
    headers: {
      api_key: apiKey,
      access_token: token,
      environment: environment,
      branch: "",
    },
  };

  if (branch) {
    config.headers.branch = branch;
  }
  try {
    const response = await axios.request(config);
    return response.data;
  } catch (err: any) {
    throw {
      status: err.response.status,
      error_message: err.response.data.error_message,
    };
  }
}
