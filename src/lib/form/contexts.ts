import { createFormHookContexts } from "@tanstack/react-form";

/**
 * Shared TanStack Form contexts. `useFieldContext` is consumed by every
 * field component (via `FieldInputWrapper`); `useFormContext` is reserved
 * for future form-level components (SubmitButton, FormErrors, ...).
 */
export const { fieldContext, formContext, useFieldContext, useFormContext } =
	createFormHookContexts();
