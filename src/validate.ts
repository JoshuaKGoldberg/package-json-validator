import type { SpecMap, SpecName } from "./Spec.types.ts";

import { packageFormat, urlFormat, versionFormat } from "./formats.ts";
import {
	validateFieldType,
	validatePeople,
	validateUrlTypes,
} from "./utils/index.js";
import {
	validateAuthor,
	validateBin,
	validateBundleDependencies,
	validateConfig,
	validateCpu,
	validateDependencies,
	validateDescription,
	validateDirectories,
	validateExports,
	validateLicense,
	validateScripts,
	validateType,
	validateUrlOrMailto,
	validateVersion,
} from "./validators/index.js";

const getSpecMap = (
	isPrivate: boolean,
	specName: SpecName = "npm",
): false | SpecMap => {
	if (specName == "npm") {
		// https://docs.npmjs.com/cli/v11/configuring-npm/package-json
		// https://nodejs.org/api/packages.html
		return {
			author: {
				validate: (_, value) => validateAuthor(value).errorMessages,
				warning: true,
			},
			bin: { validate: (_, value) => validateBin(value).errorMessages },
			bugs: { validate: validateUrlOrMailto, warning: true },
			bundledDependencies: {
				validate: (_, value) => validateBundleDependencies(value).errorMessages,
			},
			bundleDependencies: {
				validate: (_, value) => validateBundleDependencies(value).errorMessages,
			},
			config: { validate: (_, value) => validateConfig(value).errorMessages },
			contributors: {
				validate: (_, value) => validatePeople(value).errorMessages,
			},
			cpu: { validate: (_, value) => validateCpu(value) },
			dependencies: {
				recommended: true,
				validate: (_, value) => validateDependencies(value),
			},
			description: {
				validate: (_, value) => validateDescription(value),
				warning: true,
			},
			devDependencies: { validate: (_, value) => validateDependencies(value) },
			directories: { validate: (_, value) => validateDirectories(value) },
			engines: { recommended: true, type: "object" },
			engineStrict: { type: "boolean" },
			exports: { validate: (_, value) => validateExports(value) },
			files: { type: "array" },
			homepage: { format: urlFormat, recommended: true, type: "string" },
			keywords: { type: "array", warning: true },
			license: { validate: (_, value) => validateLicense(value) },
			licenses: {
				or: "license",
				type: "array",
				validate: validateUrlTypes,
				warning: true,
			},
			main: { type: "string" },
			man: { types: ["string", "array"] },
			name: {
				format: packageFormat,
				required: !isPrivate,
				type: "string",
			},
			optionalDependencies: {
				validate: (_, value) => validateDependencies(value),
			},
			os: { type: "array" },
			peerDependencies: {
				validate: (_, value) => validateDependencies(value),
			},
			preferGlobal: { type: "boolean" },
			private: { type: "boolean" },
			publishConfig: { type: "object" },
			repository: {
				or: "repositories",
				types: ["string", "object"],
				validate: validateUrlTypes,
				warning: true,
			},
			scripts: { validate: (_, value) => validateScripts(value) },
			type: { recommended: true, validate: (_, value) => validateType(value) },
			version: {
				required: !isPrivate,
				validate: (_, value) => validateVersion(value).errorMessages,
			},
		};
	} else if (specName == "commonjs_1.0") {
		// http://wiki.commonjs.org/wiki/Packages/1.0
		return {
			bugs: {
				required: true,
				type: "string",
				validate: validateUrlOrMailto,
			},
			builtin: { type: "boolean" },
			checksums: { type: "object" },
			contributors: {
				required: true,
				type: "array",
				validate: (_, value) => validatePeople(value).errorMessages,
			},
			cpu: { type: "array" },
			dependencies: {
				required: true,
				validate: (_, value) => validateDependencies(value),
			},
			description: { required: true, type: "string" },
			directories: { type: "object" },
			engine: { type: "array" },
			homepage: { format: urlFormat, type: "string" },

			implements: { type: "array" },
			keywords: { required: true, type: "array" },
			licenses: {
				required: true,
				type: "array",
				validate: validateUrlTypes,
			},
			maintainers: {
				required: true,
				type: "array",
				validate: (_, value) => validatePeople(value).errorMessages,
			},
			name: { format: packageFormat, required: true, type: "string" },
			os: { type: "array" },
			repositories: {
				required: true,
				type: "object",
				validate: validateUrlTypes,
			},
			scripts: { type: "object" },
			version: { format: versionFormat, required: true, type: "string" },
		};
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	} else if (specName == "commonjs_1.1") {
		// http://wiki.commonjs.org/wiki/Packages/1.1
		return {
			bugs: {
				type: "string",
				validate: validateUrlOrMailto,
				warning: true,
			},
			builtin: { type: "boolean" },
			checksums: { type: "object" },
			contributors: {
				type: "array",
				validate: (_, value) => validatePeople(value).errorMessages,
			},

			cpu: { type: "array" },
			dependencies: { validate: (_, value) => validateDependencies(value) },
			description: { type: "string", warning: true },
			directories: { required: true, type: "object" },
			engine: { type: "array" },
			homepage: { format: urlFormat, type: "string", warning: true },
			implements: { type: "array" },
			keywords: { type: "array" },
			licenses: {
				type: "array",
				validate: validateUrlTypes,
				warning: true,
			},
			main: { required: true, type: "string" },
			maintainers: {
				type: "array",
				validate: (_, value) => validatePeople(value).errorMessages,
				warning: true,
			},
			name: { format: packageFormat, required: true, type: "string" },
			os: { type: "array" },
			overlay: { type: "object" },
			repositories: { type: "array", validate: validateUrlTypes },
			scripts: { type: "object" },
			version: { format: versionFormat, required: true, type: "string" },
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

export interface ValidateFunction {
	(data: object | string, options?: ValidationOptions): ValidationOutput;

	/** @deprecated Both commonjs specs have been deprecated. Please use `validate(data, options)` instead. */
	(
		data: object | string,
		specName?: SpecName,
		options?: ValidationOptions,
	): ValidationOutput;
}

export interface ValidationOptions {
	recommendations?: boolean;
	warnings?: boolean;
}

export interface ValidationOutput {
	critical?: Record<string, string> | string;
	errors?: ValidationError[];
	recommendations?: string[];
	valid: boolean;
	warnings?: string[];
}

interface ValidationError {
	field: string;
	message: string;
}

/**
 * Validate a package.json object (or string) against the npm spec.
 * @param data The package.json data to validate, either as a string or an object.
 * @param specNameOrOptions The options object, or the specification name to use for validation (deprecated).
 * @param options The options for validation, if using the deprecated spec name parameter.
 * @returns an object with the validation results.
 */
export const validate: ValidateFunction = (
	data: object | string,
	specNameOrOptions: SpecName | ValidationOptions = "npm",
	options: ValidationOptions = {},
): ValidationOutput => {
	const parsed = typeof data == "object" ? data : parse(data);
	const out: ValidationOutput = { valid: false };

	if (typeof parsed == "string") {
		out.critical = parsed;
		return out;
	}

	let specName: SpecName | ValidationOptions;
	if (typeof specNameOrOptions === "object") {
		specName = "npm"; // Default spec
		options = specNameOrOptions; // Use the options from the second parameter
	} else {
		specName = specNameOrOptions;
	}

	const map = getSpecMap(parsed.private, specName);
	if (map === false) {
		out.critical = { "Invalid specification": specName };
		return out;
	}
	const errors: ValidationError[] = [];
	const warnings: string[] = [];
	const recommendations: string[] = [];

	let name: keyof typeof map;
	for (name in map) {
		const field = map[name];

		if (
			parsed[name] === undefined &&
			(!field.or || (field.or && parsed[field.or] === undefined))
		) {
			if (field.required) {
				errors.push({
					field: name,
					message: `Missing required field: ${name}`,
				});
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
			const typeErrors = validateFieldType(name, field, parsed[name]);
			if (typeErrors.length > 0) {
				errors.push(...typeErrors.map((e) => ({ field: name, message: e })));
				continue;
			}
		}

		// Regexp format check
		if (field.format && !field.format.test(parsed[name])) {
			errors.push({
				field: name,
				message: `Value for field ${name}, ${parsed[name]} does not match format: ${field.format.toString()}`,
			});
		}

		// Validation function check
		if (field.validate && typeof field.validate === "function") {
			// Validation is expected to return an array of errors (empty means no errors)
			errors.push(
				...field
					.validate(name, parsed[name])
					.map((e) => ({ field: name, message: e })),
			);
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
