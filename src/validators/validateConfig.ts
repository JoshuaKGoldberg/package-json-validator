/**
 * Validate the `config` field in a package.json. The value
 * should be an object.
 */
export const validateConfig = (obj: unknown): string[] => {
	const errors: string[] = [];

	if (obj === null) {
		errors.push("the field is `null`, but should be an `object`");
	} else if (typeof obj !== "object" || Array.isArray(obj)) {
		const valueType = Array.isArray(obj) ? "array" : typeof obj;
		errors.push(`the type should be \`object\`, not \`${valueType}\``);
	}

	return errors;
};
