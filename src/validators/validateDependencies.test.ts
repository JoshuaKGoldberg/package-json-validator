import { assert, describe, expect, it } from "vitest";

import { validateDependencies } from "./validateDependencies.js";

describe("validateDependencies", () => {
	it("should validate dependencies with no errors", () => {
		const dependencies = {
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

		const result = validateDependencies("dependencies", dependencies);
		expect(result).toEqual([]);
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

		const result = validateDependencies("dependencies", {
			...publishedDependencies,
			...unpublishedDependencies,
		});
		assert.deepStrictEqual(
			result,
			Object.keys(publishedDependencies).map(
				(k) => `Invalid dependency package name: ${k}`,
			),
		);
	});

	it("should report an error when dependencies have an invalid range", () => {
		const dependencies = {
			"bad-catalog": "catalob:",
			"bad-jsr": "jsr;@scope/package@^1.0.0",
			"bad-npm": "npm;svgo@^1.2.3",
			"bad-workspace": "workspace:abc123",
			"bad-workspace-range": "workspace:^>1.2.3",
			"invalid-git-protocol": "git+foo://github.com/npm/cli.git",
			"invalid-github-reference-bad-reponame": "some/package?",
			"invalid-github-reference-bad-username": "some--user/package",
			"invalid-github-reference-too-many-slashes": "some/package/subpath",
			"package-name": "abc123",
		};

		const result = validateDependencies("dependencies", dependencies);

		assert.deepStrictEqual(result, [
			"Invalid version range for dependency bad-catalog: catalob:",
			"Invalid version range for dependency bad-jsr: jsr;@scope/package@^1.0.0",
			"Invalid version range for dependency bad-npm: npm;svgo@^1.2.3",
			"Invalid version range for dependency bad-workspace: workspace:abc123",
			"Invalid version range for dependency bad-workspace-range: workspace:^>1.2.3",
			"Invalid version range for dependency invalid-git-protocol: git+foo://github.com/npm/cli.git",
			"Invalid version range for dependency invalid-github-reference-bad-reponame: some/package?",
			"Invalid version range for dependency invalid-github-reference-bad-username: some--user/package",
			"Invalid version range for dependency invalid-github-reference-too-many-slashes: some/package/subpath",
			"Invalid version range for dependency package-name: abc123",
		]);
	});
});
