## Migrating from v2 to v3

This changelog documents a breaking change to the `ISystemFields` interface, specifically related to the `publish_details` field.


## What Changed

The `publish_details` field is no longer an array of objects. It is now represented as a single `IPublishDetails` object.

This update aligns the generated types with the actual [Contentstack API](https://www.contentstack.com/docs/developers/apis/content-delivery-api) response.


## Before 

```typescript
export interface ISystemFields {
  uid?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
  _content_type_uid?: string;
  tags?: string[];
  ACL?: any[];
  _version?: number;
  _in_progress?: boolean;
  locale?: string;
  publish_details?: IPublishDetails[]; // Incorrect: Array of IPublishDetails
  title?: string;
}
```


## After 
```typescript
export interface ISystemFields {
  uid?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
  _content_type_uid?: string;
  tags?: string[];
  ACL?: any[];
  _version?: number;
  _in_progress?: boolean;
  locale?: string;
  publish_details?: IPublishDetails; // Corrected: Single IPublishDetails object
  title?: string;
}
```