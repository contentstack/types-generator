import { DocumentationGenerator } from "./docgen/doc";
import NullDocumentationGenerator from "./docgen/nulldoc";
import * as ContentstackTypes from "../types/schema";
import * as _ from "lodash";
import { CSLP_HELPERS } from "./shared/cslp-helpers";
import { Logger } from "../logger";
import {
  isNumericIdentifier,
  NUMERIC_IDENTIFIER_EXCLUSION_REASON,
  checkNumericIdentifierExclusion,
  throwNumericIdentifierValidationError,
} from "./shared/utils";
import { ERROR_MESSAGES } from "../constants";
import { defaultInterfaces } from "./stack/builtins";

export function hasPrefixedNaming(prefix: string | undefined): boolean {
  return typeof prefix === "string" && prefix.trim().length > 0;
}

export function composePrefixedInterfaceName(
  uid: string,
  prefix: string,
): string {
  const trimmed = prefix.trim();
  return trimmed + _.upperFirst(_.camelCase(uid));
}

/**
 * Every interface/type name that stack/builtins.ts will actually emit for this run, read
 * from that module rather than restated here — a hand-copied list silently drifts as
 * builtins are added, and a name missing from it collides in the generated output with
 * no warning.
 *
 * The emission flags must be passed through accurately rather than all-enabled. Reserving
 * a name that is not emitted is not harmless: the block that wanted it gets renamed, and
 * it also consumes the shared suffix counter, shifting the suffix of every later
 * collision in the batch. Both would rename interfaces that compile today.
 *
 * The JSON RTE flag is passed as true deliberately. The only name it adds is the JSON
 * rich-text node interface, which a UID can never produce: a name is the upper-cased
 * camel case of its UID, and that cannot yield an all-caps acronym prefix. The two
 * live-preview helper names are unreachable for the same reason, so reserving any of
 * the three can never rename anything.
 */
function collectBuiltinInterfaceNames(
  prefix: string,
  systemFields: boolean,
  isEditableTags: boolean,
  includeReferencedEntry: boolean,
): string[] {
  const declarations = defaultInterfaces(
    prefix,
    systemFields,
    isEditableTags,
    true,
    includeReferencedEntry,
  ).join("\n");

  // Deliberately an exec loop rather than matchAll: tsconfig targets es2017, and
  // String.prototype.matchAll is es2020. It runs fine on Node, but it does not type-check.
  const names: string[] = [];
  const pattern = /(?:interface|type)\s+(\w+)/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(declarations)) !== null) {
    names.push(match[1]);
  }
  return names;
}
export function interfaceNameForUid(uid: string, prefix: string): string {
  const trimmed = typeof prefix === "string" ? prefix.trim() : "";
  if (!trimmed && isNumericIdentifier(uid)) {
    return `InvalidInterface_${uid}`;
  }
  return composePrefixedInterfaceName(uid, trimmed);
}

