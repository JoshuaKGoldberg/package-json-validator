import { packageFormat, urlFormat } from "../formats.js";

const isValidVersionRange = (v: string): boolean => {
	// https://github.com/isaacs/npm/blob/master/doc/cli/json.md#dependencies
	return (
		/^[\^<>=~]{0,2}[0-9.x]+/.test(v) ||
		urlFormat.test(v) ||
		v == "*" ||
		v === "" ||
		v === "latest" ||
		(v.indexOf && v.indexOf("git") === 0) ||
		// https://pnpm.io/next/workspaces#workspace-protocol-workspace
		/^workspace:((\^|~)?[0-9.x]*|(<=?|>=?)?[0-9.x][\-.+\w]+|\*)?$/.test(v) ||
		// https://pnpm.io/next/catalogs
		(v.indexOf && v.indexOf("catalog:") === 0) ||
		(v.indexOf && v.indexOf("npm:") === 0) ||
		false
	);
};

/**
 * Validates dependencies, making sure the object is a set of key value pairs
 * with package names and versions
 * @param name - The name of the field being validated (e.g. "dependencies", "devDependencies")
 * @param deps - A dependencies Record
 * @returns An array with validation errors (if any violations are found)
 */
export const validateDependencies = (
	name: string,
	deps: Record<string, string>,
): string[] => {
	const errors: string[] = [];
	for (const pkg in deps) {
		if (!packageFormat.test(pkg)) {
			errors.push(`Invalid dependency package name: ${pkg}`);
		}

		if (!isValidVersionRange(deps[pkg])) {
			errors.push(`Invalid version range for dependency ${pkg}: ${deps[pkg]}`);
		}
	}
	return errors;
};
