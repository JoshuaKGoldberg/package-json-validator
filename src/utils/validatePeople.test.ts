import { describe, expect, it } from "vitest";

import { isPerson, isPersonArray, validatePeople } from "./validatePeople.ts";

describe("validatePeople", () => {
	it("should validate string with only name", () => {
		const result = validatePeople("Barney Rubble");
		expect(result.errorMessages).toEqual([]);
	});

	it("should validate string with name, email, and url", () => {
		const result = validatePeople(
			"Barney Rubble <b@rubble.com> (http://barneyrubble.tumblr.com/)",
		);
		expect(result.errorMessages).toEqual([]);
	});

	it("should validate person object", () => {
		const person = {
			email: "b@rubble.com",
			name: "Barney Rubble",
			url: "http://barneyrubble.tumblr.com/",
		};
		const result = validatePeople(person);
		expect(result.errorMessages).toEqual([]);
	});

	it("should validate array of person objects", () => {
		const barney = {
			email: "b@rubble.com",
			name: "Barney Rubble",
			url: "http://barneyrubble.tumblr.com/",
		};
		const fred = {
			email: "fred@theflintstones.com",
			name: "Fred Flintstone",
			url: "https://tiktok.com/@fred",
		};
		const result = validatePeople([barney, fred]);
		expect(result.errorMessages).toEqual([]);
	});

	it("should detect invalid email format", () => {
		const barney = {
			email: "brubble",
			name: "Barney Rubble",
			url: "http://barneyrubble.tumblr.com/",
		};
		const fred = {
			email: "fred@theflintstones.com",
			name: "Fred Flintstone",
			url: "https://tiktok.com/@fred",
		};
		const result = validatePeople([barney, fred]);
		expect(result.errorMessages).toHaveLength(1);
		expect(result.issues).toEqual([]);
		expect(result.childResults).toHaveLength(2);

		const barneyResult = result.childResults?.[0];
		expect(barneyResult?.errorMessages).toHaveLength(1);
		expect(barneyResult?.issues).toEqual([]);
		expect(barneyResult?.childResults).toHaveLength(3);

		const barneyEmailResult = barneyResult?.childResults?.[0];
		expect(barneyEmailResult?.errorMessages).toEqual([
			"Email not valid: brubble",
		]);
		expect(barneyEmailResult?.issues).toHaveLength(1);
	});

	it("should require name", () => {
		let result = validatePeople(
			"<b@rubble.com> (http://barneyrubble.tumblr.com/)",
		);
		expect(result.errorMessages).toEqual(["person object should have name"]);
		expect(result.issues.length).toBe(1);

		// @ts-expect-error testing invalid param
		result = validatePeople({
			email: "<b@rubble.com>",
			url: "http://barneyrubble.tumblr.com/",
		});
		expect(result.errorMessages).toEqual(["person object should have name"]);
		expect(result.issues.length).toBe(1);
	});

	describe("isPerson", () => {
		it("should return true for valid person object", () => {
			const person = { name: "Barney Rubble" };
			expect(isPerson(person)).toBe(true);
		});

		it("should return false for invalid person object", () => {
			const notAPerson = {
				email: "<b@rubble.com>",
				url: "http://barneyrubble.tumblr.com/",
			};
			expect(isPerson(notAPerson)).toBe(false);
		});

		it.each(["Barney Rubble", ["Barney Rubble"], 42, true, null, undefined])(
			"should return false for something that's not an object: %s",
			(input) => {
				expect(isPerson(input)).toBe(false);
			},
		);
	});

	describe("isPersonArray", () => {
		it("should return true for valid person array", () => {
			const personArray = [
				{ name: "Barney Rubble" },
				{ name: "Fred Flintstone" },
			];
			expect(isPersonArray(personArray)).toBe(true);
		});

		it("should return false for invalid person array", () => {
			const notAPersonArray = [
				{
					email: "<b@rubble.com>",
					url: "http://barneyrubble.tumblr.com/",
				},
			];
			expect(isPersonArray(notAPersonArray)).toBe(false);
		});

		it.each([
			"Barney Rubble",
			{ name: "Barney Rubble" },
			42,
			true,
			null,
			undefined,
		])("should return false for something that's not an array: %s", (input) => {
			expect(isPersonArray(input)).toBe(false);
		});
	});
});
