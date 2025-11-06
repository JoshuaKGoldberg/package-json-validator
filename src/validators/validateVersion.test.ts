import { describe, expect, it } from "vitest";

import { validateVersion } from "./validateVersion.ts";

describe("validateVersion", () => {
	it.each([
		"1.2.3",
		"1.2.3-beta.0",
		"0.0.0-experimental-2f0e7e57-20250715",
		"0.0.0",
		"1.2.3-rc.1+rev.2",
	])("should return no issues for valid version '%s'", (version) => {
		expect(validateVersion(version).errorMessages).toEqual([]);
	});

	it("should return an issue if the value is not a string (number)", () => {
		const result = validateVersion(123);

		expect(result.errorMessages).toEqual([
			"the type should be a `string`, not `number`",
		]);
	});

	it("should return an issue if the value is not a string (object)", () => {
		const result = validateVersion({});

		expect(result.errorMessages).toEqual([
			"the type should be a `string`, not `object`",
		]);
	});

	it("should return an issue if the value is not a string (array)", () => {
		const result = validateVersion([]);

		expect(result.errorMessages).toEqual([
			"the type should be a `string`, not `Array`",
		]);
	});

	it("should return an issue if value is not a string (boolean)", () => {
		const result = validateVersion(true);

		expect(result.errorMessages).toEqual([
			"the type should be a `string`, not `boolean`",
		]);
	});

	it("should return an issue if value is not a string (undefined)", () => {
		const result = validateVersion(undefined);

		expect(result.errorMessages).toEqual([
			"the type should be a `string`, not `undefined`",
		]);
	});

	it("should return an issue if value is not a string (null)", () => {
		const result = validateVersion(null);

		expect(result.errorMessages).toEqual([
			"the value is `null`, but should be a `string`",
		]);
	});

	it("should return an issue if the value is an empty string", () => {
		const result = validateVersion("");

		expect(result.errorMessages).toEqual([
			"the value is empty, but should be a valid version",
		]);
	});

	it("should return an issue if the value is whitespace only", () => {
		const result = validateVersion("   ");

		expect(result.errorMessages).toEqual([
			"the value is empty, but should be a valid version",
		]);
	});

	it.each(["^1.2.3", "~1.2.3", "invalid", "1.2.3.4.5-alpha2", "1.2", "1"])(
		"should return an issue for invalid version '%s'",
		(version) => {
			const result = validateVersion(version);

			expect(result.errorMessages).toEqual([
				"the value is not a valid semver version",
			]);
		},
	);
});
