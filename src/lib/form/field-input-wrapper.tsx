import { useStore } from "@tanstack/react-form";
import type * as React from "react";

import { BaseField } from "#/components/form/base-field.tsx";
import { useFieldContext } from "#/lib/form/contexts.ts";
import { fieldNameToLabel } from "#/lib/form/field-name-to-label.ts";
import {
	normalizeFieldErrors,
	shouldShowFieldError,
} from "#/lib/form/should-show-field-error.ts";

/**
 * Props the wrapper passes to every wrapped control. Each control type
 * decides how to render — TextInput bridges the change event to a string,
 * NumberInput will bridge to a number, etc.
 */
export type FieldControlProps<TValue> = {
	id: string;
	name: string;
	value: TValue;
	onChange: (value: TValue) => void;
	onBlur: () => void;
	"aria-invalid": boolean | undefined;
};

type ExtractFieldValue<TControlProps> =
	TControlProps extends FieldControlProps<infer TValue> ? TValue : never;

/**
 * Props exposed by a wrapped field component. Whatever extra props the
 * control declares (placeholder, autoFocus, disabled, ...) flow through;
 * the wrapper-owned bindings are stripped from the consumer-facing type.
 */
export type FieldInputWrapperProps<TControlProps> = Omit<
	TControlProps,
	keyof FieldControlProps<ExtractFieldValue<TControlProps>>
> & {
	label?: React.ReactNode;
	description?: React.ReactNode;
	hideLabel?: boolean;
};

/**
 * Wrap a dumb control component so it plugs into TanStack Form's
 * `useAppForm` / `form.AppField` flow. The wrapper:
 *
 *  - reads the field via `useFieldContext`
 *  - derives `id`/`name` from `field.name`
 *  - derives a label heuristically (camelCase → Title Case) unless overridden
 *  - shows errors once the field is touched or a submit has been attempted
 *  - renders the shared `BaseField` shell (label, description, error)
 *
 * Register the result on `createFormHook`'s `fieldComponents` map so it is
 * available as `field.TextInput` (or similar) inside `form.AppField`.
 *
 * The `any` in the constraint is required so controls with a concrete value
 * type (e.g. `string`) satisfy `FieldControlProps`; the narrowed value type
 * is recovered via `ExtractFieldValue`.
 */
// biome-ignore lint/suspicious/noExplicitAny: see JSDoc above for rationale.
export function fieldInputWrapper<TControlProps extends FieldControlProps<any>>(
	Control: React.ComponentType<TControlProps>,
) {
	type TValue = ExtractFieldValue<TControlProps>;

	return function WrappedField(props: FieldInputWrapperProps<TControlProps>) {
		const { label, description, hideLabel, ...controlProps } = props;
		const field = useFieldContext<TValue>();
		const submissionAttempts = useStore(
			field.form.store,
			(state) => state.submissionAttempts,
		);

		const showError = shouldShowFieldError(
			field.state.meta,
			submissionAttempts,
		);
		const errors = showError
			? normalizeFieldErrors(field.state.meta.errors)
			: [];
		const resolvedLabel = label ?? fieldNameToLabel(field.name);

		const bindings = {
			id: field.name,
			name: field.name,
			value: field.state.value,
			onChange: (value: TValue) => field.handleChange(value),
			onBlur: field.handleBlur,
			"aria-invalid": showError || undefined,
		} satisfies FieldControlProps<TValue>;

		const mergedControlProps = {
			...(controlProps as object),
			...bindings,
		} as unknown as TControlProps;

		return (
			<BaseField.Root data-invalid={showError || undefined}>
				<BaseField.Label
					htmlFor={field.name}
					className={hideLabel ? "sr-only" : undefined}
				>
					{resolvedLabel}
				</BaseField.Label>
				<Control {...mergedControlProps} />
				{description ? (
					<BaseField.Description>{description}</BaseField.Description>
				) : null}
				{errors.length > 0 ? <BaseField.Error errors={errors} /> : null}
			</BaseField.Root>
		);
	};
}
