import { describe, expect, it } from "vitest";

import { Result } from "../Result.ts";
import { validateLicense } from "./validateLicense.ts";

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
	])("should return no issues for valid license '%s'", (license) => {
		expect(validateLicense(license)).toEqual(new Result());
	});

	it("should return an issue if the value is not a string (number)", () => {
		const result = validateLicense(123);
		expect(result.errorMessages).toEqual([
			"the type should be a `string`, not `number`",
		]);
		expect(result.issues).toHaveLength(1);
	});

	it("should return an issue if the value is not a string (object)", () => {
		const result = validateLicense({});
		expect(result.errorMessages).toEqual([
			"the type should be a `string`, not `object`",
		]);
		expect(result.issues).toHaveLength(1);
	});

	it("should return an issue if the value is not a string (array)", () => {
		const result = validateLicense([]);
		expect(result.errorMessages).toEqual([
			"the type should be a `string`, not `Array`",
		]);
		expect(result.issues).toHaveLength(1);
	});

	it("should return an issue if value is not a string (boolean)", () => {
		const result = validateLicense(true);
		expect(result.errorMessages).toEqual([
			"the type should be a `string`, not `boolean`",
		]);
		expect(result.issues).toHaveLength(1);
	});

	it("should return an issue if value is not a string (undefined)", () => {
		const result = validateLicense(undefined);
		expect(result.errorMessages).toEqual([
			"the type should be a `string`, not `undefined`",
		]);
		expect(result.issues).toHaveLength(1);
	});

	it("should return an issue if value is not a string (null)", () => {
		const result = validateLicense(null);
		expect(result.errorMessages).toEqual([
			"the value is `null`, but should be a `string`",
		]);
		expect(result.issues).toHaveLength(1);
	});

	it("should return an issue if the value is an empty string", () => {
		const result = validateLicense("");
		expect(result.errorMessages).toEqual([
			"the value is empty, but should be a valid license",
		]);
		expect(result.issues).toHaveLength(1);
	});

	it("should return an issue if the value is whitespace only", () => {
		const result = validateLicense("   ");
		expect(result.errorMessages).toEqual([
			"the value is empty, but should be a valid license",
		]);
		expect(result.issues).toHaveLength(1);
	});

	it("should return an issue if the value is an invalid string", () => {
		const result = validateLicense("LicenseRef-Made-Up");
		expect(result.errorMessages).toHaveLength(1);
		expect(result.issues).toHaveLength(1);
	});
});
