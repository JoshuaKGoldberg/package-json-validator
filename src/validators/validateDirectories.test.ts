import { describe, expect, it } from "vitest";

import { ChildResult, Result } from "../Result.ts";
import { validateDirectories } from "./validateDirectories.ts";

describe("validateDirectories", () => {
	it("should return no issues if the value is an empty object", () => {
		const result = validateDirectories({});
		expect(result).toEqual(new Result());
	});

	it("should return no issues if the value is a valid object with all keys having valid strings", () => {
		const result = validateDirectories({
			bin: "dist/bin",
			man: "docs",
		});
		expect(result).toEqual(new Result());
	});

	it("should return issues if the value is an object with some keys having invalid scripts", () => {
		const result = validateDirectories({
			bin: "dist/bin",
			man: "",
			test: "    ",
		});
		expect(result).toEqual(
			new Result(
				[],
				[
					new ChildResult(0),
					new ChildResult(1, [
						'the value of property "man" is empty, but should be a path to a directory',
					]),
					new ChildResult(2, [
						'the value of property "test" is empty, but should be a path to a directory',
					]),
				],
			),
		);
	});

	it("should return issues if the value is an object with an empty string keys", () => {
		const result = validateDirectories({
			"": "dist/bin",
			"  ": "docs",
			"    ": "",
		});
		expect(result).toEqual(
			new Result(
				[],
				[
					new ChildResult(0, [
						"property 0 has an empty key, but should be a path to a directory",
					]),
					new ChildResult(1, [
						"property 1 has an empty key, but should be a path to a directory",
					]),
					new ChildResult(2, [
						"the value of property 2 is empty, but should be a path to a directory",
						"property 2 has an empty key, but should be a path to a directory",
					]),
				],
			),
		);
	});

	it("should return issues if the value is an object with some keys having non-string values", () => {
		const result = validateDirectories({
			bin: "dist/bin",
			invalid: 123,
		});
		expect(result).toEqual(
			new Result(
				[],
				[
					new ChildResult(0),
					new ChildResult(1, [
						'the value of property "invalid" should be a string',
					]),
				],
			),
		);
	});

	it("should return an issue if the value is neither a string nor an object", () => {
		const result = validateDirectories(123);
		expect(result).toEqual(
			new Result(["the type should be `object`, not `number`"]),
		);
	});

	it("should return an issue if the value is an array", () => {
		const result = validateDirectories(["dist/bin", "docs"]);
		expect(result).toEqual(
			new Result(["the type should be `object`, not `array`"]),
		);
	});

	it("should return an issue if the value is null", () => {
		const result = validateDirectories(null);
		expect(result).toEqual(
			new Result(["the field is `null`, but should be an `object`"]),
		);
	});
});
