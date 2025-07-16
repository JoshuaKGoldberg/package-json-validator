import { describe, expect, it } from "vitest";

import { validateVersion } from "./validateVersion.js";

describe("validateVersion", () => {
	it.each([
		"1.2.3",
		"1.2.3-beta.0",
		"0.0.0-experimental-2f0e7e57-20250715",
		"0.0.0",
		"1.2.3-rc.1+rev.2",
	])("should return no errors for valid version '%s'", (version) => {
		expect(validateVersion(version)).toEqual([]);
	});

	it("should return error if the value is not a string (number)", () => {
		expect(validateVersion(123)).toEqual([
			"the type should be a `string`, not `number`",
		]);
	});

	it("should return error if the value is not a string (object)", () => {
		expect(validateVersion({})).toEqual([
			"the type should be a `string`, not `object`",
		]);
	});

	it("should return error if the value is not a string (array)", () => {
		expect(validateVersion([])).toEqual([
			"the type should be a `string`, not `Array`",
		]);
	});

	it("should return error if value is not a string (boolean)", () => {
		expect(validateVersion(true)).toEqual([
			"the type should be a `string`, not `boolean`",
		]);
	});

	it("should return error if value is not a string (undefined)", () => {
		expect(validateVersion(undefined)).toEqual([
			"the type should be a `string`, not `undefined`",
		]);
	});

	it("should return error if value is not a string (null)", () => {
		expect(validateVersion(null)).toEqual([
			"the field is `null`, but should be a `string`",
		]);
	});

	it("should return error if the value is an empty string", () => {
		expect(validateVersion("")).toEqual([
			"the value is empty, but should be a valid version",
		]);
	});

	it("should return error if the value is whitespace only", () => {
		expect(validateVersion("   ")).toEqual([
			"the value is empty, but should be a valid version",
		]);
	});

	it.each(["^1.2.3", "~1.2.3", "invalid", "1.2.3.4.5-alpha2", "1.2", "1"])(
		"should return error for invalid version '%s'",
		(version) => {
			expect(validateVersion(version)).toEqual([
				"the value is not a valid semver version",
			]);
		},
	);
});
