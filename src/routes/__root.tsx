import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
	useNavigate,
	useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { GlobalErrorState } from "#/components/errors/global-error-state";
import appCss from "../globals.css?url";
import { TanStackQueryDevtools } from "../integrations/tanstack-query/devtools";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Finance Tracker",
			},
		],
		links: [{ rel: "stylesheet", href: appCss }],
	}),
	shellComponent: RootDocument,
	errorComponent: RootErrorComponent,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body>
				{children}

				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
						TanStackQueryDevtools,
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}

function RootErrorComponent({
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
	const isHomePage = currentPathname === "/";
	const navigateAwayLabel = isHomePage ? "Go to login" : "Go to home";

	return (
		<GlobalErrorState
			error={error}
			onRetry={reset}
			navigateAwayLabel={navigateAwayLabel}
			onNavigateAway={() =>
				navigate({
					to: isHomePage ? "/login" : "/",
				})
			}
		/>
	);
}
