import { mutationOptions } from "@tanstack/react-query";
import { z } from "zod";
import { loginFormSchema } from "#/features/auth/schemas/login-form-schema.ts";
import { authClient } from "#/lib/auth-client.ts";
import { appMutationFn } from "#/lib/query/app-mutation-fn";
import { invalidateOnSuccess } from "#/lib/query/invalidate-on-success";
import { createSuccessResponse } from "#/lib/server-fn/create-success-response";
import { sessionQueryOptions } from "../queries/session-query-options";

const loginMutationInputSchema = z.object({
	formData: loginFormSchema,
});

type LoginMutationInput = z.infer<typeof loginMutationInputSchema>;

async function loginMutationFn(input: LoginMutationInput) {
	const parsedInput = loginMutationInputSchema.parse(input);
	await authClient.signIn.email(parsedInput.formData, {
		throw: true,
	});

	return createSuccessResponse();
}

export function loginMutationOptions() {
	return mutationOptions({
		mutationFn: appMutationFn(loginMutationFn),
		onSuccess: async (...args) => {
			await invalidateOnSuccess(args, sessionQueryOptions().queryKey);
		},
	});
}
