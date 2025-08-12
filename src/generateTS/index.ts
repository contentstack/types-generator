import async from "async";
import { flatMap, flatten } from "lodash";
import { TOKEN_TYPE } from "../constants";
import { initializeContentstackSdk } from "../sdk/utils";
import { GenerateTS, GenerateTSFromContentTypes } from "../types";
import { DocumentationGenerator } from "./docgen/doc";
import JSDocumentationGenerator from "./docgen/jsdoc";
import NullDocumentationGenerator from "./docgen/nulldoc";
import tsgenFactory from "./factory";
import { defaultInterfaces } from "./stack/builtins";
import { format } from "../format/index";
import { ContentType } from "../types/schema";
import { cliux } from "@contentstack/cli-utilities";

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
  host,
}: GenerateTS) => {
  try {
    if (!token || !tokenType || !apiKey || !environment || !region) {
      throw {
        type: "validation",
        error_message:
          "Please provide all the required params (token, tokenType, apiKey, environment, region)",
      };
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
        cliux.print("No Content Types found in the Stack", {
          color: "red",
          bold: true,
        });
        cliux.print(
          "Please create Content Models to generate type definitions",
          { color: "yellow" }
        );
        throw {
          type: "validation",
          error_message:
            "There are no Content Types in the Stack, please create Content Models to generate type definitions",
        };
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
      const errorObj = JSON.parse(error.message.replace("Error: ", ""));
      let errorMessage = "Something went wrong";
      let errorCode = "API_ERROR";

      if (errorObj.status) {
        switch (errorObj.status) {
          case 401:
            errorMessage =
              "Unauthorized: The apiKey, token or region is not valid.";
            errorCode = "AUTHENTICATION_FAILED";
            break;
          case 412:
            errorMessage =
              "Invalid Credentials: Please check the provided apiKey, token and region.";
            errorCode = "INVALID_CREDENTIALS";
            break;
          default:
            errorMessage = `${errorMessage}, ${errorObj.error_message}`;
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
}: GenerateTSFromContentTypes) => {
  try {
    const docgen: DocumentationGenerator = includeDocumentation
      ? new JSDocumentationGenerator()
      : new NullDocumentationGenerator();
    const globalFields = new Set();
    const definitions = [];

    const tsgen = tsgenFactory({
      docgen,
      naming: { prefix },
      systemFields,
      isEditableTags,
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
          prefix,
          systemFields,
          isEditableTags,
          hasJsonField
        ).join("\n\n"),
        [...globalFields].join("\n\n"),
        definitions.join("\n\n"),
      ].join("\n\n")
    );

    return output;
  } catch (err: any) {
    // Enhanced error logging with more context
    let errorDetails;

    if (err.type === "validation") {
      // Handle validation errors with proper error codes
      errorDetails = {
        error_message: err.error_message || "Validation error occurred", // Keep for backwards compatibility
        error_code: err.error_code || "VALIDATION_ERROR", // New property
        context: "generateTSFromContentTypes",
        timestamp: new Date().toISOString(),
        error_type: "ValidationError",
        details: err.details || {},
      };
    } else {
      // Handle other types of errors
      const errorMessage = err.message || "Unknown error occurred";
      errorDetails = {
        error_message: `Type generation failed: ${errorMessage}`, // Keep for backwards compatibility
        error_code: "TYPE_GENERATION_FAILED", // New property
        context: "generateTSFromContentTypes",
        timestamp: new Date().toISOString(),
        error_type: err.constructor.name,
        details: {},
      };
    }

    // Don't log the error here - let the CLI handle the display
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
