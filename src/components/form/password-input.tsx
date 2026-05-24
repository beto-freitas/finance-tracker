import { Eye, EyeOff } from "lucide-react";
import type * as React from "react";
import { useState } from "react";

import type { InputAddonSlot } from "#/components/form/input-addon.tsx";
import { StringInput } from "#/components/form/string-input.tsx";
import type { FieldControlProps } from "#/lib/form/field-input-wrapper.tsx";

export type PasswordInputProps = FieldControlProps<string> &
	Omit<
		React.ComponentProps<"input">,
		"value" | "onChange" | "onBlur" | "name" | "id" | "aria-invalid" | "type"
	> & {
		leftAddon?: InputAddonSlot;
		/* `rightAddon` is intentionally omitted from the public API — the eye
		 * toggle owns the right slot. Routes needing custom right-slot
		 * behaviour should use `TextInput` with manual addons. */
	};

/**
 * Password control. Always grouped — internally injects an eye toggle in
 * the right addon slot so users can reveal/hide what they typed. Toggling
 * flips the underlying `type` between `"password"` and `"text"`.
 *
 * Delegates layout to the shared `StringInput` primitive (same chrome as
 * every other string-valued control). `leftAddon` is forwarded through;
 * `rightAddon` is not exposed (see {@link PasswordInputProps}).
 */
export function PasswordInput({ leftAddon, ...rest }: PasswordInputProps) {
	const [visible, setVisible] = useState(false);

	return (
		<StringInput
			{...rest}
			type={visible ? "text" : "password"}
			leftAddon={leftAddon}
			rightAddon={{
				variant: "action",
				icon: visible ? EyeOff : Eye,
				ariaLabel: visible ? "Hide password" : "Show password",
				onClick: () => setVisible((current) => !current),
			}}
		/>
	);
}
