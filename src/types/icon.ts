import type { LucideIcon } from "lucide-react";

/**
 * Project-wide icon component type. Aliasing `LucideIcon` here means swapping
 * icon libraries later is a single-file change — every consumer references
 * `Icon` from this module instead of importing the library type directly.
 */
export type Icon = LucideIcon;
