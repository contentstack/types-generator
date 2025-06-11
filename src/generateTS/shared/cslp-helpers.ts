// Shared CSLP mapping constants and helpers
export const CSLP_HELPERS = {
  INTERFACE_DEFINITION: `export interface CSLPAttribute {
  "data-cslp"?: string;
  "data-cslp-parent-field"?: string;
}`,
  FIELD_COMMENT: "/** CSLP mapping for editable fields */",
  createFieldMapping: (fieldUid: string) =>
    `${JSON.stringify(fieldUid)}?: CSLPAttribute`,
  createMappingBlock: (dollarKeys: string[]) =>
    `$?: {\n  ${dollarKeys.join(";\n  ")};\n};`,
};
