export { PJV } from "./PJV.ts";
export type { SpecName, SpecType } from "./types.ts";
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
	validateLicense,
	validateDependencies as validateOptionalDependencies,
	validateDependencies as validatePeerDependencies,
	validateScripts,
	validateType,
	validateVersion,
} from "./validators/index.ts";
