import { packageFormat, urlFormat } from "../formats.js";

const isUnpublishedVersion = (v: string): boolean => {
	return (
		// https://docs.npmjs.com/cli/v11/configuring-npm/package-json#urls-as-dependencies
		urlFormat.test(v) ||
		// https://docs.npmjs.com/cli/v11/configuring-npm/package-json#git-urls-as-dependencies
		/^git(?:\+(?:ssh|http|https|file|rsync|ftp))?:/.test(v) ||
		// https://docs.npmjs.com/cli/v11/configuring-npm/package-json#github-urls
		/^(?:github:)?[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*\/[\w.-]+(?:#|$)/.test(v) ||
		// https://pnpm.io/next/workspaces#workspace-protocol-workspace
		/^workspace:((\^|~)?[0-9.x]*|(<=?|>=?)?[0-9.x][\-.+\w]+|\*)?$/.test(v) ||
		// https://pnpm.io/next/catalogs
		v.startsWith("catalog:") ||
		// https://docs.npmjs.com/cli/v11/using-npm/package-spec#aliases
		v.startsWith("npm:") ||
		// https://docs.npmjs.com/cli/v10/configuring-npm/package-json#local-paths
		v.startsWith("file:") ||
		v.startsWith("../") ||
		v.startsWith("~/") ||
		v.startsWith("./") ||
		v.startsWith("/") ||
		false
	);
};

const isValidVersionRange = (v: string): boolean => {
	// https://docs.npmjs.com/cli/v11/configuring-npm/package-json#dependencies
	return (
		/^[\^<>=~]{0,2}[0-9.x]+/.test(v) ||
		v == "*" ||
		v === "" ||
		v === "latest" ||
		// https://jsr.io/docs/using-packages
		v.startsWith("jsr:") ||
		isUnpublishedVersion(v) ||
		false
	);
};

/**
 * Validates dependencies, making sure the object is a set of key value pairs
 * with package names and versions
 * @param name The name of the field being validated (e.g. "dependencies", "devDependencies")
 * @param deps A dependencies Record
 * @returns An array with validation errors (if any violations are found)
 */
export const validateDependencies = (
	name: string,
	deps: Record<string, unknown>,
): string[] => {
	const errors: string[] = [];
	for (const pkg in deps) {
		if (
			!packageFormat.test(pkg) &&
			!(typeof deps[pkg] === "string" && isUnpublishedVersion(deps[pkg]))
		) {
			errors.push(`Invalid dependency package name: ${pkg}`);
		}

		if (typeof deps[pkg] !== "string") {
			errors.push(
				`Dependency version for ${pkg} should be a string: ${deps[pkg]}`,
			);
			continue;
		}
		if (!isValidVersionRange(deps[pkg])) {
			errors.push(`Invalid version range for dependency ${pkg}: ${deps[pkg]}`);
		}
	}
	return errors;
};
