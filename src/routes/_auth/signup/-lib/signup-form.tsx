import { useMutation } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { Button } from "#/components/ui/button.tsx";
import { signupMutationOptions } from "#/features/auth/mutations/signup-mutation-options";
import {
	type SignupFormValues,
	signupFormSchema,
} from "#/features/auth/schemas/signup-form-schema.ts";
import { useAppForm } from "#/lib/form/create-app-form.ts";

const SignupRoute = getRouteApi("/_auth/signup/");

function useSignUpFormDefaultValues() {
	return { name: "", email: "", password: "" } satisfies SignupFormValues;
}

export function SignupForm() {
	const navigate = SignupRoute.useNavigate();
	const signupMutation = useMutation(signupMutationOptions());

	const defaultValues = useSignUpFormDefaultValues();

	const form = useAppForm({
		defaultValues,
		validators: { onChange: signupFormSchema },
		onSubmit: async ({ value }) => {
			await signupMutation.mutateAsync({ formData: value });
			navigate({ to: "/app/dashboard" });
		},
	});

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();
				void form.handleSubmit();
			}}
			className="flex w-full max-w-sm flex-col gap-4"
		>
			<form.AppField name="name">
				{(field) => <field.TextInput autoComplete="name" />}
			</form.AppField>

			<form.AppField name="email">
				{(field) => <field.TextInput autoComplete="email" />}
			</form.AppField>

			<form.AppField name="password">
				{(field) => <field.PasswordInput autoComplete="new-password" />}
			</form.AppField>

			<form.Subscribe
				selector={(state) => [state.canSubmit, state.isSubmitting]}
			>
				{([canSubmit, isSubmitting]) => (
					<Button type="submit" disabled={!canSubmit}>
						{isSubmitting ? "Signing up..." : "Signup"}
					</Button>
				)}
			</form.Subscribe>
		</form>
	);
}
