import { CSLP_HELPERS } from "../shared/cslp-helpers";

export const defaultInterfaces = (
  prefix = "",
  systemFields = false,
  isEditableTags = false,
  hasJsonRte?: boolean
) => {
  const defaultInterfaces = [
    `type BuildTuple<T, N extends number, R extends T[] = []> =
    R['length'] extends N ? R : BuildTuple<T, N, [...R, T]>`,
    `type TuplePrefixes<T extends any[]> = 
    T extends [any, ...infer Rest] ? T | TuplePrefixes<Rest extends any[] ? Rest : []> : []`,
    `type MaxTuple<T, N extends number> = TuplePrefixes<BuildTuple<T, N>>`,
    `export interface ${prefix}PublishDetails {
            environment: string;
            locale: string;
            time: string;
            user: string;
        }`,
    `export interface ${prefix}File { 
              uid: string;
              created_at: string;
              updated_at: string;
              created_by: string;
              updated_by: string;
              content_type: string;
              file_size: string;
              tags: string[];
              filename: string;
              url: string;
              ACL: any[] | object;
              is_dir: boolean;
              parent_uid: string;
              _version: number;
              title: string;
              _metadata?:object;
              description?:string;
              publish_details: ${prefix}PublishDetails;
          }`,
    `export interface ${prefix}Link { 
              title: string;
              href: string;
          }`,
    `export interface ${prefix}Taxonomy { 
            taxonomy_uid: string;
            max_terms?: number;
            mandatory: boolean;
            non_localizable: boolean;
        }`,
  ];
  if (hasJsonRte) {
    defaultInterfaces.push(
      `export interface JSONRTENode {
      type: string;
      uid: string;
      _version: number;
      attrs: Record<string, any>;
      children?: JSONRTENode[];
      text?: string;
      bold?: boolean;
      italic?: boolean;
      underline?: boolean;
      src?: string; 
      alt?: string; 
      href?: string; 
      target?: string; 
      embed?: {
        type: string;
        uid: string;
        _version: number;
        attrs: Record<string, any>;
      };
    };`
    );
  }

  if (isEditableTags) {
    defaultInterfaces.push(CSLP_HELPERS.INTERFACE_DEFINITION);
  }

  if (systemFields) {
    defaultInterfaces.push(
      `export interface ${prefix}SystemFields {
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
            publish_details?: ${prefix}PublishDetails;
            title?: string;
        }`
    );
    return defaultInterfaces;
  } else {
    return defaultInterfaces;
  }
};
