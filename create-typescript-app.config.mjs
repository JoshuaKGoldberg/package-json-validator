// 👋 Hi! This is an optional config file for create-typescript-app (CTA).
// Repos created with CTA or its underlying framework Bingo don't use one by default.
// A CTA config file allows automatic updates to the repo that preserve customizations.
// For more information, see Bingo's docs:
//   https://www.create.bingo/execution#transition-mode
// Eventually these values should be inferable, making this config file unnecessary:
//   https://github.com/JoshuaKGoldberg/bingo/issues/128
import {
	blockCSpell,
	blockESLint,
	blockPackageJson,
	blockTSup,
	blockTypeScript,
	createConfig,
} from "create-typescript-app";

export default createConfig({
	refinements: {
		addons: [
			blockCSpell({
				ignores: ["src/**/*.test.ts"],
				words: ["Pilotfish", "react-chartjs-2", "robotstxt.org"],
			}),
			blockESLint({
				ignores: ["demo", "README.md/*.js"],
				rules: [
					{
						entries: {
							"@typescript-eslint/no-deprecated": "off",
							"@typescript-eslint/no-dynamic-delete": "off",
							"n/no-missing-import": "off",
						},
					},
					{
						comment: `Using a ts bin file throws this rule off.
It uses the package.json as a source of truth, and since the package points
at the transpiled js file, it treats usage on the ts src as a violation.`,
						entries: {
							"n/hashbang": "off",
						},
					},
					{
						comment: "TODO: Eventually clean these up",
						entries: {
							"@typescript-eslint/no-deprecated": "off",
							"@typescript-eslint/no-dynamic-delete": "off",
							"@typescript-eslint/no-non-null-assertion": "off",
							"@typescript-eslint/no-unnecessary-condition": "off",
							"@typescript-eslint/no-unsafe-argument": "off",
							"@typescript-eslint/no-unsafe-assignment": "off",
							"@typescript-eslint/no-unsafe-member-access": "off",
							"@typescript-eslint/no-unsafe-return": "off",
							"@typescript-eslint/no-unused-vars": "off",
							"@typescript-eslint/prefer-for-of": "off",
							"@typescript-eslint/prefer-nullish-coalescing": "off",
							"@typescript-eslint/restrict-template-expressions": "off",
							"jsdoc/match-description": "off",
							"no-useless-escape": "off",
							"regexp/no-super-linear-backtracking": "off",
							"regexp/no-unused-capturing-group": "off",
							"regexp/no-useless-quantifier": "off",
						},
					},
				],
			}),
			blockPackageJson({
				properties: {
					type: "commonjs",
				},
			}),
			blockTSup({
				properties: {
					format: ["cjs", "esm"],
				},
			}),
			blockTypeScript({
				compilerOptions: {
					module: "ESNext",
					moduleResolution: "Bundler",
					rewriteRelativeImportExtensions: true,
				},
			}),
		],
	},
});
