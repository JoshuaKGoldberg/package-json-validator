import { describe, expect, it } from "vitest";

import { validateScripts } from "./validateScripts.ts";

describe("validateScripts", () => {
	it("should return no errors if the scripts field is an empty object", () => {
		const result = validateScripts({});
		expect(result).toEqual([]);
	});

	it("should return no errors if the scripts field is a valid object with all keys having valid strings", () => {
		const result = validateScripts({
			build: "rollup -c",
			lint: "eslint .",
			test: "vitest",
		});
		expect(result).toEqual([]);
	});

	it("should return errors if the scripts field is an object with some keys having invalid scripts", () => {
		const result = validateScripts({
			build: "rollup -c",
			lint: "",
			test: "    ",
		});
		expect(result).toEqual([
			'the value of field "lint" is empty, but should be a script command',
			'the value of field "test" is empty, but should be a script command',
		]);
	});

	it("should return an error if the scripts field is an object with an empty string key", () => {
		const result = validateScripts({
			"": "rollup -c",
			"  ": "eslint .",
			"    ": "",
		});
		expect(result).toEqual([
			"field 0 has an empty key, but should be a script name",
			"field 1 has an empty key, but should be a script name",
			"the value of field 2 is empty, but should be a script command",
			"field 2 has an empty key, but should be a script name",
		]);
	});

	it("should return errors if the scripts field is an object with some keys having non-string values", () => {
		const result = validateScripts({
			build: "rollup -c",
			invalid: 123,
		});
		expect(result).toEqual(['the value of field "invalid" should be a string']);
	});

	it("should return an error if the scripts field is neither a string nor an object", () => {
		const result = validateScripts(123);
		expect(result).toEqual(["the type should be `object`, not `number`"]);
	});

	it("should return an error if the scripts field is an array", () => {
		const result = validateScripts(["rollup -c", "eslint ."]);
		expect(result).toEqual(["the type should be `object`, not `array`"]);
	});

	it("should return an error if the scripts field is null", () => {
		const result = validateScripts(null);
		expect(result).toEqual(["the field is `null`, but should be an `object`"]);
	});
});
