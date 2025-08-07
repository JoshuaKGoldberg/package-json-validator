import { describe, expect, it } from "vitest";

import { validateDirectories } from "./validateDirectories.js";

describe("validateDirectories", () => {
	it("should return no errors if the value is an empty object", () => {
		const result = validateDirectories({});
		expect(result).toEqual([]);
	});

	it("should return no errors if the value is a valid object with all keys having valid strings", () => {
		const result = validateDirectories({
			bin: "dist/bin",
			man: "docs",
		});
		expect(result).toEqual([]);
	});

	it("should return errors if the value is an object with some keys having invalid scripts", () => {
		const result = validateDirectories({
			bin: "dist/bin",
			man: "",
			test: "    ",
		});
		expect(result).toEqual([
			'the value of field "man" is empty, but should be a path to a directory',
			'the value of field "test" is empty, but should be a path to a directory',
		]);
	});

	it("should return an error if the value is an object with an empty string key", () => {
		const result = validateDirectories({
			"": "dist/bin",
			"  ": "docs",
			"    ": "",
		});
		expect(result).toEqual([
			"field 0 has an empty key, but should be a path to a directory",
			"field 1 has an empty key, but should be a path to a directory",
			"the value of field 2 is empty, but should be a path to a directory",
			"field 2 has an empty key, but should be a path to a directory",
		]);
	});

	it("should return errors if the value is an object with some keys having non-string values", () => {
		const result = validateDirectories({
			bin: "dist/bin",
			invalid: 123,
		});
		expect(result).toEqual(['the value of field "invalid" should be a string']);
	});

	it("should return an error if the value is neither a string nor an object", () => {
		const result = validateDirectories(123);
		expect(result).toEqual(["the type should be `object`, not `number`"]);
	});

	it("should return an error if the value is an array", () => {
		const result = validateDirectories(["dist/bin", "docs"]);
		expect(result).toEqual(["the type should be `object`, not `array`"]);
	});

	it("should return an error if the value is null", () => {
		const result = validateDirectories(null);
		expect(result).toEqual(["the field is `null`, but should be an `object`"]);
	});
});
