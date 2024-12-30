#!/usr/bin/env node
/**
 * Command line interface for package-json-validator.
 * For command line options, try --help
 * See README.md for more information
 */
import fs from "node:fs";
import process from "node:process";

import yargs from "yargs";

import { PJV } from "../PJV.js";
import type { SpecName } from "../types";

type Options = {
	filename: string;
	spec: SpecName;
	warnings: boolean;
	recommendations: boolean;
	quiet: boolean;
};

// Command line options
const options = yargs(process.argv.slice(2))
	.options("filename", {
		default: "package.json",
		alias: "f",
		description: "package.json file to validate",
	})
	.options("spec", {
		default: "npm",
		alias: "s",
		choices: ["npm", "commonjs_1.0", "commonjs_1.1"],
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
	.parse() as Options;

if (!fs.existsSync(options.filename)) {
	console.error("File does not exist: " + options.filename);
	process.exitCode = 1;
} else {
	const contents = fs.readFileSync(options.filename).toString(),
		results = PJV.validate(contents, options.spec, {
			warnings: options.warnings,
			recommendations: options.recommendations,
		});

	if (results.valid) {
		if (!options.quiet) {
			console.log(results);
		}
	} else {
		console.error(options.filename + " is NOT valid");
		console.error(results);
		process.exitCode = 1;
	}
}
