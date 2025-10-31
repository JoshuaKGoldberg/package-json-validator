import { Result } from "../Result.ts";

/**
 * Validate the `config` field in a package.json. The value
 * should be an object.
 */
export const validateConfig = (obj: unknown): Result => {
	const result = new Result();

	if (obj === null) {
		result.addIssue("the value is `null`, but should be an `object`");
	} else if (typeof obj !== "object" || Array.isArray(obj)) {
		const valueType = Array.isArray(obj) ? "array" : typeof obj;
		result.addIssue(`the type should be \`object\`, not \`${valueType}\``);
	}

	return result;
};
