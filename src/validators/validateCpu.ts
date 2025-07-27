/**
 * Validate the `cpu` field in a package.json, which should be an array of
 * strings.
 *
 * ["x64", "ia32"]
 */
export const validateCpu = (obj: unknown): string[] => {
	const errors: string[] = [];

	if (Array.isArray(obj)) {
		// If it's an array, check if all items are non-empty strings
		for (let i = 0; i < obj.length; i++) {
			const item = obj[i];
			if (typeof item !== "string") {
				const itemType = item === null ? "null" : typeof item;
				errors.push(
					`item at index ${i} should be a string, not \`${itemType}\``,
				);
			} else if (item.trim() === "") {
				errors.push(
					`item at index ${i} is empty, but should be the name of a cpu architecture`,
				);
			}
		}
	} else if (obj == null) {
		errors.push("the field is `null`, but should be an `Array` of strings");
	} else {
		const valueType = typeof obj;
		errors.push(`the type should be \`Array\`, not \`${valueType}\``);
	}

	return errors;
};
