import { assert, describe, expect, it, test } from "vitest";

import { validate } from "./validate.ts";

const getPackageJson = (
	extra: Record<string, unknown> = {},
): Record<string, unknown> => ({
	name: "test-package",
	version: "0.5.0",
	...extra,
});

const npmWarningFields = {
	author: "Nick Sullivan <nick@sullivanflock.com>",
	bugs: "http://example.com/bugs",
	description: "This is my description",
	keywords: ["keyword1", "keyword2", "keyword3"],
	licenses: [{ type: "MIT", url: "http://example.com/license" }],
	repository: {
		type: "git",
		url: "git@github.com:JoshuaKGoldberg/package-json-validator.git",
	},
};

describe("validate", () => {
	describe("Basic", () => {
		test("Input types", () => {
			assert.ok(validate("string").critical, "string");
			assert.ok(validate("{").critical, "malformed object");
			assert.ok(validate("[]").critical, "array");
			assert.ok(validate('"malformed"').critical, "quoted string");
			assert.ok(validate("42").critical, "number");
			assert.ok(validate("null").critical, "null");
			assert.ok(validate("true").critical, "true");
			assert.ok(validate("false").critical, "false");
		});
	});

	test("Field formats", () => {
		assert.equal(
			validate(JSON.stringify(getPackageJson({ bin: "./path/to/program" })))
				.valid,
			true,
			"bin: can be string",
		);
		assert.equal(
			validate(
				JSON.stringify(
					getPackageJson({ bin: { "my-project": "./path/to/program" } }),
				),
			).valid,
			true,
			"bin: can be object",
		);
		assert.equal(
			validate(JSON.stringify(getPackageJson({ bin: ["./path/to/program"] })))
				.valid,
			false,
			"bin: can't be an array",
		);
		assert.equal(
			validate(
				JSON.stringify(
					getPackageJson({ dependencies: { bad: { version: "3.3.3" } } }),
				),
			).valid,
			false,
			"version should be a string",
		);
		assert.equal(
			validate(getPackageJson({ bin: "./path/to/program" })).valid,
			true,
			"bin: can be string | with object input",
		);
		assert.equal(
			validate(getPackageJson({ bin: { "my-project": "./path/to/program" } }))
				.valid,
			true,
			"bin: can be object | with object input",
		);
		assert.equal(
			validate(getPackageJson({ bin: ["./path/to/program"] })).valid,
			false,
			"bin: can't be an array | with object input",
		);
		assert.equal(
			validate(getPackageJson({ dependencies: { bad: { version: "3.3.3" } } }))
				.valid,
			false,
			"version should be a string | with object input",
		);
	});

	describe("with string input", () => {
		describe("Dependencies Ranges", () => {
			test("Smoke", () => {
				const json = getPackageJson({
					dependencies: {
						"caret-first": "^1.0.0",
						"caret-top": "^1",
						"catalog-named-package": "catalog:react19",
						"catalog-package": "catalog:",
						empty: "",
						star: "*",
						"svgo-v1": "npm:svgo@1.3.2",
						"svgo-v2": "npm:svgo@2.0.3",
						"tilde-first": "~1.2",
						"tilde-top": "~1",
						url: "https://github.com/JoshuaKGoldberg/package-json-validator",
						"workspace-gt-version": "workspace:>1.2.3",
						"workspace-package-any": "workspace:*",
						"workspace-package-caret": "workspace:^",
						"workspace-package-no-range": "workspace:",
						"workspace-package-tilde-version": "workspace:~1.2.3",
						"workspace-pre-release": "workspace:1.2.3-rc.1",
						"x-version": "1.2.x",
					},
					devDependencies: {
						gt: ">1.2.3",
						gteq: ">=1.2.3",
						lt: "<1.2.3",
						lteq: "<=1.2.3",
						range: "1.2.3 - 2.3.4",
						"verion-build": "1.2.3+build2012",
					},
					peerDependencies: {
						gt: ">1.2.3",
						gteq: ">=1.2.3",
						lt: "<1.2.3",
						lteq: "<=1.2.3",
						range: "1.2.3 - 2.3.4",
						"verion-build": "1.2.3+build2012",
					},
				});
				const result = validate(JSON.stringify(json), {
					recommendations: false,
					warnings: false,
				});
				assert.equal(result.valid, true, JSON.stringify(result));
				assert.equal(result.critical, undefined, JSON.stringify(result));
			});

			it("reports a complaint when devDependencies has an invalid range", () => {
				const json = getPackageJson({
					devDependencies: {
						"bad-catalog": "catalob:",
						"bad-npm": "npm;svgo@^1.2.3",
						"package-name": "abc123",
					},
				});

				const result = validate(JSON.stringify(json));

				assert.deepStrictEqual(result.errors, [
					{
						field: "devDependencies",
						message:
							"invalid version range for dependency bad-catalog: catalob:",
					},
					{
						field: "devDependencies",
						message:
							"invalid version range for dependency bad-npm: npm;svgo@^1.2.3",
					},
					{
						field: "devDependencies",
						message:
							"invalid version range for dependency package-name: abc123",
					},
				]);
			});

			it("reports a complaint when peerDependencies has an invalid range", () => {
				const json = getPackageJson({
					peerDependencies: {
						"package-name": "abc123",
					},
				});

				const result = validate(JSON.stringify(json));

				assert.deepStrictEqual(result.errors, [
					{
						field: "peerDependencies",
						message:
							"invalid version range for dependency package-name: abc123",
					},
				]);
			});

			test("Dependencies with scope", () => {
				// reference: https://github.com/JoshuaKGoldberg/package-json-validator/issues/49
				const json = getPackageJson({
					dependencies: {
						"@reactivex/rxjs": "^5.0.0-alpha.7",
						empty: "",
						star: "*",
						url: "https://github.com/JoshuaKGoldberg/package-json-validator",
					},
				});
				const result = validate(JSON.stringify(json), {
					recommendations: false,
					warnings: false,
				});
				assert.equal(result.valid, true, JSON.stringify(result));
				assert.equal(result.critical, undefined, JSON.stringify(result));
			});
		});

		test("Required fields", () => {
			let json = getPackageJson();
			let result = validate(JSON.stringify(json), {
				recommendations: false,
				warnings: false,
			});
			assert.equal(result.valid, true, JSON.stringify(result));
			assert.equal(result.critical, undefined, JSON.stringify(result));

			["name", "version"].forEach((field) => {
				json = getPackageJson();
				delete json[field];
				result = validate(JSON.stringify(json), {
					recommendations: false,
					warnings: false,
				});
				assert.equal(result.valid, false, JSON.stringify(result));
				assert.equal(result.warnings, undefined, JSON.stringify(result));
			});
			["name", "version"].forEach((field) => {
				json = getPackageJson();
				json.private = true;
				delete json[field];
				result = validate(JSON.stringify(json), {
					recommendations: false,
					warnings: false,
				});
				assert.equal(result.valid, true, JSON.stringify(result));
				assert.equal(result.warnings, undefined, JSON.stringify(result));
			});
		});

		test("Warning fields", () => {
			let json = getPackageJson(npmWarningFields);
			let result = validate(JSON.stringify(json), {
				recommendations: false,
				warnings: true,
			});
			assert.equal(result.valid, true, JSON.stringify(result));
			assert.equal(result.critical, undefined, JSON.stringify(result));

			for (const field in npmWarningFields) {
				json = getPackageJson(npmWarningFields);
				delete json[field];
				result = validate(JSON.stringify(json), {
					recommendations: false,
					warnings: true,
				});
				assert.equal(result.valid, true, JSON.stringify(result));
				assert.equal(result.warnings?.length, 1, JSON.stringify(result));
			}
		});

		test("Recommended fields", () => {
			const recommendedFields = {
				dependencies: { "package-json-validator": "*" },
				engines: { node: ">=0.10.3 <0.12" },
				homepage: "http://example.com",
				type: "module",
			};
			let json = getPackageJson(recommendedFields);
			let result = validate(JSON.stringify(json), {
				recommendations: true,
				warnings: false,
			});
			expect(result.valid).toBe(true);
			expect(result.recommendations?.length).toBeFalsy();

			for (const field in recommendedFields) {
				json = getPackageJson(recommendedFields);
				delete json[field];
				result = validate(JSON.stringify(json), {
					recommendations: true,
					warnings: false,
				});
				assert.equal(result.valid, true, JSON.stringify(result));
				assert.equal(result.recommendations?.length, 1, JSON.stringify(result));
			}
		});

		test("Licenses", () => {
			// https://docs.npmjs.com/cli/v9/configuring-npm/package-json#license

			// licenses as an array
			let json = getPackageJson(npmWarningFields);
			let result = validate(JSON.stringify(json), {
				recommendations: false,
				warnings: true,
			});
			assert.equal(result.valid, true, JSON.stringify(result));
			assert.equal(result.critical, undefined, JSON.stringify(result));
			assert.equal(result.warnings, undefined, JSON.stringify(result));

			// licenses as a single type
			json = getPackageJson(npmWarningFields);
			delete json.licenses;
			json.license = "MIT";
			result = validate(JSON.stringify(json), {
				recommendations: false,
				warnings: true,
			});
			assert.equal(result.valid, true, JSON.stringify(result));
			assert.equal(result.critical, undefined, JSON.stringify(result));
			assert.equal(result.warnings, undefined, JSON.stringify(result));

			// neither
			json = getPackageJson(npmWarningFields);
			delete json.licenses;
			result = validate(JSON.stringify(json), {
				recommendations: false,
				warnings: true,
			});
			assert.equal(result.valid, true, JSON.stringify(result));
			assert.equal(result.critical, undefined, JSON.stringify(result));
			assert.equal(result.warnings?.length, 1, JSON.stringify(result));
		});
	});
	describe("with object input", () => {
		describe("Dependencies Ranges", () => {
			test("Smoke", () => {
				const json = getPackageJson({
					dependencies: {
						"caret-first": "^1.0.0",
						"caret-top": "^1",
						"catalog-named-package": "catalog:react19",
						"catalog-package": "catalog:",
						empty: "",
						star: "*",
						"svgo-v1": "npm:svgo@1.3.2",
						"svgo-v2": "npm:svgo@2.0.3",
						"tilde-first": "~1.2",
						"tilde-top": "~1",
						url: "https://github.com/JoshuaKGoldberg/package-json-validator",
						"workspace-gt-version": "workspace:>1.2.3",
						"workspace-package-any": "workspace:*",
						"workspace-package-caret": "workspace:^",
						"workspace-package-no-range": "workspace:",
						"workspace-package-tilde-version": "workspace:~1.2.3",
						"workspace-pre-release": "workspace:1.2.3-rc.1",
						"x-version": "1.2.x",
					},
					devDependencies: {
						gt: ">1.2.3",
						gteq: ">=1.2.3",
						lt: "<1.2.3",
						lteq: "<=1.2.3",
						range: "1.2.3 - 2.3.4",
						"verion-build": "1.2.3+build2012",
					},
					peerDependencies: {
						gt: ">1.2.3",
						gteq: ">=1.2.3",
						lt: "<1.2.3",
						lteq: "<=1.2.3",
						range: "1.2.3 - 2.3.4",
						"verion-build": "1.2.3+build2012",
					},
				});
				const result = validate(json, {
					recommendations: false,
					warnings: false,
				});
				assert.equal(result.valid, true, JSON.stringify(result));
				assert.equal(result.critical, undefined, JSON.stringify(result));
			});

			it("reports errors when devDependencies have invalid ranges", () => {
				const json = getPackageJson({
					devDependencies: {
						"bad-catalog": "catalob:",
						"bad-npm": "npm;svgo@^1.2.3",
						"package-name": "abc123",
					},
				});

				const result = validate(json);

				assert.deepStrictEqual(result.errors, [
					{
						field: "devDependencies",
						message:
							"invalid version range for dependency bad-catalog: catalob:",
					},
					{
						field: "devDependencies",
						message:
							"invalid version range for dependency bad-npm: npm;svgo@^1.2.3",
					},
					{
						field: "devDependencies",
						message:
							"invalid version range for dependency package-name: abc123",
					},
				]);
			});

			it("reports a complaint when peerDependencies has an invalid range", () => {
				const json = getPackageJson({
					peerDependencies: {
						"package-name": "abc123",
					},
				});

				const result = validate(json);

				assert.deepStrictEqual(result.errors, [
					{
						field: "peerDependencies",
						message:
							"invalid version range for dependency package-name: abc123",
					},
				]);
			});

			test("Dependencies with scope", () => {
				// reference: https://github.com/JoshuaKGoldberg/package-json-validator/issues/49
				const json = getPackageJson({
					dependencies: {
						"@reactivex/rxjs": "^5.0.0-alpha.7",
						empty: "",
						star: "*",
						url: "https://github.com/JoshuaKGoldberg/package-json-validator",
					},
				});
				const result = validate(json, {
					recommendations: false,
					warnings: false,
				});
				assert.equal(result.valid, true, JSON.stringify(result));
				assert.equal(result.critical, undefined, JSON.stringify(result));
			});
		});

		test("Required fields", () => {
			let json = getPackageJson();
			let result = validate(json, {
				recommendations: false,
				warnings: false,
			});
			assert.equal(result.valid, true, JSON.stringify(result));
			assert.equal(result.critical, undefined, JSON.stringify(result));

			["name", "version"].forEach((field) => {
				json = getPackageJson();
				delete json[field];
				result = validate(json, {
					recommendations: false,
					warnings: false,
				});
				assert.equal(result.valid, false, JSON.stringify(result));
				assert.equal(result.warnings, undefined, JSON.stringify(result));
			});
			["name", "version"].forEach((field) => {
				json = getPackageJson();
				json.private = true;
				delete json[field];
				result = validate(json, {
					recommendations: false,
					warnings: false,
				});
				assert.equal(result.valid, true, JSON.stringify(result));
				assert.equal(result.warnings, undefined, JSON.stringify(result));
			});
		});

		test("Warning fields", () => {
			let json = getPackageJson(npmWarningFields);
			let result = validate(json, {
				recommendations: false,
				warnings: true,
			});
			assert.equal(result.valid, true, JSON.stringify(result));
			assert.equal(result.critical, undefined, JSON.stringify(result));

			for (const field in npmWarningFields) {
				json = getPackageJson(npmWarningFields);
				delete json[field];
				result = validate(json, {
					recommendations: false,
					warnings: true,
				});
				assert.equal(result.valid, true, JSON.stringify(result));
				assert.equal(result.warnings?.length, 1, JSON.stringify(result));
			}
		});

		test("Recommended fields", () => {
			const recommendedFields = {
				dependencies: { "package-json-validator": "*" },
				engines: { node: ">=0.10.3 <0.12" },
				homepage: "http://example.com",
				type: "module",
			};
			let json = getPackageJson(recommendedFields);
			let result = validate(json, {
				recommendations: true,
				warnings: false,
			});
			expect(result.valid).toBe(true);
			expect(result.recommendations?.length).toBeFalsy();

			for (const field in recommendedFields) {
				json = getPackageJson(recommendedFields);
				delete json[field];
				result = validate(json, {
					recommendations: true,
					warnings: false,
				});
				assert.equal(result.valid, true, JSON.stringify(result));
				assert.equal(result.recommendations?.length, 1, JSON.stringify(result));
			}
		});

		test("Licenses", () => {
			// https://docs.npmjs.com/cli/v9/configuring-npm/package-json#license

			// licenses as an array
			let json = getPackageJson(npmWarningFields);
			let result = validate(json, {
				recommendations: false,
				warnings: true,
			});
			assert.equal(result.valid, true, JSON.stringify(result));
			assert.equal(result.critical, undefined, JSON.stringify(result));
			assert.equal(result.warnings, undefined, JSON.stringify(result));

			// licenses as a single type
			json = getPackageJson(npmWarningFields);
			delete json.licenses;
			json.license = "MIT";
			result = validate(json, {
				recommendations: false,
				warnings: true,
			});
			assert.equal(result.valid, true, JSON.stringify(result));
			assert.equal(result.critical, undefined, JSON.stringify(result));
			assert.equal(result.warnings, undefined, JSON.stringify(result));

			// neither
			json = getPackageJson(npmWarningFields);
			delete json.licenses;
			result = validate(json, {
				recommendations: false,
				warnings: true,
			});
			assert.equal(result.valid, true, JSON.stringify(result));
			assert.equal(result.critical, undefined, JSON.stringify(result));
			assert.equal(result.warnings?.length, 1, JSON.stringify(result));
		});
	});
});
