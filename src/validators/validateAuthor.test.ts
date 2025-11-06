import { beforeEach, describe, expect, it, vi } from "vitest";

import { Result } from "../Result.ts";
import { isPerson, validatePeople } from "../utils/index.ts";
import { validateAuthor } from "./validateAuthor.ts";

vi.mock("../utils/validatePeople", () => ({
	isPerson: vi.fn(),
	validatePeople: vi.fn(),
}));

describe("validateAuthor", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it("should call validatePeople with 'author' and a string if input is a string", () => {
		const mockResult = new Result([{ message: "error" }]);
		const mockValidatePeople = vi
			.mocked(validatePeople)
			.mockReturnValue(mockResult);

		const result = validateAuthor(
			"Barney Rubble <b@rubble.com> (http://barnyrubble.tumblr.com/)",
		);
		expect(mockValidatePeople).toHaveBeenCalledWith(
			"Barney Rubble <b@rubble.com> (http://barnyrubble.tumblr.com/)",
		);
		expect(result).toBe(mockResult);
	});

	it("should call validatePeople with 'author' and the object if input is a person object", () => {
		const personObj = {
			email: "b@rubble.com",
			name: "Barney Rubble",
			url: "http://barnyrubble.tumblr.com/",
		};
		const mockResult = new Result();
		const mockValidatePeople = vi
			.mocked(validatePeople)
			.mockReturnValue(mockResult);
		vi.mocked(isPerson).mockReturnValue(true);

		const result = validateAuthor(personObj);

		expect(mockValidatePeople).toHaveBeenCalledWith(personObj);
		expect(result).toBe(mockResult);
	});

	it("should return the correct error if input is not a string or person object", () => {
		vi.mocked(isPerson).mockReturnValue(false);

		const result = validateAuthor(123);
		expect(result.issues).toHaveLength(1);
		expect(result.errorMessages).toEqual([
			"the type should be a `string` or an `object` with at least a `name` property",
		]);
		expect(vi.mocked(validatePeople)).not.toHaveBeenCalled();
	});
});
