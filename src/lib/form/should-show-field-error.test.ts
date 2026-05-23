import { describe, expect, it } from "vitest";

import {
	normalizeFieldErrors,
	shouldShowFieldError,
} from "#/lib/form/should-show-field-error.ts";

describe("shouldShowFieldError", () => {
	it("hides errors on a pristine, untouched field before any submit attempt", () => {
		expect(
			shouldShowFieldError(
				{ errors: [{ message: "Required" }], isTouched: false },
				0,
			),
		).toBe(false);
	});

	it("shows errors once the field is touched", () => {
		expect(
			shouldShowFieldError(
				{ errors: [{ message: "Required" }], isTouched: true },
				0,
			),
		).toBe(true);
	});

	it("shows errors after a submit attempt even when not touched", () => {
		expect(
			shouldShowFieldError(
				{ errors: [{ message: "Required" }], isTouched: false },
				1,
			),
		).toBe(true);
	});

	it("never shows errors when the error array is empty", () => {
		expect(shouldShowFieldError({ errors: [], isTouched: true }, 5)).toBe(
			false,
		);
	});
});

describe("normalizeFieldErrors", () => {
	it("drops null and undefined entries", () => {
		expect(normalizeFieldErrors([null, undefined])).toEqual([]);
	});

	it("wraps plain string errors in a message object", () => {
		expect(normalizeFieldErrors(["Required"])).toEqual([
			{ message: "Required" },
		]);
	});

	it("keeps standard schema issue objects with a string message", () => {
		expect(
			normalizeFieldErrors([
				{ message: "Must be at least 1 character", path: ["firstName"] },
			]),
		).toEqual([{ message: "Must be at least 1 character" }]);
	});

	it("ignores entries with a non-string message", () => {
		expect(normalizeFieldErrors([{ message: 42 }, { other: "x" }])).toEqual([]);
	});
});
