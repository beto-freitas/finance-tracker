import { useSuspenseQuery } from "@tanstack/react-query";
import {
	createFileRoute,
	Navigate,
	Outlet,
	useMatchRoute,
	useNavigate,
} from "@tanstack/react-router";
import { sessionQueryOptions } from "#/api/session";
import { AppErrorState } from "#/components/errors/app-error-state";

export const Route = createFileRoute("/app")({
	component: AppLayout,
	errorComponent: AppErrorComponent,
});

function AppLayout() {
	const sessionQuery = useSuspenseQuery(sessionQueryOptions());

	if (!sessionQuery.data?.user) {
		return <Navigate to="/login" />;
	}

	return <Outlet />;
}

function AppErrorComponent({
	error,
	reset,
}: {
	error: unknown;
	reset: () => void;
}) {
	const navigate = useNavigate();
	const matchRoute = useMatchRoute();
	const isOnDashboard = Boolean(
		matchRoute({ to: "/app/dashboard", fuzzy: false }),
	);
	const canGoDashboard = !isOnDashboard;

	return (
		<AppErrorState
			error={error}
			onRetry={reset}
			onGoDashboard={
				canGoDashboard ? () => navigate({ to: "/app/dashboard" }) : undefined
			}
		/>
	);
}
