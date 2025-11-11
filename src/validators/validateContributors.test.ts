import { beforeEach, describe, expect, it, vi } from "vitest";

import { Result } from "../Result.ts";
import { validatePeople } from "../utils/index.ts";
import { validateContributors } from "./validateContributors.ts";

vi.mock("../utils/validatePeople", async () => ({
	...(await vi.importActual("../utils/validatePeople")),
	validatePeople: vi.fn(),
}));

describe(validateContributors, () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should call validatePeople with objects", () => {
		const barney = {
			email: "b@rubble.com",
			name: "Barney Rubble",
			url: "http://barnyrubble.tumblr.com/",
		};
		const fred = {
			email: "f@flintstone.com",
			name: "Fred Flintstone",
			url: "http://fflintstone.tumblr.com/",
		};
		const mockValidatePeople = vi
			.mocked(validatePeople)
			.mockReturnValue(new Result());

		const result = validateContributors([barney, fred]);

		expect(mockValidatePeople).toHaveBeenNthCalledWith(1, barney);
		expect(mockValidatePeople).toHaveBeenNthCalledWith(2, fred);
		expect(result.childResults).toHaveLength(2);
		expect(result.errorMessages).toEqual([]);
	});

	it("should return an issue if the input is not an array", () => {
		const result = validateContributors(123);
		expect(result.issues).toHaveLength(1);
		expect(result.errorMessages).toEqual([
			"the type should be an `Array` of objects with at least a `name` property, and optionally `email` and `url`",
		]);
		expect(validatePeople).not.toHaveBeenCalled();
	});

	it("should return issues if any of the contributors aren't valid people objects", () => {
		const barney = {
			email: "b@rubble.com",
			name: "Barney Rubble",
			url: "http://barnyrubble.tumblr.com/",
		};
		const fred = {
			email: "f@flintstone.com",
		};
		const contributors = [barney, fred];
		const mockValidatePeople = vi
			.mocked(validatePeople)
			.mockReturnValue(new Result());

		const result = validateContributors(contributors);
		expect(result.issues).toHaveLength(0);
		expect(result.childResults).toHaveLength(2);
		expect(result.errorMessages).toEqual([
			"item 1 is invalid; it should be a person object with at least a \`name\`",
		]);
		expect(mockValidatePeople).toHaveBeenCalledTimes(1);
	});
});
