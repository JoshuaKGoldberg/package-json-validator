import { assert, describe, expect, it } from "vitest";

import { validateDependencies } from "./validateDependencies.js";

describe("validateDependencies", () => {
	it("should validate dependencies with no errors", () => {
		const dependencies = {
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
		};

		const result = validateDependencies("dependencies", dependencies);
		expect(result).toEqual([]);
	});

	it("should report an error when dependencies have an invalid range", () => {
		const dependencies = {
			"bad-catalog": "catalob:",
			"bad-jsr": "jsr;@scope/package@^1.0.0",
			"bad-npm": "npm;svgo@^1.2.3",
			"bad-workspace": "workspace:abc123",
			"bad-workspace-range": "workspace:^>1.2.3",
			"package-name": "abc123",
		};

		const result = validateDependencies("dependencies", dependencies);

		assert.deepStrictEqual(result, [
			"Invalid version range for dependency bad-catalog: catalob:",
			"Invalid version range for dependency bad-jsr: jsr;@scope/package@^1.0.0",
			"Invalid version range for dependency bad-npm: npm;svgo@^1.2.3",
			"Invalid version range for dependency bad-workspace: workspace:abc123",
			"Invalid version range for dependency bad-workspace-range: workspace:^>1.2.3",
			"Invalid version range for dependency package-name: abc123",
		]);
	});
});
