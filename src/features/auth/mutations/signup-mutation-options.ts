import { mutationOptions } from "@tanstack/react-query";
import { z } from "zod";
import { signupFormSchema } from "#/features/auth/schemas/signup-form-schema.ts";
import { authClient } from "#/lib/auth/auth-client";
import { appMutationFn } from "#/lib/query/app-mutation-fn";
import { invalidateOnSuccess } from "#/lib/query/invalidate-on-success";
import { createSuccessResponse } from "#/lib/server-fn/create-success-response";
import { sessionQueryOptions } from "../queries/session-query-options";

const signupMutationInputSchema = z.object({
	formData: signupFormSchema,
});

type SignupMutationInput = z.infer<typeof signupMutationInputSchema>;

async function signupMutationFn(input: SignupMutationInput) {
	const parsedInput = signupMutationInputSchema.parse(input);
	await authClient.signUp.email(parsedInput.formData, {
		throw: true,
	});

	return createSuccessResponse();
}

export function signupMutationOptions() {
	return mutationOptions({
		mutationFn: appMutationFn(signupMutationFn),
		onSuccess: async (...args) => {
			await invalidateOnSuccess(args, sessionQueryOptions().queryKey);
		},
	});
}
