import * as prettier from "prettier";
import * as tsParser from "prettier/plugins/typescript";
import * as estreeParser from "prettier/plugins/estree";

export async function format(definition: string) {
  const formatted = await prettier.format(definition, {
    parser: "typescript",
    plugins: [tsParser, estreeParser]
  });
  return formatted;
}
