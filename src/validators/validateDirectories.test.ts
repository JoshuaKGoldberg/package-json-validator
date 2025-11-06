import { describe, expect, it } from "vitest";

import { validateDirectories } from "./validateDirectories.ts";

describe("validateDirectories", () => {
	it("should return no issues if the value is an empty object", () => {
		const result = validateDirectories({});
		expect(result.errorMessages).toEqual([]);
	});

	it("should return no issues if the value is a valid object with all keys having valid strings", () => {
		const result = validateDirectories({
			bin: "dist/bin",
			man: "docs",
		});
		expect(result.errorMessages).toEqual([]);
	});

	it("should return issues if the value is an object with some keys having invalid scripts", () => {
		const result = validateDirectories({
			bin: "dist/bin",
			man: "",
			test: "    ",
		});
		expect(result.issues).toEqual([]);
		expect(result.childResults).toHaveLength(3);
		[
			[],
			[
				'the value of property "man" is empty, but should be a path to a directory',
			],
			[
				'the value of property "test" is empty, but should be a path to a directory',
			],
		].forEach((childErrors, index) => {
			expect(result.childResults[index].errorMessages).toEqual(childErrors);
		});
	});

	it("should return issues if the value is an object with an empty string keys", () => {
		const result = validateDirectories({
			"": "dist/bin",
			"  ": "docs",
			"    ": "",
		});
		expect(result.issues).toEqual([]);
		expect(result.childResults).toHaveLength(3);
		[
			["property 0 has an empty key, but should be a path to a directory"],
			["property 1 has an empty key, but should be a path to a directory"],
			[
				"the value of property 2 is empty, but should be a path to a directory",
				"property 2 has an empty key, but should be a path to a directory",
			],
		].forEach((childErrors, index) => {
			expect(result.childResults[index].errorMessages).toEqual(childErrors);
		});
	});

	it("should return issues if the value is an object with some keys having non-string values", () => {
		const result = validateDirectories({
			bin: "dist/bin",
			invalid: 123,
		});
		expect(result.issues).toEqual([]);
		expect(result.childResults).toHaveLength(2);
		[[], ['the value of property "invalid" should be a string']].forEach(
			(childErrors, index) => {
				expect(result.childResults[index].errorMessages).toEqual(childErrors);
			},
		);
	});

	it("should return an issue if the value is neither a string nor an object", () => {
		const result = validateDirectories(123);
		expect(result.errorMessages).toEqual([
			"the type should be `object`, not `number`",
		]);
		expect(result.issues).toHaveLength(1);
	});

	it("should return an issue if the value is an array", () => {
		const result = validateDirectories(["dist/bin", "docs"]);
		expect(result.errorMessages).toEqual([
			"the type should be `object`, not `array`",
		]);
		expect(result.issues).toHaveLength(1);
	});

	it("should return an issue if the value is null", () => {
		const result = validateDirectories(null);
		expect(result.errorMessages).toEqual([
			"the value is `null`, but should be an `object`",
		]);
		expect(result.issues).toHaveLength(1);
	});
});
