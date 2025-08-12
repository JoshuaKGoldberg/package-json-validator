/* eslint-disable perfectionist/sort-objects */
import { describe, expect, it } from "vitest";

import { validateExports } from "./validateExports.ts";

describe("validateExports", () => {
	it("should return no errors if the value is an empty object", () => {
		const result = validateExports({});
		expect(result).toEqual([]);
	});

	it("should return no errors if the value is a valid string", () => {
		const result = validateExports("./index.js");
		expect(result).toEqual([]);
	});

	it("should return no errors if the value is a valid object with all keys having valid strings", () => {
		const result = validateExports({
			".": "./index.js",
			"./secondary": "./secondary.js",
			"./tertiary": "./tertiary.js",
		});
		expect(result).toEqual([]);
	});

	it("should return no errors if the value is a valid object with one level of nesting", () => {
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
		expect(result).toEqual([]);
	});

	it("should return no errors if the value is a valid object with multiple levels of nesting", () => {
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
		expect(result).toEqual([]);
	});

	it("should return errors if the value is an object with some properties having invalid string", () => {
		const result = validateExports({
			".": "./index.js",
			"./secondary": "",
			"./tertiary": "    ",
		});
		expect(result).toEqual([
			'the value of "./secondary" is empty, but should be an entry point path',
			'the value of "./tertiary" is empty, but should be an entry point path',
		]);
	});

	it("should return an error if the value is an object with an empty string key", () => {
		const result = validateExports({
			"": "./index.js",
			"  ": "./secondary.ks",
			"    ": "",
		});
		expect(result).toEqual([
			"property 0 has an empty key, but should be an export condition",
			"property 1 has an empty key, but should be an export condition",
			"property 2 has an empty key, but should be an export condition",
			"the value of property 2 is empty, but should be an entry point path",
		]);
	});

	it("should return errors if the value is an object with some keys having invalid values", () => {
		const result = validateExports({
			".": "./index.js",
			"invalid-number": 123,
			"invalid-null": null,
			"invalid-array": [],
		});
		expect(result).toEqual([
			'the value of "invalid-number" should be either an entry point path or an object of export conditions',
			'the value of "invalid-null" should be either an entry point path or an object of export conditions',
			'the value of "invalid-array" should be either an entry point path or an object of export conditions',
		]);
	});

	it("should return an error if the value is an empty string", () => {
		const result = validateExports("");
		expect(result).toEqual([
			"the value is empty, but should be an entry point path",
		]);
	});

	it("should return an error if the value is neither a string nor an object", () => {
		const result = validateExports(123);
		expect(result).toEqual([
			"the type should be `object` or `string`, not `number`",
		]);
	});

	it("should return an error if the scripts field is an array", () => {
		const result = validateExports(["./index.js", "./secondary.js"]);
		expect(result).toEqual([
			"the type should be `object` or `string`, not `Array`",
		]);
	});

	it("should return an error if the scripts field is null", () => {
		const result = validateExports(null);
		expect(result).toEqual([
			"the field is `null`, but should be an `object` or `string`",
		]);
	});
});
/* eslint-enable perfectionist/sort-objects */
