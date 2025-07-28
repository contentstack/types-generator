// Shared CSLP mapping constants and helpers
export const CSLP_HELPERS = {
  INTERFACE_DEFINITION: `export interface CSLPAttribute {
  "data-cslp"?: string;
  "data-cslp-parent-field"?: string;
}
export type CSLPFieldMapping = CSLPAttribute | string;`,
  createFieldMapping: (fieldUid: string) =>
    `${JSON.stringify(fieldUid)}?: CSLPFieldMapping`,
  createMappingBlock: (dollarKeys: string[]) =>
    `$?: {\n  ${dollarKeys.join(";\n  ")};\n};`,
};
