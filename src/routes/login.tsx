import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";

import { Button } from "#/components/ui/button.tsx";
import { authClient } from "#/lib/auth-client.ts";
import { useAppForm } from "#/lib/form/create-app-form.ts";

export const Route = createFileRoute("/login")({
	component: Login,
});

const loginSchema = z.object({
	email: z.email("Enter a valid email"),
	password: z.string().min(1, "Enter your password"),
});

function Login() {
	const navigate = useNavigate();
	const [serverError, setServerError] = useState<string | null>(null);

	const form = useAppForm({
		defaultValues: { email: "", password: "" },
		validators: { onChange: loginSchema },
		onSubmit: async ({ value }) => {
			setServerError(null);
			const { error } = await authClient.signIn.email(value);
			if (error) {
				setServerError(error.message ?? "Login failed");
				return;
			}
			navigate({ to: "/dashboard" });
		},
	});

	return (
		<main>
			<h1>Login</h1>
			<form
				onSubmit={(event) => {
					event.preventDefault();
					event.stopPropagation();
					void form.handleSubmit();
				}}
			>
				<form.AppField name="email">
					{(field) => <field.TextInput autoComplete="email" />}
				</form.AppField>

				<form.AppField name="password">
					{(field) => <field.TextInput autoComplete="current-password" />}
				</form.AppField>

				{serverError ? <p role="alert">{serverError}</p> : null}

				<form.Subscribe
					selector={(state) => [state.canSubmit, state.isSubmitting] as const}
				>
					{([canSubmit, isSubmitting]) => (
						<Button type="submit" disabled={!canSubmit}>
							{isSubmitting ? "Logging in..." : "Login"}
						</Button>
					)}
				</form.Subscribe>
			</form>
		</main>
	);
}
