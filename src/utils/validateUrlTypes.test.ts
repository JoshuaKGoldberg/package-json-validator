import { describe, expect, it } from "vitest";

import { validateUrlTypes } from "./validateUrlTypes.ts";

describe(validateUrlTypes, () => {
	it("should return an error if the string is not a valid URL", () => {
		const result = validateUrlTypes("testField", "invalidUrl");
		expect(result).toEqual(["URL not valid for testField: invalidUrl"]);
	});

	it("should return no errors if the string is a valid URL", () => {
		const result = validateUrlTypes("testField", "http://example.com");
		expect(result).toEqual([]);
	});

	it("should return an error if the object is missing the type property", () => {
		// @ts-expect-error testing edge cases
		const result = validateUrlTypes("testField", { url: "http://example.com" });
		expect(result).toEqual(["testField field should have type"]);
	});

	it("should return an error if the object is missing the url property", () => {
		// @ts-expect-error testing edge cases
		const result = validateUrlTypes("testField", { type: "homepage" });
		expect(result).toEqual(["testField field should have url"]);
	});

	it("should return no errors if the object has both type and url properties", () => {
		const result = validateUrlTypes("testField", {
			type: "homepage",
			url: "http://example.com",
		});
		expect(result).toEqual([]);
	});

	it("should return errors if the array of objects has some missing type or url properties", () => {
		const result = validateUrlTypes("testField", [
			{ type: "homepage", url: "http://example.com" },
			// @ts-expect-error testing edge cases
			{ type: "repository" },
			// @ts-expect-error testing edge cases
			{ url: "http://example.com" },
		]);
		expect(result).toEqual([
			"testField field should have url",
			"testField field should have type",
		]);
	});

	it("should return no errors if the array of objects has all valid type and url properties", () => {
		const result = validateUrlTypes("testField", [
			{ type: "homepage", url: "http://example.com" },
			{ type: "repository", url: "http://example.com/repo" },
		]);
		expect(result).toEqual([]);
	});

	it("should return an error if the input is neither a string, an object, nor an array", () => {
		// @ts-expect-error testing edge cases
		const result = validateUrlTypes("testField", 123);
		expect(result).toEqual([
			"Type for field testField should be a string or an object",
		]);
	});
});
