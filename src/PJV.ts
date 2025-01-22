import type {
	FieldSpec,
	People,
	Person,
	SpecMap,
	SpecName,
	SpecType,
	UrlOrMailTo,
	UrlType,
} from "./types";

const packageFormat = /^[a-zA-Z0-9@\/][a-zA-Z0-9@\/\.\-_]*$/;
const versionFormat = /^[0-9]+\.[0-9]+[0-9+a-zA-Z\.\-]+$/;
const urlFormat = /^https*:\/\/[a-z.\-0-9]+/;
const emailFormat = /\S+@\S+/; // I know this isn't thorough. it's not supposed to be.

const getSpecMap = (
	specName: SpecName,
	isPrivate: boolean,
): SpecMap | false => {
	if (specName == "npm") {
		// https://docs.npmjs.com/cli/v9/configuring-npm/package-json
		return {
			name: {
				type: "string",
				required: !isPrivate,
				format: packageFormat,
			},
			version: {
				type: "string",
				required: !isPrivate,
				format: versionFormat,
			},
			description: { type: "string", warning: true },
			keywords: { type: "array", warning: true },
			homepage: { type: "string", recommended: true, format: urlFormat },
			bugs: { warning: true, validate: validateUrlOrMailto },
			licenses: {
				type: "array",
				warning: true,
				validate: validateUrlTypes,
				or: "license",
			},
			license: { type: "string" },
			author: { warning: true, validate: validatePeople },
			contributors: { warning: true, validate: validatePeople },
			files: { type: "array" },
			main: { type: "string" },
			bin: { types: ["string", "object"] },
			man: { types: ["string", "array"] },
			directories: { type: "object" },
			repository: {
				types: ["string", "object"],
				warning: true,
				validate: validateUrlTypes,
				or: "repositories",
			},
			scripts: { type: "object" },
			config: { type: "object" },
			dependencies: {
				type: "object",
				recommended: true,
				validate: validateDependencies,
			},
			devDependencies: { type: "object", validate: validateDependencies },
			peerDependencies: {
				type: "object",
				validate: validateDependencies,
			},
			bundledDependencies: { type: "array" },
			bundleDependencies: { type: "array" },
			optionalDependencies: {
				type: "object",
				validate: validateDependencies,
			},
			engines: { type: "object", recommended: true },
			engineStrict: { type: "boolean" },
			os: { type: "array" },
			cpu: { type: "array" },
			preferGlobal: { type: "boolean" },
			private: { type: "boolean" },
			publishConfig: { type: "object" },
		};
	} else if (specName == "commonjs_1.0") {
		// http://wiki.commonjs.org/wiki/Packages/1.0
		return {
			name: { type: "string", required: true, format: packageFormat },
			description: { type: "string", required: true },
			version: { type: "string", required: true, format: versionFormat },
			keywords: { type: "array", required: true },
			maintainers: {
				type: "array",
				required: true,
				validate: validatePeople,
			},
			contributors: {
				type: "array",
				required: true,
				validate: validatePeople,
			},
			bugs: {
				type: "string",
				required: true,
				validate: validateUrlOrMailto,
			},
			licenses: {
				type: "array",
				required: true,
				validate: validateUrlTypes,
			},
			repositories: {
				type: "object",
				required: true,
				validate: validateUrlTypes,
			},
			dependencies: {
				type: "object",
				required: true,
				validate: validateDependencies,
			},

			homepage: { type: "string", format: urlFormat },
			os: { type: "array" },
			cpu: { type: "array" },
			engine: { type: "array" },
			builtin: { type: "boolean" },
			directories: { type: "object" },
			implements: { type: "array" },
			scripts: { type: "object" },
			checksums: { type: "object" },
		};
	} else if (specName == "commonjs_1.1") {
		// http://wiki.commonjs.org/wiki/Packages/1.1
		return {
			name: { type: "string", required: true, format: packageFormat },
			version: { type: "string", required: true, format: versionFormat },
			main: { type: "string", required: true },
			directories: { type: "object", required: true },

			maintainers: {
				type: "array",
				warning: true,
				validate: validatePeople,
			},
			description: { type: "string", warning: true },
			licenses: {
				type: "array",
				warning: true,
				validate: validateUrlTypes,
			},
			bugs: {
				type: "string",
				warning: true,
				validate: validateUrlOrMailto,
			},
			keywords: { type: "array" },
			repositories: { type: "array", validate: validateUrlTypes },
			contributors: { type: "array", validate: validatePeople },
			dependencies: { type: "object", validate: validateDependencies },
			homepage: { type: "string", warning: true, format: urlFormat },
			os: { type: "array" },
			cpu: { type: "array" },
			engine: { type: "array" },
			builtin: { type: "boolean" },
			implements: { type: "array" },
			scripts: { type: "object" },
			overlay: { type: "object" },
			checksums: { type: "object" },
		};
	} else {
		// Unrecognized spec
		return false;
	}
};

const parse = (data: string) => {
	if (typeof data != "string") {
		// It's just a string
		return "Invalid data - Not a string";
	}
	let parsed;
	try {
		parsed = JSON.parse(data);
	} catch (e: unknown) {
		let errorMessage = "Invalid JSON";
		if (e instanceof Error) {
			errorMessage = `Invalid JSON - ${e.toString()}`;
		}
		return errorMessage;
	}

	if (
		typeof parsed !== "object" ||
		parsed === null ||
		parsed instanceof Array
	) {
		return `Invalid JSON - not an object (actual type: ${typeof parsed})`;
	}

	return parsed;
};

