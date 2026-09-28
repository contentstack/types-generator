import async from "async";
import { flatMap, flatten } from "lodash";
import { TOKEN_TYPE, ERROR_MESSAGES } from "../constants";
import { initializeContentstackSdk } from "../sdk/utils";
import { GenerateTS, GenerateTSFromContentTypes } from "../types";
import { DocumentationGenerator } from "./docgen/doc";
import JSDocumentationGenerator from "./docgen/jsdoc";
import NullDocumentationGenerator from "./docgen/nulldoc";
import tsgenFactory, { interfaceNameForUid } from "./factory";
import { defaultInterfaces } from "./stack/builtins";
import { format } from "../format/index";
import { ContentType } from "../types/schema";
import { createLogger } from "../logger";
import { createValidationError, createErrorDetails } from "./shared/utils";

export const generateTS = async ({
  token,
  tokenType,
  apiKey,
  environment,
  region,
  branch,
  prefix,
  includeDocumentation,
  systemFields,
  isEditableTags,
  includeReferencedEntry,
  host,
  logger: loggerInstance,
}: GenerateTS) => {
  const logger = createLogger(loggerInstance);
  try {
    if (!token || !tokenType || !apiKey || !environment || !region) {
      throw createValidationError(
        "Please provide all the required params (token, tokenType, apiKey, environment, region)"
      );
    }

    if (tokenType === TOKEN_TYPE.DELIVERY) {
      const Stack = initializeContentstackSdk({
        apiKey,
        token,
        environment,
        region,
        branch,
        host,
      });

      const contentTypeQuery = Stack.contentType();
      contentTypeQuery._queryParams["include_count"] = "true";
      const globalFieldsQuery = Stack.globalField();
      const contentTypes = await getContentTypes(contentTypeQuery);
      const globalFields = await globalFieldsQuery.find();

      const { content_types }: any = contentTypes;

      if (!content_types.length) {
        logger.error(ERROR_MESSAGES.NO_CONTENT_TYPES);
        logger.warn(ERROR_MESSAGES.CREATE_CONTENT_MODELS);
        throw createValidationError(ERROR_MESSAGES.NO_CONTENT_TYPES_DETAILED);
      }

      let schemas: ContentType[] = [];
      if (content_types?.length) {
        if ((globalFields as any)?.global_fields?.length) {
          schemas = schemas.concat(
            (globalFields as any).global_fields as ContentType
          );
          schemas = schemas.map((schema) => ({
            ...schema,
            schema_type: "global_field",
          }));
        }
        schemas = schemas.concat(content_types);

        const generatedTS = generateTSFromContentTypes({
          contentTypes: schemas,
          prefix,
          includeDocumentation,
          systemFields,
          isEditableTags,
          includeReferencedEntry,
        });
        return generatedTS;
      }
    }
  } catch (error: any) {
    if (error.type === "validation") {
      // Handle validation errors with proper error codes
      throw {
        error_message: error.error_message,
        error_code: error.error_code || "VALIDATION_ERROR",
      };
    } else {
      const errorObj = JSON.parse(error?.message?.replace("Error: ", ""));
      let errorMessage: string = ERROR_MESSAGES.API_ERROR_DEFAULT;
      let errorCode = "API_ERROR";

      if (errorObj.status) {
        switch (errorObj.status) {
          case 401:
            errorMessage = ERROR_MESSAGES.UNAUTHORIZED;
            errorCode = "AUTHENTICATION_FAILED";
            break;
          case 412:
            errorMessage = ERROR_MESSAGES.INVALID_CREDENTIALS;
            errorCode = "INVALID_CREDENTIALS";
            break;
          default:
            errorMessage = ERROR_MESSAGES.API_ERROR_WITH_STATUS(errorObj.status, errorObj.error_message);
            errorCode = `API_ERROR_${errorObj.status}`;
        }
      }
      if (errorObj.error_message && !errorObj.status) {
        errorMessage = `${errorMessage}, ${errorObj.error_message}`;
      }
      throw {
        error_message: errorMessage,
        error_code: errorCode,
      };
    }
  }
};

