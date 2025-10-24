import { ChildResult, Result } from "../Result.ts";

/**
 * Validate the `bin` field in a package.json, which can either be a string
 * with the path to the executable, or a Record&lt;string, string&gt; where the
 * key is the name of the command and the value is the path to the executable.
 *
 * {
 *   "my-cli" : "./cli.js",
 *   "my-dev-tool" : "./dev-tool.js",
 * }
 */
export const validateBin = (obj: unknown): Result => {
	const result = new Result();

	if (typeof obj === "string") {
		if (obj.trim() === "") {
			result.addIssue(`the value is empty, but should be a relative path`);
		}
	} else if (obj && typeof obj === "object" && !Array.isArray(obj)) {
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
					`the value of property ${fieldName} is empty, but should be a relative path`,
				);
			}
			if (key.trim() === "") {
				childResult.addIssue(
					`property ${fieldName} has an empty key, but should be a valid command name`,
				);
			}
			result.addChildResult(childResult);
			propertyNumber++;
		}
	} else if (obj == null) {
		result.addIssue(
			"the value is `null`, but should be a `string` or an `object`",
		);
	} else {
		const valueType = Array.isArray(obj) ? "array" : typeof obj;
		result.addIssue(
			`the type should be \`string\` or \`object\`, not \`${valueType}\``,
		);
	}

	return result;
};
