import { DocumentationGenerator } from "./doc";

export default class JSDocumentationGenerator
  implements DocumentationGenerator
{
  interface(description: string) {
    return description ? this.block(description) : null;
  }

  field(description: string) {
    return description ? this.block(description) : null;
  }

  versionComment() {
    return "/** Version */";
  }

  private block(description: string) {
    return ["/**", description, "*/"].join(" ");
  }
}
