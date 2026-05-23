/**
 * Derive a human-readable label from a form field name. Splits camelCase,
 * snake_case, kebab-case, and dotted paths into Title Case words.
 *
 * Examples:
 *   firstName     -> "First Name"
 *   as_of_date    -> "As Of Date"
 *   balanceMinor  -> "Balance Minor"
 *   user.email    -> "Email"          (last segment of a nested path)
 */
export function fieldNameToLabel(name: string): string {
	const segment = name.split(".").pop() ?? name;
	const arraySafe = segment.replace(/\[\d+\]/g, "");

	const words = arraySafe
		.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
		.replace(/[_-]+/g, " ")
		.trim()
		.split(/\s+/)
		.filter(Boolean);

	return words
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}