export const generateTSFromContentTypes = async ({
  contentTypes,
  prefix = "",
  includeDocumentation = true,
  systemFields = false,
  isEditableTags = false,
  includeReferencedEntry = false,
  logger: loggerInstance,
}: GenerateTSFromContentTypes) => {
  const logger = createLogger(loggerInstance);
  try {
    const docgen: DocumentationGenerator = includeDocumentation
      ? new JSDocumentationGenerator()
      : new NullDocumentationGenerator();
    const globalFields = new Set();
    const definitions = [];

    // Normalise once, here, so that the builtins, the reserved names and the generated
    // interfaces all agree on the prefix. They used to disagree: `defaultInterfaces` got
    // the raw value while the factory trimmed it, so a prefix of `null` emitted
    // `nullFile` and a prefix of "  CS  " emitted `  CS  File` against a reserved
    // `CSFile`.
    const normalizedPrefix = (prefix ?? "").trim();

    // Every top-level interface name in this batch, claimed before generation starts.
    // Content types are visited one at a time, so without this the factory cannot know
    // about a content type it has not reached yet (DX-10385).
    const reservedNames = contentTypes.map((contentType) =>
      interfaceNameForUid(contentType.uid, normalizedPrefix)
    );

    const tsgen = tsgenFactory({
      docgen,
      naming: { prefix: normalizedPrefix },
      systemFields,
      isEditableTags,
      includeReferencedEntry,
      logger,
      reservedNames,
    });
    for (const contentType of contentTypes) {
      const tsgenResult = tsgen(contentType);
      if (tsgenResult.isGlobalField) {
        globalFields.add(tsgenResult.definition);
      } else {
        definitions.push(tsgenResult.definition);

        tsgenResult.metadata.types.globalFields.forEach((field: string) => {
          globalFields.add(
            tsgenResult.metadata.dependencies.globalFields[field].definition
          );
        });
      }
    }

    const hasJsonField = contentTypes.some((contentType) =>
      checkJsonField(contentType.schema)
    );

    const output = await format(
      [
        defaultInterfaces(
          normalizedPrefix,
          systemFields,
          isEditableTags,
          hasJsonField,
          includeReferencedEntry
        ).join("\n\n"),
        [...globalFields].join("\n\n"),
        definitions.join("\n\n"),
      ].join("\n\n")
    );

    return output;
  } catch (err: any) {
    // Handle numeric identifier errors specially to preserve their detailed format
    if (
      err.type === "validation" &&
      err.error_code === "VALIDATION_ERROR" &&
      err.error_message &&
      err.error_message.includes("numeric identifiers")
    ) {
      // Pass through the detailed error as-is
      throw err;
    }

    // Use common function to create detailed error information for other errors
    const errorDetails = createErrorDetails(err, "generateTSFromContentTypes");
    throw errorDetails;
  }
};

const getContentTypes = async (contentTypeQuery: any) => {
  try {
    const limit = 100;

    const results: any = await contentTypeQuery.find();

    if (results?.count > limit) {
      const additionalQueries = Array.from(
        { length: Math.ceil(results.count / limit) - 1 },
        (_, i) => {
          return async.reflect(async () => {
            contentTypeQuery._queryParams["skip"] = (i + 1) * limit;
            contentTypeQuery._queryParams["limit"] = limit;
            return contentTypeQuery.find();
          });
        }
      );
      const additionalResults: any = await async.parallel(additionalQueries);
      const flattenedResult = additionalResults.flatMap(
        (res: any) => res?.value?.content_types
      );
      results.content_types = flatten([flattenedResult, results.content_types]);
    }

    return results;
  } catch (error) {
    throw error;
  }
};

const checkJsonField = (schema: any[]): boolean => {
  return schema.some((field) => {
    if (field.data_type === "json" && field.field_metadata?.allow_json_rte) {
      return true;
    }

    if (field.data_type === "group" && Array.isArray(field.schema)) {
      return checkJsonField(field.schema);
    }

    if (field.data_type === "blocks" && Array.isArray(field.blocks)) {
      return field.blocks.some((block: { schema: any }) =>
        checkJsonField(block.schema || [])
      );
    }

    return false;
  });
};
