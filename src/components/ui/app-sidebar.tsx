import { useHotkey } from "@tanstack/react-hotkeys";
import { useMutation } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { LogOut, Palette, User } from "lucide-react";
import { type ReactNode, useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu.tsx";
import {
	SIDEBAR_WIDTH,
	SIDEBAR_WIDTH_ICON,
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
	SidebarSeparator,
} from "#/components/ui/sidebar.tsx";
import { logoutMutationOptions } from "#/features/auth/mutations/logout-mutation-options.ts";
import { useAuth } from "#/lib/hooks/use-auth.ts";
import { sidebarItems } from "#/lib/sidebar/sidebar-items";
import { writeSidebarOpen } from "#/lib/sidebar/sidebar-position-cookie.ts";
import { cn } from "#/lib/utils.ts";

/**
 * Local hook to manage the sidebar open state
 * should be instantiated a single time in the root sidebar component
 */
function useSidebarOpen(defaultOpen: boolean) {
	const [open, setOpenState] = useState(defaultOpen);

	const toggle = () => {
		setOpenState((prev) => {
			const next = !prev;
			writeSidebarOpen(next);
			return next;
		});
	};

	return { open, toggle };
}

function AppLogo({ className }: { className?: string }) {
	return (
		<svg
			role="img"
			aria-label="Finance Tracker"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={cn("size-4 shrink-0", className)}
		>
			<rect width="20" height="12" x="2" y="6" rx="2" />
			<circle cx="12" cy="12" r="2" />
			<path d="M6 12h.01M18 12h.01" />
		</svg>
	);
}

export function AppSidebar({
	defaultOpen,
	children,
}: {
	defaultOpen: boolean;
	children: ReactNode;
}) {
	const sidebar = useSidebarOpen(defaultOpen);

	useHotkey("Mod+B", () => {
		sidebar.toggle();
	});

	return (
		<div
			data-slot="sidebar-wrapper"
			style={
				{
					"--sidebar-width": SIDEBAR_WIDTH,
					"--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
				} as React.CSSProperties
			}
			className="group/sidebar-wrapper flex min-h-svh w-full"
		>
			<AppSidebarPanel open={sidebar.open} toggle={sidebar.toggle} />

			<SidebarInset>{children}</SidebarInset>
		</div>
	);
}

function SidebarNavItems({ open }: { open: boolean }) {
	return (
		<SidebarMenu>
			{sidebarItems.map((item) => {
				if (item.type === "separator") {
					return <SidebarSeparator key="nav-separator" />;
				}

				if (item.type === "group") {
					return null;
				}

				const IconComponent = item.icon;

				return (
					<SidebarMenuItem key={item.label}>
						<SidebarMenuButton asChild tooltip={item.label} open={open}>
							<Link
								to={item.to}
								activeProps={{ "data-active": true }}
								activeOptions={{ exact: false }}
							>
								<IconComponent aria-hidden />
								<span>{item.label}</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				);
			})}
		</SidebarMenu>
	);
}

function SidebarUserMenu({ open }: { open: boolean }) {
	const auth = useAuth();
	const logoutMutation = useMutation(logoutMutationOptions());

	const handleLogout = async () => {
		await logoutMutation.mutateAsync();
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<SidebarMenuButton
					size="lg"
					open={open}
					className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
				>
					{auth.user.image ? (
						<img
							src={auth.user.image}
							alt=""
							className="size-8 shrink-0 rounded-lg object-cover"
						/>
					) : (
						<span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
							<User className="size-4" aria-hidden />
						</span>
					)}
					<div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
						<span className="truncate font-medium">{auth.user.name}</span>
						<span className="truncate text-xs text-muted-foreground">
							{auth.user.email}
						</span>
					</div>
				</SidebarMenuButton>
			</DropdownMenuTrigger>
			<DropdownMenuContent side="right" align="end" className="min-w-48">
				<DropdownMenuItem
					onSelect={(event) => {
						event.preventDefault();
					}}
				>
					<User className="size-4" aria-hidden />
					Account
				</DropdownMenuItem>
				<DropdownMenuItem
					onSelect={(event) => {
						event.preventDefault();
					}}
				>
					<Palette className="size-4" aria-hidden />
					Theme
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					variant="destructive"
					disabled={logoutMutation.isPending}
					onSelect={() => {
						void handleLogout();
					}}
				>
					<LogOut className="size-4" aria-hidden />
					{logoutMutation.isPending ? "Logging out..." : "Log out"}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function AppSidebarPanel({
	open,
	toggle,
}: {
	open: boolean;
	toggle: () => void;
}) {
	return (
		<Sidebar open={open} collapsible="icon" side="left">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							size="lg"
							open={open}
							className="pointer-events-none"
						>
							<span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
								<AppLogo />
							</span>
							<span className="truncate font-semibold group-data-[collapsible=icon]:hidden">
								Finance Tracker
							</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent>
				<SidebarNavItems open={open} />
			</SidebarContent>

			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarUserMenu open={open} />
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>

			<SidebarRail onToggle={toggle} />
		</Sidebar>
	);
}
