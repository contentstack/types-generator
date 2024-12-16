export interface StackConnectionConfig {
  apiKey: string;
  token: string;
  region: "US" | "EU" | "AZURE_NA" | "AZURE_EU" | "GCP_NA";
  environment: string;
  branch?: string;
  host?: string;
}

export interface GenerateTSBase extends StackConnectionConfig {
  tokenType: "delivery";
  prefix?: string;
  includeDocumentation?: boolean;
  systemFields?: boolean;
}

export type GenerateTS = GenerateTSBase;

export interface GraphQLBase extends StackConnectionConfig {
  namespace?: string;
}

export interface GenerateTSFromContentTypes {
  contentTypes: any[];
  prefix?: string;
  includeDocumentation?: boolean;
  systemFields?: boolean;
}
