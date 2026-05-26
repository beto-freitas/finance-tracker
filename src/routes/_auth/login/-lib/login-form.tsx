import { useMutation } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { Button } from "#/components/ui/button.tsx";
import { loginMutationOptions } from "#/features/auth/mutations/login-mutation-options";
import {
	type LoginFormValues,
	loginFormSchema,
} from "#/features/auth/schemas/login-form-schema.ts";
import { useAppForm } from "#/lib/form/create-app-form.ts";

const LoginRoute = getRouteApi("/_auth/login/");

function useLoginFormDefaultValues() {
	return {
		email: "",
		password: "",
	} satisfies LoginFormValues as LoginFormValues;
}

export function LoginForm() {
	const navigate = LoginRoute.useNavigate();
	const search = LoginRoute.useSearch();
	const loginMutation = useMutation(loginMutationOptions());

	const defaultValues = useLoginFormDefaultValues();

	const form = useAppForm({
		defaultValues,
		validators: { onChange: loginFormSchema },
		onSubmit: async ({ value }) => {
			await loginMutation.mutateAsync({ formData: value });
			if (search.redirect) {
				navigate({ href: search.redirect });
				return;
			}

			navigate({ to: "/app/dashboard" });
		},
	});

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				void form.handleSubmit();
			}}
			className="flex w-full max-w-sm flex-col gap-4"
		>
			<form.AppField name="email">
				{(field) => <field.TextInput autoComplete="email" />}
			</form.AppField>

			<form.AppField name="password">
				{(field) => <field.PasswordInput autoComplete="current-password" />}
			</form.AppField>

			<form.Subscribe
				selector={(state) => [state.canSubmit, state.isSubmitting]}
			>
				{([canSubmit, isSubmitting]) => (
					<Button type="submit" disabled={!canSubmit}>
						{isSubmitting ? "Logging in..." : "Login"}
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
}
