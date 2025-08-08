import { describe, expect, it } from "vitest";

import { validateType } from "./validateType.ts";

describe("validateType", () => {
	it.each(["commonjs", "module"])(
		"should return no errors for valid type '%s'",
		(type) => {
			expect(validateType(type)).toEqual([]);
		},
	);

	it("should return error if type is not a string (number)", () => {
		expect(validateType(123)).toEqual([
			"type should be a `string`, not `number`",
		]);
	});

	it("should return error if type is not a string (object)", () => {
		expect(validateType({})).toEqual([
			"type should be a `string`, not `object`",
		]);
	});

	it("should return error if type is not a string (array)", () => {
		expect(validateType([])).toEqual([
			"type should be a `string`, not `array`",
		]);
	});

	it("should return error if type is not a string (boolean)", () => {
		expect(validateType(true)).toEqual([
			"type should be a `string`, not `boolean`",
		]);
	});

	it("should return error if type is not a string (undefined)", () => {
		expect(validateType(undefined)).toEqual([
			"type should be a `string`, not `undefined`",
		]);
	});

	it("should return error if type is not a string (null)", () => {
		expect(validateType(null)).toEqual([
			"type is `null`, but should be a `string`",
		]);
	});

	it("should return error if type is an empty string", () => {
		expect(validateType("")).toEqual([
			"type is empty, but should be one of: commonjs, module",
		]);
	});

	it("should return error if type is whitespace only", () => {
		expect(validateType("   ")).toEqual([
			"type is empty, but should be one of: commonjs, module",
		]);
	});

	it("should return error if type is an invalid string", () => {
		expect(validateType("esm")).toEqual([
			'type "esm" is not valid. Valid types are: commonjs, module',
		]);
	});

	it("should return error if type is a valid type but with extra whitespace", () => {
		expect(validateType(" commonjs ")).toEqual([
			'type " commonjs " is not valid. Valid types are: commonjs, module',
		]);
	});

	it("should return error if type is a case-mismatched valid type", () => {
		expect(validateType("CommonJS")).toEqual([
			'type "CommonJS" is not valid. Valid types are: commonjs, module',
		]);
	});
});
