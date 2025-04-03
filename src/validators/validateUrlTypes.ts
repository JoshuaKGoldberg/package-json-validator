import type { UrlType } from "../types";

import { urlFormat } from "../formats.js";

/**
 * Format for license(s) and repository(s):
 * url as a string
 * or
 * object with "type" and "url"
 * or
 * array of objects with "type" and "url"
 */
export const validateUrlTypes = (
	name: string,
	obj: string | UrlType | UrlType[],
): string[] => {
	const errors: string[] = [];

	const validateUrlType = (obj: UrlType) => {
		if (!obj.type) {
			errors.push(`${name} field should have type`);
		}
		if (!obj.url) {
			errors.push(`${name} field should have url`);
		}
	};

	if (typeof obj === "string") {
		if (!urlFormat.test(obj)) {
			errors.push(`URL not valid for ${name}: ${obj}`);
		}
	} else if (obj instanceof Array) {
		for (let i = 0; i < obj.length; i++) {
			validateUrlType(obj[i]);
		}
	} else if (typeof obj === "object") {
		validateUrlType(obj);
	} else {
		errors.push(`Type for field ${name} should be a string or an object`);
	}

	return errors;
};
