const jsonRTEContentType = {
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
    updated_at: "2025-02-05T06:23:51.672Z",
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
    _version: 22,
  }
  
  module.exports = {jsonRTEContentType}
  