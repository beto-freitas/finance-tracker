import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { useAuth } from "#/lib/hooks/use-auth";

export const Route = createFileRoute("/_auth")({
	component: AuthLayout,
});

function AuthLayout() {
	const queryClient = useQueryClient();
	const session = useAuth();

	if (session) {
		// removes all cached data to prevent data leak between sessions
		// TODO: move this to a proper location (maybe logout onSuccess)
		// we won't have any issues with this for now, but it's a bit hacky
		queryClient.clear();
		return <Navigate to="/app/dashboard" />;
	}

	return <Outlet />;
}
