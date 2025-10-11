import type { UrlOrMailTo } from "../utils/index.ts";

import { emailFormat, urlFormat } from "../formats.ts";

/**
 * Allows for a url as a string, or an object that looks like:
 * {
 *   "url" : "http://github.com/owner/project/issues",
 *   "email" : "project@hostname.com"
 * }
 * or
 * {
 *   "mail": "dev@example.com",
 *   "web": "http://www.example.com/bugs"
 * }
 */
export const validateUrlOrMailto = (
	name: string,
	obj: UrlOrMailTo,
): string[] => {
	const errors: string[] = [];
	if (typeof obj === "string") {
		if (!urlFormat.test(obj) && !emailFormat.test(obj)) {
			errors.push(`${name} should be an email or a url`);
		}
	} else if (typeof obj === "object") {
		if (!obj.email && !obj.url && !obj.mail && !obj.web) {
			errors.push(`${name} field should have one of: email, url, mail, web`);
		} else {
			if (obj.email && !emailFormat.test(obj.email)) {
				errors.push(`Email not valid for ${name}: ${obj.email}`);
			}
			if (obj.mail && !emailFormat.test(obj.mail)) {
				errors.push(`Email not valid for ${name}: ${obj.mail}`);
			}
			if (obj.url && !urlFormat.test(obj.url)) {
				errors.push(`URL not valid for ${name}: ${obj.url}`);
			}
			if (obj.web && !urlFormat.test(obj.web)) {
				errors.push(`URL not valid for ${name}: ${obj.web}`);
			}
		}
	} else {
		errors.push(`Type for field ${name} should be a string or an object`);
	}
	return errors;
};
