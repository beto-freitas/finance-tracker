import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { useAuth } from "#/lib/hooks/use-auth";

export const Route = createFileRoute("/_auth")({
	component: AuthLayout,
});

function AuthLayout() {
	const session = useAuth();

	if (session) {
		return <Navigate to="/app/dashboard" />;
	}

	return <Outlet />;
}
