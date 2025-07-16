import { valid } from "semver";

/**
 * Validate the `version` field in a package.json, using `semver`.
 */
export const validateVersion = (version: unknown): string[] => {
	const errors: string[] = [];

	if (typeof version !== "string") {
		if (version === null) {
			errors.push("the field is `null`, but should be a `string`");
		} else {
			const valueType = Array.isArray(version) ? "Array" : typeof version;
			errors.push(`the type should be a \`string\`, not \`${valueType}\``);
		}
		return errors;
	}

	if (version.trim() === "") {
		errors.push("the value is empty, but should be a valid version");
	} else {
		if (!valid(version)) {
			errors.push("the value is not a valid semver version");
		}
	}

	return errors;
};
