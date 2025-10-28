/**
 * Centralized error and info messages for the types-generator
 * This file contains all user-facing messages to ensure consistency and easier maintenance
 */

export const ERROR_MESSAGES = {
  // Validation Errors
  MISSING_REQUIRED_PARAMS: "Missing required parameters",
  REQUIRED_PARAMS_LIST: "Required: token, apiKey, environment, region",
  UNSUPPORTED_REGION: (region: string) => `Unsupported region: ${region}`,
  SUPPORTED_REGIONS: "Supported regions: US, EU, AU, AZURE_NA, AZURE_EU, GCP_NA, GCP_EU",
  CUSTOM_HOST_OPTION: "Or provide a custom host",
  
  // Content Type Errors
  NO_CONTENT_TYPES: "No Content Types found in the Stack",
  CREATE_CONTENT_MODELS: "Please create Content Models to generate type definitions",
  NO_CONTENT_TYPES_DETAILED: "There are no Content Types in the Stack, please create Content Models to generate type definitions",
  
  // Authentication Errors
  UNAUTHORIZED: "Unauthorized: The apiKey, token or region is not valid.",
  INVALID_CREDENTIALS: "Invalid credentials. Please verify your apiKey, token, and region.",
  INVALID_CREDENTIALS_GRAPHQL: "Unauthorized: The apiKey, token or environment is not valid.",
  
  // API Errors
  API_ERROR_DEFAULT: "Something went wrong",
  API_ERROR_WITH_STATUS: (status: number, message?: string) => 
    `API error occurred. Status: ${status}${message ? `. ${message}` : ""}`,
  GRAPHQL_SCHEMA_ERROR: "An error occurred while processing GraphQL schema",
  
  // Field/Block Skip Messages
  SKIPPED_FIELD_UNKNOWN_TYPE: (uid: string, dataType: string, reason: string) =>
    `Skipped field "${uid}" with unknown type "${dataType}": ${reason}`,
  SKIPPED_GLOBAL_FIELD_REFERENCE: (uid: string, referenceTo: string, reason: string) =>
    `Skipped global field reference "${uid}" to "${referenceTo}": ${reason}`,
  SKIPPED_FIELD_AT_PATH: (uid: string, path: string, reason: string) =>
    `Skipped field "${uid}" at path "${path}": ${reason}`,
  SKIPPED_BLOCK_AT_PATH: (uid: string, path: string, reason: string) =>
    `Skipped block "${uid}" at path "${path}": ${reason}`,
  SKIPPED_GLOBAL_FIELD: (uid: string, reason: string) =>
    `Skipped global field "${uid}": ${reason}`,
  SKIPPED_GLOBAL_FIELD_NO_SCHEMA: (uid: string, reason: string) =>
    `Skipped global field "${uid}": ${reason}. Did you forget to include it?`,
  SKIPPED_REFERENCE: (reference: string, reason: string) =>
    `Skipped reference to content type "${reference}": ${reason}`,
  
  // Summary Messages
  SUMMARY_HEADER: "Summary of Skipped Items:",
  TOTAL_SKIPPED_ITEMS: (count: number) => `Total skipped items: ${count}`,
  GENERATION_COMPLETED_PARTIAL: "Generation completed successfully with partial schema.",
  
  // GraphQL Errors
  GRAPHQL_API_UNAVAILABLE: (region: string) =>
    `GraphQL content delivery api unavailable for '${region}' region and no custom host provided`,
} as const;

export const INFO_MESSAGES = {
  // Informational messages can be added here
} as const;

export const WARNING_MESSAGES = {
  // Warning-specific messages can be added here
} as const;

