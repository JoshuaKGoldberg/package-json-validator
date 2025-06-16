import type { SpecMap } from "./Spec.types.ts";

import { validateFieldType } from "./utils/index.ts";
import {
	validateAuthor,
	validateBin,
	validateBundleDependencies,
	validateConfig,
	validateContributors,
	validateCpu,
	validateDependencies,
	validateDescription,
	validateDirectories,
	validateEngines,
	validateExports,
	validateFiles,
	validateHomepage,
	validateKeywords,
	validateLicense,
	validateMain,
	validateMan,
	validateName,
	validateOs,
	validatePrivate,
	validatePublishConfig,
	validateRepository,
	validateScripts,
	validateSideEffects,
	validateType,
	validateUrlOrMailto,
	validateVersion,
	validateWorkspaces,
} from "./validators/index.ts";

// https://docs.npmjs.com/cli/v11/configuring-npm/package-json
		// https://nodejs.org/api/packages.html
const getSpecMap = (
	isPrivate: boolean,
): SpecMap => ({
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
				validate: (_, value) => validateContributors(value).errorMessages,
			},
			cpu: { validate: (_, value) => validateCpu(value).errorMessages },
			dependencies: {
				recommended: true,
				validate: (_, value) => validateDependencies(value).errorMessages,
			},
			description: {
				validate: (_, value) => validateDescription(value).errorMessages,
				warning: true,
			},
			devDependencies: {
				validate: (_, value) => validateDependencies(value).errorMessages,
			},
			directories: {
				validate: (_, value) => validateDirectories(value).errorMessages,
			},
			engines: {
				recommended: true,
				validate: (_, value) => validateEngines(value).errorMessages,
			},
			exports: { validate: (_, value) => validateExports(value).errorMessages },
			files: { validate: (_, value) => validateFiles(value).errorMessages },
			homepage: {
				recommended: true,
				validate: (_, value) => validateHomepage(value).errorMessages,
			},
			keywords: {
				validate: (_, value) => validateKeywords(value).errorMessages,
				warning: true,
			},
			license: {
				validate: (_, value) => validateLicense(value).errorMessages,
				warning: true,
			},
			main: { validate: (_, value) => validateMain(value).errorMessages },
			man: { validate: (_, value) => validateMan(value).errorMessages },
			name: {
				required: !isPrivate,
				validate: (_, value) => validateName(value).errorMessages,
			},
			optionalDependencies: {
				validate: (_, value) => validateDependencies(value).errorMessages,
			},
			os: { validate: (_, value) => validateOs(value).errorMessages },
			peerDependencies: {
				validate: (_, value) => validateDependencies(value).errorMessages,
			},
			private: { validate: (_, value) => validatePrivate(value).errorMessages },
			publishConfig: {
				validate: (_, value) => validatePublishConfig(value).errorMessages,
			},
			repository: {
				validate: (_, value) => validateRepository(value).errorMessages,
				warning: true,
			},
			scripts: { validate: (_, value) => validateScripts(value).errorMessages },
			sideEffects: {
				validate: (_, value) => validateSideEffects(value).errorMessages,
			},
			type: {
				recommended: true,
				validate: (_, value) => validateType(value).errorMessages,
			},
			version: {
				required: !isPrivate,
				validate: (_, value) => validateVersion(value).errorMessages,
			},
			workspaces: {
				validate: (_, value) => validateWorkspaces(value).errorMessages,
			},
		});

const parse = (data: string) => {
	if (typeof data != "string") {
		// It's just a string
		return "Invalid data - Not a string";
	}
	let parsed;
	try {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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

	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	return parsed;
};

export type ValidateFunction = (data: object | string, options?: ValidationOptions) => ValidationOutput;

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
 * @param options The options for validation, if using the deprecated spec name parameter.
 * @returns an object with the validation results.
 */
export const validate: ValidateFunction = (
	data: object | string,
	options: ValidationOptions = {},
): ValidationOutput => {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const parsed = typeof data == "object" ? data : parse(data);
	const out: ValidationOutput = { valid: false };

	if (typeof parsed == "string") {
		out.critical = parsed;
		return out;
	}

	const map = getSpecMap((parsed.private as boolean | undefined) ?? false);
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
			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			const typeErrors = validateFieldType(name, field, parsed[name]);
			if (typeErrors.length > 0) {
				errors.push(...typeErrors.map((e) => ({ field: name, message: e })));
				continue;
			}
		}

		// Regexp format check
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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
