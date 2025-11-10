import { describe, expect, it } from "vitest";

import { validateMan } from "./validateMan.ts";

describe(validateMan, () => {
	it("should return no issues if the value is an empty array", () => {
		const result = validateMan([]);
		expect(result.errorMessages).toEqual([]);
	});

	it("should return no issues if the value is an array with all valid strings", () => {
		const result = validateMan(["./man/doc.1", "./man/doc.2.gz"]);
		expect(result.errorMessages).toEqual([]);
	});

	it("should return no issues if the value is a valid string", () => {
		const result = validateMan("./man/doc.1");
		expect(result.errorMessages).toEqual([]);
	});

	it("should return issues if the value is an array with some non-string values", () => {
		const result = validateMan(["./man/doc.1", null, "./man/doc.2.gz", 123]);
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

	it("should return issues if the value is an array with empty strings", () => {
		const result = validateMan(["", "./man/doc.1", "", "./man/doc.2.gz"]);
		expect(result.errorMessages).toEqual([
			"item at index 0 is empty, but should be the path to a man file",
			"item at index 2 is empty, but should be the path to a man file",
		]);
		expect(result.childResults).toHaveLength(4);
		expect(result.childResults[0].errorMessages).toEqual([
			"item at index 0 is empty, but should be the path to a man file",
		]);
		expect(result.childResults[2].errorMessages).toEqual([
			"item at index 2 is empty, but should be the path to a man file",
		]);
	});

	it("should return issues if the value is an array with invalid strings", () => {
		const result = validateMan([
			"./man/doc.one",
			"./man/doc.gz",
			"./man/doc.Infinity",
			"man/doc",
		]);
		expect(result.errorMessages).toEqual([
			"item at index 0 is not valid; it should be the path to a man file",
			"item at index 1 is not valid; it should be the path to a man file",
			"item at index 2 is not valid; it should be the path to a man file",
			"item at index 3 is not valid; it should be the path to a man file",
		]);
		expect(result.childResults).toHaveLength(4);
		expect(result.childResults[0].errorMessages).toEqual([
			"item at index 0 is not valid; it should be the path to a man file",
		]);
		expect(result.childResults[1].errorMessages).toEqual([
			"item at index 1 is not valid; it should be the path to a man file",
		]);
		expect(result.childResults[2].errorMessages).toEqual([
			"item at index 2 is not valid; it should be the path to a man file",
		]);
		expect(result.childResults[3].errorMessages).toEqual([
			"item at index 3 is not valid; it should be the path to a man file",
		]);
	});

	it.each([
		"./man/doc",
		"man/doc",
		"man/doc.one",
		"./man/doc.",
		"man/doc.Infinity",
		"./man/doc.gz",
	])(
		"should return an issue if the value is an invalid string (%s)",
		(input) => {
			const result = validateMan(input);
			expect(result.errorMessages).toEqual([
				"the value is not valid; it should be the path to a man file",
			]);
			expect(result.issues).toHaveLength(1);
		},
	);

	it("should return an issue if the value is an empty string", () => {
		let result = validateMan("");
		expect(result.errorMessages).toEqual([
			"the value is empty, but should be the path to a man file",
		]);
		expect(result.issues).toHaveLength(1);

		result = validateMan("     ");
		expect(result.errorMessages).toEqual([
			"the value is empty, but should be the path to a man file",
		]);
		expect(result.issues).toHaveLength(1);
	});

	it("should return issues if the value is a number", () => {
		const result = validateMan(123);
		expect(result.errorMessages).toEqual([
			"the type should be `Array` or `string`, not `number`",
		]);
	});

	it("should return issues if the value is an object", () => {
		const result = validateMan({});
		expect(result.issues).toEqual([
			{ message: "the type should be `Array` or `string`, not `object`" },
		]);
	});

	it("should return issues if the value is null", () => {
		const result = validateMan(null);
		expect(result.issues).toEqual([
			{
				message: "the value is `null`, but should be an `Array` or a `string`",
			},
		]);
	});
});
