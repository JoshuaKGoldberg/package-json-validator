import { describe, expect, it } from "vitest";

import { ChildResult, Result } from "../Result.ts";
import { validateKeywords } from "./validateKeywords.ts";

describe(validateKeywords, () => {
	it("should return no issues if the value is an empty array", () => {
		const result = validateKeywords([]);

		expect(result).toEqual(new Result());
	});

	it("should return no issues if the value is a valid array with all strings", () => {
		const result = validateKeywords(["nin", "thee-silver-mt-zion"]);

		expect(result).toEqual(new Result());
	});

	it("should return child results with issues if the value is an array with some non-string values", () => {
		const result = validateKeywords(["nin", null, "thee-silver-mt-zion", 123]);

		expect(result.errorMessages).toEqual([
			"item at index 1 should be a string, not `null`",
			"item at index 3 should be a string, not `number`",
		]);
		expect(result.childResults).toEqual([
			new ChildResult(0),
			new ChildResult(1, ["item at index 1 should be a string, not `null`"]),
			new ChildResult(2),
			new ChildResult(3, ["item at index 3 should be a string, not `number`"]),
		]);
	});

	it("should return child results with issues if the value is an array with non-empty strings", () => {
		const result = validateKeywords(["", "nin", "", "thee-silver-mt-zion"]);

		expect(result.errorMessages).toEqual([
			"item at index 0 is empty, but should be a keyword string",
			"item at index 2 is empty, but should be a keyword string",
		]);
		expect(result.childResults).toEqual([
			new ChildResult(0, [
				"item at index 0 is empty, but should be a keyword string",
			]),
			new ChildResult(1),
			new ChildResult(2, [
				"item at index 2 is empty, but should be a keyword string",
			]),
			new ChildResult(3),
		]);
	});

	it("should return an issue if the value is a number", () => {
		const result = validateKeywords(123);

		expect(result.errorMessages).toEqual([
			"the type should be `Array`, not `number`",
		]);
		expect(result.issues[0].message).toEqual(
			"the type should be `Array`, not `number`",
		);
	});

	it("should return an issue if the value is an object", () => {
		const result = validateKeywords({});

		expect(result.errorMessages).toEqual([
			"the type should be `Array`, not `object`",
		]);
		expect(result.issues[0].message).toEqual(
			"the type should be `Array`, not `object`",
		);
	});

	it("should return an issue if the value is null", () => {
		const result = validateKeywords(null);

		expect(result.errorMessages).toEqual([
			"the value is `null`, but should be an `Array` of strings",
		]);
		expect(result.issues[0].message).toEqual(
			"the value is `null`, but should be an `Array` of strings",
		);
	});
});
