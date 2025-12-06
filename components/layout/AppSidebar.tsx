"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  FolderOpen,
  CheckSquare,
  DollarSign,
  ShoppingCart,
  Calendar,
  Shield,
  FileSpreadsheet,
  BarChart3,
  Upload,
  Award,
  Settings,
  Home,
} from "lucide-react";

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
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Events", href: "/events", icon: Calendar },
    { label: "Users", href: "/users", icon: Users },
    { label: "MDAs", href: "/mdas", icon: Building2 },
    { label: "Projects", href: "/projects", icon: FolderOpen },
    {
      label: "Submissions",
      href: "/submissions",
      icon: CheckSquare,
    },
    { label: "Budget", href: "/budget", icon: Upload },

    { label: "Expenditure", href: "/expenditure", icon: DollarSign },
    { label: "Revenue", href: "/revenue", icon: DollarSign },
    { label: "Tenders", href: "/tenders", icon: ShoppingCart },
    { label: "Awards", href: "/awards", icon: Award },
    { label: "Contract", href: "/contract", icon: Award },
    { label: "Meetings", href: "/meetings", icon: Calendar },
    { label: "Audit", href: "/audit", icon: Shield },
    { label: "Reports", href: "/reports", icon: FileSpreadsheet },
  ];

  const isActive = (href: string) => pathname.startsWith(href);

  const getBadgeCount = (href: string) => {
    if (href.includes("submissions")) return 8;
    if (href.includes("projects")) return 3;
    if (href.includes("tenders")) return 5;
    return 0;
  };

  return (
    <Sidebar className="border-r-0 shadow-lg backdrop-blur-sm bg-gradient-to-b from-background to-background/95">
      <SidebarHeader className="border-b border-border/50 bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="flex items-center gap-3 px-3 py-4">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25">
              <Home className="h-5 w-5" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              E-Track
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              Unified System
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
            Main Menu
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                const badgeCount = getBadgeCount(item.href);

                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      className={`relative group h-11 rounded-xl transition-all duration-200 ease-out
                        hover:shadow-md hover:shadow-primary/10
                        ${
                          active
                            ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
                            : "hover:bg-gradient-to-r hover:from-accent/50 hover:to-accent/30"
                        }`}
                    >
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 px-3"
                      >
                        <div
                          className={`relative flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200
                            ${
                              active
                                ? "bg-primary-foreground/20 text-primary-foreground"
                                : "bg-muted/50 text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                            }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <span
                          className={`font-medium transition-colors duration-200 ${
                            active
                              ? "text-primary-foreground"
                              : "text-foreground group-hover:text-primary"
                          }`}
                        >
                          {item.label}
                        </span>
                        {badgeCount > 0 && !active && (
                          <SidebarMenuBadge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-sm">
                            {badgeCount}
                          </SidebarMenuBadge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Optional Stats */}
        <div className="mt-6 px-3">
          <div className="rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">
                Quick Stats
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  Active Projects
                </span>
                <span className="text-sm font-bold text-primary">24</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  Pending Reviews
                </span>
                <span className="text-sm font-bold text-orange-600">8</span>
              </div>
            </div>
          </div>
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 bg-gradient-to-r from-muted/20 to-muted/10 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-11 rounded-xl transition-all duration-200 hover:shadow-md hover:shadow-primary/10 hover:bg-gradient-to-r hover:from-accent/50 hover:to-accent/30"
            >
              <Link href="/settings" className="flex items-center gap-3 px-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary transition-all duration-200">
                  <Settings className="h-4 w-4" />
                </div>
                <span className="font-medium">Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
