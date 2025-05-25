import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		clearMocks: true,
		coverage: {
			all: true,
			include: ["src"],
			reporter: ["html", "lcov", "text"],
		},
		exclude: ["lib", "node_modules"],
		setupFiles: ["console-fail-test/setup"],
	},
});
