import type { FieldSpec, SpecType } from "../Spec.types.ts";

/**
 * Validate that a field conforms to the shape defined by its `type` property.
 * @param name The name of the field being validated
 * @param field The field spec
 * @param value The actual value of the field we're going to validate
 * @returns An array with a validation error (if a violation is found)
 */
export const validateFieldType = (
	name: string,
	field: FieldSpec,
	value: boolean | object | string | unknown[],
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
