/** Top-level result, returned from a validator function */
export interface Result {
	/** Equivalent of the previous return type, the full collection of error messages (including errors from child properties) */
	errorMessages: string[];

	/** Collection of issues for *this* object (property or array element) */
	issues: Issue[];

	/** Collection of result objects for child elements (either properties or array elements), if this property is an object or array */
	childResults?: ChildResult[];
}

/** Result object for a child (either a property in an object or an element of an array) */
export interface ChildResult extends Result {
	/** The index of this property in relation to its parent's collection (properties or array elements) */
	index: number;
}

/** Object with information about the issue identified by the validation rules  */
export interface Issue {
	/** The message with information about this issue */
	message: string;
}

/**
 * Create a Result object from the issues for this property value and an array of child results.
 * The resulting object's `isValid` property will be a product of its own `isValid` value and all of its children.
 * Similarly, the `errorMessages` property will be a combination of the `message` properties of its issues, and the `errorMessages` props of its children.
 * @param issuesOrMessages the collection of issues from this property value
 * @param childResults results from child property values
 */
export const createValidationResult = (
	issuesOrMessages: Issue[] | string[] = [],
	childResults: ChildResult[] = [],
): Result => {
	const issues: Issue[] = issuesOrMessages.map((item) =>
		typeof item === "string" ? { message: item } : item,
	);
	const errorMessages = issues.map((issue) => issue.message);
	errorMessages.push(
		...childResults.map((childResult) => childResult.errorMessages).flat(),
	);
	return {
		childResults,
		errorMessages,
		issues,
	};
};

/**
 * Adds a new child result to a parent result, adding the child's error messages to the parents, and
 * appending the child result to the parent's childResults array.
 */
export const addChildResult = (
	parent: Result,
	child: Result | string,
	index: number,
): void => {
	let newChild: Result;
	if (typeof child === "string") {
		const childResult = createValidationResult();
		addIssue(childResult, child);
		newChild = childResult;
	} else {
		newChild = child;
	}
	parent.childResults ??= [];
	parent.childResults.push({ ...newChild, index });
	parent.errorMessages.push(...newChild.errorMessages);
};

/**
 * Creates a new Issue and adds it to the provided Result's issues.
 */
export const addIssue = (result: Result, message: string): void => {
	result.issues.push({ message });
	result.errorMessages.push(message);
};

/**
 * Recursively flattens a Result object by pulling all issues from child results into the top-level result.
 */
export const flattenResult = (result: Result): Result => {
	const flattened = createValidationResult(result.issues);
	for (const childResult of result.childResults ?? []) {
		const flattenedChild = flattenResult(childResult);
		for (const issue of flattenedChild.issues) {
			addIssue(flattened, issue.message);
		}
	}
	return flattened;
};
