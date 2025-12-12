"use client";

/**
 * AppSidebar - Professional, responsive, accessible sidebar
 * Features:
 * - Collapsible with icon-only mode
 * - Hover tooltips when collapsed
 * - Full keyboard navigation
 * - Mobile-responsive slide-in drawer
 * - Theme-matched styling (Kaduna Green/Blue/Gold)
 * - Permission-based navigation filtering
 */

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import { LogOut, Settings } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { getNavigationForPermissions } from "@/lib/navigation";
import { getRoleDisplayName } from "@/lib/auth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { state, isMobile } = useSidebar();

  // Get filtered navigation items based on user permissions
  const navItems = useMemo(() => {
    return getNavigationForPermissions(user);
  }, [user]);

  const getBadgeCount = (href: string) => {
    // Placeholder badge counts - can be connected to real data later
    if (href.includes("submissions")) return 8;
    if (href.includes("projects")) return 3;
    if (href.includes("tenders")) return 5;
    return 0;
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/auth/login");
  };

  const getInitials = (firstname: string, lastname: string) => {
    return `${firstname[0]}${lastname[0]}`.toUpperCase();
  };

  const isCollapsed = state === "collapsed" && !isMobile;

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border/50 bg-sidebar-accent-foreground shadow-lg"
    >
      {/* Header with Logo */}
      <SidebarHeader className="border-b border-sidebar-border/50 bg-gradient-to-r from-sidebar-primary/10 via-sidebar-primary/5 to-transparent">
        <div className="flex items-center gap-3 px-3 py-4">
          <div className="relative flex-shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground shadow-lg shadow-primary/25 ring-2 ring-primary/20">
              {isCollapsed ? (
                <Image
                  src="/logo.png"
                  alt="E-Track Logo"
                  width={24}
                  height={24}
                  className="object-contain"
                  priority
                />
              ) : (
                <Image
                  src="/logo.png"
                  alt="E-Track Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                  priority
                />
              )}
            </div>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-base font-bold text-sidebar-foreground truncate">
                E-Track
              </span>
              <span className="text-xs text-sidebar-foreground/70 font-medium truncate">
                {user ? getRoleDisplayName(user.role) : "System"}
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* Navigation Content */}
      <SidebarContent className="px-2 py-4 gap-2">
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
              Navigation
            </SidebarGroupLabel>
          )}

          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                const badgeCount = getBadgeCount(item.href);

                const menuButton = (
                  <SidebarMenuButton
                    asChild
                    isActive={active}
                    tooltip={isCollapsed ? item.label : undefined}
                    className={cn(
                      "relative group h-11 rounded-lg transition-all duration-200 ease-out",
                      "hover:shadow-md hover:shadow-primary/10",
                      active
                        ? "bg-gradient-to-r from-sidebar-primary to-sidebar-primary/90 text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/25 font-semibold"
                        : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground text-sidebar-foreground/80"
                    )}
                  >
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 px-3 w-full"
                      aria-label={item.label}
                    >
                      <div
                        className={cn(
                          "relative flex h-8 w-8 items-center justify-center rounded-md transition-all duration-200 flex-shrink-0",
                          active
                            ? "bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground"
                            : "bg-sidebar-accent/30 text-sidebar-foreground/70 group-hover:bg-sidebar-primary/20 group-hover:text-sidebar-primary"
                        )}
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </div>
                      {!isCollapsed && (
                        <span className="font-medium transition-colors duration-200 flex-1 truncate">
                          {item.label}
                        </span>
                      )}
                      {badgeCount > 0 && !isCollapsed && (
                        <SidebarMenuBadge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-sm ml-auto">
                          {badgeCount}
                        </SidebarMenuBadge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                );

                // Wrap in tooltip if collapsed
                if (isCollapsed) {
                  return (
                    <Tooltip key={item.id} delayDuration={0}>
                      <TooltipTrigger asChild>
                        <SidebarMenuItem>{menuButton}</SidebarMenuItem>
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        align="center"
                        className="bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border"
                      >
                        {item.label}
                        {badgeCount > 0 && (
                          <span className="ml-2 px-1.5 py-0.5 rounded bg-primary text-primary-foreground text-xs font-semibold">
                            {badgeCount}
                          </span>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return (
                  <SidebarMenuItem key={item.id}>{menuButton}</SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with User Info and Actions */}
      <SidebarFooter className="border-t border-sidebar-border/50 bg-gradient-to-r from-sidebar-accent/10 via-sidebar-accent/5 to-transparent p-2 gap-2">
        {/* User Profile Section */}
        {!isCollapsed && user && (
          <div className="px-3 py-2 rounded-lg bg-sidebar-accent/20 border border-sidebar-border/50 mb-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 border-2 border-sidebar-primary/30">
                <AvatarImage src="" alt={`${user.firstname} ${user.lastname}`} />
                <AvatarFallback className="bg-gradient-to-br from-sidebar-primary via-sidebar-primary/90 to-sidebar-primary/70 text-sidebar-primary-foreground font-semibold text-xs">
                  {getInitials(user.firstname, user.lastname)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-semibold text-sidebar-foreground truncate">
                  {`${user.firstname} ${user.lastname}`}
                </span>
                <span className="text-xs text-sidebar-foreground/70 truncate">
                  {user.email}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Settings and Logout */}
        <SidebarMenu className="space-y-1">
          {/* Settings */}
          <SidebarMenuItem>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <SidebarMenuButton
                  asChild
                  tooltip={isCollapsed ? "Settings" : undefined}
                  className={cn(
                    "h-11 rounded-lg transition-all duration-200",
                    "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground text-sidebar-foreground/80"
                  )}
                >
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 px-3 w-full"
                    aria-label="Settings"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-accent/30 text-sidebar-foreground/70 transition-all duration-200 group-hover:bg-sidebar-primary/20 group-hover:text-sidebar-primary flex-shrink-0">
                      <Settings className="h-4 w-4" aria-hidden="true" />
                    </div>
                    {!isCollapsed && (
                      <span className="font-medium">Settings</span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent
                  side="right"
                  align="center"
                  className="bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border"
                >
                  Settings
                </TooltipContent>
              )}
            </Tooltip>
          </SidebarMenuItem>

          {/* Logout */}
          <SidebarMenuItem>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <SidebarMenuButton
                  onClick={handleLogout}
                  tooltip={isCollapsed ? "Sign out" : undefined}
                  className={cn(
                    "h-11 rounded-lg transition-all duration-200 w-full",
                    "hover:bg-destructive/10 hover:text-destructive text-sidebar-foreground/80",
                    "focus-visible:ring-2 focus-visible:ring-destructive/50"
                  )}
                  aria-label="Sign out"
                >
                  <div className="flex items-center gap-3 px-3 w-full">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-destructive/10 text-destructive/70 transition-all duration-200 group-hover:bg-destructive/20 group-hover:text-destructive flex-shrink-0">
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                    </div>
                    {!isCollapsed && (
                      <span className="font-medium">Sign out</span>
                    )}
                  </div>
                </SidebarMenuButton>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent
                  side="right"
                  align="center"
                  className="bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-border"
                >
                  Sign out
                </TooltipContent>
              )}
            </Tooltip>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
