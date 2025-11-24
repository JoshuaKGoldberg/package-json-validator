import { validRange } from "semver";

import { packageFormat, urlFormat } from "../formats.ts";
import { ChildResult, Result } from "../Result.ts";

const isUnpublishedVersion = (version: string): boolean => {
	return (
		// https://docs.npmjs.com/cli/v11/configuring-npm/package-json#urls-as-dependencies
		urlFormat.test(version) ||
		// https://docs.npmjs.com/cli/v11/configuring-npm/package-json#git-urls-as-dependencies
		/^git(?:\+(?:ssh|http|https|file|rsync|ftp))?:/.test(version) ||
		// https://docs.npmjs.com/cli/v11/configuring-npm/package-json#github-urls
		/^(?:github:)?[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*\/[\w.-]+(?:#|$)/.test(
			version,
		) ||
		// https://pnpm.io/next/workspaces#workspace-protocol-workspace
		version.startsWith("workspace:") ||
		// https://yarnpkg.com/protocol/patch
		version.startsWith("patch:") ||
		// https://docs.npmjs.com/cli/v11/using-npm/package-spec#aliases
		version.startsWith("npm:") ||
		// https://docs.npmjs.com/cli/v10/configuring-npm/package-json#local-paths
		version.startsWith("file:") ||
		version.startsWith("../") ||
		version.startsWith("~/") ||
		version.startsWith("./") ||
		version.startsWith("/") ||
		false
	);
};

const isValidVersionRange = (version: string): boolean => {
	// https://docs.npmjs.com/cli/v11/configuring-npm/package-json#dependencies
	return (
		!!validRange(version) ||
		version === "*" ||
		version === "" ||
		version === "latest" ||
		// https://jsr.io/docs/using-packages
		version.startsWith("jsr:") ||
		// https://pnpm.io/next/catalogs
		// These could be published or unpublished. Ideally linting would validate the
		// catalog itself, and then we could ignore the package names here since they'd be
		// correctly validated there. But the catalog is elsewhere, and the better
		// assumption is that it mostly has published packages.
		version.startsWith("catalog:") ||
		isUnpublishedVersion(version)
	);
};

/**
 * Validates dependencies, making sure the object is a set of key value pairs
 * with package names and versions
 * @returns An array with validation errors (if any violations are found)
 */
export const validateDependencies = (value: unknown): Result => {
	const result = new Result();

	if (value == null) {
		result.addIssue(
			"the value is `null`, but should be a record of dependencies",
		);
	} else if (typeof value === "object" && !Array.isArray(value)) {
		const entries = Object.entries(value);
		for (let i = 0; i < entries.length; ++i) {
			const childResult = new ChildResult(i);
			const [pkg, version] = entries[i] as [string, unknown];
			if (
				!packageFormat.test(pkg) &&
				!(typeof version === "string" && isUnpublishedVersion(version))
			) {
				childResult.addIssue(`invalid dependency package name: ${pkg}`);
			}

			if (typeof version !== "string") {
				childResult.addIssue(
					`dependency version for ${pkg} should be a string: ${version}`,
				);
			} else if (!isValidVersionRange(version)) {
				childResult.addIssue(
					`invalid version range for dependency ${pkg}: ${version}`,
				);
			}
			result.addChildResult(childResult);
		}
	} else {
		const valueType = Array.isArray(value) ? "array" : typeof value;
		result.addIssue(`the type should be \`object\`, not \`${valueType}\``);
	}
	return result;
};
