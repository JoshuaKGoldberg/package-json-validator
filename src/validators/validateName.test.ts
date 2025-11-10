import { describe, expect, it } from "vitest";

import { validateName } from "./validateName.ts";

describe(validateName, () => {
	it.each([
		"some-package",
		"example.com",
		"under_score",
		"123numeric",
		"@scope/name",
		"@scope/with.dot",
	])("should return no issues for valid name '%s'", (license) => {
		expect(validateName(license).errorMessages).toEqual([]);
	});

	it("should return an issue if the value is not a string (number)", () => {
		const result = validateName(123);
		expect(result.errorMessages).toEqual([
			"the type should be a `string`, not `number`",
		]);
		expect(result.issues).toHaveLength(1);
	});

	it("should return an issue if the value is not a string (object)", () => {
		const result = validateName({});
		expect(result.errorMessages).toEqual([
			"the type should be a `string`, not `object`",
		]);
		expect(result.issues).toHaveLength(1);
	});

	it("should return an issue if the value is not a string (array)", () => {
		const result = validateName([]);
		expect(result.errorMessages).toEqual([
			"the type should be a `string`, not `Array`",
		]);
		expect(result.issues).toHaveLength(1);
	});

	it("should return an issue if value is not a string (boolean)", () => {
		const result = validateName(true);
		expect(result.errorMessages).toEqual([
			"the type should be a `string`, not `boolean`",
		]);
		expect(result.issues).toHaveLength(1);
	});

	it("should return an issue if value is not a string (undefined)", () => {
		const result = validateName(undefined);
		expect(result.errorMessages).toEqual([
			"the type should be a `string`, not `undefined`",
		]);
		expect(result.issues).toHaveLength(1);
	});

	it("should return an issue if value is not a string (null)", () => {
		const result = validateName(null);
		expect(result.errorMessages).toEqual([
			"the value is `null`, but should be a `string`",
		]);
		expect(result.issues).toHaveLength(1);
	});

	it("should return an issue if the value is an empty string", () => {
		const result = validateName("");
		expect(result.errorMessages).toEqual([
			"the value is empty, but should be a valid name",
		]);
		expect(result.issues).toHaveLength(1);
	});

	it("should return an issue if the value is whitespace only", () => {
		const result = validateName("   ");
		expect(result.errorMessages).toEqual([
			"the value is empty, but should be a valid name",
		]);
		expect(result.issues).toHaveLength(1);
	});

	it.each([
		["excited!", [`name can no longer contain special characters ("~'!()*")`]],
		[
			" leading-space:and:weirdchars",
			[
				"name cannot contain leading or trailing spaces",
				"name can only contain URL-friendly characters",
			],
		],
		[
			"eLaBorAtE-paCkAgE-with-mixed-case-and-more-than-214-characters-----------------------------------------------------------------------------------------------------------------------------------------------------------",
			[
				"name can no longer contain more than 214 characters",
				"name can no longer contain capital letters",
			],
		],
	])(
		"should return an issue if the value is an invalid name (%s)",
		(input, expected) => {
			const result = validateName(input);
			expect(result.errorMessages).toEqual(expected);
		},
	);
});
