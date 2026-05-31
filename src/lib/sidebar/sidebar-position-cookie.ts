import { setCookie } from "typescript-cookie";

export const SIDEBAR_POSITION_COOKIE = "sidebar_position";

const SIDEBAR_POSITION_EXPIRES_DAYS = 7;

type SidebarPosition = "expanded" | "collapsed";

function sidebarPositionFromOpen(open: boolean): SidebarPosition {
	return open ? "expanded" : "collapsed";
}

/** Parse cookie value; defaults to expanded when missing/invalid. */
export function parseSidebarPositionCookie(
	cookieValue?: string | null,
): boolean {
	if (!cookieValue || typeof cookieValue !== "string") {
		return true;
	}

	const value = cookieValue.trim();
	if (value === "collapsed") {
		return false;
	}

	return true;
}

export function writeSidebarOpen(open: boolean) {
	setCookie(SIDEBAR_POSITION_COOKIE, sidebarPositionFromOpen(open), {
		path: "/",
		expires: SIDEBAR_POSITION_EXPIRES_DAYS,
	});
}
