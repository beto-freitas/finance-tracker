/**
 * The subset of `field.state.meta` that drives error visibility. Kept narrow
 * so the helper stays trivially testable without depending on TanStack's
 * deeply-generic types.
 */
export type FieldErrorMeta = {
	errors: Array<unknown>;
	isTouched: boolean;
};

/**
 * A field shows its validation error once it has been touched OR the user
 * has attempted to submit the form at least once. This catches untouched
 * invalid fields on submit without nagging the user as they type.
 */
export function shouldShowFieldError(
	meta: FieldErrorMeta,
	submissionAttempts: number,
): boolean {
	if (meta.errors.length === 0) return false;
	return meta.isTouched || submissionAttempts > 0;
}

/**
 * Normalize the heterogeneous `meta.errors` array (Standard Schema issues,
 * plain strings, or `undefined` slots) into the `{ message }[]` shape that
 * shadcn's `FieldError` expects.
 */
export function normalizeFieldErrors(
	errors: Array<unknown>,
): Array<{ message: string }> {
	const result: Array<{ message: string }> = [];
	for (const error of errors) {
		if (error == null) continue;
		if (typeof error === "string") {
			result.push({ message: error });
			continue;
		}
		if (typeof error === "object" && "message" in error) {
			const message = (error as { message: unknown }).message;
			if (typeof message === "string") result.push({ message });
		}
	}
	return result;
}
