import { describe, expect, it } from "vitest";

import { validateDependencies } from "./validateDependencies.ts";

describe("validateDependencies", () => {
	it("should return no errors if the value is an empty object", () => {
		const result = validateDependencies({});
		expect(result.errorMessages).toEqual([]);
	});

	it("should validate dependencies with no issues", () => {
		const dependencies = {
			"@package/package": "workspace:@package/package@*",
			"@types/org__package": "workspace:@org/types___org__package@1",
			"absolute-path-without-protocol": "/absolute/path",
			"caret-first": "^1.0.0",
			"caret-top": "^1",
			"catalog-named-package": "catalog:react19",
			"catalog-package": "catalog:",
			empty: "",
			gt: ">1.2.3",
			gteq: ">=1.2.3",
			"jsr-package": "jsr:^1.0.0",
			"jsr-package-exact": "jsr:1.0.0",
			"jsr-scoped-package": "jsr:@valibot/valibot@^1.0.0",
			lt: "<1.2.3",
			lteq: "<=1.2.3",
			patch: "patch:some-package@^1.2.3",
			range: "1.2.3 - 2.3.4",
			relative: "file:../relative/path",
			"relative-parent-without-protocol": "../relative/path",
			"relative-subdir-without-protocol": "./relative/path",
			"relative-tilde-without-protocol": "~/path",
			star: "*",
			"svgo-v1": "npm:svgo@1.3.2",
			"svgo-v2": "npm:svgo@2.0.3",
			"tilde-first": "~1.2",
			"tilde-top": "~1",
			url: "https://github.com/JoshuaKGoldberg/package-json-validator",
			"verion-build": "1.2.3+build2012",
			"workspace-gt-version": "workspace:>1.2.3",
			"workspace-package-any": "workspace:*",
			"workspace-package-caret": "workspace:^",
			"workspace-package-no-range": "workspace:",
			"workspace-package-tilde-version": "workspace:~1.2.3",
			"workspace-pre-release": "workspace:1.2.3-rc.1",
			"x-version": "1.2.x",
			// reference: https://github.com/JoshuaKGoldberg/package-json-validator/issues/49
			"@reactivex/rxjs": "^5.0.0-alpha.7",
			"git-https-reference": "git+https://isaacs@github.com/npm/cli.git",
			"git-reference": "git://github.com/npm/cli.git#v1.0.27",
			"git-ssh-reference": "git+ssh://git@github.com:npm/cli#semver:^5.0",
			"github-reference": "github:some/package",
			"github-reference-no-protocol": "some/package",
			"github-reference-with-hash": "some/package#feature/branch",
		};

		const result = validateDependencies(dependencies);
		expect(result.errorMessages).toEqual([]);
		expect(result.issues).toEqual([]);
		expect(result.childResults).toHaveLength(
			Object.entries(dependencies).length,
		);
		result.childResults.forEach((child) => {
			expect(child.issues).toEqual([]);
		});
	});

	it("should only validate the package name for published-looking versions", () => {
		const publishedDependencies = {
			"_caret-first": "^1.0.0",
			"_catalog-named-package": "catalog:react19",
			"_catalog-package": "catalog:",
			_empty: "",
			_gt: ">1.2.3",
			_gteq: ">=1.2.3",
			"_jsr-package": "jsr:^1.0.0",
			"_jsr-package-exact": "jsr:1.0.0",
			"_jsr-scoped-package": "jsr:@valibot/valibot@^1.0.0",
			_lt: "<1.2.3",
			_lteq: "<=1.2.3",
			_range: "1.2.3 - 2.3.4",
			_star: "*",
			"_tilde-first": "~1.2",
			"_tilde-top": "~1",
			"_verion-build": "1.2.3+build2012",
			"_x-version": "1.2.x",
		};
		const unpublishedDependencies = {
			"_absolute-path-without-protocol": "/absolute/path",
			"_git-https-reference": "git+https://isaacs@github.com/npm/cli.git",
			"_git-reference": "git://github.com/npm/cli.git#v1.0.27",
			"_git-ssh-reference": "git+ssh://git@github.com:npm/cli#semver:^5.0",
			"_github-reference": "github:some/package",
			"_github-reference-no-protocol": "some/package",
			"_github-reference-with-hash": "some/package#feature/branch",
			_patch: "patch:some-package@^1.2.3",
			_relative: "file:../relative/path",
			"_relative-parent-without-protocol": "../relative/path",
			"_relative-subdir-without-protocol": "./relative/path",
			"_relative-tilde-without-protocol": "~/path",
			"_svgo-v1": "npm:svgo@1.3.2",
			"_svgo-v2": "npm:svgo@2.0.3",
			_url: "https://github.com/JoshuaKGoldberg/package-json-validator",
			"_workspace-gt-version": "workspace:>1.2.3",
			"_workspace-package-any": "workspace:*",
			"_workspace-package-caret": "workspace:^",
			"_workspace-package-no-range": "workspace:",
			"_workspace-package-tilde-version": "workspace:~1.2.3",
			"_workspace-pre-release": "workspace:1.2.3-rc.1",
		};
		const publishedKeys = Object.keys(publishedDependencies);
		const unpublishedKeys = Object.keys(unpublishedDependencies);

		const result = validateDependencies({
			...publishedDependencies,
			...unpublishedDependencies,
		});
		expect(result.issues).toEqual([]);
		expect(result.errorMessages).toEqual(
			publishedKeys.map((key) => `invalid dependency package name: ${key}`),
		);
		publishedKeys.forEach((key, i) => {
			expect(result.childResults[i].errorMessages).toEqual([
				`invalid dependency package name: ${key}`,
			]);
		});
		unpublishedKeys.forEach((_, i) => {
			expect(
				result.childResults[publishedKeys.length + i].errorMessages,
			).toEqual([]);
		});
	});

	it("should report an issue when dependencies have an invalid range", () => {
		const dependencies = {
			"bad-catalog": "catalob:",
			"bad-jsr": "jsr;@scope/package@^1.0.0",
			"bad-npm": "npm;svgo@^1.2.3",
			"invalid-git-protocol": "git+foo://github.com/npm/cli.git",
			"invalid-github-reference-bad-reponame": "some/package?",
			"invalid-github-reference-bad-username": "some--user/package",
			"invalid-github-reference-too-many-slashes": "some/package/subpath",
			"package-name": "abc123",
		};

		const result = validateDependencies(dependencies);

		expect(result.issues).toEqual([]);
		Object.entries(dependencies).forEach(([key, value], i) => {
			expect(result.childResults[i].errorMessages).toEqual([
				`invalid version range for dependency ${key}: ${value}`,
			]);
		});
	});

	it("should return an issue if the value is a string", () => {
		const result = validateDependencies("123");

		expect(result.errorMessages).toEqual([
			"the type should be `object`, not `string`",
		]);
		expect(result.issues).toHaveLength(1);
	});

	it("should return an issue if the value is a number", () => {
		const result = validateDependencies(123);
		expect(result.errorMessages).toEqual([
			"the type should be `object`, not `number`",
		]);
		expect(result.issues).toHaveLength(1);
	});

	it("should return an issue if the value is an object", () => {
		const result = validateDependencies([]);
		expect(result.errorMessages).toEqual([
			"the type should be `object`, not `array`",
		]);
		expect(result.issues).toHaveLength(1);
	});

	it("should return an issue if the value is null", () => {
		const result = validateDependencies(null);
		expect(result.errorMessages).toEqual([
			"the value is `null`, but should be a record of dependencies",
		]);
		expect(result.issues).toHaveLength(1);
	});
});
