import { Result } from "../Result.ts";
import { isPerson, validatePeople } from "../utils/index.ts";

/**
 * Validate the `contributors` field in a package.json, which should be an array
 * consisting of objects with `name` and optionally, `email` and `url` fields.
 * The `email` and `url` fields, if present, should be valid email and URL formats.
 *
 * [
 *   {
 *     "name" : "Barney Rubble"
 *     "email" : "b@rubble.com",
 *     "url" : "http://barnyrubble.tumblr.com/"
 *   }
 * ]
 */
export const validateContributors = (obj: unknown): Result => {
	const result = new Result();
	if (Array.isArray(obj)) {
		for (let i = 0; i < obj.length; i++) {
			let childResult: Result;
			const item: unknown = obj[i];
			if (!isPerson(item)) {
				childResult = new Result([
					`item ${i} is invalid; it should be a person object with at least a \`name\``,
				]);
			} else {
				childResult = validatePeople(item);
			}
			result.addChildResult(i, childResult);
		}
	} else {
		result.addIssue(
			"the type should be an `Array` of objects with at least a `name` property, and optionally `email` and `url`",
		);
	}
	return result;
};
