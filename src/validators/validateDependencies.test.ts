import { assert, describe, expect, it } from "vitest";
import { validateDependencies } from "./validateDependencies";

describe("validateDependencies", () => {
	it("should validate dependencies with no errors", () => {
		const dependencies = {
			star: "*",
			empty: "",
			url: "https://github.com/JoshuaKGoldberg/package-json-validator",
			"caret-first": "^1.0.0",
			"tilde-first": "~1.2",
			"x-version": "1.2.x",
			"tilde-top": "~1",
			"caret-top": "^1",
			"workspace-package-no-range": "workspace:",
			"workspace-package-caret": "workspace:^",
			"workspace-package-any": "workspace:*",
			"workspace-package-tilde-version": "workspace:~1.2.3",
			"workspace-gt-version": "workspace:>1.2.3",
			"workspace-pre-release": "workspace:1.2.3-rc.1",
			"catalog-package": "catalog:",
			"catalog-named-package": "catalog:react19",
			"svgo-v1": "npm:svgo@1.3.2",
			"svgo-v2": "npm:svgo@2.0.3",
			range: "1.2.3 - 2.3.4",
			lteq: "<=1.2.3",
			gteq: ">=1.2.3",
			"verion-build": "1.2.3+build2012",
			lt: "<1.2.3",
			gt: ">1.2.3",
			// reference: https://github.com/JoshuaKGoldberg/package-json-validator/issues/49
			"@reactivex/rxjs": "^5.0.0-alpha.7",
		};

		const result = validateDependencies("dependencies", dependencies);
		expect(result).toEqual([]);
	});

	it("reports a complaint when dependencies has an invalid range", () => {
		const dependencies = {
			"package-name": "abc123",
			"bad-catalog": "catalob:",
			"bad-workspace": "workspace:abc123",
			"bad-workspace-range": "workspace:^>1.2.3",
			"bad-npm": "npm;svgo@^1.2.3",
		};

		const result = validateDependencies("dependencies", dependencies);

		assert.deepStrictEqual(result, [
			"Invalid version range for dependency package-name: abc123",
			"Invalid version range for dependency bad-catalog: catalob:",
			"Invalid version range for dependency bad-workspace: workspace:abc123",
			"Invalid version range for dependency bad-workspace-range: workspace:^>1.2.3",
			"Invalid version range for dependency bad-npm: npm;svgo@^1.2.3",
		]);
	});
});
