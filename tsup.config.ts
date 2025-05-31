import { defineConfig } from "tsup";

export default defineConfig({
	clean: true,
	dts: true,
	entry: ["src/index.ts", "src/bin/pjv.ts"],
	external: ["package-json-validator"],
	format: ["cjs", "esm"],
	outDir: "lib",
});
