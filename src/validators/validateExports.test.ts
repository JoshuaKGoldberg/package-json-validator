/* eslint-disable perfectionist/sort-objects */
import { describe, expect, it } from "vitest";

import { ChildResult, Result } from "../Result.ts";
import { validateExports } from "./validateExports.ts";

describe("validateExports", () => {
	it("should return no issues if the value is an empty object", () => {
		const result = validateExports({});
		expect(result).toEqual(new Result());
	});

	it("should return no issues if the value is a valid string", () => {
		const result = validateExports("./index.js");
		expect(result).toEqual(new Result());
	});

	it("should return no issues if the value is a valid object with all keys having valid strings", () => {
		const result = validateExports({
			".": "./index.js",
			"./secondary": "./secondary.js",
			"./tertiary": "./tertiary.js",
		});
		expect(result.errorMessages).toEqual([]);
		expect(result.childResults).toHaveLength(3);
	});

	it("should return no issues if the value is a valid object with one level of nesting", () => {
		const result = validateExports({
			".": {
				types: "./index.d.mts",
				import: "./index.mjs",
				require: "./index.cjs",
			},
			"./secondary": {
				types: "./index.d.mts",
				import: "./index.mjs",
				require: "./index.cjs",
			},
			"./tertiary": "./tertiary.js",
		});
		expect(result.errorMessages).toEqual([]);
		expect(result.childResults).toHaveLength(3);
	});

	it("should return no issues if the value is a valid object with multiple levels of nesting", () => {
		const result = validateExports({
			".": {
				import: {
					types: "./index.d.mts",
					default: "./index.mjs",
				},
				require: {
					types: "./index.d.cts",
					default: "./index.cjs",
				},
			},
			"./secondary": {
				types: "./index.d.mts",
				import: "./index.mjs",
				require: "./index.cjs",
			},
			"./tertiary": "./tertiary.js",
		});
		expect(result.errorMessages).toEqual([]);
		expect(result.childResults).toHaveLength(3);
	});

	it("should return issues if the value is an object with some properties having invalid string", () => {
		const result = validateExports({
			".": "./index.js",
			"./secondary": "",
			"./tertiary": "    ",
		});
		expect(result.errorMessages).toEqual([
			'the value of "./secondary" is empty, but should be an entry point path',
			'the value of "./tertiary" is empty, but should be an entry point path',
		]);
		expect(result).toEqual(
			new Result(
				[],
				[
					new ChildResult(0),
					new ChildResult(1, [
						'the value of "./secondary" is empty, but should be an entry point path',
					]),
					new ChildResult(2, [
						'the value of "./tertiary" is empty, but should be an entry point path',
					]),
				],
			),
		);
	});

	it("should return issues if the value is an object with empty string keys", () => {
		const result = validateExports({
			"": "./index.js",
			"  ": "./secondary.ks",
			"    ": "",
		});
		expect(result.errorMessages).toEqual([
			"property 0 has an empty key, but should be an export condition",
			"property 1 has an empty key, but should be an export condition",
			"the value of property 2 is empty, but should be an entry point path",
			"property 2 has an empty key, but should be an export condition",
		]);
		expect(result).toEqual(
			new Result(
				[],
				[
					new ChildResult(0, [
						"property 0 has an empty key, but should be an export condition",
					]),
					new ChildResult(1, [
						"property 1 has an empty key, but should be an export condition",
					]),
					new ChildResult(2, [
						"the value of property 2 is empty, but should be an entry point path",
						"property 2 has an empty key, but should be an export condition",
					]),
				],
			),
		);
	});

	it("should return issues if the value is an object with some keys having invalid values", () => {
		const result = validateExports({
			".": "./index.js",
			"invalid-number": 123,
			"invalid-null": null,
			"invalid-array": [],
		});
		expect(result.errorMessages).toEqual([
			'the value of "invalid-number" should be either an entry point path or an object of export conditions',
			'the value of "invalid-null" should be either an entry point path or an object of export conditions',
			'the value of "invalid-array" should be either an entry point path or an object of export conditions',
		]);
		expect(result).toEqual(
			new Result(
				[],
				[
					new ChildResult(0),
					new ChildResult(1, [
						'the value of "invalid-number" should be either an entry point path or an object of export conditions',
					]),
					new ChildResult(2, [
						'the value of "invalid-null" should be either an entry point path or an object of export conditions',
					]),
					new ChildResult(3, [
						'the value of "invalid-array" should be either an entry point path or an object of export conditions',
					]),
				],
			),
		);
	});

	it("should return an issue if the value is an empty string", () => {
		const result = validateExports("");
		expect(result.errorMessages).toEqual([
			"the value is empty, but should be an entry point path",
		]);
		expect(result.issues).toHaveLength(1);
	});

	it("should return an issue if the value is neither a string nor an object", () => {
		const result = validateExports(123);
		expect(result.errorMessages).toEqual([
			"the type should be `object` or `string`, not `number`",
		]);
		expect(result.issues).toHaveLength(1);
	});

	it("should return an issue if the scripts field is an array", () => {
		const result = validateExports(["./index.js", "./secondary.js"]);
		expect(result.errorMessages).toEqual([
			"the type should be `object` or `string`, not `Array`",
		]);
		expect(result.issues).toHaveLength(1);
	});

	it("should return an issue if the scripts field is null", () => {
		const result = validateExports(null);
		expect(result.errorMessages).toEqual([
			"the value is `null`, but should be an `object` or `string`",
		]);
		expect(result.issues).toHaveLength(1);
	});
});
/* eslint-enable perfectionist/sort-objects */
