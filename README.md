# Contentstack - TypeScript generation library

This library helps to generate TypeScript type definition for the content types available in a Stack.

## Installation

`$ npm install tsgen-lib`

## Usage

### In NodeJs

`require("tsgen-lib")` for Common JS (CJS)

OR

`import {<< required method >>} from "tsgen-lib"` for ECMAScript Modules (ESM)

### In Web application

`import {<< required method >>} from "tsgen-lib/dist/web"`

## Usage Guide

#### 1. `generateTS()` (Available for both NodeJS and Web application)

This is an asynchronous method which generates Typescript type definition of the content types available in a Stack using given inputs. Use this method for `REST API`.

**Input:**

| Property Name        | Description                                                                        | Data type | Accepted values                    | Mandatory | Default value |
| -------------------- | ---------------------------------------------------------------------------------- | --------- | ---------------------------------- | --------- | ------------- |
| token                | Unique identifier used for authorization                                           | String    |                                    | Yes       |               |
| tokenType            | Type of token being provided (Currently we are supporting only delivery token)     | String    | delivery                           | Yes       |               |
| apiKey               | Stack API key                                                                      | String    |                                    | Yes       |               |
| environment          | Name of the environment (example: development, staging, production)                | String    |                                    | Yes       |               |
| region               | Contentstack API region                                                            | String    | US, EU, AZURE_NA, AZURE_EU, GCP_NA | Yes       |               |
| branch               | Stack branch name                                                                  | String    |                                    | No        |               |
| prefix               | Optional prefix to add for each interface                                          | String    |                                    | No        |               |
| includeDocumentation | To add content type documentation in the generated file                            | boolean   | true, false                        | No        | true          |
| systemFields         | Boolean flag indicating whether to include system-generated fields in the response | boolean   | true, false                        | No        | false         |

**Output:**

Returns a Promise that resolves with data or rejects with an error.

**_If resolved:_**

Type: String

Data: Generated Typescript

**_If rejected:_**

Type: Error Object

Data: An object with `error_message`

**Example usage:**

```typescript
import { generateTS } from "tsgen-lib"; // Import statement for NodeJS
import { generateTS } from "tsgen-lib/dist/web"; // Import statement for Web application

const typeDefRequest = await generateTS({
  token: "<< your_token >>",
  tokenType: "delivery", // Currently we are supporting only delivery token
  apiKey: "<< your_stack_api_key >>",
  environment: "development",
  region: "na",
  branch: "main",
  prefix: "CS",
  includeDocumentation: true,
  systemFields: false,
});

typeDefRequest
  .then((typeDef: string) => {
    // Handle resolved promise
  })
  .catch((error) => {
    // Handle rejected promise
    // error: { error_message: "Unauthorized! Please check the given token and api key" }
  });
```

**Example output:**

```typescript
/** This is a description. */
interface BuiltinExample {
  /** Title */
  title: string;
  /** URL */
  url: string;
  /** Group1 */
  group1?: {
    /** Group2 */
    group2?: {
      /** Group3 */
      group3?: {
        /** Number */
        number?: number;
      };
    };
  };
  /** SEO */
  seo?: Seo;
  /** Single line textbox */
  single_line?: string;
  /** Multi line textbox */
  multi_line?: string;
  /** Rich text editor */
  rich_text_editor?: string;
  /** Multiple Single Line Textbox */
  multiple_single_line_textbox?: string[];
  /** Markdown */
  markdown?: string;
  /** Multiple Choice */
  multiple_choice?: ("Choice 1" | "Choice 2" | "Choice 3")[];
  /** Single Choice */
  single_choice: "Choice 1" | "Choice 2" | "Choice 3";
  /** Modular Blocks */
  modular_blocks?: (
    | {
        block_1: {
          /** Number */
          number?: number;
          /** Single line textbox */
          single_line?: string;
        };
        block_2: undefined;
        seo_gf: undefined;
      }
    | {
        block_2: {
          /** Boolean */
          boolean?: boolean;
          /** Date */
          date?: string;
        };
        block_1: undefined;
        seo_gf: undefined;
      }
    | {
        seo_gf: {
          /** Keywords */
          keywords?: string;
          /** Description */
          description?: string;
        };
        block_1: undefined;
        block_2: undefined;
      }
  )[];
  /** Number */
  number?: number;
  /** Link */
  link?: Link;
  /** File */
  file?: File;
  /** Boolean */
  boolean?: boolean;
  /** Date */
  date?: string;
}
```

#### 2. `graphqlTS()` (Available only for NodeJS)

This is an asynchronous method which generates Typescript type definition of the content types available in a Stack using given inputs for GraphQL. Use this method for `GraphQL`.

**Input:**

| Property Name | Description                                                                               | Data type | Accepted values                        | Mandatory |
| ------------- | ----------------------------------------------------------------------------------------- | --------- | -------------------------------------- | --------- |
| token         | Unique identifier used for authorization. This should be the delivery token of the stack. | String    |                                        | Yes       |
| apiKey        | Stack API key                                                                             | String    |                                        | Yes       |
| environment   | Name of the environment (example: development, staging, production)                       | String    |                                        | Yes       |
| region        | Contentstack API region                                                                   | String    | na, us, eu, azure-na, azure-eu, gcp-na | Yes       |
| branch        | Stack branch name                                                                         | String    |                                        | No        |
| namespace     | Identifies the specific namespace within schema                                           | String    |                                        | No        |

**Output:**

Returns a Promise that resolves with data or rejects with an error.

**_If resolved:_**

Type: String

Data: Generated Typescript

**_If rejected:_**

Type: Error Object

Data: An object with `error_message`

**Example usage:**

```typescript
import { graphqlTS } from "tsgen-lib"; // Import statement for NodeJS

const typeDefRequest = await graphqlTS({
  token: "<< your_delivery_token >>",
  apiKey: "<< your_stack_api_key >>",
  environment: "development",
  region: "na",
  branch: "main",
  namespace: "<< your_name_space >>",
});

typeDefRequest
  .then((typeDef: string) => {
    // Handle resolved promise
  })
  .catch((error) => {
    // Handle rejected promise
    // error: { error_message: "Unauthorized! Please check the given token and api key" }
  });
```
