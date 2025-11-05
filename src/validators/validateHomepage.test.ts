import { describe, expect, it } from "vitest";

import { validateHomepage } from "./validateHomepage.ts";

describe("validateHomepage", () => {
	it("should return no issues for a valid url", () => {
		let result = validateHomepage("https://nin.com");

		expect(result.errorMessages).toEqual([]);

		result = validateHomepage("http://gybe.com");

		expect(result.errorMessages).toEqual([]);
	});

	it("should return an issue if the value is not a valid url", () => {
		const result = validateHomepage("The Fragile");

		expect(result.errorMessages).toEqual(["the value is not a valid url"]);
	});

	it("should return an issue if the value is not a string (number)", () => {
		const result = validateHomepage(123);

		expect(result.errorMessages).toEqual([
			"the type should be a `string`, not `number`",
		]);
	});

	it("should return an issue if the value is not a string (object)", () => {
		const result = validateHomepage({});

		expect(result.errorMessages).toEqual([
			"the type should be a `string`, not `object`",
		]);
	});

	it("should return an issue if the value is not a string (Array)", () => {
		const result = validateHomepage([]);

		expect(result.errorMessages).toEqual([
			"the type should be a `string`, not `Array`",
		]);
	});

	it("should return an issue if value is not a string (boolean)", () => {
		const result = validateHomepage(true);

		expect(result.errorMessages).toEqual([
			"the type should be a `string`, not `boolean`",
		]);
	});

	it("should return an issue if value is not a string (undefined)", () => {
		const result = validateHomepage(undefined);

		expect(result.errorMessages).toEqual([
			"the type should be a `string`, not `undefined`",
		]);
	});

	it("should return an issue if value is not a string (null)", () => {
		const result = validateHomepage(null);

		expect(result.errorMessages).toEqual([
			"the value is `null`, but should be a `string`",
		]);
	});

	it("should return an issue if the value is an empty string", () => {
		const result = validateHomepage("");

		expect(result.errorMessages).toEqual([
			"the value is empty, but should be a valid url",
		]);
	});

	it("should return an issue if the value is whitespace only", () => {
		const result = validateHomepage("   ");

		expect(result.errorMessages).toEqual([
			"the value is empty, but should be a valid url",
		]);
	});
});
