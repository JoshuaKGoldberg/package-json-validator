import { ChildResult, Result } from "../Result.ts";

/**
 * Validate the `bundleDependencies` field in a package.json, which can either be
 * an array of strings or a boolean.
 *
 * ["renderized", "super-streams"]
 */
export const validateBundleDependencies = (obj: unknown): Result => {
	const result = new Result();

	if (typeof obj === "boolean") {
		return result; // No errors for boolean, as per spec
	} else if (Array.isArray(obj)) {
		// If it's an array, check if all items are non-empty strings
		for (let i = 0; i < obj.length; i++) {
			const childResult = new ChildResult(i);
			const item: unknown = obj[i];
			if (typeof item !== "string") {
				const itemType = item === null ? "null" : typeof item;
				childResult.addIssue(
					`item at index ${i} should be a string, not \`${itemType}\``,
				);
			} else if (item.trim() === "") {
				childResult.addIssue(
					`item at index ${i} is empty, but should be a dependency name`,
				);
			}
			result.addChildResult(childResult);
		}
	} else if (obj == null) {
		result.addIssue(
			"the value is `null`, but should be an `Array` or a `boolean`",
		);
	} else {
		const valueType = typeof obj;
		result.addIssue(
			`the type should be \`Array\` or \`boolean\`, not \`${valueType}\``,
		);
	}

	return result;
};
