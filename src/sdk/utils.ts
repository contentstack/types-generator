import Contentstack, { Region } from "@contentstack/delivery-sdk";
import { StackConnectionConfig } from "../types";
import { REGIONS } from "../constants";

export const initializeContentstackSdk = ({
  apiKey,
  token,
  environment,
  region,
  branch,
  host,
}: StackConnectionConfig) => {
  try {
    let isCustomRegion = false;
    const regionVal: Region | undefined = (function (regionValue: string) {
      switch (regionValue) {
        case REGIONS.US:
          return Region.US;
        case REGIONS.EU:
          return Region.EU;
        case REGIONS.AZURE_NA:
          return Region.AZURE_NA;
        case REGIONS.AZURE_EU:
          return Region.AZURE_EU;
        case REGIONS.GCP_NA:
          return Region.GCP_NA;
        default:
          isCustomRegion = true;
          break;
      }
    })(region as string);

    let Stack;
    if (isCustomRegion && host) {
      Stack = Contentstack.stack({
        apiKey: apiKey,
        deliveryToken: token,
        environment,
        host: host,
        branch: branch,
      });
    } else if (regionVal) {
      Stack = Contentstack.stack({
        apiKey: apiKey,
        deliveryToken: token,
        environment,
        region: regionVal,
        branch: branch,
      });
    } else {
      throw {
        type: "validation",
        error_message: `The region "${region}" is not supported and no host is provided for a custom region.`,
      };
    }

    return Stack;
  } catch (err: any) {
    throw {
      type: "validation",
      error_message:
        "Something went wrong while initializing Contentstack SDK.",
    };
  }
};
