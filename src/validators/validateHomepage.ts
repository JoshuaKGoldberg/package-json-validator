import { urlFormat } from "../formats.ts";
import { Result } from "../Result.ts";

/**
 * Validate the `homepage` field in a package.json.
 * It should be a string that contains a url.
 */
export const validateHomepage = (value: unknown): Result => {
	const result = new Result();

	if (typeof value !== "string") {
		if (value === null) {
			result.addIssue("the value is `null`, but should be a `string`");
		} else {
			const valueType = Array.isArray(value) ? "Array" : typeof value;
			result.addIssue(`the type should be a \`string\`, not \`${valueType}\``);
		}
	} else if (value.trim() === "") {
		result.addIssue("the value is empty, but should be a valid url");
	} else if (!value.match(urlFormat)) {
		result.addIssue("the value is not a valid url");
	}

	return result;
};
