#!/usr/bin/env node

/**
 * Command line interface for package-json-validator.
 * For command line options, try --help
 * See README.md for more information
 */
import fs from "node:fs";
import process from "node:process";
import yargs from "yargs";

import { validate } from "../validate.ts";

interface Options {
	filename: string;
	quiet: boolean;
	recommendations: boolean;
	warnings: boolean;
}

// Command line options
const options = yargs(process.argv.slice(2))
	.options("filename", {
		alias: "f",
		default: "package.json",
		description: "package.json file to validate",
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

if (!options.quiet) {
	console.warn(
		"The pjv CLI in package-json-validator is deprecated and will be removed soon. Please use package-json-validator-cli instead.",
	);
}

if (!fs.existsSync(options.filename)) {
	console.error("File does not exist: " + options.filename);
	process.exitCode = 1;
} else {
	const contents = fs.readFileSync(options.filename).toString(),
		results = validate(contents, {
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
