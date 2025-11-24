import comments from "@eslint-community/eslint-plugin-eslint-comments/configs";
import eslint from "@eslint/js";
import vitest from "@vitest/eslint-plugin";
import jsdoc from "eslint-plugin-jsdoc";
import jsonc from "eslint-plugin-jsonc";
import n from "eslint-plugin-n";
import packageJson from "eslint-plugin-package-json";
import perfectionist from "eslint-plugin-perfectionist";
import * as regexp from "eslint-plugin-regexp";
import yml from "eslint-plugin-yml";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

const JS_FILES = ["**/*.js"];
const TS_FILES = ["**/*.ts"];
const JS_TS_FILES = [...JS_FILES, ...TS_FILES];

export default defineConfig(
	{
		ignores: [
			"**/*.snap",
			"README.md/*.js",
			"coverage",
			"demo",
			"lib",
			"node_modules",
			"pnpm-lock.yaml",
		],
	},
	{ linterOptions: { reportUnusedDisableDirectives: "error" } },
	{
		extends: [
			eslint.configs.recommended,
			comments.recommended,
			n.configs["flat/recommended"],
			perfectionist.configs["recommended-natural"],
			regexp.configs["flat/recommended"],
		],
		files: JS_TS_FILES,
	},
	{
		extends: [
			jsdoc.configs["flat/contents-typescript-error"],
			jsdoc.configs["flat/logical-typescript-error"],
			jsdoc.configs["flat/stylistic-typescript-error"],
		],
		files: TS_FILES,
	},
	{
		extends: [jsonc.configs["flat/recommended-with-json"]],
		files: ["**/*.json", "**/*.jsonc"],
	},
	{
		extends: [packageJson.configs["recommended-publishable"]],
		files: ["package.json"],
	},
	{
		extends: [
			tseslint.configs.strictTypeChecked,
			tseslint.configs.stylisticTypeChecked,
		],
		files: JS_TS_FILES,
		languageOptions: {
			parserOptions: {
				projectService: {
					allowDefaultProject: ["*.config.*s", "lib/bin/pjv.mjs"],
				},
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			"@typescript-eslint/consistent-type-imports": "error",
			"@typescript-eslint/no-deprecated": "off",
			"@typescript-eslint/no-dynamic-delete": "off",
			"@typescript-eslint/restrict-template-expressions": "off",
			"jsdoc/match-description": "off",
			"n/no-missing-import": "off",

			// Using a ts bin file throws this rule off.
			// It uses the package.json as a source of truth, and since the package points
			// at the transpiled js file, it treats usage on the ts src as a violation.
			"n/hashbang": "off",

			// TODO: Eventually clean these up
			"@typescript-eslint/no-unsafe-argument": "off",
			"@typescript-eslint/no-unsafe-assignment": "off",
			"@typescript-eslint/no-unsafe-member-access": "off",
			"@typescript-eslint/no-unsafe-return": "off",
			"no-useless-escape": "off",
			"regexp/no-super-linear-backtracking": "off",
			"regexp/no-unused-capturing-group": "off",
			"regexp/no-useless-quantifier": "off",

			// Stylistic concerns that don't interfere with Prettier
			"logical-assignment-operators": [
				"error",
				"always",
				{ enforceForIfStatements: true },
			],
			"no-useless-rename": "error",
			"object-shorthand": "error",
			"operator-assignment": "error",
		},
		settings: {
			perfectionist: { partitionByComment: true, type: "natural" },
			vitest: { typecheck: true },
		},
	},
	{
		extends: [vitest.configs.recommended],
		files: ["**/*.test.*"],
		rules: {
			"@typescript-eslint/no-unsafe-assignment": "off",
			"vitest/prefer-describe-function-title": "error",
		},
	},
	{
		extends: [yml.configs["flat/standard"], yml.configs["flat/prettier"]],
		files: ["**/*.{yml,yaml}"],
		rules: {
			"yml/file-extension": ["error", { extension: "yml" }],
			"yml/sort-sequence-values": [
				"error",
				{ order: { type: "asc" }, pathPattern: "^.*$" },
			],
		},
	},
	{
		files: ["./eslint.config.js", "./**/*.test.*"],
		rules: {
			"n/no-unsupported-features/node-builtins": "off",
		},
	},
);
