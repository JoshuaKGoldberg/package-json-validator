const eslint = require("@eslint/js");
const n = require("eslint-plugin-n");
const tseslint = require("typescript-eslint");

module.exports = tseslint.config(
	{ ignores: ["lib/*", "eslint.config.js"] },
	eslint.configs.recommended,
	n.configs["flat/recommended"],
	tseslint.configs.recommended,
	{
		linterOptions: {
			reportUnusedDisableDirectives: "error",
		},
		rules: {
			"no-undef": "off",
			"no-useless-escape": "off",
			// TS handles this for us
			"n/no-missing-import": "off",
			// Using a ts bin file throws this rule off.
			// it uses the package.json as a source of truth, and since the package points
			// at the transpiled js file, it treats usage on the ts src as a violation.
			"n/hashbang": "off",
		},
	},
	{
		files: ["*.jsonc"],
		rules: {
			"jsonc/comma-dangle": "off",
			"jsonc/no-comments": "off",
			"jsonc/sort-keys": "error",
		},
	},
	{
		files: ["*.mjs"],
		languageOptions: {
			sourceType: "module",
		},
	},
);
