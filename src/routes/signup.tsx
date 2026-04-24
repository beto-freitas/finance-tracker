import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { signupFormSchema, signupMutationOptions } from "#/api/signup";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";

export const Route = createFileRoute("/signup")({ component: SignupPage });

function getFieldErrorMessage(error: unknown) {
	if (typeof error === "string") return error;
	if (error && typeof error === "object" && "message" in error) {
		const message = (error as { message?: unknown }).message;
		if (typeof message === "string") return message;
	}
	return "Invalid value";
}

function SignupPage() {
	const navigate = useNavigate();
	const signupMutation = useMutation(signupMutationOptions());

	const form = useForm({
		defaultValues: {
			name: "",
			email: "",
			password: "",
			confirmPassword: "",
		},
		validators: {
			onChange: signupFormSchema,
		},
		onSubmit: async ({ value }) => {
			await signupMutation.mutateAsync({ data: value });
			await navigate({ to: "/" });
		},
	});

	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4">
			<motion.div
				initial={{ opacity: 0, y: 12 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
				className="w-full max-w-sm"
			>
				<div className="mb-8 text-center">
					<h1 className="text-2xl font-bold tracking-tight text-foreground">
						Create an account
					</h1>
					<p className="mt-1.5 text-sm text-muted-foreground">
						Enter your details to get started.
					</p>
				</div>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="space-y-4"
				>
					<form.Field name="name">
						{(field) => (
							<div className="space-y-1.5">
								<Label htmlFor={field.name}>Name</Label>
								<Input
									id={field.name}
									type="text"
									placeholder="John Doe"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
								{field.state.meta.errors.length > 0 && (
									<p className="text-xs text-destructive">
										{getFieldErrorMessage(field.state.meta.errors[0])}
									</p>
								)}
							</div>
						)}
					</form.Field>

					<form.Field name="email">
						{(field) => (
							<div className="space-y-1.5">
								<Label htmlFor={field.name}>Email</Label>
								<Input
									id={field.name}
									type="email"
									placeholder="you@example.com"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
								{field.state.meta.errors.length > 0 && (
									<p className="text-xs text-destructive">
										{getFieldErrorMessage(field.state.meta.errors[0])}
									</p>
								)}
							</div>
						)}
					</form.Field>

					<form.Field name="password">
						{(field) => (
							<div className="space-y-1.5">
								<Label htmlFor={field.name}>Password</Label>
								<Input
									id={field.name}
									type="password"
									placeholder="••••••••"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
								{field.state.meta.errors.length > 0 && (
									<p className="text-xs text-destructive">
										{getFieldErrorMessage(field.state.meta.errors[0])}
									</p>
								)}
							</div>
						)}
					</form.Field>

					<form.Field name="confirmPassword">
						{(field) => (
							<div className="space-y-1.5">
								<Label htmlFor={field.name}>Confirm password</Label>
								<Input
									id={field.name}
									type="password"
									placeholder="••••••••"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
								{field.state.meta.errors.length > 0 && (
									<p className="text-xs text-destructive">
										{getFieldErrorMessage(field.state.meta.errors[0])}
									</p>
								)}
							</div>
						)}
					</form.Field>

					<Button
						type="submit"
						className="w-full"
						size="lg"
						disabled={signupMutation.isPending}
					>
						{signupMutation.isPending ? "Creating account..." : "Sign up"}
					</Button>
					{signupMutation.error && (
						<p className="text-center text-xs text-destructive">
							{signupMutation.error.message}
						</p>
					)}
				</form>

				<p className="mt-6 text-center text-sm text-muted-foreground">
					Already have an account?{" "}
					<Link
						to="/login"
						className="font-medium text-foreground underline-offset-4 hover:underline"
					>
						Login
					</Link>
				</p>
			</motion.div>
		</div>
	);
}
