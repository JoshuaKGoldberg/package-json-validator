import {
	emailFormat,
	packageFormat,
	urlFormat,
	versionFormat,
} from "./formats";
import { validate } from "./validate";
import {
	validateDependencies,
	validatePeople,
	validateType,
	validateUrlOrMailto,
	validateUrlTypes,
} from "./validators";

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
