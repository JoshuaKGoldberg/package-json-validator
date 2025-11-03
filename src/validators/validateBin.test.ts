import { describe, expect, it } from "vitest";

import { validateBin } from "./validateBin.ts";

describe("validateBin", () => {
	it("should return a Result with no issues if the bin field is an empty object", () => {
		const result = validateBin({});
		expect(result.errorMessages).toEqual([]);
	});

	it.each(["./cli.js", "cli.js", "./bin/cli.js", "bin/cli.js"])(
		"should return a Result with no issues if the bin field is a valid string: %s",
		(binPath) => {
			const result = validateBin(binPath);
			expect(result.errorMessages).toEqual([]);
		},
	);

	it("should return a Result with one issue when the bin field is an empty string", () => {
		const result = validateBin("");
		expect(result.errorMessages).toEqual([
			"the value is empty, but should be a relative path",
		]);
		expect(result.issues).toHaveLength(1);
	});

	it("should return a Result with ChildResults that have no issues if the bin field is a valid object with all keys having valid strings", () => {
		const result = validateBin({
			"my-cli": "cli.js",
			"my-dev-tool": "./dev-tool.js",
			"my-other-cli": "bin/cli.js",
			"my-other-tool": "./tools/other-tool.js",
		});
		expect(result.issues).toHaveLength(0);
		expect(result.childResults).toHaveLength(4);
		result.childResults.forEach((childResult) => {
			expect(childResult.issues).toHaveLength(0);
		});
	});

	it("should return a Result with ChildResults that have issues if the bin field is an object with some keys having invalid paths", () => {
		const result = validateBin({
			"my-cli": "./cli.js",
			"my-dev-tool": "",
			"my-other-tool": "  ",
		});
		expect(result.issues).toHaveLength(0);
		expect(result.childResults).toHaveLength(3);
		expect(result.childResults[0].errorMessages).toEqual([]);
		expect(result.childResults[1].errorMessages).toEqual([
			'the value of property "my-dev-tool" is empty, but should be a relative path',
		]);
		expect(result.childResults[2].errorMessages).toEqual([
			'the value of property "my-other-tool" is empty, but should be a relative path',
		]);
	});

	it("should return a Result with ChildResults that have issues if the bin field is an object with an empty string key", () => {
		const result = validateBin({
			"": "./cli.js",
			"  ": "./dev-tool.js",
			"    ": "",
		});
		expect(result.issues).toHaveLength(0);
		expect(result.childResults).toHaveLength(3);
		expect(result.childResults[0].errorMessages).toEqual([
			"property 0 has an empty key, but should be a valid command name",
		]);
		expect(result.childResults[1].errorMessages).toEqual([
			"property 1 has an empty key, but should be a valid command name",
		]);
		expect(result.childResults[2].errorMessages).toEqual([
			"the value of property 2 is empty, but should be a relative path",
			"property 2 has an empty key, but should be a valid command name",
		]);
	});

	it("should return a Result with ChildResults that have issues if the bin field is an object with some keys having non-string values", () => {
		const result = validateBin({
			"my-cli": "./cli.js",
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			"my-dev-tool": 123 as any,
		});
		expect(result.issues).toHaveLength(0);
		expect(result.childResults).toHaveLength(2);
		expect(result.childResults[0].errorMessages).toEqual([]);
		expect(result.childResults[1].errorMessages).toEqual([
			'the value of property "my-dev-tool" should be a string',
		]);
	});

	it("should return a Result with an issue if the bin field is neither a string nor an object", () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const result = validateBin(123 as any);
		expect(result.issues).toHaveLength(1);
		expect(result.errorMessages).toEqual([
			"the type should be `string` or `object`, not `number`",
		]);
	});

	it("should return an error if the bin field is an array", () => {
		const result = validateBin(["./cli.js"]);
		expect(result.issues).toHaveLength(1);
		expect(result.errorMessages).toEqual([
			"the type should be `string` or `object`, not `array`",
		]);
	});

	it("should return a Result with an issue if the bin field is null", () => {
		const result = validateBin(null);
		expect(result.issues).toHaveLength(1);
		expect(result.errorMessages).toEqual([
			"the value is `null`, but should be a `string` or an `object`",
		]);
	});
});
