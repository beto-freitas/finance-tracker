import { createIsomorphicFn } from "@tanstack/react-start";
import { getCookie as getRequestCookie } from "@tanstack/react-start/server";
import { getCookie as getBrowserCookie } from "typescript-cookie";
import {
	parseSidebarPositionCookie,
	SIDEBAR_POSITION_COOKIE,
} from "#/lib/sidebar/sidebar-position-cookie.ts";

export const readSidebarOpen = createIsomorphicFn()
	.server(() =>
		parseSidebarPositionCookie(getRequestCookie(SIDEBAR_POSITION_COOKIE)),
	)
	.client(() =>
		parseSidebarPositionCookie(getBrowserCookie(SIDEBAR_POSITION_COOKIE)),
	);
