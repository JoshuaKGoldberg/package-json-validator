import { defineConfig } from "tsup";

export default defineConfig([
	{
		clean: true,
		dts: true,
		entry: ["src/index.ts"],
		format: ["cjs", "esm"],
		outDir: "lib",
	},
	{
		dts: false,
		entry: ["src/bin/pjv.ts"],
		external: ["package-json-validator"],
		format: ["esm"],
		outDir: "lib/bin",
	},
]);
