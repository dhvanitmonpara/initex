import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/**/*.ts"],
  outDir: "dist",
  format: ["esm"],
  dts: true,
  target: "node16",
  clean: true,
  onSuccess: "cp -r src/templates dist && cp -r src/data/presets dist/data",
});
