import validate from "validate-npm-package-name";

import { Result } from "../Result.ts";

/**
 * Validate the `name` field in a package.json, using `validate-npm-package-name`.
 */
export const validateName = (value: unknown): Result => {
	const result = new Result();

	if (typeof value !== "string") {
		if (value === null) {
			result.addIssue("the value is `null`, but should be a `string`");
		} else {
			const valueType = Array.isArray(value) ? "Array" : typeof value;
			result.addIssue(`the type should be a \`string\`, not \`${valueType}\``);
		}
	} else if (value.trim() === "") {
		result.addIssue("the value is empty, but should be a valid name");
	} else {
		const validationResults = validate(value);
		for (const error of validationResults.errors ?? []) {
			result.addIssue(error);
		}
		for (const warning of validationResults.warnings ?? []) {
			result.addIssue(warning);
		}
	}

	return result;
};
