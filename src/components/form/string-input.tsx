import type * as React from "react";

import {
	type InputAddonSlot,
	renderInputAddon,
} from "#/components/form/input-addon.tsx";
import { Input } from "#/components/ui/input.tsx";
import { InputGroup, InputGroupInput } from "#/components/ui/input-group.tsx";
import type { FieldControlProps } from "#/lib/form/field-input-wrapper.tsx";

/**
 * @internal Props accepted by the shared {@link StringInput} primitive. Not
 * exposed publicly — public string controls (`TextInput`, `PasswordInput`)
 * declare their own narrower props and delegate here.
 */
export type StringInputProps = FieldControlProps<string> &
	Omit<
		React.ComponentProps<"input">,
		"value" | "onChange" | "onBlur" | "name" | "id" | "aria-invalid"
	> & {
		leftAddon?: InputAddonSlot;
		rightAddon?: InputAddonSlot;
	};

/**
 * @internal Shared layout primitive for string-valued controls. Owns the
 * bare-`Input` vs `InputGroup` branching so every public control that
 * stores a `string` value renders identically.
 *
 * Branching rule (per ADR-0001):
 *  - no addons   → bare `Input`        (unchanged surface for the common
 *                                       case; matches the existing
 *                                       `TextInput`-only baseline)
 *  - any addon   → `InputGroup`        (shell wraps input + addons; same
 *                                       chrome via `controlShellVariants`)
 *
 * Specialised controls that always render addons (e.g. `PasswordInput`'s
 * eye toggle) simply pass them in; the branching above keeps them on the
 * grouped path automatically.
 *
 * Not exported from `create-app-form.ts` — consume via the public
 * `TextInput` / `PasswordInput` (or future siblings) instead.
 */
export function StringInput({
	value,
	onChange,
	onBlur,
	leftAddon,
	rightAddon,
	...rest
}: StringInputProps) {
	const hasAddons = leftAddon != null || rightAddon != null;
	const inputProps = {
		value,
		onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
			onChange(event.target.value),
		onBlur,
		...rest,
	};

	if (!hasAddons) {
		return <Input {...inputProps} />;
	}

	return (
		<InputGroup>
			<InputGroupInput {...inputProps} />
			{renderInputAddon(leftAddon, "inline-start")}
			{renderInputAddon(rightAddon, "inline-end")}
		</InputGroup>
	);
}
