import { Result } from "../Result.ts";
import { validateBin } from "./validateBin.ts";
import { validateCpu } from "./validateCpu.ts";
import { validateExports } from "./validateExports.ts";
import { validateMain } from "./validateMain.ts";

const VALID_ACCESS = ["public", "restricted"];

const validateAccess = (value: unknown): Result => {
	const result = new Result();

	if (typeof value !== "string") {
		if (value !== null) {
			const valueType = Array.isArray(value) ? "Array" : typeof value;
			result.addIssue(`the type should be a \`string\`, not \`${valueType}\``);
		}
	} else if (value.trim() === "") {
		result.addIssue(
			`the value is empty, but should be "public" or "restricted"`,
		);
	} else if (!VALID_ACCESS.includes(value)) {
		result.addIssue(
			`the value "${value}" is not valid. Valid types are: ${VALID_ACCESS.join(", ")}`,
		);
	}
	return result;
};

const validateBoolean = (value: unknown): Result => {
	const result = new Result();

	if (typeof value !== "boolean") {
		if (value === null) {
			result.addIssue("the value is `null`, but should be a `boolean`");
		} else {
			const valueType = Array.isArray(value) ? "Array" : typeof value;
			result.addIssue(`the type should be a \`boolean\`, not \`${valueType}\``);
		}
	}

	return result;
};

const validateString = (
	value: unknown,
	propertyDescription: string,
): Result => {
	const result = new Result();

	if (typeof value !== "string") {
		if (value === null) {
			result.addIssue("the value is `null`, but should be a `string`");
		} else {
			const valueType = Array.isArray(value) ? "Array" : typeof value;
			result.addIssue(`the type should be a \`string\`, not \`${valueType}\``);
		}
	} else if (value.trim() === "") {
		result.addIssue(`the value is empty, but should be ${propertyDescription}`);
	}
	return result;
};

const propertyValidators: Record<string, (value: unknown) => Result> = {
	access: validateAccess,
	bin: validateBin,
	cpu: validateCpu,
	directory: (value) => validateString(value, "the path to a subdirectory"),
	exports: validateExports,
	main: validateMain,
	provenance: validateBoolean,
	tag: (value) => validateString(value, "a release tag"),
};

/**
 * Validate the `publishConfig` field in a package.json. The value
 * should be an object.  And when present, specific properties should conform
 * to the types that their respective package manager supports
 * @see https://docs.npmjs.com/cli/v11/commands/npm-publish#configuration
 * @see https://pnpm.io/package_json#publishconfig
 * @see https://yarnpkg.com/configuration/manifest#publishConfig
 */
export const validatePublishConfig = (value: unknown): Result => {
	const result = new Result();

	if (value === null) {
		result.addIssue("the value is `null`, but should be an `object`");
	} else if (typeof value !== "object" || Array.isArray(value)) {
		const valueType = Array.isArray(value) ? "Array" : typeof value;
		result.addIssue(`the type should be \`object\`, not \`${valueType}\``);
	} else {
		// Validate specific properties
		const entries = Object.entries(value);
		for (let i = 0; i < entries.length; i++) {
			const [key, value] = entries[i];
			let childResult: Result;
			if (key in propertyValidators) {
				childResult = propertyValidators[key](value);
			} else {
				childResult = new Result();
			}

			result.addChildResult(i, childResult);
		}
	}

	return result;
};
