const customField = {
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
        display_name: "Custom key value pair",
        extension_uid: "blt819d8b90b0236e1f",
        field_metadata: {
          extension: true,
        },
        uid: "custom_key_value_pair",
        mandatory: false,
        non_localizable: false,
        unique: false,
        config: {
        },
        data_type: "json",
        multiple: false,
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
    updated_at: "2025-02-05T07:47:19.736Z",
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
    _version: 24,
  }
  
  module.exports = {customField}
  