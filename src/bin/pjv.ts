#!/usr/bin/env node
/* Command line interface for package-json-validator.
 *
 * For command line options, try --help

 * See README.md for more information
 */

// Command line options
var options = require("yargs/yargs")(process.argv.slice(2))
	.options("filename", {
		default: "package.json",
		alias: "f",
		description: "package.json file to validate",
	})
	.options("spec", {
		default: "npm",
		alias: "s",
		description: "spec to use - npm|commonjs_1.0|commonjs_1.1",
	})
	.options("warnings", {
		default: false,
		alias: "w",
		boolean: true,
		description: "display warnings",
	})
	.options("recommendations", {
		default: false,
		alias: "r",
		boolean: true,
		description: "display recommendations",
	})
	.options("quiet", {
		default: false,
		alias: "q",
		boolean: true,
		description: "less output",
	})
	.usage("Validate package.json files")
	.parse();

var PJV = require("../PJV").PJV;
var fs = require("fs");
if (!fs.existsSync(options.filename)) {
	console.error("File does not exist: " + options.filename);
	process.exit(1);
}

var contents = fs.readFileSync(options.filename).toString(),
	results = PJV.validate(contents, options.spec, {
		warnings: options.warnings,
		recommendations: options.recommendations,
	});

if (results.valid) {
	if (!options.quiet) {
		console.log(results);
	}
	process.exit(0);
} else {
	console.error(options.filename + " is NOT valid");
	console.error(results);
	process.exit(1);
}
