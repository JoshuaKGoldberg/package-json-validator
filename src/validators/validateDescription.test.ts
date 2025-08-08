import { describe, expect, it } from "vitest";

import { validateDescription } from "./validateDescription.ts";

describe("validateDescription", () => {
	it("should return no errors for a string", () => {
		expect(validateDescription("The Fragile")).toEqual([]);
	});

	it("should return error if the value is not a string (number)", () => {
		expect(validateDescription(123)).toEqual([
			"the type should be a `string`, not `number`",
		]);
	});

	it("should return error if the value is not a string (object)", () => {
		expect(validateDescription({})).toEqual([
			"the type should be a `string`, not `object`",
		]);
	});

	it("should return error if the value is not a string (Array)", () => {
		expect(validateDescription([])).toEqual([
			"the type should be a `string`, not `Array`",
		]);
	});

	it("should return error if value is not a string (boolean)", () => {
		expect(validateDescription(true)).toEqual([
			"the type should be a `string`, not `boolean`",
		]);
	});

	it("should return error if value is not a string (undefined)", () => {
		expect(validateDescription(undefined)).toEqual([
			"the type should be a `string`, not `undefined`",
		]);
	});

	it("should return error if value is not a string (null)", () => {
		expect(validateDescription(null)).toEqual([
			"the field is `null`, but should be a `string`",
		]);
	});

	it("should return error if the value is an empty string", () => {
		expect(validateDescription("")).toEqual([
			"the value is empty, but should be a description",
		]);
	});

	it("should return error if the value is whitespace only", () => {
		expect(validateDescription("   ")).toEqual([
			"the value is empty, but should be a description",
		]);
	});
});
