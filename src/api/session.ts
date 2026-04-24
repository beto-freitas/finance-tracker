import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createAppQueryOptions } from "#/lib/api-client";
import { createErrorResponse, createSuccessResponse } from "#/lib/api-response";
import { auth } from "#/lib/auth";
import { HTTP_STATUS } from "#/lib/http-status";

type SessionResponse = {
	user: {
		id: string;
		name: string;
		email: string;
	} | null;
	session: {
		id: string;
		expiresAt: string;
	} | null;
};

const sessionServerFn = createServerFn({ method: "GET" }).handler(async () => {
	try {
		const request = getRequest();
		const authSession = await auth.api.getSession({
			headers: request.headers,
		});

		if (!authSession?.user || !authSession.session) {
			return createSuccessResponse<SessionResponse>({
				user: null,
				session: null,
			});
		}

		return createSuccessResponse<SessionResponse>({
			user: {
				id: authSession.user.id,
				name: authSession.user.name,
				email: authSession.user.email,
			},
			session: {
				id: authSession.session.id,
				expiresAt: authSession.session.expiresAt.toISOString(),
			},
		});
	} catch (error) {
		if (error instanceof Error) {
			return createErrorResponse(HTTP_STATUS.UNAUTHORIZED, error.message);
		}

		return createErrorResponse(
			HTTP_STATUS.INTERNAL_SERVER_ERROR,
			"Unable to get the current session.",
		);
	}
});

export const sessionQueryOptions = () =>
	createAppQueryOptions({
		queryKey: ["auth", "session"],
		queryFn: () => sessionServerFn(),
	});
