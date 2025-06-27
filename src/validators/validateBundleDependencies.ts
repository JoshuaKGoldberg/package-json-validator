/**
 * Validate the `bundleDependencies` field in a package.json, which can either be
 * an array of strings or a boolean.
 *
 * ["renderized", "super-streams"]
 */
export const validateBundleDependencies = (obj: unknown): string[] => {
	const errors: string[] = [];

	if (typeof obj === "boolean") {
		return []; // No errors for boolean, as per spec
	} else if (Array.isArray(obj)) {
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
					`item at index ${i} is empty, but should be a dependency name`,
				);
			}
		}
	} else if (obj == null) {
		errors.push("the field is `null`, but should be an `Array` or a `boolean`");
	} else {
		const valueType = typeof obj;
		errors.push(
			`the type should be \`Array\` or \`boolean\`, not \`${valueType}\``,
		);
	}

	return errors;
};
