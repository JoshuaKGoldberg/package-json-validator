import {
	emailFormat,
	packageFormat,
	urlFormat,
	versionFormat,
} from "./formats.js";
import { validate } from "./validate.js";
import {
	validateDependencies,
	validatePeople,
	validateType,
	validateUrlOrMailto,
	validateUrlTypes,
} from "./validators/index.js";

/** @deprecated please use the individual {@link validate} function */
export const PJV = {
	// Format regexes
	emailFormat,
	packageFormat,
	urlFormat,
	versionFormat,

	// Functions
	validate,
	validateDependencies,
	validatePeople,
	validateType,
	validateUrlOrMailto,
	validateUrlTypes,
};
