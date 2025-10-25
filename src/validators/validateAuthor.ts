import { Result } from "../Result.ts";
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
	if (typeof obj === "string" || isPerson(obj)) {
		return validatePeople(obj);
	} else {
		return new Result([
			`the type should be a \`string\` or an \`object\` with at least a \`name\` property`,
		]);
	}
};
