import type * as React from "react";

import {
	FieldContent,
	FieldDescription,
	FieldError,
	FieldLabel,
	Field as FieldRoot,
} from "#/components/ui/field.tsx";

/**
 * The shared visual shell for every form field. A field component
 * (TextInput, NumberInput, Select, ...) composes `BaseField.*` parts so all
 * inputs look identical and accept the same label / description / error
 * markup.
 *
 * The shell does NOT know about TanStack Form — `FieldInputWrapper` is the
 * thin layer that wires field state into these slots.
 */
function BaseFieldRoot(props: React.ComponentProps<typeof FieldRoot>) {
	return <FieldRoot {...props} />;
}

export const BaseField = {
	Root: BaseFieldRoot,
	Label: FieldLabel,
	Control: FieldContent,
	Description: FieldDescription,
	Error: FieldError,
};
