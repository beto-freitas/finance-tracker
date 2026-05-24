import type * as React from "react";

import { Input } from "#/components/ui/input.tsx";
import type { FieldControlProps } from "#/lib/form/field-input-wrapper.tsx";

export type TextInputProps = FieldControlProps<string> &
	Omit<
		React.ComponentProps<"input">,
		"value" | "onChange" | "onBlur" | "name" | "id" | "aria-invalid" | "type"
	>;

/**
 * The text "bar". Dumb on purpose — it knows nothing about TanStack Form.
 * Bridges the native change event into the `(value: string) => void`
 * contract that `fieldInputWrapper` provides.
 */
export function TextInput({ value, onChange, ...rest }: TextInputProps) {
	return (
		<Input
			type="text"
			value={value}
			onChange={(event) => onChange(event.target.value)}
			{...rest}
		/>
	);
}
