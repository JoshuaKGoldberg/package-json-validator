import { validRange } from "semver";

import { packageFormat, urlFormat } from "../formats.js";

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
		/^workspace:((\^|~)?[0-9.x]*|(<=?|>=?)?[0-9.x][\-.+\w]+|\*)?$/.test(
			version,
		) ||
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
export const validateDependencies = (value: unknown): string[] => {
	const errors: string[] = [];

	if (value == null) {
		errors.push("the field is `null`, but should be a record of dependencies");
	} else if (typeof value === "object" && !Array.isArray(value)) {
		for (const [pkg, version] of Object.entries(value)) {
			if (
				!packageFormat.test(pkg) &&
				!(typeof version === "string" && isUnpublishedVersion(version))
			) {
				errors.push(`invalid dependency package name: ${pkg}`);
			}

			if (typeof version !== "string") {
				errors.push(
					`dependency version for ${pkg} should be a string: ${version}`,
				);
				continue;
			}
			if (!isValidVersionRange(version)) {
				errors.push(`invalid version range for dependency ${pkg}: ${version}`);
			}
		}
	} else {
		const valueType = Array.isArray(value) ? "array" : typeof value;
		errors.push(`the type should be \`object\`, not \`${valueType}\``);
	}
	return errors;
};
