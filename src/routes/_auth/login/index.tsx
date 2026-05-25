import { createFileRoute, Link } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { LoginForm } from "./-lib/login-form";

const loginSearchSchema = z.object({
	redirect: z.string().optional(),
});

export const Route = createFileRoute("/_auth/login/")({
	validateSearch: zodValidator(loginSearchSchema),
	component: LoginPage,
});

function LoginPage() {
	return (
		<main className="flex flex-col gap-4 p-6">
			<h1>Login</h1>

			<LoginForm />

			<p>
				No account yet? <Link to="/signup">Signup</Link>
			</p>
		</main>
	);
}
