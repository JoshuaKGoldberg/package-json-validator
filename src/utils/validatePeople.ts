import { emailFormat, urlFormat } from "../formats.ts";
import { ChildResult, Result } from "../Result.ts";
import { type People, type Person } from "./validation.types.ts";

export const isPersonArray = (obj: unknown): obj is Person[] => {
	return Array.isArray(obj) && obj.every((item) => isPerson(item));
};

export const isPerson = (obj: unknown): obj is Person => {
	return typeof obj === "object" && obj !== null && "name" in obj;
};

function validatePerson(obj: Person | string): Result {
	let result = new Result();
	if (typeof obj == "string") {
		const authorRegex = /^([^<(\s][^<(]*)?(\s*<(.*?)>)?(\s*\((.*?)\))?/;
		const authorFields = authorRegex.exec(obj);
		if (authorFields) {
			const authorName = authorFields[1];
			const authorEmail = authorFields[3];
			const authorUrl = authorFields[5];
			const objResult = validatePerson({
				email: authorEmail,
				name: authorName,
				url: authorUrl,
			});
			// Since this wasn't originally an object, we need to flatten the child results
			// into this result object.
			result = objResult.flatten();
		}
	} else if (typeof obj == "object") {
		if (typeof obj.name === "undefined") {
			result.addIssue("person should have a name");
		}
		const entries = Object.entries(obj);
		for (let i = 0; i < entries.length; i++) {
			const [key, value] = entries[i];
			const childResult = new ChildResult(i);
			if (key === "name" && typeof value === "string" && value.trim() === "") {
				childResult.addIssue(`name should not be empty`);
			}
			if (key === "email" && value && !emailFormat.test(value)) {
				childResult.addIssue(`email is not valid: ${value}`);
			}
			if (key === "url" && value && !urlFormat.test(value)) {
				childResult.addIssue(`url is not valid: ${value}`);
			}
			if (key === "web" && value && !urlFormat.test(value)) {
				childResult.addIssue(`url is not valid: ${value}`);
			}
			result.addChildResult(childResult);
		}
	} else {
		result.addIssue("person field must be an object or a string");
	}
	return result;
}

/**
 * Validate 'people' fields, which can be an object like this:
 *
 * {
 *   "name" : "Barney Rubble"
 *   "email" : "b@rubble.com",
 *   "url" : "http://barnyrubble.tumblr.com/"
 * }
 *
 * Or a single string like this:
 * "Barney Rubble &lt;b@rubble.com> (http://barnyrubble.tumblr.com/)
 * Or an array of either of the above.
 */
export const validatePeople = (obj: People): Result => {
	if (obj instanceof Array) {
		const result = new Result();
		for (let i = 0; i < obj.length; i++) {
			result.addChildResult(i, validatePerson(obj[i]));
		}
		return result;
	} else {
		return validatePerson(obj);
	}
};
