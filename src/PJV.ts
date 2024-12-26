(function (exports) {
	/* Parse the incoming string as JSON, validate it against the spec for package.json
	 * See README for more details
	 */
	exports.PJV = {
		packageFormat: /^[a-zA-Z0-9@\/][a-zA-Z0-9@\/\.\-_]*$/,
		versionFormat: /^[0-9]+\.[0-9]+[0-9+a-zA-Z\.\-]+$/,
		urlFormat: /^https*:\/\/[a-z.\-0-9]+/,
		emailFormat: /\S+@\S+/, // I know this isn't thorough. it's not supposed to be.
	};

	var PJV = exports.PJV;

	PJV.getSpecMap = function (specName, isPrivate) {
		if (specName == "npm") {
			// https://docs.npmjs.com/cli/v9/configuring-npm/package-json
			return {
				name: {
					type: "string",
					required: !isPrivate,
					format: PJV.packageFormat,
				},
				version: {
					type: "string",
					required: !isPrivate,
					format: PJV.versionFormat,
				},
				description: { type: "string", warning: true },
				keywords: { type: "array", warning: true },
				homepage: { type: "string", recommended: true, format: PJV.urlFormat },
				bugs: { warning: true, validate: PJV.validateUrlOrMailto },
				licenses: {
					type: "array",
					warning: true,
					validate: PJV.validateUrlTypes,
					or: "license",
				},
				license: { type: "string" },
				author: { warning: true, validate: PJV.validatePeople },
				contributors: { warning: true, validate: PJV.validatePeople },
				files: { type: "array" },
				main: { type: "string" },
				bin: { types: ["string", "object"] },
				man: { types: ["string", "array"] },
				directories: { type: "object" },
				repository: {
					types: ["string", "object"],
					warning: true,
					validate: PJV.validateUrlTypes,
					or: "repositories",
				},
				scripts: { type: "object" },
				config: { type: "object" },
				dependencies: {
					type: "object",
					recommended: true,
					validate: PJV.validateDependencies,
				},
				devDependencies: { type: "object", validate: PJV.validateDependencies },
				peerDependencies: {
					type: "object",
					validate: PJV.validateDependencies,
				},
				bundledDependencies: { type: "array" },
				bundleDependencies: { type: "array" },
				optionalDependencies: {
					type: "object",
					validate: PJV.validateDependencies,
				},
				engines: { type: "object", recommended: true },
				engineStrict: { type: "boolean" },
				os: { type: "array" },
				cpu: { type: "array" },
				preferGlobal: { type: "boolean" },
				private: { type: "boolean" },
				publishConfig: { type: "object" },
			};
		} else if (specName == "commonjs_1.0") {
			// http://wiki.commonjs.org/wiki/Packages/1.0
			return {
				name: { type: "string", required: true, format: PJV.packageFormat },
				description: { type: "string", required: true },
				version: { type: "string", required: true, format: PJV.versionFormat },
				keywords: { type: "array", required: true },
				maintainers: {
					type: "array",
					required: true,
					validate: PJV.validatePeople,
				},
				contributors: {
					type: "array",
					required: true,
					validate: PJV.validatePeople,
				},
				bugs: {
					type: "string",
					required: true,
					validate: PJV.validateUrlOrMailto,
				},
				licenses: {
					type: "array",
					required: true,
					validate: PJV.validateUrlTypes,
				},
				repositories: {
					type: "object",
					required: true,
					validate: PJV.validateUrlTypes,
				},
				dependencies: {
					type: "object",
					required: true,
					validate: PJV.validateDependencies,
				},

				homepage: { type: "string", format: PJV.urlFormat },
				os: { type: "array" },
				cpu: { type: "array" },
				engine: { type: "array" },
				builtin: { type: "boolean" },
				directories: { type: "object" },
				implements: { type: "array" },
				scripts: { type: "object" },
				checksums: { type: "object" },
			};
		} else if (specName == "commonjs_1.1") {
			// http://wiki.commonjs.org/wiki/Packages/1.1
			return {
				name: { type: "string", required: true, format: PJV.packageFormat },
				version: { type: "string", required: true, format: PJV.versionFormat },
				main: { type: "string", required: true },
				directories: { type: "object", required: true },

				maintainers: {
					type: "array",
					warning: true,
					validate: PJV.validatePeople,
				},
				description: { type: "string", warning: true },
				licenses: {
					type: "array",
					warning: true,
					validate: PJV.validateUrlTypes,
				},
				bugs: {
					type: "string",
					warning: true,
					validate: PJV.validateUrlOrMailto,
				},
				keywords: { type: "array" },
				repositories: { type: "array", validate: PJV.validateUrlTypes },
				contributors: { type: "array", validate: PJV.validatePeople },
				dependencies: { type: "object", validate: PJV.validateDependencies },
				homepage: { type: "string", warning: true, format: PJV.urlFormat },
				os: { type: "array" },
				cpu: { type: "array" },
				engine: { type: "array" },
				builtin: { type: "boolean" },
				implements: { type: "array" },
				scripts: { type: "object" },
				overlay: { type: "object" },
				checksums: { type: "object" },
			};
		} else {
			// Unrecognized spec
			return false;
		}
	};

	PJV.parse = function (data) {
		if (typeof data != "string") {
			// It's just a string
			return "Invalid data - Not a string";
		}
		var parsed;
		try {
			parsed = JSON.parse(data);
		} catch (e) {
			return "Invalid JSON - " + e.toString();
		}

		if (
			typeof parsed != "object" ||
			parsed === null ||
			parsed instanceof Array
		) {
			return "Invalid JSON - not an an object " + typeof parsed;
		}

		return parsed;
	};

	PJV.validate = function (data, specName, options) {
		/* jshint maxstatements: 45, maxcomplexity: 21 */
		options = options || {};
		specName = specName || "npm";
		var parsed = PJV.parse(data),
			out = { valid: false };

		if (typeof parsed == "string") {
			out.critical = parsed;
			return out;
		}

		var map = PJV.getSpecMap(specName, parsed.private);
		if (specName === false) {
			out.critical = { "Invalid specification": specName };
			return out;
		}
		var errors = [],
			warnings = [],
			recommendations = [];

		for (var name in map) {
			var field = map[name];

			if (
				parsed[name] === undefined &&
				(!field.or || (field.or && parsed[field.or] === undefined))
			) {
				if (field.required) {
					errors.push("Missing required field: " + name);
				} else if (field.warning) {
					warnings.push("Missing recommended field: " + name);
				} else if (field.recommended) {
					recommendations.push("Missing optional field: " + name);
				}
				continue;
			} else if (parsed[name] === undefined) {
				// It's empty, but not necessary
				continue;
			}

			// Type checking
			if (field.types || field.type) {
				var typeErrors = PJV.validateType(name, field, parsed[name]);
				if (typeErrors.length > 0) {
					errors = errors.concat(typeErrors);
					continue;
				}
			}

			// Regexp format check
			if (field.format && !field.format.test(parsed[name])) {
				errors.push(
					"Value for field " +
						name +
						", " +
						parsed[name] +
						" does not match format: " +
						field.format.toString(),
				);
			}

			// Validation function check
			if (typeof field.validate == "function") {
				// Validation is expected to return an array of errors (empty means no errors)
				errors = errors.concat(field.validate(name, parsed[name]));
			}
		}

		out.valid = errors.length > 0 ? false : true;
		if (errors.length > 0) {
			out.errors = errors;
		}
		if (options.warnings !== false && warnings.length > 0) {
			out.warnings = warnings;
		}
		if (options.recommendations !== false && recommendations.length > 0) {
			out.recommendations = recommendations;
		}

		return out;
	};

	PJV.validateType = function (name, field, value) {
		var errors = [];
		var validFieldTypes = field.types || [field.type];
		var valueType = value instanceof Array ? "array" : typeof value;
		if (validFieldTypes.indexOf(valueType) == -1) {
			errors.push(
				"Type for field " +
					name +
					", was expected to be " +
					validFieldTypes.join(" or ") +
					", not " +
					typeof value,
			);
		}
		return errors;
	};

	// Validates dependencies, making sure the object is a set of key value pairs
	// with package names and versions
	PJV.validateDependencies = function (name, deps) {
		var errors = [];
		for (var pkg in deps) {
			if (!PJV.packageFormat.test(pkg)) {
				errors.push("Invalid dependency package name: " + pkg);
			}

			if (!PJV.isValidVersionRange(deps[pkg])) {
				errors.push(
					"Invalid version range for dependency " + pkg + ": " + deps[pkg],
				);
			}
		}
		return errors;
	};

	PJV.isValidVersionRange = function (v) {
		// https://github.com/isaacs/npm/blob/master/doc/cli/json.md#dependencies
		return (
			/^[\^<>=~]{0,2}[0-9.x]+/.test(v) ||
			PJV.urlFormat.test(v) ||
			v == "*" ||
			v === "" ||
			v === "latest" ||
			(v.indexOf && v.indexOf("git") === 0) ||
			// https://pnpm.io/next/workspaces#workspace-protocol-workspace
			/^workspace:((\^|~)?[0-9.x]*|(<=?|>=?)?[0-9.x][\-.+\w]+|\*)?$/.test(v) ||
			// https://pnpm.io/next/catalogs
			(v.indexOf && v.indexOf("catalog:") === 0) ||
			(v.indexOf && v.indexOf("npm:") === 0) ||
			false
		);
	};

	// Allows for a url as a string, or an object that looks like:
	/*
    {
        "url" : "http://github.com/owner/project/issues",
        "email" : "project@hostname.com"
    }
    or
    {
        "mail": "dev@example.com",
        "web": "http://www.example.com/bugs"
    }
    */
	PJV.validateUrlOrMailto = function (name, obj) {
		/* jshint maxcomplexity: 10 */
		var errors = [];
		if (typeof obj == "string") {
			if (!PJV.urlFormat.test(obj) && !PJV.emailFormat.test(obj)) {
				errors.push(name + " should be an email or a url");
			}
		} else if (typeof obj == "object") {
			if (!obj.email && !obj.url && !obj.mail && !obj.web) {
				errors.push(name + " field should have one of: email, url, mail, web");
			} else {
				if (obj.email && !PJV.emailFormat.test(obj.email)) {
					errors.push("Email not valid for " + name + ": " + obj.email);
				}
				if (obj.mail && !PJV.emailFormat.test(obj.mail)) {
					errors.push("Email not valid for " + name + ": " + obj.mail);
				}
				if (obj.url && !PJV.urlFormat.test(obj.url)) {
					errors.push("Url not valid for " + name + ": " + obj.url);
				}
				if (obj.web && !PJV.urlFormat.test(obj.web)) {
					errors.push("Url not valid for " + name + ": " + obj.web);
				}
			}
		} else {
			errors.push(
				"Type for field " + name + " should be a string or an object",
			);
		}
		return errors;
	};

	/* Validate 'people' fields, which can be an object like this:

    { "name" : "Barney Rubble",
      "email" : "b@rubble.com",
      "url" : "http://barnyrubble.tumblr.com/"
    }

    Or a single string like this:
    "Barney Rubble <b@rubble.com> (http://barnyrubble.tumblr.com/)

    Or an array of either of the above.

    */
	PJV.validatePeople = function (name, obj) {
		var errors = [];

		function validatePerson(obj) {
			/* jshint maxcomplexity: 10 */
			if (typeof obj == "string") {
				var authorRegex = /^([^<\(\s]+[^<\(]*)?(\s*<(.*?)>)?(\s*\((.*?)\))?/;
				var authorFields = authorRegex.exec(obj);
				var authorName = authorFields[1],
					authorEmail = authorFields[3],
					authorUrl = authorFields[5];
				validatePerson({
					name: authorName,
					email: authorEmail,
					url: authorUrl,
				});
			} else if (typeof obj == "object") {
				if (!obj.name) {
					errors.push(name + " field should have name");
				}
				if (obj.email && !PJV.emailFormat.test(obj.email)) {
					errors.push("Email not valid for " + name + ": " + obj.email);
				}
				if (obj.url && !PJV.urlFormat.test(obj.url)) {
					errors.push("Url not valid for " + name + ": " + obj.url);
				}
				if (obj.web && !PJV.urlFormat.test(obj.web)) {
					errors.push("Url not valid for " + name + ": " + obj.web);
				}
			} else {
				errors.push("People field must be an object or a string");
			}
		}

		if (obj instanceof Array) {
			for (var i = 0; i < obj.length; i++) {
				validatePerson(obj[i]);
			}
		} else {
			validatePerson(obj);
		}
		return errors;
	};

	/* Format for license(s) and repository(s):
	 * url as a string
	 * or
	 * object with "type" and "url"
	 * or
	 * array of objects with "type" and "url"
	 */
	PJV.validateUrlTypes = function (name, obj) {
		var errors = [];
		function validateUrlType(obj) {
			if (!obj.type) {
				errors.push(name + " field should have type");
			}
			if (!obj.url) {
				errors.push(name + " field should have url");
			}
		}

		if (typeof obj == "string") {
			if (!PJV.urlFormat.test(obj)) {
				errors.push("Url not valid for " + name + ": " + obj);
			}
		} else if (obj instanceof Array) {
			for (var i = 0; i < obj.length; i++) {
				validateUrlType(obj[i]);
			}
		} else if (typeof obj == "object") {
			validateUrlType(obj);
		} else {
			errors.push(
				"Type for field " + name + " should be a string or an object",
			);
		}

		return errors;
	};
})(typeof exports === "undefined" ? this : exports); // node or the browser
