import valid from "validate-npm-package-license";

/**
 * Validate the `license` field in a package.json, using `validate-npm-package-license`.
 */
export const validateLicense = (license: unknown): string[] => {
	const errors: string[] = [];

	if (typeof license !== "string") {
		if (license === null) {
			errors.push("the field is `null`, but should be a `string`");
		} else {
			const valueType = Array.isArray(license) ? "Array" : typeof license;
			errors.push(`the type should be a \`string\`, not \`${valueType}\``);
		}
		return errors;
	}

	if (license.trim() === "") {
		errors.push("the value is empty, but should be a valid license");
	} else {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call -- not sure why this is complaining, seems to be false positive
		const validationResults = valid(license);
		if (validationResults.warnings) {
			errors.push(...validationResults.warnings);
		}
	}

	return errors;
};
