import { describe, expect, it } from "vitest";

import { validateFiles } from "./validateFiles.ts";

describe(validateFiles, () => {
	it("should return no issues if the value is an empty array", () => {
		const result = validateFiles([]);

		expect(result.errorMessages).toEqual([]);
	});

	it("should return no issues if the value is a valid array with all strings", () => {
		const result = validateFiles(["nin", "thee-silver-mt-zion"]);

		expect(result.errorMessages).toEqual([]);
	});

	it("should return issues if the value is an array with some non-string values", () => {
		const result = validateFiles(["nin", null, "thee-silver-mt-zion", 123]);

		expect(result.errorMessages).toEqual([
			"item at index 1 should be a string, not `null`",
			"item at index 3 should be a string, not `number`",
		]);
		expect(result.issues).toHaveLength(0);
		expect(result.childResults).toHaveLength(4);
		[
			[],
			["item at index 1 should be a string, not `null`"],
			[],
			["item at index 3 should be a string, not `number`"],
		].forEach((childErrors, i) => {
			expect(result.childResults[i].errorMessages).toEqual(childErrors);
		});
	});

	it("should return child results with issues if the value is an array with non-empty strings", () => {
		const result = validateFiles(["", "nin", "", "thee-silver-mt-zion"]);

		expect(result.errorMessages).toEqual([
			"item at index 0 is empty, but should be a file pattern",
			"item at index 2 is empty, but should be a file pattern",
		]);
		expect(result.issues).toHaveLength(0);
		expect(result.childResults).toHaveLength(4);
		[
			["item at index 0 is empty, but should be a file pattern"],
			[],
			["item at index 2 is empty, but should be a file pattern"],
			[],
		].forEach((childErrors, i) => {
			expect(result.childResults[i].errorMessages).toEqual(childErrors);
		});
	});

	it("should return an issue if the value is a number", () => {
		const result = validateFiles(123);

		expect(result.errorMessages).toEqual([
			"the type should be `Array`, not `number`",
		]);
		expect(result.issues[0].message).toEqual(
			"the type should be `Array`, not `number`",
		);
	});

	it("should return an issue if the value is an object", () => {
		const result = validateFiles({});

		expect(result.errorMessages).toEqual([
			"the type should be `Array`, not `object`",
		]);
		expect(result.issues[0].message).toEqual(
			"the type should be `Array`, not `object`",
		);
	});

	it("should return an issue if the value is null", () => {
		const result = validateFiles(null);

		expect(result.errorMessages).toEqual([
			"the value is `null`, but should be an `Array` of strings",
		]);
		expect(result.issues[0].message).toEqual(
			"the value is `null`, but should be an `Array` of strings",
		);
	});
});
