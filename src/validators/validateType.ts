const VALID_TYPES = ["commonjs", "module"];

/**
 * Validate the `type` field in a package.json, which can only be one of the
 * following values: "commonjs" or "module".
 */
export const validateType = (type: unknown): string[] => {
	const errors: string[] = [];

	if (typeof type !== "string") {
		if (type === null) {
			errors.push("type is `null`, but should be a `string`");
		} else {
			const valueType = Array.isArray(type) ? "array" : typeof type;
			errors.push(`type should be a \`string\`, not \`${valueType}\``);
		}
		return errors;
	}

	if (type.trim() === "") {
		errors.push(
			`type is empty, but should be one of: ${VALID_TYPES.join(", ")}`,
		);
	} else if (!VALID_TYPES.includes(type)) {
		errors.push(
			`type "${type}" is not valid. Valid types are: ${VALID_TYPES.join(", ")}`,
		);
	}

	return errors;
};
