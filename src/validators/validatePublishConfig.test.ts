import { describe, expect, it } from "vitest";

import { validatePublishConfig } from "./validatePublishConfig.ts";

describe(validatePublishConfig, () => {
	it("should return no issues if the value is an empty object", () => {
		const result = validatePublishConfig({});
		expect(result.errorMessages).toEqual([]);
	});

	it("should return no issues if the value is an object with no known properties", () => {
		const result = validatePublishConfig({
			debug: true,
			host: "localhost",
			port: 8080,
		});
		expect(result.errorMessages).toEqual([]);
		expect(result.childResults).toHaveLength(3);
	});

	it.each([
		{
			access: "restricted",
			bin: "./bin/cli.js",
			cpu: ["arm64", "x64"],
			directory: "dist",
			exports: {
				".": "./dist/index.js",
				"./secondary": "./dist/secondary.js",
			},
			main: "./dist/index.js",
			provenance: true,
			tag: "dev",
		},
		{
			access: null,
			cpu: [],
			exports: "./dist/index.js",
		},
	])(
		"should return no issues if the value is an object with known properties (%0)",
		(input) => {
			const result = validatePublishConfig(input);
			expect(result.errorMessages).toEqual([]);
		},
	);

	it.each([
		[
			{
				access: "not right",
				bin: "",
				cpu: ["", "   "],
				directory: "",
				exports: {
					"": "./dist/index.js",
					"./secondary": "",
				},
				main: "",
				provenance: null,
				tag: "",
			},
			[
				'the value "not right" is not valid. Valid types are: public, restricted',
				"the value is empty, but should be a relative path",
				"item at index 0 is empty, but should be the name of a CPU architecture",
				"item at index 1 is empty, but should be the name of a CPU architecture",
				"the value is empty, but should be the path to a subdirectory",
				"property 0 has an empty key, but should be an export condition",
				'the value of "./secondary" is empty, but should be an entry point path',
				"the value is empty, but should be the path to the package's main module",
				"the value is `null`, but should be a `boolean`",
				"the value is empty, but should be a release tag",
			],
		],
		[
			{
				access: "",
				bin: 123,
				cpu: 123,
				directory: 123,
				exports: {
					"": 123,
					"./secondary": null,
				},
				main: 123,
				provenance: 123,
				tag: 123,
			},
			[
				'the value is empty, but should be "public" or "restricted"',
				"the type should be `string` or `object`, not `number`",
				"the type should be `Array`, not `number`",
				"the type should be a `string`, not `number`",
				"the value of property 0 should be either an entry point path or an object of export conditions",
				"property 0 has an empty key, but should be an export condition",
				'the value of "./secondary" should be either an entry point path or an object of export conditions',
				"the type should be a `string`, not `number`",
				"the type should be a `boolean`, not `number`",
				"the type should be a `string`, not `number`",
			],
		],
		[
			{
				access: "",
				bin: 123,
				cpu: 123,
				directory: 123,
				exports: {
					"": 123,
					"./secondary": null,
				},
				main: 123,
				provenance: 123,
				tag: 123,
			},
			[
				'the value is empty, but should be "public" or "restricted"',
				"the type should be `string` or `object`, not `number`",
				"the type should be `Array`, not `number`",
				"the type should be a `string`, not `number`",
				"the value of property 0 should be either an entry point path or an object of export conditions",
				"property 0 has an empty key, but should be an export condition",
				'the value of "./secondary" should be either an entry point path or an object of export conditions',
				"the type should be a `string`, not `number`",
				"the type should be a `boolean`, not `number`",
				"the type should be a `string`, not `number`",
			],
		],
		[
			{
				access: undefined,
				bin: null,
				cpu: undefined,
				directory: null,
				exports: 123,
				main: undefined,
				provenance: undefined,
				tag: undefined,
			},
			[
				"the type should be a `string`, not `undefined`",
				"the value is `null`, but should be a `string` or an `object`",
				"the value is `null`, but should be an `Array` of strings",
				"the value is `null`, but should be a `string`",
				"the type should be `object` or `string`, not `number`",
				"the type should be a `string`, not `undefined`",
				"the type should be a `boolean`, not `undefined`",
				"the type should be a `string`, not `undefined`",
			],
		],
		[
			{
				access: [],
				directory: [],
				provenance: [],
				tag: [],
			},
			[
				"the type should be a `string`, not `Array`",
				"the type should be a `string`, not `Array`",
				"the type should be a `boolean`, not `Array`",
				"the type should be a `string`, not `Array`",
			],
		],
	])(
		"should return issues if known properties don't pass validation ($1)",
		(input, expected) => {
			const result = validatePublishConfig(input);
			expect(result.errorMessages).toEqual(expected);
		},
	);

	it("should return issues if the value is an array", () => {
		const result = validatePublishConfig(["array", "of", "values"]);
		expect(result.errorMessages).toEqual([
			"the type should be `object`, not `Array`",
		]);
	});

	it("should return issues if the value is null", () => {
		const result = validatePublishConfig(null);
		expect(result.errorMessages).toEqual([
			"the value is `null`, but should be an `object`",
		]);
	});

	it("should return issues if the value is a string", () => {
		const result = validatePublishConfig("string");
		expect(result.errorMessages).toEqual([
			"the type should be `object`, not `string`",
		]);
	});
});
