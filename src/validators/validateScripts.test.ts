import { describe, expect, it } from "vitest";

import { validateScripts } from "./validateScripts.ts";

describe(validateScripts, () => {
	it("should return no issues if the scripts field is an empty object", () => {
		const result = validateScripts({});
		expect(result.errorMessages).toEqual([]);
	});

	it("should return no issues if the scripts field is a valid object with all keys having valid strings", () => {
		const result = validateScripts({
			build: "rollup -c",
			lint: "eslint .",
			test: "vitest",
		});
		expect(result.errorMessages).toEqual([]);
	});

	it("should return issues if the scripts field is an object with some keys having invalid scripts", () => {
		const result = validateScripts({
			build: "rollup -c",
			lint: "",
			test: "    ",
		});
		expect(result.errorMessages).toEqual([
			'the value of property "lint" is empty, but should be a script command',
			'the value of property "test" is empty, but should be a script command',
		]);
		expect(result.issues).toHaveLength(0);
		expect(result.childResults).toHaveLength(3);
		expect(result.childResults[0].errorMessages).toEqual([]);
		expect(result.childResults[1].errorMessages).toEqual([
			'the value of property "lint" is empty, but should be a script command',
		]);
		expect(result.childResults[2].errorMessages).toEqual([
			'the value of property "test" is empty, but should be a script command',
		]);
	});

	it("should return issues if the scripts field is an object with empty string keys", () => {
		const result = validateScripts({
			"": "rollup -c",
			"  ": "eslint .",
			"    ": "",
		});
		expect(result.errorMessages).toEqual([
			"property 0 has an empty key, but should be a script name",
			"property 1 has an empty key, but should be a script name",
			"the value of property 2 is empty, but should be a script command",
			"property 2 has an empty key, but should be a script name",
		]);
		expect(result.issues).toHaveLength(0);
		expect(result.childResults).toHaveLength(3);
		expect(result.childResults[0].errorMessages).toEqual([
			"property 0 has an empty key, but should be a script name",
		]);
		expect(result.childResults[1].errorMessages).toEqual([
			"property 1 has an empty key, but should be a script name",
		]);
		expect(result.childResults[2].errorMessages).toEqual([
			"the value of property 2 is empty, but should be a script command",
			"property 2 has an empty key, but should be a script name",
		]);
	});

	it("should return issues if the scripts field is an object with some keys having non-string values", () => {
		const result = validateScripts({
			build: "rollup -c",
			invalid: 123,
		});
		expect(result.errorMessages).toEqual([
			'the value of property "invalid" should be a string',
		]);
		expect(result.issues).toHaveLength(0);
		expect(result.childResults).toHaveLength(2);
		expect(result.childResults[0].errorMessages).toEqual([]);
		expect(result.childResults[1].errorMessages).toEqual([
			'the value of property "invalid" should be a string',
		]);
	});

	it("should return an issue if the scripts field is neither a string nor an object", () => {
		const result = validateScripts(123);
		expect(result.errorMessages).toEqual([
			"the type should be `object`, not `number`",
		]);
		expect(result.issues).toHaveLength(1);
	});

	it("should return an issue if the scripts field is an array", () => {
		const result = validateScripts(["rollup -c", "eslint ."]);
		expect(result.errorMessages).toEqual([
			"the type should be `object`, not `array`",
		]);
		expect(result.issues).toHaveLength(1);
	});

	it("should return an issue if the scripts field is null", () => {
		const result = validateScripts(null);
		expect(result.errorMessages).toEqual([
			"the value is `null`, but should be an `object`",
		]);
		expect(result.issues).toHaveLength(1);
	});
});
