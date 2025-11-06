import { describe, expect, it } from "vitest";

import { validatePrivate } from "./validatePrivate.ts";

describe("validatePrivate", () => {
	it.each([true, false])(
		"should return no issues for boolean values '%s'",
		(type) => {
			const result = validatePrivate(type);
			expect(result.errorMessages).toEqual([]);
		},
	);

	it("should return an issue if type is not a boolean (number)", () => {
		const result = validatePrivate(123);

		expect(result.errorMessages).toEqual([
			"the type should be a `boolean`, not `number`",
		]);
	});

	it("should return error if type is not a boolean (object)", () => {
		const result = validatePrivate({});

		expect(result.errorMessages).toEqual([
			"the type should be a `boolean`, not `object`",
		]);
	});

	it("should return error if type is not a boolean (array)", () => {
		const result = validatePrivate([]);

		expect(result.errorMessages).toEqual([
			"the type should be a `boolean`, not `array`",
		]);
	});

	it("should return error if type is not a boolean (string)", () => {
		const result = validatePrivate("the fragile");

		expect(result.errorMessages).toEqual([
			"the type should be a `boolean`, not `string`",
		]);
	});

	it("should return error if type is a boolean string", () => {
		const result = validatePrivate("true");

		expect(result.errorMessages).toEqual([
			"the type should be a `boolean`, not `string`",
		]);
	});

	it("should return error if type is not a boolean (undefined)", () => {
		const result = validatePrivate(undefined);

		expect(result.errorMessages).toEqual([
			"the type should be a `boolean`, not `undefined`",
		]);
	});

	it("should return error if type is not a boolean (null)", () => {
		const result = validatePrivate(null);

		expect(result.errorMessages).toEqual([
			"the value is `null`, but should be a `boolean`",
		]);
	});
});
