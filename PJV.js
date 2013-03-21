/* Parse the incoming string as JSON, validate it against the spec for package.json
 * See README for more details
 */
var PJV = {
    packageFormat: /^[a-z0-9][a-z0-9\.\-_]+$/,
    versionFormat: /^[0-9]+\.[0-9]+\.[0-9+a-zA-Z\.]$/,
    urlFormat    : /^https*:\/\/[a-z.\-0-9]+/,
    emailFormat  : /\S+@\S+/ // I know this isn't thorough. it's not supposed to be.
};

PJV.getSpecMap = function (specName) {

    if (specName == "npm") {
        // https://github.com/isaacs/npm/blob/c1f44603019651b99f7bfd129fa89e2c09e8f369/doc/cli/json.md
        return {
            "name":         {"type": "string", required: true, format: PJV.packageFormat},
            "version":      {"type": "string", required: true, format: PJV.versionFormat},
            "description":  {"type": "string", recommended: true},
            "keywords":     {"type": "array", recommended: true},
            "homepage":     {"type": "string", recommended: true, format: PJV.urlFormat},
            "bugs":         {recommended: true, validate: PJV.validateUrlOrMailto},
            "author":       {required: true, validate: PJV.validatePeople},
            "maintainers":  {recommended: true, validate: PJV.validatePeople},
            "contributors": {validate: PJV.validatePeople},
            "files":        {"type": "array"},
            "main":         {"type": "array"},
            "bin":          {"type": "object"},
            "man":          {"type": "object"},
            "directories":  {"type": "object"},
            "repository":   {"type": "object", recommended: true, validate: PJV.validateUrlTypes},
            "scripts":      {"type": "object"},
            "config":       {"type": "object"},
            "dependencies": {"type": "object", validate: PJV.validateDependencies},
            "devDependencies": {"type": "object", validate: PJV.validateDependencies},
            "bundledDependencies": {"type": "array"},
            "bundleDependencies": {"type": "array"},
            "optionalDependencies": {"type": "object", validate: PJV.validateDependencies},
            "engines":      {"type": "object"},
            "engineStrict": {"type": "boolean"},
            "os":           {"type": "array"},
            "cpu":          {"type": "array"},
            "preferGlobal": {"type": "boolean"},
            "private":      {"type": "boolean"},
            "publishConfig": {"type": "object"}
        };

    } else if (specName == "commonjs_1.0") {
        // http://wiki.commonjs.org/wiki/Packages/1.0
        return {
            "name":         {"type": "string", required: true, format: PJV.packageFormat},
            "description":  {"type": "string", required: true},
            "version":      {"type": "string", required: true, format: PJV.versionFormat},
            "keywords":     {"type": "array", required: true},
            "maintainers":  {"type": "array", required: true, validate: PJV.validatePeople},
            "contributors": {"type": "array", required: true, validate: PJV.validatePeople},
            "bugs":         {"type": "string", required: true, validate: PJV.validateUrlOrMailto},
            "licenses":     {"type": "array", required: true, validate: PJV.validateUrlTypes},
            "repositories": {"type": "object", required: true, validate: PJV.validateUrlTypes},
            "dependencies": {"type": "object", required: true, validate: PJV.validateDependencies},

            "homepage":     {"type": "string", recommended: true, format: PJV.urlFormat},
            "os":           {"type": "array"},
            "cpu":          {"type": "array"},
            "engine":       {"type": "array"},
            "builtin":      {"type": "boolean"},
            "directories":  {"type": "object"},
            "implements":   {"type": "array"},
            "scripts":      {"type": "object"},
            "checksums":    {"type": "object"}
        };

    } else if (specName == "commonjs_1.1") {
        // http://wiki.commonjs.org/wiki/Packages/1.1
        return {
            "name":         {"type": "string", required: true, format: PJV.packageFormat},
            "version":      {"type": "string", required: true, format: PJV.versionFormat},
            "main":         {"type": "array", required: true},
            "directories":  {"type": "object", required: true},

            "maintainers":  {"type": "array", recommended: true, validate: PJV.validatePeople},
            "description":  {"type": "string", recommended: true},
            "licenses":     {"type": "array", recommended: true, validate: PJV.validateUrlTypes},
            "bugs":         {"type": "string", recommended: true, validate: PJV.validateUrlOrMailto},
            "keywords":     {"type": "array"},
            "repositories": {"type": "array", validate: PJV.validateUrlTypes},
            "contributors": {"type": "array", validate: PJV.validatePeople},
            "dependencies": {"type": "object", validate: PJV.validateDependencies},
            "homepage":     {"type": "string", recommended: true, format: PJV.urlFormat},
            "os":           {"type": "array"},
            "cpu":          {"type": "array"},
            "engine":       {"type": "array"},
            "builtin":      {"type": "boolean"},
            "implements":   {"type": "array"},
            "scripts":      {"type": "object"},
            "overlay":      {"type": "object"},
            "checksums":    {"type": "object"}
        };

    } else {
        // Unrecognized spec
        return false;
    }

};

