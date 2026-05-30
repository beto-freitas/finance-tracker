import { mutationOptions } from "@tanstack/react-query";
import { authClient } from "#/lib/auth/auth-client";
import { appMutationFn } from "#/lib/query/app-mutation-fn";
import { invalidateOnSuccess } from "#/lib/query/invalidate-on-success";
import { createSuccessResponse } from "#/lib/server-fn/create-success-response";
import { sessionQueryOptions } from "../queries/session-query-options";

async function logoutMutationFn() {
	await authClient.signOut({
		fetchOptions: {
			throw: true,
		},
	});

	return createSuccessResponse();
}

export function logoutMutationOptions() {
	return mutationOptions({
		mutationFn: appMutationFn(logoutMutationFn),
		onSuccess: async (...args) => {
			await invalidateOnSuccess(args, sessionQueryOptions().queryKey);
		},
	});
}
