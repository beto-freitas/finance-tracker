import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: () => {
			alert("clicked!");
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
						Welcome back
					</h1>
					<p className="mt-1.5 text-sm text-muted-foreground">
						Enter your credentials to access your account.
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
					<form.Field
						name="email"
						validators={{
							onBlur: ({ value }) => {
								if (!value) return "Email is required";
								if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
									return "Enter a valid email address";
								return undefined;
							},
						}}
					>
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
										{field.state.meta.errors[0]}
									</p>
								)}
							</div>
						)}
					</form.Field>

					<form.Field
						name="password"
						validators={{
							onBlur: ({ value }) => {
								if (!value) return "Password is required";
								if (value.length < 8)
									return "Password must be at least 8 characters";
								return undefined;
							},
						}}
					>
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
										{field.state.meta.errors[0]}
									</p>
								)}
							</div>
						)}
					</form.Field>

					<Button type="submit" className="w-full" size="lg">
						Login
					</Button>
				</form>

				<p className="mt-6 text-center text-sm text-muted-foreground">
					Don&apos;t have an account?{" "}
					<Link
						to="/signup"
						className="font-medium text-primary underline-offset-4 hover:underline"
					>
						Sign up
					</Link>
				</p>
			</motion.div>
		</div>
	);
}
