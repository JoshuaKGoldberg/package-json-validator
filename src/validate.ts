import { packageFormat, urlFormat, versionFormat } from "./formats.js";
import type { SpecMap, SpecName } from "./types";
import {
	validateDependencies,
	validatePeople,
	validateType,
	validateUrlOrMailto,
	validateUrlTypes,
} from "./validators/index.js";

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
export const validate = (
	data: string | object,
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
