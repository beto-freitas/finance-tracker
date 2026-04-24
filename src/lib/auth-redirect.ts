import type { LinkProps } from "@tanstack/react-router";

export const postAuthRedirectTo =
	"/app/dashboard" as const satisfies LinkProps["to"];

export function getPostAuthRedirectTo() {
	return postAuthRedirectTo;
}
