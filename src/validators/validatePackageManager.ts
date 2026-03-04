import { Result } from "../Result.ts";

const packageManagers = ["npm", "pnpm", "yarn", "bun"];
const versionRegex =
	/^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.]+)?(?:\+sha(?:224|256|384|512)\.[a-fA-F0-9]+)?$/;

const validatePackageManagerString = (value: string): string[] => {
	const results: string[] = [];

	if (!value.includes("@")) {
		results.push(
			'the value should be in the form "name@version" (e.g. "pnpm@10.3.0")',
		);
	} else {
		const [name, version] = value.split("@");
		if (!packageManagers.includes(name)) {
			results.push(
				`the package manager "${name}" is not supported. Supported package managers are: ${packageManagers.join(", ")}`,
			);
		}
		if (!version || !versionRegex.test(version)) {
			results.push(
				`the version "${version}" is not valid. It should be a valid semver version (optionally with a hash).`,
			);
		}
	}

	return results;
};

/**
 * Validate the `packageManager` field in a package.json, which should be a string
 * in the format "npm@version", "pnpm@version", or "yarn@version".
 */
export const validatePackageManager = (type: unknown): Result => {
	const result = new Result();

	if (typeof type !== "string") {
		if (type === null) {
			result.addIssue("the value is `null`, but should be a `string`");
		} else {
			const valueType = Array.isArray(type) ? "array" : typeof type;
			result.addIssue(`the type should be a \`string\`, not \`${valueType}\``);
		}
	} else if (type.trim() === "") {
		result.addIssue(
			'the value is empty, but should be the name and version of a package manager (e.g. "pnpm@10.3.0")',
		);
	} else {
		const errors = validatePackageManagerString(type);
		for (const error of errors) {
			result.addIssue(error);
		}
	}

	return result;
};
