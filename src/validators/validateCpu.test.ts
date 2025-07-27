import { describe, expect, it } from "vitest";

import { validateCpu } from "./validateCpu.js";

describe("validateCpu", () => {
	it("should return no errors if the value is an empty array", () => {
		const result = validateCpu([]);
		expect(result).toEqual([]);
	});

	it("should return no errors if the value is a valid array with all strings", () => {
		const result = validateCpu(["nin", "thee-silver-mt-zion"]);
		expect(result).toEqual([]);
	});

	it("should return errors if the value is an array with some non-string values", () => {
		const result = validateCpu(["nin", null, "thee-silver-mt-zion", 123]);
		expect(result).toEqual([
			"item at index 1 should be a string, not `null`",
			"item at index 3 should be a string, not `number`",
		]);
	});

	it("should return an error if the value is an array with non-empty strings", () => {
		const result = validateCpu(["", "nin", "", "thee-silver-mt-zion"]);
		expect(result).toEqual([
			"item at index 0 is empty, but should be the name of a cpu architecture",
			"item at index 2 is empty, but should be the name of a cpu architecture",
		]);
	});

	it("should return an error if the value is a number", () => {
		const result = validateCpu(123);
		expect(result).toEqual(["the type should be `Array`, not `number`"]);
	});

	it("should return an error if the value is an object", () => {
		const result = validateCpu({});
		expect(result).toEqual(["the type should be `Array`, not `object`"]);
	});

	it("should return an error if the value is null", () => {
		const result = validateCpu(null);
		expect(result).toEqual([
			"the field is `null`, but should be an `Array` of strings",
		]);
	});
});
