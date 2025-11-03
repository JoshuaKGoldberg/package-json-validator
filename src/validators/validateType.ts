import { Result } from "../Result.ts";

const VALID_TYPES = ["commonjs", "module"];

/**
 * Validate the `type` field in a package.json, which can only be one of the
 * following values: "commonjs" or "module".
 */
export const validateType = (type: unknown): Result => {
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
			`the value is empty, but should be one of: ${VALID_TYPES.join(", ")}`,
		);
	} else if (!VALID_TYPES.includes(type)) {
		result.addIssue(
			`the value "${type}" is not valid. Valid types are: ${VALID_TYPES.join(", ")}`,
		);
	}

	return result;
};
