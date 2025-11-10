import { describe, expect, it } from "vitest";

import { validateDescription } from "./validateDescription.ts";

describe(validateDescription, () => {
	it("should return no issues for a string", () => {
		const result = validateDescription("The Fragile");

		expect(result.errorMessages).toEqual([]);
	});

	it("should return an issue if the value is not a string (number)", () => {
		const result = validateDescription(123);

		expect(result.errorMessages).toEqual([
			"the type should be a `string`, not `number`",
		]);
	});

	it("should return an issue if the value is not a string (object)", () => {
		const result = validateDescription({});

		expect(result.errorMessages).toEqual([
			"the type should be a `string`, not `object`",
		]);
	});

	it("should return an issue if the value is not a string (Array)", () => {
		const result = validateDescription([]);

		expect(result.errorMessages).toEqual([
			"the type should be a `string`, not `Array`",
		]);
	});

	it("should return an issue if value is not a string (boolean)", () => {
		const result = validateDescription(true);

		expect(result.errorMessages).toEqual([
			"the type should be a `string`, not `boolean`",
		]);
	});

	it("should return an issue if value is not a string (undefined)", () => {
		const result = validateDescription(undefined);

		expect(result.errorMessages).toEqual([
			"the type should be a `string`, not `undefined`",
		]);
	});

	it("should return an issue if value is not a string (null)", () => {
		const result = validateDescription(null);

		expect(result.errorMessages).toEqual([
			"the value is `null`, but should be a `string`",
		]);
	});

	it("should return an issue if the value is an empty string", () => {
		const result = validateDescription("");

		expect(result.errorMessages).toEqual([
			"the value is empty, but should be a description",
		]);
	});

	it("should return an issue if the value is whitespace only", () => {
		const result = validateDescription("   ");

		expect(result.errorMessages).toEqual([
			"the value is empty, but should be a description",
		]);
	});
});
