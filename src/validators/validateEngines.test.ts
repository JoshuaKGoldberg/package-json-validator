import { describe, expect, it } from "vitest";

import { validateEngines } from "./validateEngines.ts";

describe(validateEngines, () => {
	it("should return no issues if the value is an empty object", () => {
		const result = validateEngines({});
		expect(result.errorMessages).toEqual([]);
	});

	it("should return no issues if the value is an object with all keys having valid string values", () => {
		const result = validateEngines({
			node: "^24.11.0",
			npm: "Please use pnpm",
			pnpm: "^10",
		});
		expect(result.errorMessages).toEqual([]);
		expect(result.issues).toHaveLength(0);
		expect(result.childResults).toHaveLength(3);
		result.childResults.forEach((childResult) => {
			expect(childResult.issues).toHaveLength(0);
		});
	});

	it("should return issues if the value is an object with some keys having invalid paths", () => {
		const result = validateEngines({
			node: "^24.11.0",
			npm: "      ",
			pnpm: "",
		});
		expect(result.errorMessages).toEqual([
			'the value of property "npm" is empty, but should be a semver range',
			'the value of property "pnpm" is empty, but should be a semver range',
		]);
		expect(result.issues).toHaveLength(0);
		expect(result.childResults).toHaveLength(3);
		expect(result.childResults[0].errorMessages).toEqual([]);
		expect(result.childResults[1].errorMessages).toEqual([
			'the value of property "npm" is empty, but should be a semver range',
		]);
		expect(result.childResults[2].errorMessages).toEqual([
			'the value of property "pnpm" is empty, but should be a semver range',
		]);
	});

	it("should return issues if the value is an object with an empty string key", () => {
		const result = validateEngines({
			"": "^24.11.0",
			"  ": "^10",
			"    ": "",
		});
		expect(result.errorMessages).toHaveLength(4);
		expect(result.issues).toHaveLength(0);
		expect(result.childResults).toHaveLength(3);
		expect(result.childResults[0].errorMessages).toEqual([
			"property 0 has an empty key, but should be a runtime or package manager",
		]);
		expect(result.childResults[1].errorMessages).toEqual([
			"property 1 has an empty key, but should be a runtime or package manager",
		]);
		expect(result.childResults[2].errorMessages).toEqual([
			"the value of property 2 is empty, but should be a semver range",
			"property 2 has an empty key, but should be a runtime or package manager",
		]);
	});

	it("should return issues if the value is an object with some keys having non-string values", () => {
		const result = validateEngines({
			node: "^24.11.0",
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			npm: 123 as any,
		});
		expect(result.issues).toHaveLength(0);
		expect(result.childResults).toHaveLength(2);
		expect(result.childResults[0].errorMessages).toEqual([]);
		expect(result.childResults[1].errorMessages).toEqual([
			'the value of property "npm" should be a string',
		]);
	});

	it("should return an issue if the value is neither a string nor an object", () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const result = validateEngines(123 as any);
		expect(result.issues).toHaveLength(1);
		expect(result.errorMessages).toEqual([
			"the type should be `object`, not `number`",
		]);
	});

	it("should return an issue if the value is an array", () => {
		const result = validateEngines(["node"]);
		expect(result.issues).toHaveLength(1);
		expect(result.errorMessages).toEqual([
			"the type should be `object`, not `Array`",
		]);
	});

	it("should return an issue if the value is a string", () => {
		const result = validateEngines("node");
		expect(result.issues).toHaveLength(1);
		expect(result.errorMessages).toEqual([
			"the type should be `object`, not `string`",
		]);
	});

	it("should return an issue if the value is null", () => {
		const result = validateEngines(null);
		expect(result.issues).toHaveLength(1);
		expect(result.errorMessages).toEqual([
			"the value is `null`, but should be an `object`",
		]);
	});

	it("should return an issue if the value is undefined", () => {
		const result = validateEngines(undefined);
		expect(result.issues).toHaveLength(1);
		expect(result.errorMessages).toEqual([
			"the type should be `object`, not `undefined`",
		]);
	});
});
