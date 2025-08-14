import { DocumentationGenerator } from "./docgen/doc";
import NullDocumentationGenerator from "./docgen/nulldoc";
import * as ContentstackTypes from "../types/schema";
import * as _ from "lodash";
import { CSLP_HELPERS } from "./shared/cslp-helpers";
import { cliux } from "@contentstack/cli-utilities";
import {
  isNumericIdentifier,
  NUMERIC_IDENTIFIER_EXCLUSION_REASON,
  checkNumericIdentifierExclusion,
} from "./shared/utils";

export type TSGenOptions = {
  docgen: DocumentationGenerator;
  naming?: {
    prefix: string;
  };
  systemFields?: boolean;
  isEditableTags?: boolean;
  includeReferencedEntry?: boolean;
};

export type TSGenResult = {
  definition: string;
  metadata: {
    name: string;
    types: {
      javascript: Set<string>;
      contentstack: Set<string>;
      globalFields: Set<string>;
    };
    dependencies: {
      globalFields: GlobalFieldCache;
      contentTypes: Set<string>;
    };
    skippedFields?: {
      fields: Array<{ uid: string; path: string; reason: string }>;
      blocks: Array<{ uid: string; path: string; reason: string }>;
    };
  };
};

type GlobalFieldCache = {
  [prop: string]: { definition: string };
};

type ModularBlockCache = {
  [prop: string]: string;
};

enum TypeFlags {
  BuiltinJS = 1 << 0,
  BuiltinCS = 1 << 1,
  UserGlobalField = 1 << 2,
  UserBlock = 1 << 3,
  UserGroup = 1 << 4,
  UserReference = 1 << 5,
}

type TypeMapMatch = {
  func: (field: ContentstackTypes.Field) => string;
  track: boolean;
  flag: TypeFlags;
};

type TypeMap = {
  [prop: string]: TypeMapMatch;
};

const defaultOptions: TSGenOptions = {
  docgen: new NullDocumentationGenerator(),
  naming: {
    prefix: "",
  },
  systemFields: false,
  isEditableTags: false,
  includeReferencedEntry: false,
};

