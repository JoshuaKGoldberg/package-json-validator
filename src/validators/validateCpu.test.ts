import { describe, expect, it } from "vitest";

import { validateCpu } from "./validateCpu.ts";

const VALID_ARCHS = [
	"arm",
	"arm64",
	"ia32",
	"loong64",
	"mips",
	"mipsel",
	"ppc64",
	"riscv64",
	"s390",
	"s390x",
	"x64",
];

describe(validateCpu, () => {
	it("should return no issues if the value is an empty array", () => {
		const result = validateCpu([]);

		expect(result.errorMessages).toEqual([]);
	});

	it("should return no issues if the value is an array with valid string values", () => {
		const result = validateCpu(VALID_ARCHS);

		expect(result.errorMessages).toEqual([]);
	});

	it("should return issues if the value is an array with invalid strings", () => {
		const result = validateCpu(["android", "y128"]);

		expect(result.errorMessages).toEqual([
			`the value "android" is not valid. Valid CPU values are: ${VALID_ARCHS.join(", ")}`,
			`the value "y128" is not valid. Valid CPU values are: ${VALID_ARCHS.join(", ")}`,
		]);
		expect(result.issues).toHaveLength(0);
		expect(result.childResults).toHaveLength(2);
		expect(result.childResults[0].issues).toHaveLength(1);
		expect(result.childResults[1].issues).toHaveLength(1);
	});

	it("should return child results with issues if the value is an array with some non-string values", () => {
		const result = validateCpu(["arm", null, "x64", 123]);

		expect(result.errorMessages).toEqual([
			"item at index 1 should be a string, not `null`",
			"item at index 3 should be a string, not `number`",
		]);
		expect(result.issues).toHaveLength(0);
		expect(result.childResults).toHaveLength(4);
		expect(result.childResults[0].issues).toEqual([]);
		expect(result.childResults[1].issues).toHaveLength(1);
		expect(result.childResults[2].issues).toEqual([]);
		expect(result.childResults[3].issues).toHaveLength(1);
	});

	it("should return child results with issues if the value is an array with non-empty strings", () => {
		const result = validateCpu(["", "arm", "", "x64"]);

		expect(result.errorMessages).toEqual([
			"item at index 0 is empty, but should be the name of a CPU architecture",
			"item at index 2 is empty, but should be the name of a CPU architecture",
		]);
		expect(result.issues).toHaveLength(0);
		expect(result.childResults).toHaveLength(4);
		expect(result.childResults[0].issues).toHaveLength(1);
		expect(result.childResults[1].issues).toEqual([]);
		expect(result.childResults[2].issues).toHaveLength(1);
		expect(result.childResults[3].issues).toEqual([]);
	});

	it("should return an issue if the value is a number", () => {
		const result = validateCpu(123);

		expect(result.errorMessages).toEqual([
			"the type should be `Array`, not `number`",
		]);
		expect(result.issues).toHaveLength(1);
	});

	it("should return an issue if the value is an object", () => {
		const result = validateCpu({});

		expect(result.errorMessages).toEqual([
			"the type should be `Array`, not `object`",
		]);
		expect(result.issues).toHaveLength(1);
	});

	it("should return an issue if the value is null", () => {
		const result = validateCpu(null);

		expect(result.errorMessages).toEqual([
			"the value is `null`, but should be an `Array` of strings",
		]);
		expect(result.issues).toHaveLength(1);
	});
});
