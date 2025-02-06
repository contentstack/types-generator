const globalFields = [
  {
    created_at: "2025-01-30T06:12:44.368Z",
    updated_at: "2025-01-30T06:12:44.368Z",
    title: "new global",
    uid: "new_global",
    _version: 1,
    inbuilt_class: false,
    schema: [
      {
        data_type: "text",
        display_name: "Single Line Textbox",
        uid: "single_line_textbox",
        field_metadata: {
          description: "",
          default_value: "",
          version: 3,
        },
        format: "",
        error_messages: {
          format: "",
        },
        mandatory: false,
        multiple: false,
        non_localizable: false,
        unique: false,
      },
    ],
    last_activity: {
    },
    maintain_revisions: true,
    description: "",
    schema_type: "global_field",
  },
  {
    created_at: "2024-12-23T12:57:30.467Z",
    updated_at: "2025-01-29T08:10:28.956Z",
    title: "global test",
    uid: "global_test",
    _version: 9,
    inbuilt_class: false,
    schema: [
      {
        data_type: "text",
        display_name: "Single Line Text",
        uid: "single_line_text",
        field_metadata: {
          description: "",
          default_value: "",
          version: 3,
        },
        format: "",
        error_messages: {
          format: "",
        },
        mandatory: false,
        multiple: false,
        non_localizable: false,
        unique: false,
      },
      {
        data_type: "reference",
        display_name: "SEO",
        reference_to: [
          "testing",
        ],
        field_metadata: {
          ref_multiple: false,
          ref_multiple_content_types: true,
        },
        uid: "seo",
        mandatory: false,
        multiple: false,
        non_localizable: false,
        unique: false,
      },
    ],
    last_activity: {
    },
    maintain_revisions: true,
    description: "",
    schema_type: "global_field",
  },
  {
    title: "home",
    description: "",
    options: {
      is_page: false,
      singleton: false,
      sub_title: [
      ],
      title: "title",
    },
    schema: [
      {
        data_type: "text",
        display_name: "Title",
        field_metadata: {
          _default: true,
          version: 3,
        },
        mandatory: true,
        uid: "title",
        unique: true,
        multiple: false,
        non_localizable: false,
      },
      {
        data_type: "taxonomy",
        display_name: "Taxonomy",
        uid: "taxonomies",
        taxonomies: [
          {
            taxonomy_uid: "tax_1",
            max_terms: 8,
            mandatory: false,
            multiple: true,
            non_localizable: false,
          },
          {
            taxonomy_uid: "tax_2",
            max_terms: 8,
            mandatory: false,
            multiple: true,
            non_localizable: false,
          },
        ],
        field_metadata: {
          description: "",
          default_value: "",
        },
        format: "",
        error_messages: {
          format: "",
        },
        mandatory: false,
        multiple: true,
        non_localizable: false,
        unique: false,
      },
    ],
    uid: "home",
    DEFAULT_ACL: {
      others: {
        read: false,
        create: false,
      },
      users: [
      ],
    },
    SYS_ACL: {
      others: {
        read: false,
        create: false,
        update: false,
        delete: false,
        sub_acl: {
          read: false,
          create: false,
          update: false,
          delete: false,
          publish: false,
        },
      },
      roles: [
      ],
    },
    created_at: "2025-01-10T09:18:20.450Z",
    updated_at: "2025-01-27T13:05:20.998Z",
    inbuilt_class: false,
    abilities: {
      get_one_object: true,
      get_all_objects: true,
      create_object: true,
      update_object: true,
      delete_object: true,
      delete_all_objects: true,
    },
    last_activity: {
    },
    maintain_revisions: true,
    _version: 4,
  },
  {
    title: "testing",
    description: "",
    options: {
      is_page: false,
      singleton: true,
      sub_title: [
      ],
      title: "title",
    },
    schema: [
      {
        data_type: "text",
        display_name: "Title",
        field_metadata: {
          _default: true,
          version: 3,
        },
        mandatory: true,
        uid: "title",
        unique: true,
        multiple: false,
        non_localizable: false,
      },
      {
        data_type: "json",
        display_name: "JSON Rich Text Editor",
        uid: "json_rte",
        field_metadata: {
          allow_json_rte: true,
          embed_entry: false,
          description: "",
          default_value: "",
          multiline: false,
          rich_text_type: "advanced",
          options: [
          ],
        },
        format: "",
        error_messages: {
          format: "",
        },
        reference_to: [
          "sys_assets",
        ],
        multiple: false,
        non_localizable: false,
        unique: false,
        mandatory: false,
      },
    ],
    uid: "testing",
    DEFAULT_ACL: {
      others: {
        read: false,
        create: false,
      },
      users: [
      ],
    },
    SYS_ACL: {
      others: {
        read: false,
        create: false,
        update: false,
        delete: false,
        sub_acl: {
          read: false,
          create: false,
          update: false,
          delete: false,
          publish: false,
        },
      },
      roles: [
      ],
    },
    created_at: "2025-01-09T09:32:22.764Z",
    updated_at: "2025-01-29T10:56:40.919Z",
    inbuilt_class: false,
    abilities: {
      get_one_object: true,
      get_all_objects: true,
      create_object: true,
      update_object: true,
      delete_object: true,
      delete_all_objects: true,
    },
    last_activity: {
    },
    maintain_revisions: true,
    _version: 4,
  },
]

module.exports = {
  globalFields,
};
