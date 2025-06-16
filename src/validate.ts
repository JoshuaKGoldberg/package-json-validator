import type { SpecMap } from "./types.js";

import { packageFormat, urlFormat, versionFormat } from "./formats.js";
import {
	validateFieldType,
	validatePeople,
	validateUrlTypes,
} from "./utils/index.js";
import {
	validateAuthor,
	validateBin,
	validateDependencies,
	validateType,
	validateUrlOrMailto,
} from "./validators/index.js";

// https://docs.npmjs.com/cli/configuring-npm/package-json
// https://nodejs.org/api/packages.html
const getSpecMap = (isPrivate: boolean): SpecMap => ({
	author: { validate: (_, value) => validateAuthor(value), warning: true },
	bin: { validate: (_, value) => validateBin(value) },
	bugs: { validate: validateUrlOrMailto, warning: true },
	bundledDependencies: { type: "array" },
	bundleDependencies: { type: "array" },
	config: { type: "object" },
	contributors: { validate: validatePeople, warning: true },
	cpu: { type: "array" },
	dependencies: {
		recommended: true,
		type: "object",
		validate: validateDependencies,
	},
	description: { type: "string", warning: true },
	devDependencies: { type: "object", validate: validateDependencies },
	directories: { type: "object" },
	engines: { recommended: true, type: "object" },
	engineStrict: { type: "boolean" },
	files: { type: "array" },
	homepage: { format: urlFormat, recommended: true, type: "string" },
	keywords: { type: "array", warning: true },
	license: { type: "string" },
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
		type: "object",
		validate: validateDependencies,
	},
	os: { type: "array" },
	peerDependencies: {
		type: "object",
		validate: validateDependencies,
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
	scripts: { type: "object" },
	type: { recommended: true, validate: (_, value) => validateType(value) },
	version: {
		format: versionFormat,
		required: !isPrivate,
		type: "string",
	},
});

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
export const validate = (
	data: object | string,
	options: ValidationOptions = {},
): ValidationOutput => {
	const parsed = typeof data == "object" ? data : parse(data);
	const out: ValidationOutput = { valid: false };

	if (typeof parsed == "string") {
		out.critical = parsed;
		return out;
	}

	const map = getSpecMap(parsed.private);
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
