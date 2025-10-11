import { describe, expect, it } from "vitest";

import {
	addChildResult,
	addIssue,
	createValidationResult,
	flattenResult,
} from "./Result.ts";

describe("Result", () => {
	describe("createValidationResult", () => {
		it("should create a Result with no issues by default", () => {
			const result = createValidationResult();

			expect(result.issues).toEqual([]);
			expect(result.errorMessages).toEqual([]);
			expect(result.childResults).toEqual([]);
		});

		it("should create a Result with issues from strings", () => {
			const issueStrings = ["issue 1", "issue 2"];
			const result = createValidationResult(issueStrings);

			expect(result.issues).toEqual(
				issueStrings.map((message) => ({ message })),
			);
			expect(result.errorMessages).toEqual(issueStrings);
			expect(result.childResults).toEqual([]);
			expect(result).toMatchSnapshot();
		});

		it("should create a Result with issues from Issue objects", () => {
			const issues = [{ message: "issue 1" }, { message: "issue 2" }];
			const result = createValidationResult(issues);

			expect(result.issues).toEqual(issues);
			expect(result.errorMessages).toEqual(
				issues.map((issue) => issue.message),
			);
			expect(result.childResults).toEqual([]);
			expect(result).toMatchSnapshot();
		});

		it("should create a Result with child results", () => {
			const issues = [{ message: "issue 1" }, { message: "issue 2" }];
			const childResults = [
				{ ...createValidationResult(["child issue 1"]), index: 0 },
				{ ...createValidationResult(["child issue 2"]), index: 1 },
			];
			const result = createValidationResult(issues, childResults);

			expect(result.issues).toEqual(issues);
			expect(result.errorMessages).toEqual([
				...issues.map((issue) => issue.message),
				...childResults[0].errorMessages,
				...childResults[1].errorMessages,
			]);
			expect(result.childResults).toEqual(childResults);
			expect(result).toMatchSnapshot();
		});
	});
	describe("addChildResult", () => {
		it("should add a child Result to a parent Result with a Result object", () => {
			const parent = createValidationResult();
			const child = createValidationResult(["child issue"]);

			addChildResult(parent, child, 0);

			expect(parent.childResults).toHaveLength(1);
			expect(parent.childResults[0]).toEqual({ ...child, index: 0 });
			expect(parent.errorMessages).toEqual(child.errorMessages);
		});

		it("should add a child Result to a parent Result with a string", () => {
			const parent = createValidationResult();
			const childIssueString = "child issue";

			addChildResult(parent, childIssueString, 0);

			expect(parent.childResults).toHaveLength(1);
			expect(parent.childResults[0]).toEqual({
				...createValidationResult([childIssueString]),
				index: 0,
			});
			expect(parent.errorMessages).toEqual([childIssueString]);
		});

		it("should add a child Result to a parent Result with an array of strings", () => {
			const parent = createValidationResult();
			const childIssueStrings = ["child issue 1", "child issue 2"];

			addChildResult(parent, childIssueStrings, 0);

			expect(parent.childResults).toHaveLength(1);
			expect(parent.childResults[0]).toEqual({
				...createValidationResult(childIssueStrings),
				index: 0,
			});
			expect(parent.errorMessages).toEqual(childIssueStrings);
		});

		it("should add a child Result to a parent using a different index", () => {
			const parent = createValidationResult();
			const child = createValidationResult(["child issue"]);

			addChildResult(parent, child, 13);

			expect(parent.childResults).toHaveLength(1);
			expect(parent.childResults[0]).toEqual({ ...child, index: 13 });
			expect(parent.errorMessages).toEqual(child.errorMessages);
		});
	});

	describe("addIssue", () => {
		it("should add an issue to a Result", () => {
			const result = createValidationResult();
			addIssue(result, "new issue");

			expect(result.issues).toEqual([{ message: "new issue" }]);
			expect(result.errorMessages).toEqual(["new issue"]);
		});
	});

	describe("flattenResult", () => {
		it("should flatten a Result with nested child results", () => {
			const child1 = createValidationResult(["child1 issue1", "child1 issue2"]);
			const child2 = createValidationResult(["child2 issue1"]);
			const parent = createValidationResult(
				["parent issue1"],
				[
					{ ...child1, index: 0 },
					{ ...child2, index: 1 },
				],
			);

			const flattened = flattenResult(parent);

			expect(flattened.issues).toEqual([
				...parent.issues,
				...child1.issues,
				...child2.issues,
			]);
			expect(flattened.errorMessages).toEqual([
				...parent.issues.map((issue) => issue.message),
				...child1.issues.map((issue) => issue.message),
				...child2.issues.map((issue) => issue.message),
			]);
			expect(flattened.childResults).toEqual([]);
		});

		it("should flatten a Result with multiple levels of nested child results", () => {
			const grandchild = createValidationResult(["grandchild issue1"]);
			const child = createValidationResult(
				["child issue1", "child issue2"],
				[{ ...grandchild, index: 0 }],
			);
			const parent = createValidationResult(
				["parent issue1"],
				[{ ...child, index: 0 }],
			);

			const flattened = flattenResult(parent);

			expect(flattened.issues).toEqual([
				...parent.issues,
				...child.issues,
				...grandchild.issues,
			]);
			expect(flattened.errorMessages).toEqual([
				...parent.issues.map((issue) => issue.message),
				...child.issues.map((issue) => issue.message),
				...grandchild.issues.map((issue) => issue.message),
			]);
			expect(flattened.childResults).toEqual([]);
		});
	});
});
