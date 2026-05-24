import type * as React from "react";

import type { InputAddonSlot } from "#/components/form/input-addon.tsx";
import { StringInput } from "#/components/form/string-input.tsx";
import type { FieldControlProps } from "#/lib/form/field-input-wrapper.tsx";

export type TextInputProps = FieldControlProps<string> &
	Omit<
		React.ComponentProps<"input">,
		"value" | "onChange" | "onBlur" | "name" | "id" | "aria-invalid" | "type"
	> & {
		leftAddon?: InputAddonSlot;
		rightAddon?: InputAddonSlot;
	};

/**
 * The text "bar". Dumb on purpose — it knows nothing about TanStack Form.
 * Delegates layout (bare `Input` vs `InputGroup`) and addon rendering to
 * the internal `StringInput` primitive so every string-valued control
 * stays visually identical.
 *
 * `type` is intentionally fixed to `"text"`. Password / email / number are
 * separate registered components, not props on this one.
 */
export function TextInput(props: TextInputProps) {
	return <StringInput type="text" {...props} />;
}
