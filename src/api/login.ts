import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createAppMutationOptions } from "#/lib/api-client";
import { createErrorResponse, createSuccessResponse } from "#/lib/api-response";
import { auth } from "#/lib/auth";
import { HTTP_STATUS } from "#/lib/http-status";

export const loginFormSchema = z.object({
	email: z.email("Enter a valid email address"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

const loginMutationInputSchema = z.object({
	data: loginFormSchema,
});

export type LoginFormData = z.infer<typeof loginFormSchema>;
export type LoginMutationInput = z.infer<typeof loginMutationInputSchema>;

const loginServerFn = createServerFn({ method: "POST" })
	.inputValidator(loginMutationInputSchema)
	.handler(async ({ data }) => {
		try {
			await auth.api.signInEmail({
				body: {
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
				"Unable to log in. Please check your credentials and try again.",
			);
		}
	});

export const loginMutationOptions = () =>
	createAppMutationOptions({
		mutationKey: ["auth", "login"],
		mutationFn: (input: LoginMutationInput) => loginServerFn({ data: input }),
	});
