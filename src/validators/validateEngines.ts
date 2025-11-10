import { ChildResult, Result } from "../Result.ts";

/**
 * Validate the `engines` field in a package.json, which should be a
 * Record&lt;string, string&gt; where the key is the name of a runtime or
 * package manager, and the value is the supported semver range.
 *
 * {
 *   "node": "^20.19.0 || >=22.12.0"
 * },
 * @see https://docs.npmjs.com/cli/v11/configuring-npm/package-json#engines
 */
export const validateEngines = (obj: unknown): Result => {
	const result = new Result();

	if (obj && typeof obj === "object" && !Array.isArray(obj)) {
		let propertyNumber = 0;
		for (const [key, value] of Object.entries(obj)) {
			const childResult = new ChildResult(propertyNumber);
			const normalizedKey = key.trim();
			const fieldName =
				normalizedKey === "" ? String(propertyNumber) : `"${normalizedKey}"`;

			if (typeof value !== "string") {
				childResult.addIssue(
					`the value of property ${fieldName} should be a string`,
				);
			} else if (value.trim() === "") {
				childResult.addIssue(
					`the value of property ${fieldName} is empty, but should be a semver range`,
				);
			}
			if (key.trim() === "") {
				childResult.addIssue(
					`property ${fieldName} has an empty key, but should be a runtime or package manager`,
				);
			}
			result.addChildResult(childResult);
			propertyNumber++;
		}
	} else if (obj === null) {
		result.addIssue("the value is `null`, but should be an `object`");
	} else {
		const valueType = Array.isArray(obj) ? "Array" : typeof obj;
		result.addIssue(`the type should be \`object\`, not \`${valueType}\``);
	}

	return result;
};
