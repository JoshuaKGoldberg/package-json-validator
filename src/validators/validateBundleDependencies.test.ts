import { describe, expect, it } from "vitest";

import { validateBundleDependencies } from "./validateBundleDependencies.ts";

describe("validateBundleDependencies", () => {
	it("should return no errors if the value is an empty array", () => {
		const result = validateBundleDependencies([]);
		expect(result).toEqual([]);
	});

	it("should return no errors if the value is a valid array with all strings", () => {
		const result = validateBundleDependencies(["nin", "thee-silver-mt-zion"]);
		expect(result).toEqual([]);
	});

	it("should return no errors if the value is a boolean", () => {
		let result = validateBundleDependencies(true);
		expect(result).toEqual([]);

		result = validateBundleDependencies(false);
		expect(result).toEqual([]);
	});

	it("should return errors if the value is an array with some non-string values", () => {
		const result = validateBundleDependencies([
			"nin",
			null,
			"thee-silver-mt-zion",
			123,
		]);
		expect(result).toEqual([
			"item at index 1 should be a string, not `null`",
			"item at index 3 should be a string, not `number`",
		]);
	});

	it("should return an error if the value is an array with non-empty strings", () => {
		const result = validateBundleDependencies([
			"",
			"nin",
			"",
			"thee-silver-mt-zion",
		]);
		expect(result).toEqual([
			"item at index 0 is empty, but should be a dependency name",
			"item at index 2 is empty, but should be a dependency name",
		]);
	});

	it("should return an error if the value is a number", () => {
		const result = validateBundleDependencies(123);
		expect(result).toEqual([
			"the type should be `Array` or `boolean`, not `number`",
		]);
	});

	it("should return an error if the value is an object", () => {
		const result = validateBundleDependencies({});
		expect(result).toEqual([
			"the type should be `Array` or `boolean`, not `object`",
		]);
	});

	it("should return an error if the value is null", () => {
		const result = validateBundleDependencies(null);
		expect(result).toEqual([
			"the field is `null`, but should be an `Array` or a `boolean`",
		]);
	});
});
