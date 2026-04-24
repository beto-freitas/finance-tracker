import { createFileRoute, redirect } from "@tanstack/react-router";
import { getPostAuthRedirectTo } from "#/lib/auth-redirect";

export const Route = createFileRoute("/app/")({
	beforeLoad: () => {
		throw redirect({ to: getPostAuthRedirectTo() });
	},
});
