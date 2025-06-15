import { beforeEach, describe, expect, it, vi } from "vitest";

import { isPerson, validatePeople } from "../utils/index.js";
import { validateAuthor } from "./validateAuthor.js";

vi.mock("../utils/validatePeople", () => ({
	isPerson: vi.fn(),
	validatePeople: vi.fn(),
}));

describe("validateAuthor", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it("should call validatePeople with 'author' and a string if input is a string", () => {
		const mockValidatePeople = vi
			.mocked(validatePeople)
			.mockReturnValue(["error"]);

		const result = validateAuthor(
			"Barney Rubble <b@rubble.com> (http://barnyrubble.tumblr.com/)",
		);
		expect(mockValidatePeople).toHaveBeenCalledWith(
			"author",
			"Barney Rubble <b@rubble.com> (http://barnyrubble.tumblr.com/)",
		);
		expect(result).toEqual(["error"]);
	});

	it("should call validatePeople with 'author' and the object if input is a person object", () => {
		const personObj = {
			email: "b@rubble.com",
			name: "Barney Rubble",
			url: "http://barnyrubble.tumblr.com/",
		};
		const mockValidatePeople = vi.mocked(validatePeople).mockReturnValue([]);
		vi.mocked(isPerson).mockReturnValue(true);

		const result = validateAuthor(personObj);

		expect(mockValidatePeople).toHaveBeenCalledWith("author", personObj);
		expect(result).toEqual([]);
	});

	it("should return the correct error if input is not a string or person object", () => {
		vi.mocked(isPerson).mockReturnValue(false);

		const result = validateAuthor(123);
		expect(result).toEqual([
			'Type for field "author" should be a `string` or an `object` with at least a `name` property',
		]);
		expect(vi.mocked(validatePeople)).not.toHaveBeenCalled();
	});
});
