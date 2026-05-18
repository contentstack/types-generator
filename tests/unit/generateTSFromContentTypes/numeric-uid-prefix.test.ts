import {
  composePrefixedInterfaceName,
  hasPrefixedNaming,
} from "../../../src/generateTS/factory";
import { generateTSFromContentTypes } from "../../../src/generateTS/index";
import { ContentType } from "../../../src/types/schema";

const minimalTextField = {
  data_type: "text",
  display_name: "Title",
  field_metadata: {},
  mandatory: true,
  uid: "title",
  unique: true,
  multiple: false,
  non_localizable: false,
};

const numericUidContentType: ContentType = {
  uid: "404",
  description: "",
  schema: [minimalTextField] as ContentType["schema"],
  _version: 1,
};

describe("hasPrefixedNaming / composePrefixedInterfaceName", () => {
  it("treats only whitespace prefix as absent", () => {
    expect(hasPrefixedNaming(undefined)).toBe(false);
    expect(hasPrefixedNaming("")).toBe(false);
    expect(hasPrefixedNaming("   ")).toBe(false);
    expect(hasPrefixedNaming("cs_")).toBe(true);
  });

  it("composePrefixedInterfaceName joins trimmed prefix with camel/Pascal UID", () => {
    expect(composePrefixedInterfaceName("404", "cs_")).toBe("cs_404");
    expect(composePrefixedInterfaceName("blog_post", "")).toBe("BlogPost");
  });
});

describe("generateTSFromContentTypes — numeric content-type UID and prefix", () => {
  it("accepts numeric CT uid when prefix is set", async () => {
    const out = await generateTSFromContentTypes({
      contentTypes: [numericUidContentType],
      prefix: "cs_",
      includeDocumentation: false,
      systemFields: false,
      includeReferencedEntry: false,
    });

    expect(out).toContain("export interface cs_404");
    expect(out).toMatch(/\bcs_404\b[\s\S]*\btitle:\s*string/);
  });

  it("rejects numeric CT uid without prefix", async () => {
    await expect(
      generateTSFromContentTypes({
        contentTypes: [numericUidContentType],
        prefix: "",
        includeDocumentation: false,
      })
    ).rejects.toMatchObject({
      type: "validation",
      error_code: "VALIDATION_ERROR",
    });
  });

  it("whitespace-only prefix rejects numeric CT uid like absent prefix", async () => {
    await expect(
      generateTSFromContentTypes({
        contentTypes: [numericUidContentType],
        prefix: "   ",
        includeDocumentation: false,
      })
    ).rejects.toMatchObject({
      type: "validation",
      error_code: "VALIDATION_ERROR",
    });
  });

  const numericRefGlobalField: ContentType & { data_type: string } = {
    title: "wrap",
    uid: "wrapper_gf",
    description: "",
    schema_type: "global_field",
    data_type: "global_field",
    reference_to: "404",
    schema: [{ ...minimalTextField, uid: "gtitle" }] as ContentType["schema"],
    _version: 1,
  };

  it("GF with numeric reference_to succeeds with prefix", async () => {
    const out = await generateTSFromContentTypes({
      contentTypes: [numericRefGlobalField, numericUidContentType],
      prefix: "I",
      includeDocumentation: false,
      systemFields: false,
    });

    expect(out).toContain("export interface I404");
  });

  it("GF with numeric reference_to fails without prefix", async () => {
    await expect(
      generateTSFromContentTypes({
        contentTypes: [numericRefGlobalField, numericUidContentType],
        prefix: "",
        includeDocumentation: false,
      })
    ).rejects.toMatchObject({
      type: "validation",
      error_code: "VALIDATION_ERROR",
    });
  });

  const gfStartsWithDigitRefsBlog: ContentType & { data_type: string } = {
    title: "broken uid gf",
    uid: "404_gf_own_uid",
    description: "",
    schema_type: "global_field",
    data_type: "global_field",
    reference_to: "blog",
    schema: [{ ...minimalTextField, uid: "x" }] as ContentType["schema"],
    _version: 1,
  };

  it("does not error when GF uid starts with digit but reference_to is valid (no prefix)", async () => {
    const out = await generateTSFromContentTypes({
      contentTypes: [gfStartsWithDigitRefsBlog],
      prefix: "",
      includeDocumentation: false,
      systemFields: false,
    });

    expect(out).toContain("export interface Blog");
  });

  const pageWithRef404: ContentType = {
    uid: "page",
    description: "",
    schema: [
      {
        ...minimalTextField,
        uid: "ref_field",
        data_type: "reference",
        display_name: "Ref",
        reference_to: "404",
        mandatory: false,
      } as unknown as ContentType["schema"][0],
    ],
    _version: 1,
  };

  it("reference to numeric CT includes type when prefix is set", async () => {
    const out = await generateTSFromContentTypes({
      contentTypes: [pageWithRef404, numericUidContentType],
      prefix: "P",
      includeDocumentation: false,
      includeReferencedEntry: false,
      systemFields: false,
    });

    expect(out).toContain("P404");
    expect(out).toMatch(/ref_field\?\s*:\s*P404\[\]/);
  });
});
