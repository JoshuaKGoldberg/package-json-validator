import { Result } from "../Result.ts";

/**
 * Validate the `private` field in a package.json, which should be a boolean value
 */
export const validatePrivate = (type: unknown): Result => {
	const result = new Result();

	if (typeof type !== "boolean") {
		if (type === null) {
			result.addIssue("the value is `null`, but should be a `boolean`");
		} else {
			const valueType = Array.isArray(type) ? "array" : typeof type;
			result.addIssue(`the type should be a \`boolean\`, not \`${valueType}\``);
		}
	}

	return result;
};
