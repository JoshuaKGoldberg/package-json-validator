import { Result } from "../Result.ts";

const validateExportCondition = (
	obj: unknown,
	propertyName?: string,
	index?: number,
): Result => {
	const result = new Result();

	const normalizedKey = typeof propertyName === "string" && propertyName.trim();
	const fieldName =
		normalizedKey === "" ? `property ${String(index)}` : `"${normalizedKey}"`;

	// Is the value of this property a `string`?
	if (typeof obj === "string") {
		if (obj.trim() === "") {
			// If this property is the child of another...
			if (typeof propertyName === "string") {
				result.addIssue(
					`the value of ${fieldName} is empty, but should be an entry point path`,
				);
			} else {
				result.addIssue(
					"the value is empty, but should be an entry point path",
				);
			}
		}
	}
	// Is the value of this property an object?
	else if (obj && typeof obj === "object" && !Array.isArray(obj)) {
		const entries = Object.entries(obj);
		for (let i = 0; i < entries.length; i++) {
			const [key, value] = entries[i];

			// Recurse to add results from children.
			const childResult = validateExportCondition(value, key, i);

			if (key.trim() === "") {
				childResult.addIssue(
					`property ${i} has an empty key, but should be an export condition`,
				);
			}
			result.addChildResult(i, childResult);
		}
	}
	// The value of this property is not correct, and this property is the child of another
	else if (typeof propertyName === "string") {
		result.addIssue(
			`the value of ${fieldName} should be either an entry point path or an object of export conditions`,
		);
	}
	// The remaining conditions are for values that aren't correct and this is not a child property
	else if (obj === null) {
		result.addIssue(
			"the value is `null`, but should be an `object` or `string`",
		);
	} else {
		const valueType = Array.isArray(obj) ? "Array" : typeof obj;
		result.addIssue(
			`the type should be \`object\` or \`string\`, not \`${valueType}\``,
		);
	}

	return result;
};

/**
 * Validate the `exports` field in a package.json. The value of
 * should be either a string or a Record&lt;string, object | string&gt;
 */
export const validateExports = (obj: unknown): Result =>
	validateExportCondition(obj);
