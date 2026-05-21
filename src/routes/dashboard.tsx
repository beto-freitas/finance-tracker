import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
	component: Dashboard,
});

function Dashboard() {
	return (
		<main>
			<h1>Dashboard</h1>
			<p>You are logged in.</p>
		</main>
	);
}
