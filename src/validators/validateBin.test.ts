import { describe, expect, it } from "vitest";

import { validateBin } from "./validateBin.ts";

describe("validateBin", () => {
	it("should return no errors if the bin field is an empty object", () => {
		const result = validateBin({});
		expect(result).toEqual([]);
	});

	it.each(["./cli.js", "cli.js", "./bin/cli.js", "bin/cli.js"])(
		"should return no errors if the bin field is a valid string: %s",
		(binPath) => {
			const result = validateBin(binPath);
			expect(result).toEqual([]);
		},
	);

	it("should return an error if the bin field is an empty string", () => {
		const result = validateBin("");
		expect(result).toEqual([
			"bin field is empty, but should be a relative path",
		]);
	});

	it("should return no errors if the bin field is a valid object with all keys having valid strings", () => {
		const result = validateBin({
			"my-cli": "cli.js",
			"my-dev-tool": "./dev-tool.js",
			"my-other-cli": "bin/cli.js",
			"my-other-tool": "./tools/other-tool.js",
		});
		expect(result).toEqual([]);
	});

	it("should return errors if the bin field is an object with some keys having invalid paths", () => {
		const result = validateBin({
			"my-cli": "./cli.js",
			"my-dev-tool": "",
			"my-other-tool": "  ",
		});
		expect(result).toEqual([
			'bin field "my-dev-tool" is empty, but should be a relative path',
			'bin field "my-other-tool" is empty, but should be a relative path',
		]);
	});

	it("should return an error if the bin field is an object with an empty string key", () => {
		const result = validateBin({
			"": "./cli.js",
			"  ": "./dev-tool.js",
			"    ": "",
		});
		expect(result).toEqual([
			"bin field 0 has an empty key, but should be a valid command name",
			"bin field 1 has an empty key, but should be a valid command name",
			"bin field 2 is empty, but should be a relative path",
			"bin field 2 has an empty key, but should be a valid command name",
		]);
	});

	it("should return errors if the bin field is an object with some keys having non-string values", () => {
		const result = validateBin({
			"my-cli": "./cli.js",
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			"my-dev-tool": 123 as any,
		});
		expect(result).toEqual(['bin field "my-dev-tool" should be a string']);
	});

	it("should return an error if the bin field is neither a string nor an object", () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const result = validateBin(123 as any);
		expect(result).toEqual([
			'Type for field "bin" should be `string` or `object`, not `number`',
		]);
	});

	it("should return an error if the bin field is an array", () => {
		const result = validateBin(["./cli.js"]);
		expect(result).toEqual([
			'Type for field "bin" should be `string` or `object`, not `array`',
		]);
	});

	it("should return an error if the bin field is null", () => {
		const result = validateBin(null);
		expect(result).toEqual([
			"bin field is `null`, but should be a `string` or an `object`",
		]);
	});
});
