export { PJV } from "./PJV.js";
export type { SpecName, SpecType } from "./types.js";
export { validate } from "./validate.js";
export {
	validateAuthor,
	validateBin,
	validateBundleDependencies,
	validateConfig,
	validateCpu,
	validateDependencies,
	validateDescription,
	validateDependencies as validateDevDependencies,
	validateLicense,
	validateDependencies as validateOptionalDependencies,
	validateDependencies as validatePeerDependencies,
	validateScripts,
	validateType,
	validateVersion,
} from "./validators/index.js";
