import { describe, expect, it } from "vitest";

import { validateMain } from "./validateMain.ts";

describe("validateMain", () => {
	it("should return no issues for a string", () => {
		const result = validateMain("index.js");

		expect(result.errorMessages).toEqual([]);
	});

	it("should return an issue if the value is not a string (number)", () => {
		const result = validateMain(123);

		expect(result.errorMessages).toEqual([
			"the type should be a `string`, not `number`",
		]);
	});

	it("should return an issue if the value is not a string (object)", () => {
		const result = validateMain({});

		expect(result.errorMessages).toEqual([
			"the type should be a `string`, not `object`",
		]);
	});

	it("should return an issue if the value is not a string (Array)", () => {
		const result = validateMain([]);

		expect(result.errorMessages).toEqual([
			"the type should be a `string`, not `Array`",
		]);
	});

	it("should return an issue if value is not a string (boolean)", () => {
		const result = validateMain(true);

		expect(result.errorMessages).toEqual([
			"the type should be a `string`, not `boolean`",
		]);
	});

	it("should return an issue if value is not a string (undefined)", () => {
		const result = validateMain(undefined);

		expect(result.errorMessages).toEqual([
			"the type should be a `string`, not `undefined`",
		]);
	});

	it("should return an issue if value is not a string (null)", () => {
		const result = validateMain(null);

		expect(result.errorMessages).toEqual([
			"the value is `null`, but should be a `string`",
		]);
	});

	it("should return an issue if the value is an empty string", () => {
		const result = validateMain("");

		expect(result.errorMessages).toEqual([
			"the value is empty, but should be the path to the package's main module",
		]);
	});

	it("should return an issue if the value is whitespace only", () => {
		const result = validateMain("   ");

		expect(result.errorMessages).toEqual([
			"the value is empty, but should be the path to the package's main module",
		]);
	});
});
