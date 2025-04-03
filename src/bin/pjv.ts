#!/usr/bin/env node

/**
 * Command line interface for package-json-validator.
 * For command line options, try --help
 * See README.md for more information
 */
import fs from "node:fs";
import process from "node:process";
import yargs from "yargs";

import type { SpecName } from "../types";

import { validate } from "../validate.js";

interface Options {
	filename: string;
	quiet: boolean;
	recommendations: boolean;
	spec: SpecName;
	warnings: boolean;
}

// Command line options
const options = yargs(process.argv.slice(2))
	.options("filename", {
		alias: "f",
		default: "package.json",
		description: "package.json file to validate",
	})
	.options("spec", {
		alias: "s",
		choices: ["npm", "commonjs_1.0", "commonjs_1.1"],
		default: "npm",
		description: "spec to use - npm|commonjs_1.0|commonjs_1.1",
	})
	.options("warnings", {
		alias: "w",
		boolean: true,
		default: false,
		description: "display warnings",
	})
	.options("recommendations", {
		alias: "r",
		boolean: true,
		default: false,
		description: "display recommendations",
	})
	.options("quiet", {
		alias: "q",
		boolean: true,
		default: false,
		description: "less output",
	})
	.usage("Validate package.json files")
	.parse() as Options;

if (!fs.existsSync(options.filename)) {
	console.error("File does not exist: " + options.filename);
	process.exitCode = 1;
} else {
	const contents = fs.readFileSync(options.filename).toString(),
		results = validate(contents, options.spec, {
			recommendations: options.recommendations,
			warnings: options.warnings,
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
