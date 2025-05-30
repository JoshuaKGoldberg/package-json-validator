import type { SpecMap, SpecName } from "./types";

import { packageFormat, urlFormat, versionFormat } from "./formats";
import {
	validateBin,
	validateDependencies,
	validatePeople,
	validateType,
	validateUrlOrMailto,
	validateUrlTypes,
} from "./validators";

const getSpecMap = (
	specName: SpecName,
	isPrivate: boolean,
): false | SpecMap => {
	if (specName == "npm") {
		// https://docs.npmjs.com/cli/v9/configuring-npm/package-json
		return {
			author: { validate: validatePeople, warning: true },
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
			version: {
				format: versionFormat,
				required: !isPrivate,
				type: "string",
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
				validate: validatePeople,
			},
			cpu: { type: "array" },
			dependencies: {
				required: true,
				type: "object",
				validate: validateDependencies,
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
				validate: validatePeople,
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
			contributors: { type: "array", validate: validatePeople },

			cpu: { type: "array" },
			dependencies: { type: "object", validate: validateDependencies },
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
				validate: validatePeople,
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
	specName: SpecName = "npm",
	options: ValidationOptions = {},
): ValidationOutput => {
	const parsed = typeof data == "object" ? data : parse(data);
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
			const typeErrors = validateType(name, field, parsed[name]);
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