PJV.validatePackage = function (data, specName, options) {
    var parsed;
    var out = {"valid": false};
    if (!data) {
        out.critical = {"Empty JSON": "No data to parse"};
        return out;
    }
    if (data[0] != "{") {
        // It's just a string
        return data;
    }
    try {
        parsed = JSON.parse(data);
    } catch (e) {
        out.critical = {"Invalid JSON": e.toString()};
        return out;
    }

    if (typeof parsed != "object") {
        out.critical = {"JSON is not an object": typeof parsed};
        return out;
    }

    var map = PJV.getSpecMap(specName);
    if (specName === false) {
        out.critical = {"Invalid specification": specName};
        return out;
    }
    var errors = [],
        warnings = [],
        recommendations = [];

    for (var name in map) {
        var field = map[name];

        if (typeof parsed[name] == "undefined") {
            if (field.required) {
                errors.push("Missing required field: " + name);
            } else if (field.recommended) {
                warnings.push("Missing recommended field: " + name);
            } else {
                recommendations.push("Missing optional field: " + name);
            }
            continue;
        }

        // Type checking
        if (field.type) {
            if ((field.type == "array" && !parsed[name] instanceof Array)
                    || (field.type != "array" && typeof parsed[name] != field.type)) {
                errors.push("Type for field " + name + ", was expected to be " + field.type + ", not " + typeof parsed[name]);
                continue;
            }
        }

        // Regexp format check
        if (field.format && !field.format.test(parsed[name])) {
            errors.push("Value for field " + name + ", " + parsed[name] + " does not match format: " + field.format.toString());
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

// Validates dependencies, making sure the object is a set of key value pairs
// with package names and versions
PJV.validateDependencies = function (name, deps) {
    var errors = [];
    for (var pkg in deps) {
        if (! PJV.packageFormat.test(pkg)) {
            errors.push("Invalid dependency package name: " + pkg);
        }

        if (!PJV.isValidVersionRange(deps[pkg])) {
            errors.push("Invalid version range for dependency " + pkg + ": " + deps[pkg]);
        }
    }
    return errors;
};

PJV.isValidVersionRange = function (v) {
    // https://github.com/isaacs/npm/blob/master/doc/cli/json.md#dependencies
    return  (/^[<>=~]{0,2}[0-9.x]+/).test(v) ||
            PJV.urlFormat.test(v) ||
            v == "*" ||
            v === "" ||
            v.indexOf("git") === 0 ||
            false;
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
        errors.push("Type for field " + name + " should be a string or an object");
    }
    return errors;
};

/* Validate 'people' fields, which can be an object like this:

{ "name" : "Barney Rubble",
  "email" : "b@rubble.com",
  "url" : "http://barnyrubble.tumblr.com/"
}

Or asingle string like this:
"Barney Rubble <b@rubble.com> (http://barnyrubble.tumblr.com/)

*/
PJV.validatePeople = function (name, obj) {
    var errors = [];

    function validatePerson(obj) {
        if (!obj.name) {
            errors.push(name + " field should have name");
        }
        if (!obj.email && !obj.url) {
            errors.push(name + " field should have email or url");
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
    }

    if (typeof obj == "string") {
        if ((/[^<]+<\S+@\S+>/).test(obj)) {
            errors.push("String not valid for " + name + ", expected format is Barney Rubble <b@rubble.com> (http://barnyrubble.tumblr.com/)");
        }
    } else if (obj instanceof Array) {
        for (var i = 0; i < obj.length; i++) {
            validatePerson(obj[i]);
        }
    } else if (typeof obj == "object") {
        validatePerson(obj);
    } else {
        errors.push("Type for field " + name + " should be a string or an object");
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
        if (! PJV.urlFormat.test(obj)) {
            errors.push("Url not valid for " + name + ": " + obj);
        }
    } else if (obj instanceof Array) {
        for (var i = 0; i < obj.length; i++) {
            validateUrlType(obj[i]);
        }
    } else if (typeof obj == "object") {
        validateUrlType(obj);
    } else {
        errors.push("Type for field " + name + " should be a string or an object");
    }

    return errors;
};
