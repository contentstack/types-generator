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