export type TSGenOptions = {
  docgen: DocumentationGenerator;
  naming?: {
    prefix: string;
  };
  systemFields?: boolean;
  isEditableTags?: boolean;
  includeReferencedEntry?: boolean;
  logger?: Logger;
  /** Interface names already claimed by the batch — see generateTSFromContentTypes. */
  reservedNames?: string[];
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
  const logger = options.logger;
  const visitedJSTypes = new Set<string>();
  const visitedCSTypes = new Set<string>();
  const visitedGlobalFields = new Set<string>();
  const visitedContentTypes = new Set<string>();
  const cachedGlobalFields: GlobalFieldCache = {};
  const modularBlockInterfaces = new Set<string>();
  const uniqueBlockInterfaces = new Set<string>();
  const blockInterfacesKeyToName: { [key: string]: string } = {};
  const skippedFields: Array<{ uid: string; path: string; reason: string }> =
    [];
  const skippedBlocks: Array<{ uid: string; path: string; reason: string }> =
    [];

  const trimmedNamingPrefix =
    typeof options.naming?.prefix === "string"
      ? options.naming.prefix.trim()
      : "";

  // Every interface name already claimed: the builtins, plus every top-level content
  // type and global field in this batch (seeded by generateTSFromContentTypes, which
  // knows the whole batch — the factory itself only ever sees one content type at a
  // time). Top-level names are never reallocated; only derived block names are.
  const usedInterfaceNames = new Set<string>([
    ...collectBuiltinInterfaceNames(
      trimmedNamingPrefix,
      Boolean(options.systemFields),
      Boolean(options.isEditableTags),
      Boolean(options.includeReferencedEntry),
    ),
    ...(options.reservedNames ?? []),
  ]);

  // Shared across all block-name collisions, deliberately: this reproduces the numbering
  // the generator has always produced, so no interface that compiles today is renamed.
  // A per-name counter would be tidier but would turn an existing `Card2` into `Card1`.
  let counter = 1;

  function reserveInterfaceName(baseName: string): string {
    let candidate = baseName;
    while (usedInterfaceNames.has(candidate)) {
      candidate = `${candidate}${counter}`;
      counter++;
    }
    if (candidate !== baseName) {
      // Every other name-mangling path in this file reports itself; a silent rename
      // leaves the customer with "Cannot find name 'Form'" and nothing to explain it.
      logger?.warn(ERROR_MESSAGES.RENAMED_BLOCK_INTERFACE(baseName, candidate));
    }
    usedInterfaceNames.add(candidate);
    return candidate;
  }

  // Collect numeric identifier errors instead of throwing immediately
  const numericIdentifierErrors: Array<{
    uid: string;
    referenceTo?: string;
    type: "content_type" | "global_field";
  }> = [];

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
    flag: TypeFlags,
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
    return interfaceNameForUid(uid, trimmedNamingPrefix);
  }

  function define_interface(
    contentType: ContentstackTypes.ContentType | ContentstackTypes.GlobalField,
    systemFields = false,
  ) {
    const isGlobalField = contentType.data_type === "global_field";
    const nameSourceUid =
      isGlobalField && contentType.reference_to
        ? (contentType.reference_to as string)
        : contentType.uid;

    let interfaceName: string;

    if (!trimmedNamingPrefix && isNumericIdentifier(nameSourceUid)) {
      if (isGlobalField && contentType.reference_to) {
        numericIdentifierErrors.push({
          uid: contentType.uid,
          type: "global_field",
          referenceTo: contentType.reference_to as string,
        });
      } else {
        numericIdentifierErrors.push({
          uid: contentType.uid,
          type: "content_type",
        });
      }
      interfaceName = `InvalidInterface_${nameSourceUid}`;
    } else {
      interfaceName = name_type(nameSourceUid);
    }

    const interface_declaration = ["export interface", interfaceName];
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
        logger?.warn(
          ERROR_MESSAGES.SKIPPED_FIELD_UNKNOWN_TYPE(
            field.uid,
            field.data_type,
            reason,
          ),
        );
        type = "Record<string, unknown>"; // Use Record<string, unknown> for balanced type safety
      }
    }

    return op_array(type, field);
  }

  const handleGlobalField = (field: ContentstackTypes.Field): string => {
    if (!trimmedNamingPrefix && isNumericIdentifier(field.reference_to)) {
      const exclusionCheck = checkNumericIdentifierExclusion(
        field.reference_to,
        field.uid,
      );
      skippedFields.push(exclusionCheck.record!);
      logger?.warn(
        ERROR_MESSAGES.SKIPPED_GLOBAL_FIELD_REFERENCE(
          field.uid,
          field.reference_to,
          NUMERIC_IDENTIFIER_EXCLUSION_REASON,
        ),
      );
      return "string";
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
        fieldPath,
      );
      if (exclusionCheck.shouldExclude) {
        skippedFields.push(exclusionCheck.record!);
        logger?.warn(
          ERROR_MESSAGES.SKIPPED_FIELD_AT_PATH(
            field.uid,
            fieldPath,
            NUMERIC_IDENTIFIER_EXCLUSION_REASON,
          ),
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
        "CSLP mapping for editable fields",
      );
      const lines = fieldComment
        ? [fieldComment, CSLP_HELPERS.createMappingBlock(dollarKeys)]
        : [CSLP_HELPERS.createMappingBlock(dollarKeys)];
      fieldLines.push(...lines);
    }

    return fieldLines.join("\n");
  }

  function visit_content_type(
    contentType: ContentstackTypes.ContentType | ContentstackTypes.GlobalField,
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
          blockPath,
        );
        if (exclusionCheck.shouldExclude) {
          skippedBlocks.push(exclusionCheck.record!);
          logger?.warn(
            ERROR_MESSAGES.SKIPPED_BLOCK_AT_PATH(
              block.uid,
              blockPath,
              NUMERIC_IDENTIFIER_EXCLUSION_REASON,
            ),
          );
          return null; // Return null to filter out later
        }

        const blockFieldType = block.reference_to
          ? name_type(block.reference_to)
          : visit_fields(
              block.schema || [],
              `${field.uid}.blocks.${block.uid}`,
            );

        const blockSchemaDefinition = block.reference_to
          ? `${blockFieldType};`
          : `{\n ${blockFieldType} }`;
        return `${block.uid}: ${blockSchemaDefinition}`;
      })
      .filter(Boolean); // Filter out null values from skipped blocks

    // If all blocks were skipped, return a more specific fallback type
    if (modularBlockDefinitions.length === 0) {
      if (options.systemFields) {
        const modularBlocksType = `${trimmedNamingPrefix}ModularBlocksExtension`;
        return field.multiple
          ? `${modularBlocksType}<Record<string, unknown>>[]`
          : `${modularBlocksType}<Record<string, unknown>>`;
      }
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
        // Wrap with ModularBlocks type to add _metadata support only when systemFields is enabled
        if (options.systemFields) {
          const modularBlocksType = `${trimmedNamingPrefix}ModularBlocksExtension`;
          return field.multiple
            ? `${modularBlocksType}<${existingInterfaceName}>[]`
            : `${modularBlocksType}<${existingInterfaceName}>`;
        }
        return field.multiple
          ? `${existingInterfaceName}[]`
          : existingInterfaceName;
      }
    }

    uniqueBlockInterfaces.add(modularBlockSignature);

    modularBlockInterfaceName = reserveInterfaceName(modularBlockInterfaceName);

    const modularBlockInterfaceDefinition = [
      `export interface ${modularBlockInterfaceName}${options.systemFields ? ` extends ${trimmedNamingPrefix}SystemFields` : ""} {`,
      modularBlockDefinitions.join("\n"),
      "}",
    ].join("\n");

    // Store or track the generated block interface for later use
    modularBlockInterfaces.add(modularBlockInterfaceDefinition);
    blockInterfacesKeyToName[modularBlockSignature] = modularBlockInterfaceName;

    // Wrap with ModularBlocks type to add _metadata support only when systemFields is enabled
    if (options.systemFields) {
      const modularBlocksType = `${trimmedNamingPrefix}ModularBlocksExtension`;
      return field.multiple
        ? `${modularBlocksType}<${modularBlockInterfaceName}>[]`
        : `${modularBlocksType}<${modularBlockInterfaceName}>`;
    }
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
    return `${trimmedNamingPrefix}Link`;
  }

  function type_file(field: ContentstackTypes.Field): string {
    // Check if the field is `parent_uid` and return its specific type
    if (field.uid === "parent_uid") {
      return "string | null"; // Explicitly handle `parent_uid`
    }

    // Default behavior with prefix support for other file-related fields
    return `${trimmedNamingPrefix}File`;
  }

  function type_global_field(field: ContentstackTypes.GlobalField) {
    // Skip global fields with numeric UIDs
    const exclusionCheck = checkNumericIdentifierExclusion(
      field.uid,
      field.uid,
    );
    if (exclusionCheck.shouldExclude) {
      skippedFields.push(exclusionCheck.record!);
      logger?.warn(
        ERROR_MESSAGES.SKIPPED_GLOBAL_FIELD(
          field.uid,
          NUMERIC_IDENTIFIER_EXCLUSION_REASON,
        ),
      );
      return "string"; // Use string as fallback for global fields
    }

    if (!field.schema) {
      const reason = "Schema not found for global field";
      skippedFields.push({ uid: field.uid, path: field.uid, reason });
      logger?.warn(
        ERROR_MESSAGES.SKIPPED_GLOBAL_FIELD_NO_SCHEMA(field.uid, reason),
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
      const referencedEntryType = `${trimmedNamingPrefix}ReferencedEntry`;

      const baseUnion = references.join(" | ");
      const types = `(${baseUnion} | ${referencedEntryType})`;

      return `${types}[]`;
    }
    const baseUnion = references.join(" | ");
    return `(${baseUnion})[]`;
  }

  function type_reference(field: ContentstackTypes.Field) {
    const references: string[] = [];

    if (Array.isArray(field.reference_to)) {
      field.reference_to.forEach((v) => {
        if (trimmedNamingPrefix || !isNumericIdentifier(v)) {
          references.push(name_type(v));
        } else {
          logger?.warn(
            ERROR_MESSAGES.SKIPPED_REFERENCE(
              v,
              NUMERIC_IDENTIFIER_EXCLUSION_REASON,
            ),
          );
        }
      });
    } else {
      const v = field.reference_to;
      if (trimmedNamingPrefix || !isNumericIdentifier(v)) {
        references.push(name_type(v));
      } else {
        logger?.warn(
          ERROR_MESSAGES.SKIPPED_REFERENCE(
            v,
            NUMERIC_IDENTIFIER_EXCLUSION_REASON,
          ),
        );
      }
    }

    return buildReferenceArrayType(references, options);
  }

  return function (
    contentType: ContentstackTypes.ContentType,
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

    // Check for numeric identifier errors and throw them immediately
    if (numericIdentifierErrors.length > 0) {
      throwNumericIdentifierValidationError(numericIdentifierErrors);
    }

    // Log summary table of skipped fields and blocks
    if (logger && (skippedFields.length > 0 || skippedBlocks.length > 0)) {
      logger.info("");
      logger.info(ERROR_MESSAGES.SUMMARY_HEADER);

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
      if (logger.table) {
        logger.table(
          [
            { value: "Type" },
            { value: "Key Name" },
            { value: "Schema Path" },
            { value: "Reason" },
          ],
          allSkippedItems,
        );
      }

      const totalSkipped = skippedFields.length + skippedBlocks.length;
      logger.info("");
      logger.warn(ERROR_MESSAGES.TOTAL_SKIPPED_ITEMS(totalSkipped));
      logger.success(ERROR_MESSAGES.GENERATION_COMPLETED_PARTIAL);
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
    return `${trimmedNamingPrefix}Taxonomy | ${trimmedNamingPrefix}TaxonomyEntry`;
  }

  function type_json_rte(field: ContentstackTypes.Field) {
    let json_rte;
    if (field.config && field.field_metadata?.extension) {
      json_rte = `unknown`;
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
