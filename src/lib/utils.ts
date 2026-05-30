import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Project-wide icon component type. Aliasing `LucideIcon` here means swapping
 * icon libraries later is a single-file change — every consumer references
 * `Icon` from this module instead of importing the library type directly.
 */
export type Icon = LucideIcon;
