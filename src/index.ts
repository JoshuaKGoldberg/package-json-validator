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
	validateLicense,
	validateDependencies as validateOptionalDependencies,
	validateDependencies as validatePeerDependencies,
	validateScripts,
	validateType,
	validateVersion,
} from "./validators/index.ts";
