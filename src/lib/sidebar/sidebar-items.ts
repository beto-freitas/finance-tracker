import type { LinkProps } from "@tanstack/react-router";
import { LayoutDashboard, Wallet } from "lucide-react";
import type { Icon } from "#/lib/utils";

type SidebarItemLink = {
	type: "link";
	to: LinkProps["to"];
	label: string;
	icon: Icon;
};

type SidebarNavSeparator = {
	type: "separator";
};

type SidebarItemGroup = {
	type: "group";
	label: string;
	icon: Icon;
	items: SidebarItemLink[];
};

type SidebarItem = SidebarItemLink | SidebarNavSeparator | SidebarItemGroup;

export const sidebarItems: SidebarItem[] = [
	{
		type: "link",
		to: "/app/dashboard",
		label: "Dashboard",
		icon: LayoutDashboard,
	},
	{
		type: "link",
		to: "/app/cash-accounts",
		label: "Cash accounts",
		icon: Wallet,
	},
];
