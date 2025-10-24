/** Object with information about the issue identified by the validation rules  */
export interface Issue {
	/** The message with information about this issue */
	message: string;
}

/** Top-level result, returned from a validator function */
export class Result {
	/** Equivalent of the previous return type, the full collection of error messages (including errors from child properties) */
	get errorMessages(): string[] {
		let errorMessages = this.#issues.map((issue) => issue.message);
		for (const childResult of this.#childResults) {
			errorMessages = errorMessages.concat(childResult.errorMessages);
		}
		return errorMessages;
	}

	#issues: Issue[];
	/** Collection of issues for *this* object (property or array element) */
	get issues(): Issue[] {
		return this.#issues;
	}

	#childResults: ChildResult[];
	/** Collection of result objects for child elements (either properties or array elements), if this property is an object or array */
	get childResults(): ChildResult[] {
		return this.#childResults;
	}

	/**
	 * Create a Result object from the issues for this property value and an array of child results.
	 * The resulting object's `errorMessages` property will be a combination of the `message` properties of its issues, and the `errorMessages` props of its children.
	 * @param issuesOrMessages the collection of issues from this property value
	 * @param childResults results from child property values
	 */
	constructor(
		issuesOrMessages: Issue[] | string[] = [],
		childResults: ChildResult[] = [],
	) {
		const issues: Issue[] = issuesOrMessages.map((item) =>
			typeof item === "string" ? { message: item } : item,
		);

		this.#childResults = childResults;
		this.#issues = issues;
	}

	/**
	 * Adds a new child result to this result, and adds the child's error messages to this result's `errorMessages`.
	 * @param child the ChildResult object to add
	 */
	addChildResult(child: ChildResult): void;

	/**
	 * Adds a new child result to this result, and adds the child's error messages to this result's `errorMessages`.
	 * @param index the index of this child in relation to its siblings (either properties in an object, or elements in an array)
	 * @param child the child Result object, or a string or array of strings to be converted into a Result object
	 */
	addChildResult(index: number, child?: Result | string | string[]): void;
	public addChildResult(
		indexOrChild: ChildResult | number,
		child: Result | string | string[] = [],
	): void {
		let newChild: ChildResult;
		if (indexOrChild instanceof ChildResult) {
			newChild = indexOrChild;
		} else {
			if (typeof child === "string") {
				const childResult = new ChildResult(indexOrChild);
				childResult.addIssue(child);
				newChild = childResult;
			} else if (Array.isArray(child)) {
				const childResult = new ChildResult(indexOrChild);
				for (const issueString of child) {
					childResult.addIssue(issueString);
				}
				newChild = childResult;
			} else {
				newChild = new ChildResult(indexOrChild, child);
			}
		}
		this.#childResults.push(newChild);
	}

	/**
	 * Creates a new {@link Issue} and adds it to this Result.
	 */
	public addIssue(message: string): void {
		this.#issues.push({ message });
	}

	/**
	 * Flattens this Result object (along with all child results) and pulls all issues from flattened child results into the top-level result.
	 */
	public flatten(): this {
		const flattenedIssues: Issue[] = [...this.#issues];
		for (const childResult of this.#childResults) {
			const flattenedChild = childResult.flatten();
			flattenedIssues.push(...flattenedChild.issues);
		}
		this.#issues = flattenedIssues;
		this.#childResults = [];
		return this;
	}
}

/** Result object for a child (either a property in an object or an element of an array) */
export class ChildResult extends Result {
	#index: number;
	/** The index of this property in relation to its parent's collection (properties or array elements) */
	get index(): number {
		return this.#index;
	}

	/**
	 * Given an index and all the parameters of `Result` constructor, this creates a new ChildResult object.
	 * @param index The index for this ChildResult.
	 * @param issuesOrMessages the collection of issues from this property value
	 * @param childResults results from child property values
	 * @returns The new ChildResult object
	 */
	constructor(
		index: number,
		issuesOrMessages?: Issue[] | string[],
		childResults?: ChildResult[],
	);

	/**
	 * Given an index and all the parameters of `Result` constructor, this creates a new ChildResult object.
	 * @param index The index for this ChildResult.
	 * @param result The Result object to copy issues and childResults from
	 * @returns The new ChildResult object
	 */
	constructor(index: number, result: Result);
	constructor(
		index: number,
		issuesOrMessagesOrResult: Issue[] | Result | string[] = [],
		childResults: ChildResult[] = [],
	) {
		if (issuesOrMessagesOrResult instanceof Result) {
			super(
				issuesOrMessagesOrResult.issues,
				issuesOrMessagesOrResult.childResults,
			);
		} else {
			super(issuesOrMessagesOrResult, childResults);
		}
		this.#index = index;
	}
}
