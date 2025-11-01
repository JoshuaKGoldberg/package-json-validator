import { valid } from "semver";

import { Result } from "../Result.ts";

/**
 * Validate the `version` field in a package.json, using `semver`.
 */
export const validateVersion = (version: unknown): Result => {
	const result = new Result();

	if (typeof version !== "string") {
		if (version === null) {
			result.addIssue("the value is `null`, but should be a `string`");
		} else {
			const valueType = Array.isArray(version) ? "Array" : typeof version;
			result.addIssue(`the type should be a \`string\`, not \`${valueType}\``);
		}
	} else if (version.trim() === "") {
		result.addIssue("the value is empty, but should be a valid version");
	} else {
		if (!valid(version)) {
			result.addIssue("the value is not a valid semver version");
		}
	}

	return result;
};
