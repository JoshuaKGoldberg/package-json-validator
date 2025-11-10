import { ChildResult, Result } from "../Result.ts";

/**
 * Validate the `workspaces` field in a package.json, which should be an array of
 * file patterns.
 *
 * ["./app", "./packages/*"]
 * @see https://docs.npmjs.com/cli/v11/configuring-npm/package-json#workspaces
 */
export const validateWorkspaces = (value: unknown): Result => {
	const result = new Result();

	if (Array.isArray(value)) {
		// If it's an array, check if all items are non-empty strings
		for (let i = 0; i < value.length; i++) {
			const childResult = new ChildResult(i);
			const item = value[i];

			if (typeof item !== "string") {
				const itemType =
					item === null ? "null" : Array.isArray(item) ? "Array" : typeof item;
				childResult.addIssue(
					`item at index ${i} should be a string, not \`${itemType}\``,
				);
			} else if (item.trim() === "") {
				childResult.addIssue(
					`item at index ${i} is empty, but should be a file path or glob pattern`,
				);
			}
			result.addChildResult(childResult);
		}
	} else if (value == null) {
		result.addIssue("the value is `null`, but should be an `Array` of strings");
	} else {
		const valueType = typeof value;
		result.addIssue(`the type should be \`Array\`, not \`${valueType}\``);
	}

	return result;
};
