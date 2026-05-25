import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { useAuth } from "#/lib/hooks/use-auth.ts";

export const Route = createFileRoute("/app")({
	component: AppLayout,
});

function AppLayout() {
	const session = useAuth();

	if (!session) {
		return <Navigate to="/login" search={{ redirect: location.href }} />;
	}

	return <Outlet />;
}
