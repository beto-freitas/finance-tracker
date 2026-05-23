import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "#/lib/utils";

/**
 * Shared visual chrome for every form control "bar" (text, number, select
 * trigger, etc.). Keeps every input type aligned on height, border, focus
 * ring, and invalid state styling.
 */
export const controlVariants = cva(
	cn(
		"flex h-9 w-full min-w-0 items-center rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm dark:bg-input/30",
		"selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground",
		"file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
		"disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
		"focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
		"aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
	),
	{
		variants: {},
		defaultVariants: {},
	},
);

export type ControlVariantsProps = VariantProps<typeof controlVariants>;
