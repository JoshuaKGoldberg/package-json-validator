import { emailFormat, urlFormat } from "../formats.ts";
import {
	addChildResult,
	addIssue,
	createValidationResult,
	flattenResult,
	type Result,
} from "../Result.ts";
import { type People, type Person } from "../validators/index.ts";

export const isPersonArray = (obj: unknown): obj is Person[] => {
	return Array.isArray(obj) && obj.every((item) => isPerson(item));
};

export const isPerson = (obj: unknown): obj is Person => {
	return typeof obj === "object" && obj !== null && "name" in obj;
};

function validatePerson(obj: Person | string): Result {
	let result = createValidationResult();
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
			result = flattenResult(objResult);
		}
	} else if (typeof obj == "object") {
		if (!obj.name) {
			addIssue(result, "person object should have name");
		}
		const entries = Object.entries(obj);
		for (let i = 0; i < entries.length; i++) {
			const [key, value] = entries[i];
			const childResult = createValidationResult();
			if (key === "email" && value && !emailFormat.test(value)) {
				addIssue(childResult, `Email not valid: ${value}`);
			}
			if (key === "url" && value && !urlFormat.test(value)) {
				addIssue(childResult, `URL not valid: ${value}`);
			}
			if (key === "web" && value && !urlFormat.test(value)) {
				addIssue(childResult, `URL not valid: ${value}`);
			}
			addChildResult(result, childResult, i);
		}
	} else {
		addIssue(result, "person field must be an object or a string");
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
		const result = createValidationResult();
		for (let i = 0; i < obj.length; i++) {
			addChildResult(result, validatePerson(obj[i]), i);
		}
		return result;
	} else {
		return validatePerson(obj);
	}
};
