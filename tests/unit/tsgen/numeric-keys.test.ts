const testData = require("./numeric-keys.ct");

import NullDocumentationGenerator from "../../../src/generateTS/docgen/nulldoc";
import tsgenFactory from "../../../src/generateTS/factory";
import { BasicLogger } from "../../../src/logger";

// Mock console methods to capture output
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;
const originalConsoleTable = console.table;

let logOutput: string[] = [];
let warnOutput: string[] = [];
let errorOutput: string[] = [];
let tableOutput: any[] = [];

beforeEach(() => {
  logOutput = [];
  warnOutput = [];
  errorOutput = [];
  tableOutput = [];

  console.log = jest.fn((...args: any[]) => {
    logOutput.push(args.join(" "));
  });
  console.warn = jest.fn((...args: any[]) => {
    warnOutput.push(args.join(" "));
  });
  console.error = jest.fn((...args: any[]) => {
    errorOutput.push(args.join(" "));
  });
  console.table = jest.fn((data: any) => {
    tableOutput.push(data);
  });
});

afterEach(() => {
  console.log = originalConsoleLog;
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
  console.table = originalConsoleTable;
});

describe("numeric key handling", () => {
  test("should skip fields with numeric UIDs and continue generation", () => {
    const tsgen = tsgenFactory({
      docgen: new NullDocumentationGenerator(),
      logger: new BasicLogger(),
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
      logger: new BasicLogger(),
    });
    tsgen(testData.contentTypeWithNumericKeys);

    // Should have 2 warning messages for skipped fields
    // Note: BasicLogger uses console.log with ANSI colors, so we check logOutput instead of warnOutput
    const warningMessages = logOutput.filter(
      (msg) => msg && msg.includes("Skipped field")
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
      logger: new BasicLogger(),
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
      logger: new BasicLogger(),
    });
    tsgen(testData.contentTypeWithNumericKeys);

    expect(
      logOutput.some((log) => log && log.includes("Summary of Skipped Items"))
    ).toBe(true);
    expect(
      logOutput.some((log) => log && log.includes("Total skipped items: 2"))
    ).toBe(true);
    // Check that table was called with correct data
    expect(tableOutput).toHaveLength(1); // One combined table
    expect(tableOutput[0]).toHaveLength(2); // 2 skipped fields
    expect(
      logOutput.some(
        (log) =>
          log &&
          log.includes("Generation completed successfully with partial schema")
      )
    ).toBe(true);
  });

  test("should handle nested numeric keys in groups", () => {
    const tsgen = tsgenFactory({
      docgen: new NullDocumentationGenerator(),
      logger: new BasicLogger(),
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
      logger: new BasicLogger(),
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
      logger: new BasicLogger(),
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
