export type { Result } from "./Result.ts";
export type { SpecName, SpecType } from "./Spec.types.ts";
export { validate } from "./validate.ts";
export {
	validateAuthor,
	validateBin,
	validateBundleDependencies,
	validateConfig,
	validateCpu,
	validateDependencies,
	validateDescription,
	validateDependencies as validateDevDependencies,
	validateDirectories,
	validateExports,
	validateFiles,
	validateHomepage,
	validateKeywords,
	validateLicense,
	validateMain,
	validateMan,
	validateDependencies as validateOptionalDependencies,
	validateDependencies as validatePeerDependencies,
	validatePrivate,
	validateScripts,
	validateType,
	validateVersion,
	validateWorkspaces,
} from "./validators/index.ts";
