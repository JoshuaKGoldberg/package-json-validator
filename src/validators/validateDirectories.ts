/**
 * Validate the `directories` field in a package.json. The value of
 * should be a Record&lt;string, string&gt;
 */
export const validateDirectories = (obj: unknown): string[] => {
	const errors: string[] = [];

	if (obj && typeof obj === "object" && !Array.isArray(obj)) {
		let propertyNumber = 0;
		for (const [key, value] of Object.entries(obj)) {
			const normalizedKey = key.trim();
			const fieldName =
				normalizedKey === "" ? String(propertyNumber) : `"${normalizedKey}"`;

			if (typeof value !== "string") {
				errors.push(`the value of field ${fieldName} should be a string`);
			} else if (value.trim() === "") {
				errors.push(
					`the value of field ${fieldName} is empty, but should be a path to a directory`,
				);
			}
			if (key.trim() === "") {
				errors.push(
					`field ${fieldName} has an empty key, but should be a path to a directory`,
				);
			}
			propertyNumber++;
		}
	} else if (obj === null) {
		errors.push("the field is `null`, but should be an `object`");
	} else {
		const valueType = Array.isArray(obj) ? "array" : typeof obj;
		errors.push(`the type should be \`object\`, not \`${valueType}\``);
	}

	return errors;
};
