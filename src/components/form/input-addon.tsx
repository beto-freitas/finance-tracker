import type * as React from "react";

import {
	InputGroupAddon,
	InputGroupButton,
	InputGroupText,
} from "#/components/ui/input-group.tsx";
import type { Icon } from "#/lib/icon";

/**
 * Clickable addon. Renders as an `InputGroupButton` so every interactive
 * affordance — password eye, select chevron, future actions — shares one
 * button style. `ariaLabel` is required because the button is icon-only.
 */
export type InputAddonAction = {
	variant: "action";
	icon: Icon;
	ariaLabel: string;
	onClick: React.MouseEventHandler<HTMLButtonElement>;
	disabled?: boolean;
};

/**
 * Static, decorative icon (e.g. search magnifier). Not focusable, marked
 * `aria-hidden` so screen readers don't announce it as an action.
 */
export type InputAddonIcon = {
	variant: "icon";
	icon: Icon;
};

/**
 * Static text prefix or suffix — currency symbol, unit, "@company.com".
 * Rendered through `InputGroupText` so typography matches across fields.
 */
export type InputAddonText = {
	variant: "text";
	children: string;
};

/**
 * Structured addon descriptor. Use these variants whenever possible so
 * styling stays centralized; the raw `ReactNode` escape hatch on
 * `InputAddonSlot` is intentionally a narrower path for true one-offs.
 */
export type InputAddon = InputAddonAction | InputAddonIcon | InputAddonText;

/**
 * Public prop type for `leftAddon` / `rightAddon`. Prefer the structured
 * `InputAddon` union; raw `ReactNode` is accepted as an escape hatch for
 * uncommon content (e.g. a flag, a badge). Buttons should always go
 * through `variant: "action"` so they share `InputGroupButton` styling.
 */
export type InputAddonSlot = InputAddon | React.ReactNode;

function isStructuredAddon(value: unknown): value is InputAddon {
	if (typeof value !== "object" || value === null) return false;
	if (!("variant" in value)) return false;
	const variant = (value as { variant: unknown }).variant;
	return variant === "action" || variant === "icon" || variant === "text";
}

/**
 * Render an `InputAddonSlot` into an `InputGroupAddon` positioned by
 * `align`. Returns `null` when the slot is empty so callers can render
 * unconditionally without branching on presence.
 *
 * Structured variants map to shared primitives:
 *  - `action` → `InputGroupButton` (uniform button styling)
 *  - `icon`   → bare `<Icon aria-hidden />`
 *  - `text`   → `InputGroupText`
 *
 * Anything else is treated as raw `ReactNode` and rendered as-is inside
 * the addon shell.
 */
export function renderInputAddon(
	slot: InputAddonSlot,
	align: "inline-start" | "inline-end",
): React.ReactNode {
	if (slot === undefined || slot === null || slot === false) return null;

	if (isStructuredAddon(slot)) {
		switch (slot.variant) {
			case "action": {
				const IconComponent = slot.icon;
				return (
					<InputGroupAddon align={align}>
						<InputGroupButton
							aria-label={slot.ariaLabel}
							onClick={slot.onClick}
							disabled={slot.disabled}
						>
							<IconComponent aria-hidden />
						</InputGroupButton>
					</InputGroupAddon>
				);
			}
			case "icon": {
				const IconComponent = slot.icon;
				return (
					<InputGroupAddon align={align}>
						<IconComponent aria-hidden />
					</InputGroupAddon>
				);
			}
			case "text":
				return (
					<InputGroupAddon align={align}>
						<InputGroupText>{slot.children}</InputGroupText>
					</InputGroupAddon>
				);
		}
	}

	return <InputGroupAddon align={align}>{slot}</InputGroupAddon>;
}
