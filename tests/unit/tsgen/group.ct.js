const group = {
  created_at: "2020-07-12T15:07:35.329Z",
  updated_at: "2020-07-12T15:15:23.552Z",
  title: "Group",
  uid: "group",
  _version: "number",
  inbuilt_class: false,
  schema: [
    {
      display_name: "Title",
      uid: "title",
      data_type: "text",
      mandatory: true,
      unique: true,
      field_metadata: {
        _default: true,
        version: 3,
      },
      multiple: false,
      non_localizable: false,
    },
    {
      data_type: "group",
      display_name: "Multiple Group Max Limit",
      field_metadata: {},
      schema: [
        {
          data_type: "number",
          display_name: "Number",
          uid: "number",
          field_metadata: {
            description: "",
            default_value: "",
          },
          multiple: false,
          mandatory: false,
          unique: false,
          non_localizable: false,
        },
      ],
      uid: "multiple_group_max_limit",
      multiple: true,
      max_instance: 5,
      mandatory: false,
      unique: false,
      non_localizable: false,
    },
    {
      data_type: "group",
      display_name: "Multiple Group",
      field_metadata: {},
      schema: [
        {
          data_type: "text",
          display_name: "Single line textbox",
          uid: "single_line",
          field_metadata: {
            description: "",
            default_value: "",
            version: 3,
          },
          format: "",
          error_messages: {
            format: "",
          },
          non_localizable: false,
          multiple: false,
          mandatory: false,
          unique: false,
        },
      ],
      uid: "multiple_group",
      multiple: true,
      mandatory: false,
      unique: false,
      non_localizable: false,
    },
    {
      data_type: "group",
      display_name: "Parent Group",
      field_metadata: {},
      schema: [
        {
          data_type: "text",
          display_name: "Rich text editor",
          uid: "rich_text_editor",
          field_metadata: {
            allow_rich_text: true,
            description: "",
            multiline: false,
            rich_text_type: "advanced",
            options: [],
            version: 3,
          },
          multiple: false,
          mandatory: false,
          unique: false,
          non_localizable: false,
        },
        {
          data_type: "text",
          display_name: "Multi line textbox",
          uid: "multi_line",
          field_metadata: {
            description: "",
            default_value: "",
            multiline: true,
            version: 3,
          },
          format: "",
          error_messages: {
            format: "",
          },
          multiple: false,
          mandatory: false,
          unique: false,
          non_localizable: false,
        },
        {
          data_type: "text",
          display_name: "Single line textbox",
          uid: "single_line",
          field_metadata: {
            description: "",
            default_value: "",
            version: 3,
          },
          format: "",
          error_messages: {
            format: "",
          },
          multiple: false,
          mandatory: false,
          unique: false,
          non_localizable: false,
        },
        {
          data_type: "group",
          display_name: "Child Group",
          field_metadata: {},
          schema: [
            {
              data_type: "number",
              display_name: "Number",
              uid: "number",
              field_metadata: {
                description: "",
                default_value: "",
              },
              multiple: false,
              mandatory: false,
              unique: false,
              non_localizable: false,
            },
            {
              data_type: "boolean",
              display_name: "Boolean",
              uid: "boolean",
              field_metadata: {
                description: "",
                default_value: "",
              },
              multiple: false,
              mandatory: false,
              unique: false,
              non_localizable: false,
            },
            {
              data_type: "isodate",
              display_name: "Date",
              uid: "date",
              startDate: null,
              endDate: null,
              field_metadata: {
                description: "",
                default_value: "",
              },
              multiple: false,
              mandatory: false,
              unique: false,
              non_localizable: false,
            },
          ],
          uid: "child_group",
          multiple: false,
          mandatory: false,
          unique: false,
          non_localizable: false,
        },
      ],
      uid: "parent_group",
      multiple: false,
      mandatory: false,
      unique: false,
      non_localizable: false,
    },
  ],
  last_activity: {},
  maintain_revisions: true,
  description: "",
  DEFAULT_ACL: {
    others: {
      read: false,
      create: false,
    },
    users: [
      {
        uid: "blta1a106c13958e89d",
        read: true,
        sub_acl: {
          read: true,
        },
      },
    ],
  },
  SYS_ACL: {
    roles: [
      {
        uid: "blt127263b8951e2542",
        read: true,
        sub_acl: {
          create: true,
          read: true,
          update: true,
          delete: true,
          publish: true,
        },
        update: true,
        delete: true,
      },
      {
        uid: "blt7e69bb0e63cc5fb6",
        read: true,
        sub_acl: {
          create: true,
          read: true,
          update: true,
          delete: true,
          publish: true,
        },
      },
      {
        uid: "bltb442c49a50c5804d",
        read: true,
        sub_acl: {
          create: true,
          read: true,
          update: true,
          delete: true,
          publish: true,
        },
        update: true,
        delete: true,
      },
    ],
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
  },
  options: {
    is_page: false,
    singleton: true,
    title: "title",
    sub_title: [],
  },
  abilities: {
    get_one_object: true,
    get_all_objects: true,
    create_object: true,
    update_object: true,
    delete_object: true,
    delete_all_objects: true,
  },
};

module.exports = {
  group
}