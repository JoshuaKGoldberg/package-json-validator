import valid from "validate-npm-package-license";

import { Result } from "../Result.ts";

/**
 * Validate the `license` field in a package.json, using `validate-npm-package-license`.
 */
export const validateLicense = (license: unknown): Result => {
	const result = new Result();

	if (typeof license !== "string") {
		if (license === null) {
			result.addIssue("the value is `null`, but should be a `string`");
		} else {
			const valueType = Array.isArray(license) ? "Array" : typeof license;
			result.addIssue(`the type should be a \`string\`, not \`${valueType}\``);
		}
	} else if (license.trim() === "") {
		result.addIssue("the value is empty, but should be a valid license");
	} else {
		const validationResults = valid(license);
		if (validationResults.warnings) {
			for (const warning of validationResults.warnings) {
				result.addIssue(warning);
			}
		}
	}

	return result;
};
