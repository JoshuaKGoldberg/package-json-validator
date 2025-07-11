import { describe, expect, it } from "vitest";

import { validateLicense } from "./validateLicense.js";

describe("validateLicense", () => {
	it.each([
		"MIT",
		"BSD-2-Clause",
		"Apache-2.0",
		"ISC",
		"UNLICENSED",
		"(GPL-3.0-only OR BSD-2-Clause)",
		"SEE LICENSE IN license.md",
		"SEE LICENCE IN license.md",
	])("should return no errors for valid license '%s'", (license) => {
		expect(validateLicense(license)).toEqual([]);
	});

	it("should return error if the value is not a string (number)", () => {
		expect(validateLicense(123)).toEqual([
			"the type should be a `string`, not `number`",
		]);
	});

	it("should return error if the value is not a string (object)", () => {
		expect(validateLicense({})).toEqual([
			"the type should be a `string`, not `object`",
		]);
	});

	it("should return error if the value is not a string (array)", () => {
		expect(validateLicense([])).toEqual([
			"the type should be a `string`, not `Array`",
		]);
	});

	it("should return error if value is not a string (boolean)", () => {
		expect(validateLicense(true)).toEqual([
			"the type should be a `string`, not `boolean`",
		]);
	});

	it("should return error if value is not a string (undefined)", () => {
		expect(validateLicense(undefined)).toEqual([
			"the type should be a `string`, not `undefined`",
		]);
	});

	it("should return error if value is not a string (null)", () => {
		expect(validateLicense(null)).toEqual([
			"the field is `null`, but should be a `string`",
		]);
	});

	it("should return error if the value is an empty string", () => {
		expect(validateLicense("")).toEqual([
			"the value is empty, but should be a valid license",
		]);
	});

	it("should return error if the value is whitespace only", () => {
		expect(validateLicense("   ")).toEqual([
			"the value is empty, but should be a valid license",
		]);
	});

	it("should return error if the value is an invalid string", () => {
		expect(validateLicense("LicenseRef-Made-Up")).toHaveLength(1);
	});
});
