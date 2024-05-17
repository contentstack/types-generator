import { defineConfig } from "tsup";

export default defineConfig({
  format: ["cjs", "esm"],
  entry: {
    "index": "./src/index.ts",
    "web": "./src/web.ts"
  },
  dts: true,
  shims: true,
  skipNodeModulesBundle: true,
  clean: true,
});
