import { describe, expect, it } from "vitest";

import { validateSideEffects } from "./validateSideEffects.ts";

describe(validateSideEffects, () => {
	it("should return no issues if the value is an empty array", () => {
		const result = validateSideEffects([]);
		expect(result.errorMessages).toEqual([]);
	});

	it("should return no issues if the value is a boolean", () => {
		let result = validateSideEffects(true);
		expect(result.errorMessages).toEqual([]);

		result = validateSideEffects(false);
		expect(result.errorMessages).toEqual([]);
	});

	it("should return no issues if the value is a valid array with all strings", () => {
		const result = validateSideEffects([
			"./dist/polyfill.js",
			"./dist/legacy.js",
		]);
		expect(result.errorMessages).toEqual([]);
	});

	it("should return issues if the value is an array with some non-string values", () => {
		const result = validateSideEffects([
			"./dist/polyfill.js",
			null,
			"./dist/legacy.js",
			123,
		]);
		expect(result.errorMessages).toEqual([
			"item at index 1 should be a string, not `null`",
			"item at index 3 should be a string, not `number`",
		]);
		expect(result.childResults).toHaveLength(4);
		expect(result.childResults[1].errorMessages).toEqual([
			"item at index 1 should be a string, not `null`",
		]);
		expect(result.childResults[3].errorMessages).toEqual([
			"item at index 3 should be a string, not `number`",
		]);
	});

	it("should return a result with issues if the value is an array with non-empty strings", () => {
		const result = validateSideEffects([
			"",
			"./dist/polyfill.js",
			"",
			"./dist/legacy.js",
		]);
		expect(result.errorMessages).toEqual([
			"item at index 0 is empty, but should be a path to a file with side effects or a glob pattern",
			"item at index 2 is empty, but should be a path to a file with side effects or a glob pattern",
		]);
		expect(result.childResults[0].errorMessages).toEqual([
			"item at index 0 is empty, but should be a path to a file with side effects or a glob pattern",
		]);
		expect(result.childResults[2].errorMessages).toEqual([
			"item at index 2 is empty, but should be a path to a file with side effects or a glob pattern",
		]);
	});

	it("should return issues if the value is a number", () => {
		const result = validateSideEffects(123);
		expect(result.errorMessages).toEqual([
			"the type should be `boolean` or `Array`, not `number`",
		]);
		expect(result.issues).toHaveLength(1);
	});

	it("should return a result with issues if the value is an object", () => {
		const result = validateSideEffects({});
		expect(result.issues).toEqual([
			{ message: "the type should be `boolean` or `Array`, not `object`" },
		]);
	});

	it("should return a result with issues if the value is null", () => {
		const result = validateSideEffects(null);
		expect(result.issues).toEqual([
			{
				message: "the value is `null`, but should be a `boolean` or an `Array`",
			},
		]);
	});
});
