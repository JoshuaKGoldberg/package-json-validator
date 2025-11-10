import { describe, expect, it } from "vitest";

import { validateType } from "./validateType.ts";

describe(validateType, () => {
	it.each(["commonjs", "module"])(
		"should return no issues for valid type '%s'",
		(type) => {
			expect(validateType(type).errorMessages).toEqual([]);
		},
	);

	it("should return an issue if type is not a string (number)", () => {
		const result = validateType(123);

		expect(result.errorMessages).toEqual([
			"the type should be a `string`, not `number`",
		]);
	});

	it("should return error if type is not a string (object)", () => {
		const result = validateType({});

		expect(result.errorMessages).toEqual([
			"the type should be a `string`, not `object`",
		]);
	});

	it("should return error if type is not a string (array)", () => {
		const result = validateType([]);

		expect(result.errorMessages).toEqual([
			"the type should be a `string`, not `array`",
		]);
	});

	it("should return error if type is not a string (boolean)", () => {
		const result = validateType(true);

		expect(result.errorMessages).toEqual([
			"the type should be a `string`, not `boolean`",
		]);
	});

	it("should return error if type is not a string (undefined)", () => {
		const result = validateType(undefined);

		expect(result.errorMessages).toEqual([
			"the type should be a `string`, not `undefined`",
		]);
	});

	it("should return error if type is not a string (null)", () => {
		const result = validateType(null);

		expect(result.errorMessages).toEqual([
			"the value is `null`, but should be a `string`",
		]);
	});

	it("should return error if type is an empty string", () => {
		const result = validateType("");

		expect(result.errorMessages).toEqual([
			"the value is empty, but should be one of: commonjs, module",
		]);
	});

	it("should return error if type is whitespace only", () => {
		const result = validateType("   ");

		expect(result.errorMessages).toEqual([
			"the value is empty, but should be one of: commonjs, module",
		]);
	});

	it("should return error if type is an invalid string", () => {
		const result = validateType("esm");

		expect(result.errorMessages).toEqual([
			'the value "esm" is not valid. Valid types are: commonjs, module',
		]);
	});

	it("should return error if type is a valid type but with extra whitespace", () => {
		const result = validateType(" commonjs ");

		expect(result.errorMessages).toEqual([
			'the value " commonjs " is not valid. Valid types are: commonjs, module',
		]);
	});

	it("should return error if type is a case-mismatched valid type", () => {
		const result = validateType("CommonJS");

		expect(result.errorMessages).toEqual([
			'the value "CommonJS" is not valid. Valid types are: commonjs, module',
		]);
	});
});
