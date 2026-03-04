import { describe, expect, it } from "vitest";

import { validatePackageManager } from "./validatePackageManager.ts";

describe(validatePackageManager, () => {
	it.each([
		"npm@11.1.0",
		"pnpm@10.3.0",
		"yarn@4.2.3",
		"bun@1.0.0",
		"yarn@4.2.3+sha224.953c8233f7a92884eee2de69a1b92d1f2ec1655e66d08071ba9a02fa",
	])(
		"should return no issues for valid package manager '%s'",
		(packageManager) => {
			expect(validatePackageManager(packageManager).errorMessages).toEqual([]);
		},
	);

	it("should return an issue if the value is not a string (number)", () => {
		const result = validatePackageManager(123);

		expect(result.errorMessages).toEqual([
			"the type should be a `string`, not `number`",
		]);
	});

	it("should return an issue if the value is not a string (object)", () => {
		const result = validatePackageManager({});

		expect(result.errorMessages).toEqual([
			"the type should be a `string`, not `object`",
		]);
	});

	it("should return an issue if the value is not a string (array)", () => {
		const result = validatePackageManager([]);

		expect(result.errorMessages).toEqual([
			"the type should be a `string`, not `array`",
		]);
	});

	it("should return an issue if the value is not a string (boolean)", () => {
		const result = validatePackageManager(true);

		expect(result.errorMessages).toEqual([
			"the type should be a `string`, not `boolean`",
		]);
	});

	it("should return an issue if the value is not a string (undefined)", () => {
		const result = validatePackageManager(undefined);

		expect(result.errorMessages).toEqual([
			"the type should be a `string`, not `undefined`",
		]);
	});

	it("should return an issue if the value is not a string (null)", () => {
		const result = validatePackageManager(null);

		expect(result.errorMessages).toEqual([
			"the value is `null`, but should be a `string`",
		]);
	});

	it("should return an issue if the value is an empty string", () => {
		const result = validatePackageManager("");

		expect(result.errorMessages).toEqual([
			'the value is empty, but should be the name and version of a package manager (e.g. "pnpm@10.3.0")',
		]);
	});

	it("should return an issue if the value is whitespace only", () => {
		const result = validatePackageManager("   ");

		expect(result.errorMessages).toEqual([
			'the value is empty, but should be the name and version of a package manager (e.g. "pnpm@10.3.0")',
		]);
	});

	it("should return an issue if the value is not in the correct format", () => {
		const result = validatePackageManager("pnpm");

		expect(result.errorMessages).toEqual([
			'the value should be in the form "name@version" (e.g. "pnpm@10.3.0")',
		]);
	});

	it("should return an issue if the value doesn't have a supported package manager", () => {
		const result = validatePackageManager("invalid@10.3.0");

		expect(result.errorMessages).toEqual([
			'the package manager "invalid" is not supported. Supported package managers are: npm, pnpm, yarn, bun',
		]);
	});

	it("should return an issue if the value doesn't have a valid version", () => {
		const result = validatePackageManager("pnpm@invalid");

		expect(result.errorMessages).toEqual([
			'the version "invalid" is not valid. It should be a valid semver version (optionally with a hash).',
		]);
	});

	it("should return an issue if the value uses a semver range instead of exact version", () => {
		const result = validatePackageManager("pnpm@^10.3.0");

		expect(result.errorMessages).toEqual([
			'the version "^10.3.0" is not valid. It should be a valid semver version (optionally with a hash).',
		]);
	});

	it("should return issues if the value has neither a supported package manager nor a valid version", () => {
		const result = validatePackageManager("unsupported@invalid");

		expect(result.errorMessages).toEqual([
			'the package manager "unsupported" is not supported. Supported package managers are: npm, pnpm, yarn, bun',
			'the version "invalid" is not valid. It should be a valid semver version (optionally with a hash).',
		]);
	});
});
