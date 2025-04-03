import { describe, expect, it } from "vitest";

import { validateUrlOrMailto } from "./validateUrlOrMailto";

describe("validateUrlOrMailto", () => {
	it("should return an error if the string is neither a valid URL nor a valid email", () => {
		const result = validateUrlOrMailto("testField", "invalidString");
		expect(result).toEqual(["testField should be an email or a url"]);
	});

	it("should return no errors if the string is a valid URL", () => {
		const result = validateUrlOrMailto("testField", "http://example.com");
		expect(result).toEqual([]);
	});

	it("should return no errors if the string is a valid email", () => {
		const result = validateUrlOrMailto("testField", "test@example.com");
		expect(result).toEqual([]);
	});

	it("should return an error if the object has none of the required properties", () => {
		// @ts-expect-error testing edge cases
		const result = validateUrlOrMailto("testField", {});
		expect(result).toEqual([
			"testField field should have one of: email, url, mail, web",
		]);
	});

	it("should return no errors if the object has a valid email", () => {
		const result = validateUrlOrMailto("testField", {
			email: "test@example.com",
		});
		expect(result).toEqual([]);
	});

	it("should return no errors if the object has a valid url", () => {
		const result = validateUrlOrMailto("testField", {
			url: "http://example.com",
		});
		expect(result).toEqual([]);
	});

	it("should return no errors if the object has a valid mail", () => {
		const result = validateUrlOrMailto("testField", {
			mail: "test@example.com",
		});
		expect(result).toEqual([]);
	});

	it("should return no errors if the object has a valid web", () => {
		const result = validateUrlOrMailto("testField", {
			web: "http://example.com",
		});
		expect(result).toEqual([]);
	});

	it("should return an error if the object has an invalid email", () => {
		const result = validateUrlOrMailto("testField", { email: "invalidEmail" });
		expect(result).toEqual(["Email not valid for testField: invalidEmail"]);
	});

	it("should return an error if the object has an invalid mail", () => {
		const result = validateUrlOrMailto("testField", { mail: "invalidMail" });
		expect(result).toEqual(["Email not valid for testField: invalidMail"]);
	});

	it("should return an error if the object has an invalid url", () => {
		const result = validateUrlOrMailto("testField", { url: "invalidUrl" });
		expect(result).toEqual(["URL not valid for testField: invalidUrl"]);
	});

	it("should return an error if the object has an invalid web", () => {
		const result = validateUrlOrMailto("testField", { web: "invalidWeb" });
		expect(result).toEqual(["URL not valid for testField: invalidWeb"]);
	});

	it("should return an error if the input is neither a string nor an object", () => {
		// @ts-expect-error testing edge cases
		const result = validateUrlOrMailto("testField", 123);
		expect(result).toEqual([
			"Type for field testField should be a string or an object",
		]);
	});

	it("should return no errors if the object has both valid email and url", () => {
		const result = validateUrlOrMailto("testField", {
			email: "test@example.com",
			url: "http://example.com",
		});
		expect(result).toEqual([]);
	});

	it("should return errors if the object has both invalid email and url", () => {
		const result = validateUrlOrMailto("testField", {
			email: "invalidEmail",
			url: "invalidUrl",
		});
		expect(result).toEqual([
			"Email not valid for testField: invalidEmail",
			"URL not valid for testField: invalidUrl",
		]);
	});

	it("should return no errors if the object has both valid mail and web", () => {
		const result = validateUrlOrMailto("testField", {
			mail: "test@example.com",
			web: "http://example.com",
		});
		expect(result).toEqual([]);
	});

	it("should return errors if the object has both invalid mail and web", () => {
		const result = validateUrlOrMailto("testField", {
			mail: "invalidMail",
			web: "invalidWeb",
		});
		expect(result).toEqual([
			"Email not valid for testField: invalidMail",
			"URL not valid for testField: invalidWeb",
		]);
	});
});
