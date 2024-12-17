import Contentstack from "@contentstack/delivery-sdk";
import { StackConnectionConfig } from "../types";

export const initializeContentstackSdk = ({
  apiKey,
  token,
  environment,
  region,
  branch,
  host,
}: StackConnectionConfig) => {
  try {
    const Stack = Contentstack.stack({
      apiKey: apiKey,
      deliveryToken: token,
      environment,
      host: host,
      region: region,
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
