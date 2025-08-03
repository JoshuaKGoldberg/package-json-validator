/**
 * Validate the `description` field in a package.json.
 * It should be a non-empty string..
 */
export const validateDescription = (value: unknown): string[] => {
	const errors: string[] = [];

	if (typeof value !== "string") {
		if (value === null) {
			errors.push("the field is `null`, but should be a `string`");
		} else {
			const valueType = Array.isArray(value) ? "Array" : typeof value;
			errors.push(`the type should be a \`string\`, not \`${valueType}\``);
		}
	} else if (value.trim() === "") {
		errors.push("the value is empty, but should be a description");
	}

	return errors;
};
