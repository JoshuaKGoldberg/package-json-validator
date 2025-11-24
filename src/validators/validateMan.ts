import { ChildResult, Result } from "../Result.ts";

/**
 * The string should end in a number and optionally .gz
 */
const isManStringValid = (man: string): boolean => {
	const stringParts = man.split(".");
	let fileEnd = stringParts.at(-1);
	if (fileEnd === "gz") {
		fileEnd = stringParts.at(-2);
	}
	return !!fileEnd && !isNaN(parseInt(fileEnd));
};

/**
 * Validate the `man` field in a package.json, which can either be
 * a string or an array of strings.
 * The string(s) must end with a number (and optionally .gz)
 * @example ["./man/foo.1", "./man/bar.1"]
 * @see https://docs.npmjs.com/cli/v11/configuring-npm/package-json#man
 */
export const validateMan = (obj: unknown): Result => {
	const result = new Result();

	if (typeof obj === "string") {
		if (obj.trim() === "") {
			result.addIssue(
				"the value is empty, but should be the path to a man file",
			);
		} else if (!isManStringValid(obj)) {
			result.addIssue(
				"the value is not valid; it should be the path to a man file",
			);
		}
	} else if (Array.isArray(obj)) {
		// If it's an array, check if all items are valid strings
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
					`item at index ${i} is empty, but should be the path to a man file`,
				);
			} else if (!isManStringValid(item)) {
				childResult.addIssue(
					`item at index ${i} is not valid; it should be the path to a man file`,
				);
			}
			result.addChildResult(childResult);
		}
	} else if (obj == null) {
		result.addIssue(
			"the value is `null`, but should be an `Array` or a `string`",
		);
	} else {
		const valueType = typeof obj;
		result.addIssue(
			`the type should be \`Array\` or \`string\`, not \`${valueType}\``,
		);
	}

	return result;
};
