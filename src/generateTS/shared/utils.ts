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
 * Creates a validation error in the exact format expected by tests
 * This maintains backward compatibility while reducing code duplication
 * @param errorMessage - The error message to display
 * @returns A validation error object with the expected structure
 */
export function createValidationError(errorMessage: string) {
  return {
    type: "validation",
    error_message: errorMessage,
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
      details: err.details || {},
    };
  } else {
    // Handle other types of errors
    const errorMessage = err.message || "Unknown error occurred";
    return {
      error_message: `Type generation failed: ${errorMessage}`, // Keep for backwards compatibility
      error_code: "TYPE_GENERATION_FAILED", // New property
      details: {},
    };
  }
}

/**
 * Helper function to format error details consistently
 * @param error - The error object containing uid and other details
 * @param index - The index number for the error
 * @param skipHeader - Whether to skip the header (for global fields)
 * @returns Formatted error details string
 */
export function formatErrorDetails(
  error: any,
  index: number,
  skipHeader: boolean = false
): string {
  if (skipHeader) {
    // For global fields, skip the header since it's already added above
    return `TypeScript constraint: Object keys cannot start with a number.\nSuggestion: Since UIDs cannot be changed, use the --prefix flag to add a valid prefix to all interface names (e.g., --prefix "ContentType").\n\n`;
  }

  // For content types, include the full header
  return `${index}. UID: "${error.uid}"\nTypeScript constraint: Object keys cannot start with a number.\nSuggestion: Since UIDs cannot be changed, use the --prefix flag to add a valid prefix to all interface names (e.g., --prefix "ContentType").\n\n`;
}

/**
 * Build the main error header for numeric identifier errors
 * @param totalErrors - Total number of errors found
 * @returns Error header string
 */
export function buildErrorHeader(totalErrors: number): string {
  return `Type generation failed: ${totalErrors} items use numeric identifiers, which result in invalid TypeScript interface names. Use the --prefix flag to resolve this issue.\n\n`;
}

/**
 * Build content type errors section
 * @param contentTypeErrors - Array of content type errors
 * @returns Formatted content type errors section string
 */
export function buildContentTypeErrorsSection(
  contentTypeErrors: any[]
): string {
  if (contentTypeErrors.length === 0) return "";

  let section = "Content Types and Global Fields with Numeric UIDs\n";
  section +=
    "Note: Global Fields are also Content Types. If their UID begins with a number, they are listed here.\n\n";

  contentTypeErrors.forEach((error, index) => {
    section += formatErrorDetails(error, index + 1);
  });

  return section;
}

/**
 * Build global field errors section
 * @param globalFieldErrors - Array of global field errors
 * @returns Formatted global field errors section string
 */
export function buildGlobalFieldErrorsSection(
  globalFieldErrors: any[]
): string {
  if (globalFieldErrors.length === 0) return "";

  let section = "Global Fields Referencing Invalid Content Types:\n\n";

  globalFieldErrors.forEach((error, index) => {
    section += `${index + 1}. Global Field: "${error.uid}"\n`;
    section += `   References: "${error.referenceTo || "Unknown"}"\n`;
    section += formatErrorDetails(error, index + 1, true);
  });

  return section;
}

/**
 * Build resolution instructions section
 * @returns Resolution instructions string
 */
export function buildResolutionInstructionsSection(): string {
  return (
    "To resolve these issues:\n" +
    "• Use the --prefix flag to add a valid prefix to all interface names.\n" +
    '• Example: --prefix "ContentType"\n'
  );
}

/**
 * Parent method that orchestrates the error building process
 * @param errors - Array of numeric identifier errors
 * @returns Complete error message string
 */
export function buildNumericIdentifierErrorDetails(errors: any[]): string {
  // Group errors by type for better organization
  const contentTypeErrors = errors.filter((err) => err.type === "content_type");
  const globalFieldErrors = errors.filter((err) => err.type === "global_field");

  // Build the complete error message by calling each section builder
  let errorDetails = buildErrorHeader(errors.length);
  errorDetails += buildContentTypeErrorsSection(contentTypeErrors);
  errorDetails += buildGlobalFieldErrorsSection(globalFieldErrors);
  errorDetails += buildResolutionInstructionsSection();

  return errorDetails;
}

/**
 * Create and throw validation error for numeric identifiers
 * @param errors - Array of numeric identifier errors
 * @throws A validation error object
 */
export function throwNumericIdentifierValidationError(errors: any[]): never {
  const errorDetails = buildNumericIdentifierErrorDetails(errors);

  throw {
    type: "validation",
    error_code: "VALIDATION_ERROR",
    error_message: errorDetails,
  };
}
