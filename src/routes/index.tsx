import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: App });

function App() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-50">
			<h1 className="text-4xl font-bold text-primary-600">
				Finance Tracker
			</h1>
		</div>
	);
}