type ValidationOptions = {
	warnings?: boolean;
	recommendations?: boolean;
};
type ValidationOutput = {
	valid: boolean;
	errors?: string[];
	warnings?: string[];
	recommendations?: string[];
	critical?: string | Record<string, string>;
};
const validate = (
	data: string,
	specName: SpecName = "npm",
	options: ValidationOptions = {},
): ValidationOutput => {
	const parsed = parse(data);
	const out: ValidationOutput = { valid: false };

	if (typeof parsed == "string") {
		out.critical = parsed;
		return out;
	}

	const map = getSpecMap(specName, parsed.private);
	if (map === false) {
		out.critical = { "Invalid specification": specName };
		return out;
	}
	const errors: string[] = [];
	const warnings: string[] = [];
	const recommendations: string[] = [];

	let name: keyof typeof map;
	for (name in map) {
		const field = map[name]!;

		if (
			parsed[name] === undefined &&
			(!field.or || (field.or && parsed[field.or] === undefined))
		) {
			if (field.required) {
				errors.push(`Missing required field: ${name}`);
			} else if (field.warning) {
				warnings.push(`Missing recommended field: ${name}`);
			} else if (field.recommended) {
				recommendations.push(`Missing optional field: ${name}`);
			}
			continue;
		} else if (parsed[name] === undefined) {
			// It's empty, but not necessary
			continue;
		}

		// Type checking
		if (field.types || field.type) {
			const typeErrors = validateType(name, field, parsed[name]);
			if (typeErrors.length > 0) {
				errors.push(...typeErrors);
				continue;
			}
		}

		// Regexp format check
		if (field.format && !field.format.test(parsed[name])) {
			errors.push(
				`Value for field ${name}, ${parsed[name]} does not match format: ${field.format.toString()}`,
			);
		}

		// Validation function check
		if (field.validate && typeof field.validate === "function") {
			// Validation is expected to return an array of errors (empty means no errors)
			errors.push(...field.validate(name, parsed[name]));
		}
	}

	out.valid = errors.length > 0 ? false : true;
	if (errors.length > 0) {
		out.errors = errors;
	}
	if (options.warnings !== false && warnings.length > 0) {
		out.warnings = warnings;
	}
	if (options.recommendations !== false && recommendations.length > 0) {
		out.recommendations = recommendations;
	}

	return out;
};

/**
 * Validate that a field conforms to the shape defined by its `type` property.
 * @param name - The name of the field being validated
 * @param field - The field spec
 * @param value - The actual value of the field we're going to validate
 * @returns An array with a validation error (if a violation is found)
 */
const validateType = (
	name: string,
	field: FieldSpec,
	value: unknown[] | boolean | string | object,
): string[] => {
	// If there's no type defined, we can't validate it
	if (!field.types && !field.type) {
		return [];
	}
	const errors: string[] = [];
	const validFieldTypes = field.types || [field.type!];
	const valueType = value instanceof Array ? "array" : typeof value;
	if (!validFieldTypes.includes(valueType as SpecType)) {
		errors.push(
			`Type for field ${name} was expected to be ${validFieldTypes.join(" or ")}, not ${valueType}`,
		);
	}
	return errors;
};

/**
 * Validates dependencies, making sure the object is a set of key value pairs
 * with package names and versions
 * @param name - The name of the field being validated (e.g. "dependencies", "devDependencies")
 * @param deps - A dependencies Record
 * @returns An array with validation errors (if any violations are found)
 */
const validateDependencies = (
	name: string,
	deps: Record<string, string>,
): string[] => {
	const errors: string[] = [];
	for (const pkg in deps) {
		if (!packageFormat.test(pkg)) {
			errors.push(`Invalid dependency package name: ${pkg}`);
		}

		if (!isValidVersionRange(deps[pkg])) {
			errors.push(`Invalid version range for dependency ${pkg}: ${deps[pkg]}`);
		}
	}
	return errors;
};

const isValidVersionRange = (v: string): boolean => {
	// https://github.com/isaacs/npm/blob/master/doc/cli/json.md#dependencies
	return (
		/^[\^<>=~]{0,2}[0-9.x]+/.test(v) ||
		PJV.urlFormat.test(v) ||
		v == "*" ||
		v === "" ||
		v === "latest" ||
		(v.indexOf && v.indexOf("git") === 0) ||
		// https://pnpm.io/next/workspaces#workspace-protocol-workspace
		/^workspace:((\^|~)?[0-9.x]*|(<=?|>=?)?[0-9.x][\-.+\w]+|\*)?$/.test(v) ||
		// https://pnpm.io/next/catalogs
		(v.indexOf && v.indexOf("catalog:") === 0) ||
		(v.indexOf && v.indexOf("npm:") === 0) ||
		false
	);
};

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
const validateUrlOrMailto = (name: string, obj: UrlOrMailTo): string[] => {
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
const validatePeople = (name: string, obj: People): string[] => {
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

/**
 * Format for license(s) and repository(s):
 * url as a string
 * or
 * object with "type" and "url"
 * or
 * array of objects with "type" and "url"
 */
const validateUrlTypes = (
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

/** @deprecated please use the individual {@link validate} function */
export const PJV = {
	// Format regexes
	emailFormat,
	packageFormat,
	urlFormat,
	versionFormat,

	// Functions
	getSpecMap,
	parse,
	isValidVersionRange,
	validate,
	validateDependencies,
	validatePeople,
	validateType,
	validateUrlOrMailto,
	validateUrlTypes,
};

export { validate };
