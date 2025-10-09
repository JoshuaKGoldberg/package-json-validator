import { createValidationResult, type Result } from "../Result.ts";
import { isPerson, validatePeople } from "../utils/index.ts";

/**
 * Validate the `author` field in a package.json, which can either be a person
 * string, or an object with `name` and optionally, `email` and `url` fields.
 * The `email` and `url` fields, if present, should be valid email and URL formats.
 *
 * {
 *   "name" : "Barney Rubble"
 *   "email" : "b@rubble.com",
 *   "url" : "http://barnyrubble.tumblr.com/"
 * }
 */
export const validateAuthor = (obj: unknown): Result => {
	let result = createValidationResult();

	if (typeof obj === "string" || isPerson(obj)) {
		result = validatePeople(obj);
	} else {
		const issue = {
			message: `the type should be a \`string\` or an \`object\` with at least a \`name\` property`,
		};
		result = createValidationResult([issue]);
	}

	return result;
};
