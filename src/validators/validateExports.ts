const validateExportCondition = (
	obj: unknown,
	propertyName?: string,
	index?: number,
): string[] => {
	const errors: string[] = [];

	const normalizedKey = typeof propertyName === "string" && propertyName.trim();
	const fieldName =
		normalizedKey === "" ? `property ${String(index)}` : `"${normalizedKey}"`;

	// Is the value of this property a `string`?
	if (typeof obj === "string") {
		if (obj.trim() === "") {
			// If this property is the child of another...
			if (typeof propertyName === "string") {
				errors.push(
					`the value of ${fieldName} is empty, but should be an entry point path`,
				);
			} else {
				errors.push("the value is empty, but should be an entry point path");
			}
		}
	}
	// Is the value of this property an object?
	else if (obj && typeof obj === "object" && !Array.isArray(obj)) {
		let propertyNumber = 0;
		for (const [key, value] of Object.entries(obj)) {
			if (key.trim() === "") {
				errors.push(
					`property ${propertyNumber} has an empty key, but should be an export condition`,
				);
			}

			// Recurse to add errors from children.
			const childErrors = validateExportCondition(value, key, propertyNumber);
			errors.push(...childErrors);
			propertyNumber++;
		}
	}
	// The value of this property is not correct, and this property is the child of another
	else if (typeof propertyName === "string") {
		errors.push(
			`the value of ${fieldName} should be either an entry point path or an object of export conditions`,
		);
	}
	// The remaining conditions are for values that aren't correct and this is not a child property
	else if (obj === null) {
		errors.push("the field is `null`, but should be an `object` or `string`");
	} else {
		const valueType = Array.isArray(obj) ? "Array" : typeof obj;
		errors.push(
			`the type should be \`object\` or \`string\`, not \`${valueType}\``,
		);
	}

	return errors;
};

/**
 * Validate the `exports` field in a package.json. The value of
 * should be either a string or a Record&lt;string, object | string&gt;
 */
export const validateExports = (obj: unknown): string[] =>
	validateExportCondition(obj);
