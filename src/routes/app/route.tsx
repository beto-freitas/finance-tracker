import { useSuspenseQuery } from "@tanstack/react-query";
import {
	createFileRoute,
	Navigate,
	Outlet,
	useNavigate,
	useRouterState,
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
	const currentPathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const canGoDashboard = currentPathname !== "/app/dashboard";

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
