import Contentstack, { Region } from "@contentstack/delivery-sdk";
import { StackConnectionConfig } from "../types";

export const initializeContentstackSdk = ({
  apiKey,
  token,
  environment,
  region,
  branch,
}: StackConnectionConfig) => {
  try {
    const regionVal: Region | undefined = (function (regionValue: string) {
      switch (regionValue) {
        case "US":
          return Region.US;
        case "EU":
          return Region.EU;
        case "AZURE_NA":
          return Region.AZURE_NA;
        case "AZURE_EU":
          return Region.AZURE_EU;
        case "GCP_NA":
          return Region.GCP_NA;
        default:
          return undefined;
      }
    })(region as string);

    const Stack = Contentstack.stack({
      apiKey: apiKey,
      deliveryToken: token,
      environment,
      region: regionVal,
      branch: branch,
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
