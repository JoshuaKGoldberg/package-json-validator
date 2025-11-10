import { describe, expect, it } from "vitest";

import { validateOs } from "./validateOs.ts";

const VALID_OSS = [
	"aix",
	"android",
	"darwin",
	"freebsd",
	"linux",
	"openbsd",
	"sunos",
	"win32",
];

describe(validateOs, () => {
	it("should return no issues if the value is an empty array", () => {
		const result = validateOs([]);

		expect(result.errorMessages).toEqual([]);
	});

	it("should return no issues if the value is an array with valid string values", () => {
		const result = validateOs(VALID_OSS);

		expect(result.errorMessages).toEqual([]);
	});

	it("should return issues if the value is an array with invalid strings", () => {
		const result = validateOs(["arm", "x64"]);

		expect(result.errorMessages).toEqual([
			`the value "arm" is not valid. Valid OS values are: ${VALID_OSS.join(", ")}`,
			`the value "x64" is not valid. Valid OS values are: ${VALID_OSS.join(", ")}`,
		]);
		expect(result.issues).toHaveLength(0);
		expect(result.childResults).toHaveLength(2);
		expect(result.childResults[0].issues).toHaveLength(1);
		expect(result.childResults[1].issues).toHaveLength(1);
	});

	it("should return child results with issues if the value is an array with some non-string values", () => {
		const result = validateOs(["win32", null, "linux", 123]);

		expect(result.errorMessages).toEqual([
			"item at index 1 should be a string, not `null`",
			"item at index 3 should be a string, not `number`",
		]);
		expect(result.issues).toHaveLength(0);
		expect(result.childResults).toHaveLength(4);
		expect(result.childResults[0].issues).toEqual([]);
		expect(result.childResults[1].issues).toHaveLength(1);
		expect(result.childResults[2].issues).toEqual([]);
		expect(result.childResults[3].issues).toHaveLength(1);
	});

	it("should return child results with issues if the value is an array with non-empty strings", () => {
		const result = validateOs(["", "win32", "", "linux"]);

		expect(result.errorMessages).toEqual([
			"item at index 0 is empty, but should be the name of an operating system",
			"item at index 2 is empty, but should be the name of an operating system",
		]);
		expect(result.issues).toHaveLength(0);
		expect(result.childResults).toHaveLength(4);
		expect(result.childResults[0].issues).toHaveLength(1);
		expect(result.childResults[1].issues).toEqual([]);
		expect(result.childResults[2].issues).toHaveLength(1);
		expect(result.childResults[3].issues).toEqual([]);
	});

	it("should return an issue if the value is a number", () => {
		const result = validateOs(123);

		expect(result.errorMessages).toEqual([
			"the type should be `Array`, not `number`",
		]);
		expect(result.issues).toHaveLength(1);
	});

	it("should return an issue if the value is an object", () => {
		const result = validateOs({});

		expect(result.errorMessages).toEqual([
			"the type should be `Array`, not `object`",
		]);
		expect(result.issues).toHaveLength(1);
	});

	it("should return an issue if the value is null", () => {
		const result = validateOs(null);

		expect(result.errorMessages).toEqual([
			"the value is `null`, but should be an `Array` of strings",
		]);
		expect(result.issues).toHaveLength(1);
	});
});
