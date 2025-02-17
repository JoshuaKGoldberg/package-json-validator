import { emailFormat, urlFormat } from "../formats.js";
import type { People, Person } from "../types";

/**
 * Validate 'people' fields, which can be an object like this:
 *
 * {
 *   "name" : "Barney Rubble"
 *   "email" : "b@rubble.com",
 *   "url" : "http://barnyrubble.tumblr.com/"
 *   "web" : "http://barnyrubble.tumblr.com/"
 * }
 *
 * Or a single string like this:
 * "Barney Rubble <b@rubble.com> (http://barnyrubble.tumblr.com/)
 * Or an array of either of the above.
 */
export const validatePeople = (name: string, obj: People): string[] => {
	const errors: string[] = [];

	function validatePerson(obj: string | Person) {
		if (typeof obj == "string") {
			const authorRegex = /^([^<\(\s]+[^<\(]*)?(\s*<(.*?)>)?(\s*\((.*?)\))?/;
			const authorFields = authorRegex.exec(obj);
			if (authorFields) {
				const authorName = authorFields[1];
				const authorEmail = authorFields[3];
				const authorUrl = authorFields[5];
				validatePerson({
					name: authorName,
					email: authorEmail,
					url: authorUrl,
				});
			} else {
				errors.push(`Unable to parse person string: ${obj}`);
			}
		} else if (typeof obj == "object") {
			if (!obj.name) {
				errors.push(`${name} field should have name`);
			}
			if (obj.email && !emailFormat.test(obj.email)) {
				errors.push(`Email not valid for ${name}: ${obj.email}`);
			}
			if (obj.url && !urlFormat.test(obj.url)) {
				errors.push(`URL not valid for ${name}: ${obj.url}`);
			}
			if (obj.web && !urlFormat.test(obj.web)) {
				errors.push(`URL not valid for ${name}: ${obj.web}`);
			}
		} else {
			errors.push("People field must be an object or a string");
		}
	}

	if (obj instanceof Array) {
		for (let i = 0; i < obj.length; i++) {
			validatePerson(obj[i]);
		}
	} else {
		validatePerson(obj);
	}
	return errors;
};
