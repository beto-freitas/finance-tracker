import { createFileRoute, Link } from "@tanstack/react-router";
import { SignupForm } from "./-lib/signup-form";

export const Route = createFileRoute("/_auth/signup/")({
	component: SignupPage,
});

function SignupPage() {
	return (
		<main className="flex flex-col gap-4 p-6">
			<h1>Signup</h1>

			<SignupForm />

			<p>
				Already have an account? <Link to="/login">Login</Link>
			</p>
		</main>
	);
}
