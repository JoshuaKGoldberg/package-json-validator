import { describe, expect, it } from "vitest";

import { validateConfig } from "./validateConfig.ts";

describe("validateConfig", () => {
	it("should return no errors if the field is an empty object", () => {
		const result = validateConfig({});
		expect(result).toEqual([]);
	});

	it("should return no errors if the field is an object", () => {
		const result = validateConfig({
			debug: true,
			host: "localhost",
			port: 8080,
		});
		expect(result).toEqual([]);
	});

	it("should return an error if the field is an array", () => {
		const result = validateConfig(["array", "of", "values"]);
		expect(result).toEqual(["the type should be `object`, not `array`"]);
	});

	it("should return an error if the field is null", () => {
		const result = validateConfig(null);
		expect(result).toEqual(["the field is `null`, but should be an `object`"]);
	});
});
