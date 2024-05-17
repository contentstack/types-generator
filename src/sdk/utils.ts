import Contentstack from "contentstack";
import { StackConnectionConfig } from "../types";

export const initializeContentstackSdk = ({
  apiKey,
  token,
  environment,
  region,
  branch,
}: StackConnectionConfig) => {
  try {
    const regionVal: Contentstack.Region | undefined = (function (
      regionValue: string
    ) {
      switch (regionValue) {
        case "US":
          return Contentstack.Region.US;
        case "EU":
          return Contentstack.Region.EU;
        case "AZURE_NA":
          return Contentstack.Region.AZURE_NA;
        case "AZURE_EU":
          return Contentstack.Region.AZURE_EU;
        case "GCP_NA":
          return Contentstack.Region.GCP_NA;
        default:
          return undefined;
      }
    })(region as string);

    const Stack = Contentstack.Stack({
      api_key: apiKey,
      delivery_token: token,
      environment,
      region: regionVal,
      branch,
    });

    return Stack;
  } catch (err: any) {
    throw {
      type: "validation",
      error_message:
        "Something went wrong while initializing Contentstack SDK.",
    };
  }
};
