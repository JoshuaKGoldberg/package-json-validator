import { ChildResult, Result } from "../Result.ts";

type RepositoryValidator = (value: string) => Result;

const validateNonEmptyString = (
	value: string,
	property: string,
	description: string,
) => {
	const result = new Result();
	if (value.trim() === "") {
		result.addIssue(
			`the value of property "${property}" is empty, but should be ${description}`,
		);
	}
	return result;
};

const repoUrlRegex =
	/^(?:(?:git\+)?(?:https?|git):\/\/[\w.-]+(?::\d+)?(?:\/[\w.~:/?#@!$&'()*+,;=%-]+)?(?:\.git)?\/?|git@[\w.-]+:[\w.~:/?#@!$&'()*+,;=%-]+\.git)$/;
const repositoryValidators = {
	directory: (value) =>
		validateNonEmptyString(
			value,
			"directory",
			"the path to this package in the repository",
		),
	type: (value) =>
		validateNonEmptyString(
			value,
			"type",
			'the type of repository this is (e.g. "git")',
		),
	url: (value: string) => {
		const result = new Result();

		// Should match the url regex
		if (!repoUrlRegex.exec(value)) {
			result.addIssue(
				`the value of property "url" is invalid; it should be the url to a repository (e.g. "git+https://github.com/npm/cli.git")`,
			);
		}
		return result;
	},
} satisfies Record<"directory" | "type" | "url", RepositoryValidator>;

const KNOWN_PROVIDERS = ["bitbucket", "gist", "github", "gitlab"];
const REPONAME_REGEX: Record<(typeof KNOWN_PROVIDERS)[number], RegExp> = {
	bitbucket: /^[\w.-]+\/[\w.-]+$/,
	gist: /^[\w.-]+$/,
	github: /^[\w.-]+\/[\w.-]+$/,
	gitlab: /^[\w.-]+\/[\w.-]+$/,
};

/**
 * Should be of the form &lt;provider>:&lt;user>/&lt;repo>, or without the provider if the repo is from github.
 */
const isValidShorthandRepoString = (value: string): boolean => {
	// It should either have no repo prefix, which means it's github, or should
	// be prefixed by a known repo provider.
	const parts = value.split(":");
	let provider = "github";
	let repo = parts[0];
	if (parts.length > 1) {
		provider = parts[0];
		repo = parts[1];
	}

	if (!KNOWN_PROVIDERS.includes(provider)) {
		return false;
	}

	// Repo name should match, based on the provider
	if (!REPONAME_REGEX[provider].exec(repo)) {
		return false;
	}

	return true;
};

/**
 * Validate the `repository` field in a package.json, which can either be an object
 * with `type`, `url`, and optionally `directory`, or a string with shorthand
 * syntax to a supported repo.
 *
 * {
 *  "type": "git",
 *  "url": "git+https://github.com/npm/cli.git",
 *  "directory": "packages/lib-a"
 * }
 * @see https://docs.npmjs.com/cli/v11/configuring-npm/package-json#repository
 */
export const validateRepository = (obj: unknown): Result => {
	const result = new Result();

	if (typeof obj === "string") {
		if (obj.trim() === "") {
			result.addIssue(
				"the value is empty, but should be repository shorthand string",
			);
		} else if (!isValidShorthandRepoString(obj)) {
			result.addIssue(
				`the value "${obj}" is invalid; it should be the shorthand for a repository (e.g. "github:npm/example")`,
			);
		}
	} else if (obj && typeof obj === "object" && !Array.isArray(obj)) {
		const seenProperties = new Set<string>();
		let propertyNumber = 0;
		for (const [key, value] of Object.entries(obj)) {
			const childResult = new ChildResult(propertyNumber);
			const normalizedKey = key.trim();
			const propertyName =
				normalizedKey === "" ? String(propertyNumber) : `"${normalizedKey}"`;

			if (key === "directory" || key === "type" || key === "url") {
				seenProperties.add(key);

				if (typeof value !== "string") {
					childResult.addIssue(
						`the value of property ${propertyName} should be a string`,
					);
				} else {
					const propertyResult = repositoryValidators[key](value);
					propertyResult.issues.forEach((issue) => {
						childResult.addIssue(issue.message);
					});
				}
			} else {
				childResult.addIssue(
					`property ${propertyName} is invalid; keys should be "type", "url", and optionally "directory"`,
				);
			}
			result.addChildResult(childResult);
			propertyNumber++;
		}

		// the object should at least have `type` and `url`.
		if (!seenProperties.has("type")) {
			result.addIssue(
				`repository is missing property "type", which should be the type of repository this is (e.g. "git")`,
			);
		}
		if (!seenProperties.has("url")) {
			result.addIssue(
				`repository is missing property "url", which should be the url to a repository (e.g. "git+https://github.com/npm/cli.git")`,
			);
		}
	} else if (obj === null) {
		result.addIssue(
			"the value is `null`, but should be an `object` or a `string`",
		);
	} else {
		const valueType = Array.isArray(obj) ? "Array" : typeof obj;
		result.addIssue(
			`the type should be \`object\` or \`string\`, not \`${valueType}\``,
		);
	}

	return result;
};
