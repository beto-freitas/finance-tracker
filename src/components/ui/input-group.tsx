import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import {
	controlInnerVariants,
	controlShellVariants,
} from "#/components/form/control-variants.ts";
import { Button } from "#/components/ui/button.tsx";
import { cn } from "#/lib/utils.ts";

/**
 * Outer shell that groups an input with inline addons (icons, buttons,
 * text). Composes `controlShellVariants({ appearance: "group" })` so a
 * grouped input is visually indistinguishable from a bare `Input`.
 *
 * Composition (shadcn-aligned):
 *
 * ```
 * InputGroup
 * ├── InputGroupInput | <SomeControl data-slot="input-group-control" />
 * ├── InputGroupAddon align="inline-start" | "inline-end"
 * ├── InputGroupButton  (interactive addon content)
 * └── InputGroupText    (static text content — "$", "USD", …)
 * ```
 *
 * Place `InputGroupAddon` **after** the control in DOM and use `align` to
 * position it visually. This keeps tab order intuitive (input first, then
 * its actions).
 */
function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="input-group"
			className={cn(
				"group/input-group relative",
				controlShellVariants({ appearance: "group" }),
				"has-[>[data-align=inline-start]]:[&>[data-slot=input-group-control]]:pl-2",
				"has-[>[data-align=inline-end]]:[&>[data-slot=input-group-control]]:pr-2",
				className,
			)}
			{...props}
		/>
	);
}

const inputGroupAddonVariants = cva(
	cn(
		"flex h-full self-stretch cursor-text items-center justify-center gap-2 py-1.5 text-sm font-medium text-muted-foreground select-none",
		"group-data-[disabled=true]/input-group:opacity-50",
		"[&>svg:not([class*='size-'])]:size-4",
	),
	{
		variants: {
			align: {
				"inline-start": "order-first pl-3 has-[>button]:ml-[-0.45rem]",
				"inline-end": "order-last pr-3 has-[>button]:mr-[-0.45rem]",
			},
		},
		defaultVariants: {
			align: "inline-start",
		},
	},
);

/**
 * Addon slot inside an `InputGroup`. Clicking the addon background focuses
 * the inner control unless the click landed on an interactive element
 * (button, link, …), so adjacent icons feel like part of the input bar
 * without stealing clicks from real actions.
 */
function InputGroupAddon({
	className,
	align = "inline-start",
	onClick,
	...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: click-to-focus is a mouse-only convenience; the inner control is already keyboard-reachable via normal tab order.
		// biome-ignore lint/a11y/noStaticElementInteractions: see above — pointer-only ergonomics, no semantic role needed.
		<div
			data-slot="input-group-addon"
			data-align={align}
			className={cn(inputGroupAddonVariants({ align }), className)}
			onClick={(event) => {
				onClick?.(event);
				if (event.defaultPrevented) return;
				const target = event.target as HTMLElement;
				if (target.closest("button, a, [role=button]")) return;
				event.currentTarget.parentElement
					?.querySelector<HTMLElement>("[data-slot=input-group-control]")
					?.focus();
			}}
			{...props}
		/>
	);
}

const inputGroupButtonVariants = cva(
	"flex items-center gap-2 text-sm shadow-none focus-visible:border-transparent focus-visible:ring-0",
	{
		variants: {
			size: {
				xs: "h-6 gap-1 rounded-md px-2 has-[>svg]:px-2 [&>svg:not([class*='size-'])]:size-3.5",
				sm: "h-8 gap-1.5 rounded-md px-2.5 has-[>svg]:px-2.5",
				"icon-xs": "size-6 rounded-md p-0 has-[>svg]:p-0",
				"icon-sm": "size-8 p-0 has-[>svg]:p-0",
			},
		},
		defaultVariants: {
			size: "icon-xs",
		},
	},
);

/**
 * Button styled to sit inside an `InputGroupAddon`. Defaults to `type="button"`
 * to avoid accidental form submits, ghost variant to blend with the bar, and
 * a compact size so it fits the 36px input height without resizing the bar.
 */
function InputGroupButton({
	className,
	type = "button",
	variant = "ghost",
	size = "icon-xs",
	...props
}: Omit<React.ComponentProps<typeof Button>, "size"> &
	VariantProps<typeof inputGroupButtonVariants>) {
	return (
		<Button
			data-slot="input-group-button"
			data-size={size}
			type={type}
			variant={variant}
			className={cn(inputGroupButtonVariants({ size }), className)}
			{...props}
		/>
	);
}

/**
 * Static text addon content — currency symbols, units, suffixes. Inherits
 * the addon's muted typography so prefixes/suffixes look uniform across
 * fields.
 */
function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
	return (
		<span
			data-slot="input-group-text"
			className={cn("text-sm text-muted-foreground", className)}
			{...props}
		/>
	);
}

/**
 * Drop-in replacement for `<Input>` when used inside an `InputGroup`. The
 * shell already owns border/focus/invalid styling, so this strips chrome
 * and keeps only the typography and spacing the input needs.
 */
function InputGroupInput({
	className,
	type = "text",
	...props
}: React.ComponentProps<"input">) {
	return (
		<input
			data-slot="input-group-control"
			type={type}
			className={cn(controlInnerVariants({ appearance: "group" }), className)}
			{...props}
		/>
	);
}

export {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
	InputGroupText,
};
