import { describe, expect, it } from "vitest";

import { validateRepository } from "./validateRepository.ts";

describe(validateRepository, () => {
	it.each([
		"git+https://github.com/JoshuaKGoldberg/package-json-validator.git",
		"https://github.com/JoshuaKGoldberg/package-json-validator",
		"https://github.com/JoshuaKGoldberg/package-json-validator.git",
		"http://github.com/JoshuaKGoldberg/package-json-validator.git",
		"git://github.com/JoshuaKGoldberg/package-json-validator.git",
		"git://github.com/JoshuaKGoldberg/package-json-validator",
		"git@github.com:JoshuaKGoldberg/package-json-validator.git",
	])(
		"should return no issues if the value is a valid object (with directory) (%s)",
		(url) => {
			const result = validateRepository({
				directory: "packages/lib-a",
				type: "git",
				url,
			});
			expect(result.errorMessages).toEqual([]);
			expect(result.childResults).toHaveLength(3);
			result.childResults.forEach((childResult) => {
				expect(childResult.issues).toHaveLength(0);
			});
		},
	);

	it("should return no issues if the value is a valid object (without directory)", () => {
		const result = validateRepository({
			type: "git",
			url: "git+https://github.com/JoshuaKGoldberg/package-json-validator.git",
		});
		expect(result.errorMessages).toEqual([]);
		expect(result.childResults).toHaveLength(2);
		result.childResults.forEach((childResult) => {
			expect(childResult.issues).toHaveLength(0);
		});
	});

	it.each([
		"npm/example",
		"github:npm/example",
		"gist:11081aaa281",
		"bitbucket:user/repo",
		"gitlab:user/repo",
		// Names with hyphens and dots
		"github:some-user/some-repo",
		"github:user-name/repo-name",
		"some-user/some-repo",
		"user-name/repo.js",
		"bitbucket:my-org/my-repo",
		"gitlab:some.user/some.repo",
		"gist:abc-123",
	])(
		"should return no issues if the value is a shorthand string: %s",
		(value) => {
			const result = validateRepository(value);
			expect(result.errorMessages).toEqual([]);
		},
	);

	it.each([
		"svn:npm/example",
		"eslint-plugin-package-json",
		"git:npm/example",
		"github:npm/example/repo",
		"org/user/repo",
	])(
		"should return issues if the value is an invalid shorthand string: %s",
		(value) => {
			const result = validateRepository(value);
			expect(result.errorMessages).toEqual([
				`the value "${value}" is invalid; it should be the shorthand for a repository (e.g. "github:npm/example")`,
			]);
		},
	);

	it("should return an issue when the value is an empty string", () => {
		const result = validateRepository("");
		expect(result.errorMessages).toEqual([
			"the value is empty, but should be repository shorthand string",
		]);
		expect(result.issues).toHaveLength(1);
	});

	it("should return issues if the value is an object with empty property values", () => {
		const result = validateRepository({
			directory: "",
			type: "",
			url: "",
		});
		expect(result.issues).toHaveLength(0);
		expect(result.childResults).toHaveLength(3);
		[
			[
				`the value of property "directory" is empty, but should be the path to this package in the repository`,
			],
			[
				`the value of property "type" is empty, but should be the type of repository this is (e.g. "git")`,
			],
			[
				`the value of property "url" is invalid; it should be the url to a repository (e.g. "git+https://github.com/npm/cli.git")`,
			],
		].forEach((childErrors, i) => {
			expect(result.childResults[i].errorMessages).toEqual(childErrors);
		});
	});

	it("should return issues if the value is missing type and / or url", () => {
		const result = validateRepository({
			directory: "packages/lib-a",
		});
		expect(result.issues).toEqual([
			{
				message: `repository is missing property "type", which should be the type of repository this is (e.g. "git")`,
			},
			{
				message: `repository is missing property "url", which should be the url to a repository (e.g. "git+https://github.com/npm/cli.git")`,
			},
		]);
	});

	it("should return issues if the value is an object with empty string keys", () => {
		const result = validateRepository({
			"": "packages/lib-a",
			"  ": "git",
			"    ":
				"git+https://github.com/JoshuaKGoldberg/package-json-validator.git",
		});
		expect(result.issues).toEqual([
			{
				message: `repository is missing property "type", which should be the type of repository this is (e.g. "git")`,
			},
			{
				message: `repository is missing property "url", which should be the url to a repository (e.g. "git+https://github.com/npm/cli.git")`,
			},
		]);

		expect(result.childResults).toHaveLength(3);
		expect(result.childResults[0].errorMessages).toEqual([
			'property 0 is invalid; keys should be "type", "url", and optionally "directory"',
		]);
		expect(result.childResults[1].errorMessages).toEqual([
			'property 1 is invalid; keys should be "type", "url", and optionally "directory"',
		]);
		expect(result.childResults[2].errorMessages).toEqual([
			'property 2 is invalid; keys should be "type", "url", and optionally "directory"',
		]);
	});

	it("should return issues if the value is an object with some properties having non-string values", () => {
		const result = validateRepository({
			type: "git",
			url: 123,
		});
		expect(result.issues).toHaveLength(0);
		expect(result.childResults).toHaveLength(2);
		expect(result.childResults[0].errorMessages).toEqual([]);
		expect(result.childResults[1].errorMessages).toEqual([
			'the value of property "url" should be a string',
		]);
	});

	it("should return an issue if the value is neither an object nor a string", () => {
		const result = validateRepository(123);
		expect(result.issues).toHaveLength(1);
		expect(result.errorMessages).toEqual([
			"the type should be `object` or `string`, not `number`",
		]);
	});

	it("should return an issue if the value is an array", () => {
		const result = validateRepository([
			"git",
			"git+https://github.com/JoshuaKGoldberg/package-json-validator.git",
		]);
		expect(result.issues).toHaveLength(1);
		expect(result.errorMessages).toEqual([
			"the type should be `object` or `string`, not `Array`",
		]);
	});

	it("should return an issue if the value is null", () => {
		const result = validateRepository(null);
		expect(result.issues).toHaveLength(1);
		expect(result.errorMessages).toEqual([
			"the value is `null`, but should be an `object` or a `string`",
		]);
	});

	it("should return an issue if the value is undefined", () => {
		const result = validateRepository(undefined);
		expect(result.issues).toHaveLength(1);
		expect(result.errorMessages).toEqual([
			"the type should be `object` or `string`, not `undefined`",
		]);
	});
});
