const text = (uid) => ({ uid, data_type: "text", multiple: false });

// A content type whose modular-blocks field is named `file`, colliding with the
// built-in `File` interface.
const blockVsBuiltin = {
  uid: "page",
  title: "Page",
  schema_type: "content_type",
  schema: [
    text("title"),
    {
      uid: "file",
      data_type: "blocks",
      multiple: true,
      blocks: [{ uid: "hero", title: "Hero", schema: [text("label")] }],
    },
  ],
};

// DX-10385: content type `form`, plus content type `form_basic` whose modular-blocks
// field is also UID'd `form`.
const formCT = {
  uid: "form",
  title: "Form",
  schema_type: "content_type",
  schema: [text("title"), text("heading")],
};

const formBasicCT = {
  uid: "form_basic",
  title: "Form Basic",
  schema_type: "content_type",
  schema: [
    text("title"),
    {
      uid: "form",
      data_type: "blocks",
      multiple: true,
      blocks: [{ uid: "heading", title: "Heading", schema: [text("label")] }],
    },
  ],
};

module.exports = { blockVsBuiltin, formCT, formBasicCT };
