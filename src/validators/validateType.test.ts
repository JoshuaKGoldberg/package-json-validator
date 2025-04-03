import { describe, expect, it } from "vitest";

import type { FieldSpec } from "../types";

import { validateType } from "./validateType";

describe("validateType", () => {
	it("should return an empty array if no type or types are defined", () => {
		const field = {} satisfies FieldSpec;
		const result = validateType("testField", field, "testValue");
		expect(result).toEqual([]);
	});

	it("should validate a single type correctly", () => {
		const field = { type: "string" } satisfies FieldSpec;
		const result = validateType("testField", field, "testValue");
		expect(result).toEqual([]);
	});

	it("should return an error if the value does not match the single type", () => {
		const field = { type: "string" } satisfies FieldSpec;
		const result = validateType("testField", field, true);
		expect(result).toEqual([
			"Type for field testField was expected to be string, not boolean",
		]);
	});

	it("should validate multiple types correctly", () => {
		const field = { types: ["string", "boolean"] } satisfies FieldSpec;
		const result1 = validateType("testField", field, "testValue");
		const result2 = validateType("testField", field, true);
		expect(result1).toEqual([]);
		expect(result2).toEqual([]);
	});

	it("should return an error if the value does not match any of the multiple types", () => {
		const field = { types: ["string", "boolean"] } satisfies FieldSpec;
		const result = validateType("testField", field, {});
		expect(result).toEqual([
			"Type for field testField was expected to be string or boolean, not object",
		]);
	});

	it("should validate array type correctly", () => {
		const field = { type: "array" } satisfies FieldSpec;
		const result = validateType("testField", field, []);
		expect(result).toEqual([]);
	});

	it("should return an error if the value does not match the array type", () => {
		const field = { type: "array" } satisfies FieldSpec;
		const result = validateType("testField", field, "notAnArray");
		expect(result).toEqual([
			"Type for field testField was expected to be array, not string",
		]);
	});

	it("should validate boolean type correctly", () => {
		const field = { type: "boolean" } satisfies FieldSpec;
		const result = validateType("testField", field, true);
		expect(result).toEqual([]);
	});

	it("should return an error if the value does not match the boolean type", () => {
		const field = { type: "boolean" } satisfies FieldSpec;
		const result = validateType("testField", field, "notABoolean");
		expect(result).toEqual([
			"Type for field testField was expected to be boolean, not string",
		]);
	});

	it("should validate object type correctly", () => {
		const field = { type: "object" } satisfies FieldSpec;
		const result = validateType("testField", field, {});
		expect(result).toEqual([]);
	});

	it("should return an error if the value does not match the object type", () => {
		const field = { type: "object" } satisfies FieldSpec;
		const result = validateType("testField", field, "notAnObject");
		expect(result).toEqual([
			"Type for field testField was expected to be object, not string",
		]);
	});
});
