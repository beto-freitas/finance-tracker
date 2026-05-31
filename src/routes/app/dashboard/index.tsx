import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "#/lib/hooks/use-auth.ts";

export const Route = createFileRoute("/app/dashboard/")({
	component: DashboardPage,
});

function DashboardPage() {
	const auth = useAuth();

	return (
		<main className="flex flex-col gap-4 p-6">
			<h1>Dashboard</h1>
			<p>Logged in as {auth.user.email}</p>
		</main>
	);
}
