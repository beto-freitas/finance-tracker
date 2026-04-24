import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createAppMutationOptions } from "#/lib/api-client";
import { createErrorResponse, createSuccessResponse } from "#/lib/api-response";
import { auth } from "#/lib/auth";
import { HTTP_STATUS } from "#/lib/http-status";

export const signupFormSchema = z
	.object({
		name: z.string().trim().min(1, "Name is required"),
		email: z.email("Enter a valid email address"),
		password: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z
			.string()
			.min(8, "Password must be at least 8 characters"),
	})
	.refine((values) => values.password === values.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

const signupMutationInputSchema = z.object({
	data: signupFormSchema,
});

export type SignupFormData = z.infer<typeof signupFormSchema>;
export type SignupMutationInput = z.infer<typeof signupMutationInputSchema>;

const signupServerFn = createServerFn({ method: "POST" })
	.inputValidator(signupMutationInputSchema)
	.handler(async ({ data }) => {
		try {
			await auth.api.signUpEmail({
				body: {
					name: data.data.name,
					email: data.data.email,
					password: data.data.password,
				},
			});

			return createSuccessResponse();
		} catch (error) {
			if (error instanceof Error) {
				return createErrorResponse(HTTP_STATUS.BAD_REQUEST, error.message);
			}

			return createErrorResponse(
				HTTP_STATUS.INTERNAL_SERVER_ERROR,
				"Unable to create account. Please try again.",
			);
		}
	});

export const signupMutationOptions = () =>
	createAppMutationOptions({
		mutationKey: ["auth", "signup"],
		mutationFn: (input: SignupMutationInput) => signupServerFn({ data: input }),
	});