export default function (userOptions: TSGenOptions) {
  const options = Object.assign({}, defaultOptions, userOptions);
  const visitedJSTypes = new Set<string>();
  const visitedCSTypes = new Set<string>();
  const visitedGlobalFields = new Set<string>();
  const visitedContentTypes = new Set<string>();
  const cachedGlobalFields: GlobalFieldCache = {};
  const cachedModularBlocks: ModularBlockCache = {};
  const modularBlockInterfaces = new Set<string>();
  const uniqueBlockInterfaces = new Set<string>();
  const blockInterfacesKeyToName: { [key: string]: string } = {};
  let counter = 1;
  const skippedFields: Array<{ uid: string; path: string; reason: string }> =
    [];
  const skippedBlocks: Array<{ uid: string; path: string; reason: string }> =
    [];

  const typeMap: TypeMap = {
    text: { func: type_text, track: true, flag: TypeFlags.BuiltinJS },
    number: { func: type_number, track: true, flag: TypeFlags.BuiltinJS },
    isodate: { func: type_text, track: true, flag: TypeFlags.BuiltinJS },
    boolean: { func: type_boolean, track: true, flag: TypeFlags.BuiltinJS },
    blocks: {
      func: type_modular_blocks,
      track: false,
      flag: TypeFlags.UserBlock,
    },
    global_field: {
      func: type_global_field,
      track: true,
      flag: TypeFlags.UserGlobalField,
    },
    group: { func: type_group, track: false, flag: TypeFlags.UserGroup },
    link: { func: type_link, track: true, flag: TypeFlags.BuiltinCS },
    file: { func: type_file, track: true, flag: TypeFlags.BuiltinCS },
    reference: {
      func: type_reference,
      track: true,
      flag: TypeFlags.UserReference,
    },
    taxonomy: {
      func: type_taxonomy,
      track: true,
      flag: TypeFlags.BuiltinCS,
    },
  };

  function track_dependency(
    field: ContentstackTypes.Field,
    type: string,
    flag: TypeFlags
  ) {
    if (flag === TypeFlags.BuiltinJS) {
      visitedJSTypes.add(type);
    } else if (flag === TypeFlags.UserGlobalField) {
      const _type = name_type(field.reference_to);
      visitedGlobalFields.add(_type);

      if (!cachedGlobalFields[_type]) {
        cachedGlobalFields[_type] = {
          definition: visit_content_type(field),
        };
      }
    } else if (flag === TypeFlags.BuiltinCS) {
      visitedCSTypes.add(type);
    } else if (flag === TypeFlags.UserReference) {
      if (Array.isArray(field.reference_to)) {
        field.reference_to.forEach((v) => {
          visitedContentTypes.add(name_type(v));
        });
      }
    }
  }

  function name_type(uid: string) {
    return [options?.naming?.prefix, _.upperFirst(_.camelCase(uid))]
      .filter((v) => v)
      .join("");
  }

  function define_interface(
    contentType: ContentstackTypes.ContentType | ContentstackTypes.GlobalField,
    systemFields = false
  ) {
    const interface_declaration = [
      "export interface",
      name_type(
        contentType.data_type === "global_field"
          ? (contentType.reference_to as string)
          : contentType.uid
      ),
    ];
    if (systemFields && contentType.schema_type !== "global_field") {
      interface_declaration.push("extends", name_type("SystemFields"));
    }
    return interface_declaration.join(" ");
  }

  function op_array(type: string, field: ContentstackTypes.Field) {
    let op = "";

    if (field.multiple) {
      op = "[]";

      if (field.max_instance) {
        return ["MaxTuple<", type, ", ", field.max_instance, ">"].join("");
      }
    }

    return type + op;
  }

  function op_required(required: boolean) {
    return required ? "" : "?";
  }

  function op_paren(block: string) {
    return `(${block})`;
  }

  function visit_field_choices(field: ContentstackTypes.Field) {
    const choices = field.enum.choices;
    const length = choices.length;

    if (!choices && !length) return "";

    function get_value(choice: { value: string }) {
      if (field.data_type === "number") {
        return choice.value;
      }

      return `${JSON.stringify(choice.value)}`;
    }

    return op_paren(choices.map((v) => get_value(v)).join(" | "));
  }

  function visit_field_type(field: ContentstackTypes.Field) {
    let type = "any";

    if (field.enum) {
      type = visit_field_choices(field);
    } else {
      const match = typeMap[field.data_type];

      if (match) {
        type = match.func(field);

        if (match.track) {
          track_dependency(field, type, match.flag);
        }
      } else {
        // Log warning for unknown field type instead of failing silently
        const reason = `Unknown field type: ${field.data_type}`;
        skippedFields.push({ uid: field.uid, path: field.uid, reason });
        cliux.print(
          `Skipped field "${field.uid}" with unknown type "${field.data_type}": ${reason}`,
          { color: "yellow" }
        );
        type = "Record<string, unknown>"; // Use Record<string, unknown> for balanced type safety
      }
    }

    return op_array(type, field);
  }

  const handleGlobalField = (field: ContentstackTypes.Field): string => {
    // Skip global field references with numeric UIDs
    const exclusionCheck = checkNumericIdentifierExclusion(
      field.reference_to,
      field.uid
    );
    if (exclusionCheck.shouldExclude) {
      skippedFields.push(exclusionCheck.record!);
      cliux.print(
        `Skipped global field reference "${field.uid}" to "${field.reference_to}": ${NUMERIC_IDENTIFIER_EXCLUSION_REASON}`,
        { color: "yellow" }
      );
      return "string"; // Use string as fallback for global field references
    }

    const referenceName = name_type(field.reference_to);
    // Return the reference name with array brackets if the field is multiple
    return `${referenceName}${field.multiple ? "[]" : ""}`;
  };

  function visit_field(field: ContentstackTypes.Field) {
    let fieldType = "";
    // Check if the field is a global field
    if (field.data_type === "global_field") {
      fieldType = handleGlobalField(field);
    } else if (field.data_type === "blocks") {
      // Handle blocks type (unchanged)
      fieldType = type_modular_blocks(field);
    } else if (field.data_type === "json") {
      fieldType = type_json_rte(field);
    } else {
      // Default handling if fieldType is still empty
      fieldType = visit_field_type(field);
    }

    // Build and return the final string in the required format
    const requiredFlag =
      field.data_type === "boolean" ? "" : op_required(field.mandatory);
    const typeModifier =
      ["isodate", "file", "number"].includes(field.data_type) ||
      ["radio", "dropdown"].includes(field.display_type)
        ? field.mandatory
          ? ""
          : " | null"
        : "";

    // Ensure the formatting is correct, and avoid concatenating field.uid directly to a string
    return `${field.uid}${requiredFlag}: ${fieldType}${typeModifier};`;
  }

  function visit_fields(schema: ContentstackTypes.Schema, path = "") {
    const fieldLines: string[] = [];
    const dollarKeys: string[] = [];

    for (const field of schema) {
      // Skip fields with numeric UIDs
      const fieldPath = path ? `${path}.${field.uid}` : field.uid;
      const exclusionCheck = checkNumericIdentifierExclusion(
        field.uid,
        fieldPath
      );
      if (exclusionCheck.shouldExclude) {
        skippedFields.push(exclusionCheck.record!);
        cliux.print(
          `Skipped field "${field.uid}" at path "${fieldPath}": ${NUMERIC_IDENTIFIER_EXCLUSION_REASON}`,
          { color: "yellow" }
        );
        continue;
      }

      const line = [
        options.docgen.field(field.display_name),
        visit_field(field),
      ]
        .filter((v) => v)
        .join("\n");

      fieldLines.push(line);
      dollarKeys.push(CSLP_HELPERS.createFieldMapping(field.uid));
    }

    // If editableTags is enabled, add the $ field
    if (options.isEditableTags) {
      const fieldComment = options.docgen.field(
        "CSLP mapping for editable fields"
      );
      const lines = fieldComment
        ? [fieldComment, CSLP_HELPERS.createMappingBlock(dollarKeys)]
        : [CSLP_HELPERS.createMappingBlock(dollarKeys)];
      fieldLines.push(...lines);
    }

    return fieldLines.join("\n");
  }

  function visit_content_type(
    contentType: ContentstackTypes.ContentType | ContentstackTypes.GlobalField
  ) {
    modularBlockInterfaces.clear();
    const contentTypeInterface = [
      options.docgen.interface(contentType.description),
      define_interface(contentType, options.systemFields),
      "{",
      options.docgen.versionComment(),
      `_version?: number;`,
      visit_fields(contentType.schema),
      "}",
    ]
      .filter((v) => v)
      .join("\n");

    return [...modularBlockInterfaces, contentTypeInterface].join("\n\n");
  }

  function type_modular_blocks(field: ContentstackTypes.Field): string {
    let modularBlockInterfaceName = name_type(field.uid);

    const modularBlockDefinitions = field.blocks
      .map((block) => {
        // Skip blocks with numeric UIDs
        const blockPath = `${field.uid}.blocks.${block.uid}`;
        const exclusionCheck = checkNumericIdentifierExclusion(
          block.uid,
          blockPath
        );
        if (exclusionCheck.shouldExclude) {
          skippedBlocks.push(exclusionCheck.record!);
          cliux.print(
            `Skipped block "${block.uid}" at path "${blockPath}": ${NUMERIC_IDENTIFIER_EXCLUSION_REASON}`,
            { color: "yellow" }
          );
          return null; // Return null to filter out later
        }

        const blockFieldType = block.reference_to
          ? name_type(block.reference_to)
          : visit_fields(
              block.schema || [],
              `${field.uid}.blocks.${block.uid}`
            );

        const blockSchemaDefinition = block.reference_to
          ? `${blockFieldType};`
          : `{\n ${blockFieldType} }`;
        return `${block.uid}: ${blockSchemaDefinition}`;
      })
      .filter(Boolean); // Filter out null values from skipped blocks

    // If all blocks were skipped, return a more specific fallback type
    if (modularBlockDefinitions.length === 0) {
      return field.multiple
        ? "Record<string, unknown>[]"
        : "Record<string, unknown>";
    }

    const modularBlockSignature = JSON.stringify(modularBlockDefinitions);

    if (uniqueBlockInterfaces.has(modularBlockSignature)) {
      // Find the existing interface name for this structure using O(1) lookup
      const existingInterfaceName =
        blockInterfacesKeyToName[modularBlockSignature];
      if (existingInterfaceName) {
        return field.multiple
          ? `${existingInterfaceName}[]`
          : existingInterfaceName;
      }
    }

    uniqueBlockInterfaces.add(modularBlockSignature);

    while (cachedModularBlocks[modularBlockInterfaceName]) {
      modularBlockInterfaceName = `${modularBlockInterfaceName}${counter}`;
      counter++;
    }

    const modularBlockInterfaceDefinition = [
      `export interface ${modularBlockInterfaceName}${options.systemFields ? ` extends ${options.naming?.prefix || ""}SystemFields` : ""} {`,
      modularBlockDefinitions.join("\n"),
      "}",
    ].join("\n");

    // Store or track the generated block interface for later use
    modularBlockInterfaces.add(modularBlockInterfaceDefinition);
    cachedModularBlocks[modularBlockInterfaceName] = modularBlockSignature;
    blockInterfacesKeyToName[modularBlockSignature] = modularBlockInterfaceName;
    return field.multiple
      ? `${modularBlockInterfaceName}[]`
      : modularBlockInterfaceName;
  }

  function type_group(field: ContentstackTypes.Field) {
    return ["{", visit_fields(field.schema, field.uid), "}"]
      .filter((v) => v)
      .join("\n");
  }

  function type_text() {
    return "string";
  }

  function type_number() {
    return "number";
  }

  function type_boolean() {
    return "boolean";
  }

  function type_link() {
    return `${options.naming?.prefix}Link`;
  }

  function type_file(field: ContentstackTypes.Field): string {
    // Check if the field is `parent_uid` and return its specific type
    if (field.uid === "parent_uid") {
      return "string | null"; // Explicitly handle `parent_uid`
    }

    // Default behavior with prefix support for other file-related fields
    return `${options.naming?.prefix}File`;
  }

  function type_global_field(field: ContentstackTypes.GlobalField) {
    // Skip global fields with numeric UIDs
    const exclusionCheck = checkNumericIdentifierExclusion(
      field.uid,
      field.uid
    );
    if (exclusionCheck.shouldExclude) {
      skippedFields.push(exclusionCheck.record!);
      cliux.print(
        `Skipped global field "${field.uid}": ${NUMERIC_IDENTIFIER_EXCLUSION_REASON}`,
        {
          color: "yellow",
        }
      );
      return "string"; // Use string as fallback for global fields
    }

    if (!field.schema) {
      const reason = "Schema not found for global field";
      skippedFields.push({ uid: field.uid, path: field.uid, reason });
      cliux.print(
        `Skipped global field "${field.uid}": ${reason}. Did you forget to include it?`,
        { color: "yellow" }
      );
      return "string"; // Use string as fallback
    }

    return name_type(field.reference_to);
  }

  function buildReferenceArrayType(references: string[], options: any): string {
    // If no valid references remain, return a more specific fallback type
    if (references.length === 0) {
      return "Record<string, unknown>[]";
    }

    // Handle reference types with or without ReferencedEntry interface
    if (options.includeReferencedEntry) {
      const referencedEntryType = `${options.naming?.prefix || ""}ReferencedEntry`;

      const wrapWithReferencedEntry = (refType: string) =>
        `(${refType} | ${referencedEntryType})`;

      const types =
        references.length === 1
          ? wrapWithReferencedEntry(references[0])
          : references.map(wrapWithReferencedEntry).join(" | ");

      return `${types}[]`;
    }

    const baseType =
      references.length === 1 ? references[0] : references.join(" | ");

    return `${baseType}[]`;
  }

  function type_reference(field: ContentstackTypes.Field) {
    const references: string[] = [];

    if (Array.isArray(field.reference_to)) {
      field.reference_to.forEach((v) => {
        // Skip references to content types with numeric names
        if (!isNumericIdentifier(v)) {
          references.push(name_type(v));
        } else {
          cliux.print(
            `Skipped reference to content type "${v}": ${NUMERIC_IDENTIFIER_EXCLUSION_REASON}`,
            { color: "yellow" }
          );
        }
      });
    } else {
      // Skip references to content types with numeric names
      if (!isNumericIdentifier(field.reference_to)) {
        references.push(name_type(field.reference_to));
      } else {
        cliux.print(
          `Skipped reference to content type "${field.reference_to}": ${NUMERIC_IDENTIFIER_EXCLUSION_REASON}`,
          { color: "yellow" }
        );
      }
    }

    return buildReferenceArrayType(references, options);
  }

  return function (
    contentType: ContentstackTypes.ContentType
  ): TSGenResult | any {
    if (contentType.schema_type === "global_field") {
      const name = name_type(contentType.uid);
      if (!cachedGlobalFields[name]) {
        cachedGlobalFields[name] = {
          definition: visit_content_type(contentType),
        };
      }
      return {
        definition: cachedGlobalFields[name].definition,
        isGlobalField: true,
      };
    }

    const definition = visit_content_type(contentType);

    // Log summary table of skipped fields and blocks
    if (skippedFields.length > 0 || skippedBlocks.length > 0) {
      cliux.print("");
      cliux.print("Summary of Skipped Items:", {
        color: "cyan",
        bold: true,
      });

      // Create combined table data for all skipped items
      const allSkippedItems = [
        ...skippedFields.map((field) => ({
          Type: "Field",
          "Key Name": field.uid,
          "Schema Path": field.path,
          Reason: field.reason,
        })),
        ...skippedBlocks.map((block) => ({
          Type: "Block",
          "Key Name": block.uid,
          "Schema Path": block.path,
          Reason: block.reason,
        })),
      ];

      // Display table
      cliux.table(
        [
          { value: "Type" },
          { value: "Key Name" },
          { value: "Schema Path" },
          { value: "Reason" },
        ],
        allSkippedItems
      );

      const totalSkipped = skippedFields.length + skippedBlocks.length;
      cliux.print("", {});
      cliux.print(`Total skipped items: ${totalSkipped}`, {
        color: "yellow",
      });
      cliux.success(" Generation completed successfully with partial schema.");
    }

    return {
      definition,
      metadata: {
        name: name_type(contentType.uid),
        types: {
          javascript: visitedJSTypes,
          contentstack: visitedCSTypes,
          globalFields: visitedGlobalFields,
        },
        dependencies: {
          globalFields: cachedGlobalFields,
          contentTypes: visitedContentTypes,
        },
        skippedFields: {
          fields: [...skippedFields], // Create a copy to avoid reference issues
          blocks: [...skippedBlocks], // Create a copy to avoid reference issues
        },
      },
    };
  };

  function type_taxonomy() {
    return `${options?.naming?.prefix}Taxonomy | ${options?.naming?.prefix}TaxonomyEntry`;
  }

  function type_json_rte(field: ContentstackTypes.Field) {
    let json_rte;
    if (field.config && field.field_metadata?.extension) {
      json_rte = `{ value: { key: string; value: string }[] }`;
    } else {
      json_rte = `{
      type: string;
      uid: string;
      _version: number;
      attrs: Record<string, any>;
      children: JSONRTENode[];
    }`;
    }
    return json_rte;
  }
}
