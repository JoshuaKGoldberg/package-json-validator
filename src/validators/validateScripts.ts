import { ChildResult, Result } from "../Result.ts";

/**
 * Validate the `scripts` field in a package.json. The value of
 * should be a Record&lt;string, string&gt;
 */
export const validateScripts = (obj: unknown): Result => {
	const result = new Result();

	if (obj && typeof obj === "object" && !Array.isArray(obj)) {
		const entries = Object.entries(obj);
		for (let i = 0; i < entries.length; i++) {
			const childResult = new ChildResult(i);

			const [key, value] = entries[i] as [string, unknown];
			const normalizedKey = key.trim();
			const propertyName =
				normalizedKey === "" ? String(i) : `"${normalizedKey}"`;

			if (typeof value !== "string") {
				childResult.addIssue(
					`the value of property ${propertyName} should be a string`,
				);
			} else if (value.trim() === "") {
				childResult.addIssue(
					`the value of property ${propertyName} is empty, but should be a script command`,
				);
			}
			if (key.trim() === "") {
				childResult.addIssue(
					`property ${propertyName} has an empty key, but should be a script name`,
				);
			}
			result.addChildResult(childResult);
		}
	} else if (obj === null) {
		result.addIssue("the value is `null`, but should be an `object`");
	} else {
		const valueType = Array.isArray(obj) ? "array" : typeof obj;
		result.addIssue(`the type should be \`object\`, not \`${valueType}\``);
	}

	return result;
};
