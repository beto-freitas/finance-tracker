import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "#/components/ui/button.tsx";
import { logoutMutationOptions } from "#/features/auth/mutations/logout-mutation-options.ts";
import { useAuth } from "#/lib/hooks/use-auth.ts";

export const Route = createFileRoute("/app/dashboard/")({
	component: DashboardPage,
});

function DashboardPage() {
	const navigate = useNavigate();
	const auth = useAuth();
	const logoutMutation = useMutation(logoutMutationOptions());

	const handleLogout = async () => {
		await logoutMutation.mutateAsync();
		navigate({ to: "/" });
	};

	return (
		<main className="flex flex-col gap-4 p-6">
			<h1>Dashboard</h1>
			<p>Logged in as {auth.user.email}</p>
			<Route.Link to="/app/cash-accounts">Cash accounts</Route.Link>

			<Button
				type="button"
				disabled={logoutMutation.isPending}
				onClick={handleLogout}
			>
				{logoutMutation.isPending ? "Logging out..." : "Logout"}
			</Button>
		</main>
	);
}
