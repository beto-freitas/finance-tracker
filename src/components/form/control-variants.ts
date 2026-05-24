import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "#/lib/utils";

/**
 * The outer "bar" — border, height, rounding, background, focus ring, invalid
 * state. Applied to whatever element acts as the bar:
 *
 *  - `appearance: "input"` — applied directly to a bare `<input>`. Focus,
 *    invalid, and disabled styles use selectors that fire on the input
 *    itself (`focus-visible:`, `aria-invalid:`, `disabled:`).
 *  - `appearance: "group"` — applied to the `InputGroup` wrapper `<div>`.
 *    The same visual states are derived from the inner control via
 *    `has-[[data-slot=input-group-control]:…]` so the ring wraps the entire
 *    group, addons included.
 *
 * Keeping both modes in one CVA guarantees the bar looks identical whether
 * a field renders bare or with addons.
 */
export const controlShellVariants = cva(
	cn(
		"flex h-9 w-full min-w-0 items-center rounded-md border border-input bg-transparent shadow-xs transition-[color,box-shadow] outline-none dark:bg-input/30",
	),
	{
		variants: {
			appearance: {
				input: cn(
					"px-3 py-1",
					"focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
					"aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
					"disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
				),
				group: cn(
					"has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-[3px] has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50",
					"has-[[data-slot=input-group-control][aria-invalid=true]]:border-destructive has-[[data-slot=input-group-control][aria-invalid=true]]:ring-destructive/20 dark:has-[[data-slot=input-group-control][aria-invalid=true]]:ring-destructive/40",
					"has-[[data-slot=input-group-control]:disabled]:pointer-events-none has-[[data-slot=input-group-control]:disabled]:cursor-not-allowed has-[[data-slot=input-group-control]:disabled]:opacity-50",
				),
			},
		},
		defaultVariants: {
			appearance: "input",
		},
	},
);

/**
 * Text/placeholder/selection styling for the actual control element (the
 * `<input>` itself). Same typography in both appearances:
 *
 *  - `appearance: "input"` — sits inside the bar shell and inherits its
 *    padding, so this variant adds no extra layout.
 *  - `appearance: "group"` — sits inside an `InputGroup` shell as a flex
 *    child; strips its own border/background/shadow/ring (those live on the
 *    shell) and provides its own padding so text never tucks under addons.
 */
export const controlInnerVariants = cva(
	cn(
		"text-base md:text-sm",
		"selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground",
		"file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
	),
	{
		variants: {
			appearance: {
				input: "",
				group: cn(
					"flex-1 min-w-0 h-full rounded-none border-none bg-transparent px-3 py-1 shadow-none outline-none",
					"focus-visible:border-transparent focus-visible:ring-0",
					"dark:bg-transparent",
				),
			},
		},
		defaultVariants: {
			appearance: "input",
		},
	},
);

export type ControlShellVariantsProps = VariantProps<
	typeof controlShellVariants
>;
export type ControlInnerVariantsProps = VariantProps<
	typeof controlInnerVariants
>;
