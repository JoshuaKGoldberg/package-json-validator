import { describe, expect, it } from "vitest";

import { validateConfig } from "./validateConfig.ts";

describe(validateConfig, () => {
	it("should return a result with no issues if the field is an empty object", () => {
		const result = validateConfig({});
		expect(result.errorMessages).toEqual([]);
	});

	it("should return a result with no issues if the field is an object", () => {
		const result = validateConfig({
			debug: true,
			host: "localhost",
			port: 8080,
		});
		expect(result.errorMessages).toEqual([]);
	});

	it("should return a result with issues if the field is an array", () => {
		const result = validateConfig(["array", "of", "values"]);
		expect(result.errorMessages).toEqual([
			"the type should be `object`, not `array`",
		]);
	});

	it("should return a result with issues if the field is null", () => {
		const result = validateConfig(null);
		expect(result.errorMessages).toEqual([
			"the value is `null`, but should be an `object`",
		]);
	});

	it("should return a result with issues if the field is a string", () => {
		const result = validateConfig("string");
		expect(result.errorMessages).toEqual([
			"the type should be `object`, not `string`",
		]);
	});
});
