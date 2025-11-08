import { describe, expect, it } from "vitest";

import { validateWorkspaces } from "./validateWorkspaces.ts";

describe("validateWorkspaces", () => {
	it("should return no issues if the value is an empty array", () => {
		const result = validateWorkspaces([]);

		expect(result.errorMessages).toEqual([]);
	});

	it("should return no issues if the value is a valid array with all strings", () => {
		const result = validateWorkspaces([
			"app",
			"./packages/a",
			"./packages/b",
			"./tools/*",
		]);

		expect(result.errorMessages).toEqual([]);
		expect(result.childResults).toHaveLength(4);
	});

	it("should return issues if the value is an array with some non-string values", () => {
		const result = validateWorkspaces([
			"app",
			null,
			"./packages/*",
			123,
			undefined,
			[],
		]);

		expect(result.errorMessages).toEqual([
			"item at index 1 should be a string, not `null`",
			"item at index 3 should be a string, not `number`",
			"item at index 4 should be a string, not `undefined`",
			"item at index 5 should be a string, not `Array`",
		]);
		expect(result.issues).toHaveLength(0);
		expect(result.childResults).toHaveLength(6);
		expect(result.childResults[0].issues).toEqual([]);
		expect(result.childResults[1].issues).toHaveLength(1);
		expect(result.childResults[2].issues).toEqual([]);
		expect(result.childResults[3].issues).toHaveLength(1);
		expect(result.childResults[4].issues).toHaveLength(1);
		expect(result.childResults[5].issues).toHaveLength(1);
	});

	it("should return issues if the value is an array with non-empty strings", () => {
		const result = validateWorkspaces(["", "app", "", "./packages/*"]);

		expect(result.errorMessages).toEqual([
			"item at index 0 is empty, but should be a file path or glob pattern",
			"item at index 2 is empty, but should be a file path or glob pattern",
		]);
		expect(result.issues).toHaveLength(0);
		expect(result.childResults).toHaveLength(4);
		expect(result.childResults[0].issues).toHaveLength(1);
		expect(result.childResults[1].issues).toEqual([]);
		expect(result.childResults[2].issues).toHaveLength(1);
		expect(result.childResults[3].issues).toEqual([]);
	});

	it("should return an issue if the value is a number", () => {
		const result = validateWorkspaces(123);

		expect(result.errorMessages).toEqual([
			"the type should be `Array`, not `number`",
		]);
		expect(result.issues).toHaveLength(1);
	});

	it("should return an issue if the value is an object", () => {
		const result = validateWorkspaces({});

		expect(result.errorMessages).toEqual([
			"the type should be `Array`, not `object`",
		]);
		expect(result.issues).toHaveLength(1);
	});

	it("should return an issue if the value is null", () => {
		const result = validateWorkspaces(null);

		expect(result.errorMessages).toEqual([
			"the value is `null`, but should be an `Array` of strings",
		]);
		expect(result.issues).toHaveLength(1);
	});
});
