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
      const globalFieldsQuery = Stack.globalField();
      const contentTypes = await contentTypeQuery.find();
      const globalFields = await globalFieldsQuery.find();

      const { content_types }: any = contentTypes;

      if (!content_types.length) {
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
        });
        return generatedTS;
      }
    }
  } catch (error: any) {
    if (error.type === "validation") {
      throw {
        error_message: error.error_message,
      };
    } else {
      const errorObj = JSON.parse(error.message.replace("Error: ", ""));
      let errorMessage = "Something went wrong";
      if (errorObj.status) {
        switch (errorObj.status) {
          case 401:
            errorMessage =
              "Unauthorized: The apiKey, token or region is not valid.";
            break;
          case 412:
            errorMessage =
              "Invalid Credentials: Please check the provided apiKey, token and region.";
            break;
          default:
            errorMessage = `${errorMessage}, ${errorObj.error_message}`;
        }
      }
      if (errorObj.error_message && !errorObj.status) {
        errorMessage = `${errorMessage}, ${errorObj.error_message}`;
      }
      throw {
        error_message: errorMessage,
      };
    }
  }
};

export const generateTSFromContentTypes = async ({
  contentTypes,
  prefix = "",
  includeDocumentation = true,
  systemFields = false,
}: GenerateTSFromContentTypes) => {
  try {
    const docgen: DocumentationGenerator = includeDocumentation
      ? new JSDocumentationGenerator()
      : new NullDocumentationGenerator();
    const globalFields = new Set();
    const definitions = [];

    const tsgen = tsgenFactory({
      docgen,
      naming: {
        prefix,
      },
      systemFields,
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
    const output = await format(
      [
        defaultInterfaces(prefix, systemFields).join("\n\n"),
        [...globalFields].join("\n\n"),
        definitions.join("\n\n"),
      ].join("\n\n")
    );

    return output;
  } catch (err: any) {
    throw {
      error_message: "Something went wrong, " + err.message,
    };
  }
};
