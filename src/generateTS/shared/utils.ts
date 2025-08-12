/**
 * General utility functions for the types-generator library
 */

/**
 * Checks if a string identifier starts with a number
 * @param identifier - The string to check
 * @returns true if the identifier starts with a number, false otherwise
 */
export function isNumericIdentifier(identifier: string): boolean {
  return /^\d/.test(identifier);
}

/**
 * Creates a skipped item record for tracking
 * @param uid - The UID of the skipped item
 * @param path - The path where the item was found
 * @param reason - The reason for skipping
 * @returns A skipped item record
 */
export function createSkippedItemRecord(
  uid: string,
  path: string,
  reason: string
): { uid: string; path: string; reason: string } {
  return { uid, path, reason };
}

/**
 * The standard reason for excluding items with numeric identifiers
 */
export const NUMERIC_IDENTIFIER_EXCLUSION_REASON =
  "TypeScript constraint: object keys cannot start with numbers";

/**
 * Checks if an item should be excluded due to numeric identifier and creates the appropriate record
 * @param uid - The UID to check
 * @param path - The path where the item was found
 * @returns Object with shouldExclude boolean and record if applicable
 */
export function checkNumericIdentifierExclusion(
  uid: string,
  path: string
): {
  shouldExclude: boolean;
  record?: { uid: string; path: string; reason: string };
} {
  if (isNumericIdentifier(uid)) {
    return {
      shouldExclude: true,
      record: createSkippedItemRecord(
        uid,
        path,
        NUMERIC_IDENTIFIER_EXCLUSION_REASON
      ),
    };
  }
  return { shouldExclude: false };
}

/**
 * Throws a UID validation error with standardized structure
 * @param params - Object containing error parameters
 * @param params.uid - The UID that caused the validation error
 * @param params.errorCode - The error code for the validation error
 * @param params.reason - The reason for the validation error
 * @param params.suggestion - The suggestion to resolve the issue
 * @param params.context - The context where the error occurred
 * @param params.referenceTo - Optional reference UID for global field errors
 * @throws A validation error object
 */
export function throwUIDValidationError({
  uid,
  errorCode,
  reason,
  suggestion,
  context,
  referenceTo,
}: {
  uid: string;
  errorCode: string;
  reason: string;
  suggestion: string;
  context: string;
  referenceTo?: string;
}): never {
  const errorMessage =
    errorCode === "INVALID_GLOBAL_FIELD_REFERENCE"
      ? `Global field "${uid}" references content type "${referenceTo}" which starts with a number, creating invalid TypeScript interface names.`
      : `Content type UID "${uid}" starts with a number, which creates invalid TypeScript interface names.`;

  throw {
    type: "validation",
    error_code: errorCode,
    error_message: errorMessage,
    details: {
      uid,
      ...(referenceTo ? { reference_to: referenceTo } : {}),
      reason,
      suggestion,
    },
    context,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Creates standardized error details for different types of errors
 * @param err - The error object to process
 * @param context - The context where the error occurred
 * @returns Standardized error details object
 */
export function createErrorDetails(
  err: any,
  context: string = "generateTSFromContentTypes"
) {
  if (err.type === "validation") {
    // Handle validation errors with proper error codes
    return {
      error_message: err.error_message || "Validation error occurred", // Keep for backwards compatibility
      error_code: err.error_code || "VALIDATION_ERROR", // New property
      context,
      timestamp: new Date().toISOString(),
      error_type: "ValidationError",
      details: err.details || {},
    };
  } else {
    // Handle other types of errors
    const errorMessage = err.message || "Unknown error occurred";
    return {
      error_message: `Type generation failed: ${errorMessage}`, // Keep for backwards compatibility
      error_code: "TYPE_GENERATION_FAILED", // New property
      context,
      timestamp: new Date().toISOString(),
      error_type: err.constructor.name,
      details: {},
    };
  }
}
