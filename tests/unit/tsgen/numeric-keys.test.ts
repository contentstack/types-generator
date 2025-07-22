const testData = require("./numeric-keys.ct");

import NullDocumentationGenerator from "../../../src/generateTS/docgen/nulldoc";
import tsgenFactory from "../../../src/generateTS/factory";

// Mock cliux to capture output
jest.mock("@contentstack/cli-utilities", () => ({
  cliux: {
    print: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
    table: jest.fn(),
  },
}));

import { cliux } from "@contentstack/cli-utilities";

let printOutput: string[] = [];
let successOutput: string[] = [];
let tableOutput: any[] = [];

beforeEach(() => {
  printOutput = [];
  successOutput = [];
  tableOutput = [];
  (cliux.print as jest.Mock).mockImplementation(
    (message: string, options?: any) => {
      printOutput.push(message);
    }
  );
  (cliux.success as jest.Mock).mockImplementation((message: string) => {
    successOutput.push(message);
  });
  (cliux.table as jest.Mock).mockImplementation(
    (headers: any, data: any, flags?: any, options?: any) => {
      tableOutput.push({ headers, data, flags, options });
    }
  );
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("numeric key handling", () => {
  test("should skip fields with numeric UIDs and continue generation", () => {
    const tsgen = tsgenFactory({
      docgen: new NullDocumentationGenerator(),
    });
    const result = tsgen(testData.contentTypeWithNumericKeys);

    // Should not throw and should generate valid TypeScript
    expect(result.definition).toContain("export interface");
    expect(result.definition).toContain("title: string");
    expect(result.definition).toContain("description?: string"); // Note: optional field

    // Should not contain the numeric field
    expect(result.definition).not.toContain("123field");
    expect(result.definition).not.toContain("456field");
  });

  test("should log warnings for skipped fields", () => {
    const tsgen = tsgenFactory({
      docgen: new NullDocumentationGenerator(),
    });
    tsgen(testData.contentTypeWithNumericKeys);

    // Should have 2 warning messages for skipped fields
    const warningMessages = printOutput.filter((msg) =>
      msg.includes("Skipped field")
    );
    expect(warningMessages).toHaveLength(2);
    expect(warningMessages[0]).toContain('Skipped field "123field"');
    expect(warningMessages[0]).toContain(
      "TypeScript constraint: object keys cannot start with numbers"
    );
    expect(warningMessages[1]).toContain('Skipped field "456field"');
    expect(warningMessages[1]).toContain(
      "TypeScript constraint: object keys cannot start with numbers"
    );
  });

  test("should include skipped fields in metadata", () => {
    const tsgen = tsgenFactory({
      docgen: new NullDocumentationGenerator(),
    });
    const result = tsgen(testData.contentTypeWithNumericKeys);

    expect(result.metadata.skippedFields).toBeDefined();
    expect(result.metadata.skippedFields.fields).toHaveLength(2);
    expect(result.metadata.skippedFields.fields[0]).toEqual({
      uid: "123field",
      path: "123field",
      reason: "TypeScript constraint: object keys cannot start with numbers",
    });
    expect(result.metadata.skippedFields.fields[1]).toEqual({
      uid: "456field",
      path: "456field",
      reason: "TypeScript constraint: object keys cannot start with numbers",
    });
  });

  test("should log summary at the end", () => {
    const tsgen = tsgenFactory({
      docgen: new NullDocumentationGenerator(),
    });
    tsgen(testData.contentTypeWithNumericKeys);

    expect(
      printOutput.some((log) => log.includes("Summary of Skipped Items"))
    ).toBe(true);
    expect(
      printOutput.some((log) => log.includes("Total skipped items: 2"))
    ).toBe(true);
    // Check that table was called with correct data
    expect(tableOutput).toHaveLength(1); // One combined table
    expect(tableOutput[0].headers).toHaveLength(3);
    expect(tableOutput[0].headers[0].value).toBe("Type");
    expect(tableOutput[0].headers[1].value).toBe("Key Name");
    expect(tableOutput[0].headers[2].value).toBe("Schema Path");
    expect(tableOutput[0].data).toHaveLength(2); // 2 skipped fields
    expect(
      successOutput.some((log) =>
        log.includes("Generation completed successfully with partial schema")
      )
    ).toBe(true);
  });

  test("should handle nested numeric keys in groups", () => {
    const tsgen = tsgenFactory({
      docgen: new NullDocumentationGenerator(),
    });
    const result = tsgen(testData.contentTypeWithNestedNumericKeys);

    expect(result.definition).toContain("export interface");
    expect(result.definition).toContain("title: string");

    // Should not contain nested numeric fields
    expect(result.definition).not.toContain("789nested");
    expect(result.definition).not.toContain("012deep");
  });

  test("should handle numeric keys in modular blocks", () => {
    const tsgen = tsgenFactory({
      docgen: new NullDocumentationGenerator(),
    });
    const result = tsgen(testData.contentTypeWithNumericBlockKeys);

    expect(result.definition).toContain("export interface");
    expect(result.definition).toContain("title: string");

    // Should not contain numeric block keys
    expect(result.definition).not.toContain("111block");
    expect(result.definition).not.toContain("222block");
  });

  test("should handle mixed valid and invalid keys", () => {
    const tsgen = tsgenFactory({
      docgen: new NullDocumentationGenerator(),
    });
    const result = tsgen(testData.contentTypeWithMixedKeys);

    expect(result.definition).toContain("export interface");
    expect(result.definition).toContain("title: string");
    expect(result.definition).toContain("validField?: string"); // Note: optional field

    // Should not contain numeric fields
    expect(result.definition).not.toContain("999invalid");

    // Should have skipped fields in metadata
    expect(result.metadata.skippedFields.fields).toHaveLength(1);
    expect(result.metadata.skippedFields.fields[0].uid).toBe("999invalid");
  });
});
