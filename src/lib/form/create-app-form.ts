import { createFormHook } from "@tanstack/react-form";

import { PasswordInput } from "#/components/form/password-input.tsx";
import { TextInput } from "#/components/form/text-input.tsx";
import { fieldContext, formContext } from "#/lib/form/contexts.ts";
import { fieldInputWrapper } from "#/lib/form/field-input-wrapper.tsx";

/**
 * Application form hook. Use `useAppForm` to create forms and
 * `form.AppField` to render fields with our registered controls:
 *
 * ```tsx
 * import { z } from "zod";
 * import { useAppForm } from "#/lib/form/create-app-form.ts";
 *
 * const profileSchema = z.object({
 *   firstName: z.string().min(1),
 * });
 *
 * function ProfileForm() {
 *   const form = useAppForm({
 *     defaultValues: { firstName: "" },
 *     validators: { onChange: profileSchema, onSubmit: profileSchema },
 *   });
 *
 *   return (
 *     <form.AppField name="firstName">
 *       {(field) => <field.TextInput />}
 *     </form.AppField>
 *   );
 * }
 * ```
 *
 * `withForm` is re-exported for splitting large forms into composable
 * subcomponents. Form-level components (SubmitButton, FormErrors, ...) will
 * be added to `formComponents` in a follow-up.
 */
export const { useAppForm, withForm } = createFormHook({
	fieldContext,
	formContext,
	fieldComponents: {
		TextInput: fieldInputWrapper(TextInput),
		PasswordInput: fieldInputWrapper(PasswordInput),
	},
	formComponents: {},
});
