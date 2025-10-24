import { describe, expect, it } from "vitest";

import { ChildResult, Result } from "../Result.ts";
import { validateBin } from "./validateBin.ts";

describe("validateBin", () => {
	it("should return a Result with no issues if the bin field is an empty object", () => {
		const result = validateBin({});
		expect(result).toEqual(new Result());
	});

	it.each(["./cli.js", "cli.js", "./bin/cli.js", "bin/cli.js"])(
		"should return a Result with no issues if the bin field is a valid string: %s",
		(binPath) => {
			const result = validateBin(binPath);
			expect(result).toEqual(new Result());
		},
	);

	it("should return a Result with one issue when the bin field is an empty string", () => {
		const result = validateBin("");
		expect(result).toEqual(
			new Result(["the value is empty, but should be a relative path"]),
		);
	});

	it("should return a Result with ChildResults that have no issues if the bin field is a valid object with all keys having valid strings", () => {
		const result = validateBin({
			"my-cli": "cli.js",
			"my-dev-tool": "./dev-tool.js",
			"my-other-cli": "bin/cli.js",
			"my-other-tool": "./tools/other-tool.js",
		});
		expect(result).toEqual(
			new Result(
				[],
				[
					new ChildResult(0, []),
					new ChildResult(1, []),
					new ChildResult(2, []),
					new ChildResult(3, []),
				],
			),
		);
	});

	it("should return a Result with ChildResults that have issues if the bin field is an object with some keys having invalid paths", () => {
		const result = validateBin({
			"my-cli": "./cli.js",
			"my-dev-tool": "",
			"my-other-tool": "  ",
		});
		expect(result).toEqual(
			new Result(
				[],
				[
					new ChildResult(0, []),
					new ChildResult(1, [
						'the value of property "my-dev-tool" is empty, but should be a relative path',
					]),
					new ChildResult(2, [
						'the value of property "my-other-tool" is empty, but should be a relative path',
					]),
				],
			),
		);
	});

	it("should return a Result with ChildResults that have issues if the bin field is an object with an empty string key", () => {
		const result = validateBin({
			"": "./cli.js",
			"  ": "./dev-tool.js",
			"    ": "",
		});
		expect(result).toEqual(
			new Result(
				[],
				[
					new ChildResult(0, [
						"property 0 has an empty key, but should be a valid command name",
					]),
					new ChildResult(1, [
						"property 1 has an empty key, but should be a valid command name",
					]),
					new ChildResult(2, [
						"the value of property 2 is empty, but should be a relative path",
						"property 2 has an empty key, but should be a valid command name",
					]),
				],
			),
		);
	});

	it("should return a Result with ChildResults that have issues if the bin field is an object with some keys having non-string values", () => {
		const result = validateBin({
			"my-cli": "./cli.js",
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			"my-dev-tool": 123 as any,
		});
		expect(result).toEqual(
			new Result(
				[],
				[
					new ChildResult(0),
					new ChildResult(1, [
						'the value of property "my-dev-tool" should be a string',
					]),
				],
			),
		);
	});

	it("should return a Result with an issue if the bin field is neither a string nor an object", () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const result = validateBin(123 as any);
		expect(result).toEqual(
			new Result(["the type should be `string` or `object`, not `number`"]),
		);
	});

	it("should return an error if the bin field is an array", () => {
		const result = validateBin(["./cli.js"]);
		expect(result).toEqual(
			new Result(["the type should be `string` or `object`, not `array`"]),
		);
	});

	it("should return a Result with an issue if the bin field is null", () => {
		const result = validateBin(null);
		expect(result).toEqual(
			new Result([
				"the value is `null`, but should be a `string` or an `object`",
			]),
		);
	});
});
