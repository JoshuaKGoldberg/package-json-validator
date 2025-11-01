import { ChildResult, Result } from "../Result.ts";

/**
 * Validate the `cpu` field in a package.json, which should be an array of
 * strings.
 *
 * ["x64", "ia32"]
 */
export const validateCpu = (obj: unknown): Result => {
	const result = new Result();

	if (Array.isArray(obj)) {
		// If it's an array, check if all items are non-empty strings
		for (let i = 0; i < obj.length; i++) {
			const childResult = new ChildResult(i);
			const item = obj[i];

			if (typeof item !== "string") {
				const itemType = item === null ? "null" : typeof item;
				childResult.addIssue(
					`item at index ${i} should be a string, not \`${itemType}\``,
				);
			} else if (item.trim() === "") {
				childResult.addIssue(
					`item at index ${i} is empty, but should be the name of a CPU architecture`,
				);
			}
			result.addChildResult(childResult);
		}
	} else if (obj == null) {
		result.addIssue("the value is `null`, but should be an `Array` of strings");
	} else {
		const valueType = typeof obj;
		result.addIssue(`the type should be \`Array\`, not \`${valueType}\``);
	}

	return result;
};
