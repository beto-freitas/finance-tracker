import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: Home,
});

function Home() {
	return (
		<main>
			<h1>Finance Tracker</h1>
			<Link to="/login">Login</Link>
		</main>
	);
}
