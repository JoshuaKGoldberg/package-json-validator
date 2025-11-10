import { describe, expect, it } from "vitest";

import { ChildResult, Result } from "./Result.ts";

describe(Result, () => {
	describe(Result, () => {
		describe("constructor", () => {
			it("should create a Result with no issues by default", () => {
				const result = new Result();

				expect(result.issues).toEqual([]);
				expect(result.errorMessages).toEqual([]);
				expect(result.childResults).toEqual([]);
			});

			it("should create a Result with issues from strings", () => {
				const issueStrings = ["issue 1", "issue 2"];
				const result = new Result(issueStrings);

				expect(result.issues).toEqual(
					issueStrings.map((message) => ({ message })),
				);
				expect(result.errorMessages).toEqual(issueStrings);
				expect(result.childResults).toEqual([]);
			});

			it("should create a Result with issues from Issue objects", () => {
				const issues = [{ message: "issue 1" }, { message: "issue 2" }];
				const result = new Result(issues);

				expect(result.issues).toEqual(issues);
				expect(result.errorMessages).toEqual(
					issues.map((issue) => issue.message),
				);
				expect(result.childResults).toEqual([]);
			});

			it("should create a Result with child results", () => {
				const issues = [{ message: "issue 1" }, { message: "issue 2" }];
				const childResults = [
					new ChildResult(0, ["child issue 1"]),
					new ChildResult(1, ["child issue 2"]),
				];
				const result = new Result(issues, childResults);

				expect(result.issues).toEqual(issues);
				expect(result.errorMessages).toEqual([
					...issues.map((issue) => issue.message),
					...childResults[0].errorMessages,
					...childResults[1].errorMessages,
				]);
				expect(result.childResults).toEqual(childResults);
			});
		});

		describe("addChildResult", () => {
			it("should add a child Result with a Result object", () => {
				const parent = new Result();
				const child = new Result(["child issue"]);

				parent.addChildResult(0, child);

				expect(parent.childResults).toEqual([new ChildResult(0, child)]);
				expect(parent.errorMessages).toEqual(child.errorMessages);
			});

			it("should add a child Result with a string", () => {
				const parent = new Result();
				const childIssueString = "child issue";

				parent.addChildResult(0, childIssueString);

				expect(parent.childResults).toEqual([
					new ChildResult(0, [childIssueString]),
				]);
				expect(parent.errorMessages).toEqual([childIssueString]);
			});

			it("should add a child Result with an array of strings", () => {
				const parent = new Result();
				const childIssueStrings = ["child issue 1", "child issue 2"];

				parent.addChildResult(0, childIssueStrings);

				expect(parent.childResults).toEqual([
					new ChildResult(0, childIssueStrings),
				]);
				expect(parent.errorMessages).toEqual(childIssueStrings);
			});

			it("should add a child Result using a different index", () => {
				const parent = new Result();
				const child = new Result(["child issue"]);

				parent.addChildResult(13, child);

				expect(parent.childResults).toEqual([new ChildResult(13, child)]);
				expect(parent.errorMessages).toEqual(child.errorMessages);
			});

			it("should add a child Result with a ChildResult object", () => {
				const parent = new Result();
				const child = new ChildResult(13, ["child issue"]);

				parent.addChildResult(child);

				expect(parent.childResults).toEqual([child]);
				expect(parent.errorMessages).toEqual(child.errorMessages);
			});
		});

		describe("addIssue", () => {
			it("should add an issue", () => {
				const result = new Result();

				result.addIssue("new issue");

				expect(result.issues).toEqual([{ message: "new issue" }]);
				expect(result.errorMessages).toEqual(["new issue"]);
			});
		});

		describe("flatten", () => {
			it("should flatten a Result with nested child results", () => {
				const child1 = new ChildResult(0, ["child1 issue1", "child1 issue2"]);
				const child2 = new ChildResult(1, ["child2 issue1"]);
				const parent = new Result(["parent issue1"], [child1, child2]);
				const parentIssues = parent.issues;
				const child1Issues = child1.issues;
				const child2Issues = child2.issues;

				const flattened = parent.flatten();

				expect(flattened.issues).toEqual([
					...parentIssues,
					...child1Issues,
					...child2Issues,
				]);
				expect(flattened.errorMessages).toEqual([
					...parentIssues.map((issue) => issue.message),
					...child1Issues.map((issue) => issue.message),
					...child2Issues.map((issue) => issue.message),
				]);
				expect(flattened.childResults).toEqual([]);
			});

			it("should flatten a Result with multiple levels of nested child results", () => {
				const grandchild = new ChildResult(0, ["grandchild issue1"]);
				const child = new ChildResult(
					0,
					["child issue1", "child issue2"],
					[grandchild],
				);
				const parent = new Result(["parent issue1"], [child]);
				const parentIssues = parent.issues;
				const childIssues = child.issues;
				const grandchildIssues = grandchild.issues;

				const flattened = parent.flatten();

				expect(flattened.issues).toEqual([
					...parentIssues,
					...childIssues,
					...grandchildIssues,
				]);
				expect(flattened.errorMessages).toEqual([
					...parentIssues.map((issue) => issue.message),
					...childIssues.map((issue) => issue.message),
					...grandchildIssues.map((issue) => issue.message),
				]);
				expect(flattened.childResults).toEqual([]);
			});
		});
	});

	describe(ChildResult, () => {
		describe("constructor", () => {
			it("should create a ChildResult with no issues by default", () => {
				const childResult = new ChildResult(0);

				expect(childResult.index).toBe(0);
				expect(childResult.issues).toEqual([]);
				expect(childResult.errorMessages).toEqual([]);
				expect(childResult.childResults).toEqual([]);
			});

			it("should create a ChildResult with issues from strings", () => {
				const issueStrings = ["issue 1", "issue 2"];
				const childResult = new ChildResult(13, issueStrings);

				expect(childResult.index).toBe(13);
				expect(childResult.issues).toEqual(
					issueStrings.map((message) => ({ message })),
				);
				expect(childResult.errorMessages).toEqual(issueStrings);
				expect(childResult.childResults).toEqual([]);
			});

			it("should create a ChildResult with issues from Issue objects", () => {
				const issues = [{ message: "issue 1" }, { message: "issue 2" }];
				const childResult = new ChildResult(0, issues);

				expect(childResult.index).toBe(0);
				expect(childResult.issues).toEqual(issues);
				expect(childResult.errorMessages).toEqual(
					issues.map((issue) => issue.message),
				);
				expect(childResult.childResults).toEqual([]);
			});

			it("should create a ChildResult with child results", () => {
				const issues = [{ message: "issue 1" }, { message: "issue 2" }];
				const childResults = [
					new ChildResult(0, ["child issue 1"]),
					new ChildResult(1, ["child issue 2"]),
				];
				const result = new ChildResult(0, issues, childResults);

				expect(result.index).toBe(0);
				expect(result.issues).toEqual(issues);
				expect(result.errorMessages).toEqual([
					...issues.map((issue) => issue.message),
					...childResults[0].errorMessages,
					...childResults[1].errorMessages,
				]);
				expect(result.childResults).toEqual(childResults);
			});

			it("should create a ChildResult with a Result object", () => {
				const issues = [{ message: "issue 1" }, { message: "issue 2" }];
				const resultObj = new Result(issues);
				const childResult = new ChildResult(5, resultObj);

				expect(childResult.index).toBe(5);
				expect(childResult.issues).toEqual(issues);
				expect(childResult.errorMessages).toEqual(
					issues.map((issue) => issue.message),
				);
				expect(childResult.childResults).toEqual([]);
			});
		});
	});
});
