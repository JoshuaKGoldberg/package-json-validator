import { ChildResult, Result } from "../Result.ts";

/**
 * Validate the `sideEffects` property in a package.json, which can either be
 * a boolean or an array of non-empty strings.
 *@see https://webpack.js.org/guides/tree-shaking/#with-sideeffects-false-in-packagejson
 */
export const validateSideEffects = (value: unknown): Result => {
	const result = new Result();

	if (typeof value === "boolean") {
		return result; // No errors for boolean
	} else if (Array.isArray(value)) {
		// If it's an array, check if all items are non-empty strings
		for (let i = 0; i < value.length; i++) {
			const childResult = new ChildResult(i);
			const item: unknown = value[i];
			if (typeof item !== "string") {
				const itemType = item === null ? "null" : typeof item;
				childResult.addIssue(
					`item at index ${i} should be a string, not \`${itemType}\``,
				);
			} else if (item.trim() === "") {
				childResult.addIssue(
					`item at index ${i} is empty, but should be a path to a file with side effects or a glob pattern`,
				);
			}
			result.addChildResult(childResult);
		}
	} else if (value == null) {
		result.addIssue(
			"the value is `null`, but should be a `boolean` or an `Array`",
		);
	} else {
		const valueType = typeof value;
		result.addIssue(
			`the type should be \`boolean\` or \`Array\`, not \`${valueType}\``,
		);
	}

	return result;
};
