import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	outDir: "dist",
	format: ["cjs"],
	target: "node16",
	clean: true,
	onSuccess: "cp -r src/templates dist/templates",
});
