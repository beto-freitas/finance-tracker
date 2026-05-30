import { createMiddleware } from "@tanstack/react-start";
import { getAuthSessionServerFn } from "#/features/auth/lib/get-auth-session";
import { AppUnauthenticatedError } from "../errors/app-unauthenticated-error";

export const authMiddleware = createMiddleware().server(async ({ next }) => {
	const authResult = await getAuthSessionServerFn();

	if (!authResult?.user?.id) {
		throw new AppUnauthenticatedError();
	}

	return next({
		context: {
			user: authResult.user,
		},
	});
});
