import { describe, expect, it } from "vitest";
import { validatePeople } from "./validatePeople";

describe("validatePeople", () => {
	it("should validate string with only name", () => {
		const result = validatePeople("people", "Barney Rubble");
		expect(result).toEqual([]);
	});

	it("should validate string with name, email, and url", () => {
		const result = validatePeople(
			"people",
			"Barney Rubble <b@rubble.com> (http://barneyrubble.tumblr.com/)",
		);
		expect(result).toEqual([]);
	});

	it("should validate person object", () => {
		const person = {
			name: "Barney Rubble",
			email: "b@rubble.com",
			url: "http://barneyrubble.tumblr.com/",
		};
		const result = validatePeople("people", person);
		expect(result).toEqual([]);
	});

	it("should validate array of person objects", () => {
		const barney = {
			name: "Barney Rubble",
			email: "b@rubble.com",
			url: "http://barneyrubble.tumblr.com/",
		};
		const fred = {
			name: "Fred Flintstone",
			email: "fred@theflintstones.com",
			url: "https://tiktok.com/@fred",
		};
		const result = validatePeople("people", [barney, fred]);
		expect(result).toEqual([]);
	});

	it("should require name", () => {
		let result = validatePeople(
			"people",
			"<b@rubble.com> (http://barneyrubble.tumblr.com/)",
		);
		expect(result.length).toBe(1);

		// @ts-expect-error testing invalid param
		result = validatePeople("people", {
			email: "<b@rubble.com>",
			url: "http://barneyrubble.tumblr.com/",
		});
		expect(result.length).toBe(1);
	});
});
