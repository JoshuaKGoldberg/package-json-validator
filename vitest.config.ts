import { coverageConfigDefaults, defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		clearMocks: true,
		coverage: {
			exclude: [
				...coverageConfigDefaults.exclude,
				"src/index.ts",
				"**/*.types.ts",
			],
			include: ["src"],
			reporter: ["html", "lcov", "text"],
		},
		exclude: ["lib", "node_modules"],
		setupFiles: ["console-fail-test/setup"],
	},
});
