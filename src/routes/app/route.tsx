import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { Suspense } from "react";
import { AppSidebar } from "#/components/ui/app-sidebar.tsx";
import { LoadingSpinner } from "#/components/ui/loading-spinner";
import { useAuth } from "#/lib/hooks/use-auth.ts";
import { readSidebarOpen } from "#/lib/sidebar/read-sidebar-open.ts";

export const Route = createFileRoute("/app")({
	beforeLoad: () => ({
		sidebarOpen: readSidebarOpen(),
	}),
	component: AppLayout,
});

function AppLayout() {
	const session = useAuth();
	const { sidebarOpen } = Route.useRouteContext();

	if (!session) {
		return <Navigate to="/login" search={{ redirect: location.href }} />;
	}

	return (
		<AppSidebar defaultOpen={sidebarOpen}>
			<Suspense
				fallback={
					<div className="flex h-1/2 w-full items-center justify-center">
						<LoadingSpinner />
					</div>
				}
			>
				<Outlet />
			</Suspense>
		</AppSidebar>
	);
}
