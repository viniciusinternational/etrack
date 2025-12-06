"use client";

/**
 * Sidebar component for E-Track
 * Role-based navigation with collapsible design
 */

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types";
import {
  LayoutDashboard,
  Building2,
  Users,
  DollarSign,
  ShoppingCart,
  Shield,
  Calendar,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  FileSpreadsheet,
  FolderOpen,
  TrendingUp,
  Settings,
} from "lucide-react";
import { getRoleDisplayName } from "@/lib/auth";

interface SidebarProps {
  userRole: UserRole;
  collapsed?: boolean;
  onToggle?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
  permission?: string;
}

// Unified navigation (role-agnostic)
const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/users", icon: Users },
  { label: "MDAs", href: "/mdas", icon: Building2 },
  { label: "Projects", href: "/projects", icon: FolderOpen },
  { label: "Budget", href: "/budget", icon: FileSpreadsheet },
  { label: "Expenditure", href: "/expenditure", icon: TrendingUp },
  { label: "Revenue", href: "/revenue", icon: DollarSign },
  { label: "Procurement", href: "/procurement", icon: ShoppingCart },
  { label: "Meetings", href: "/meetings", icon: Calendar },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Audit", href: "/audit", icon: Shield },
];

export function Sidebar({
  userRole,
  collapsed = false,
  onToggle,
}: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (itemLabel: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemLabel)
        ? prev.filter((item) => item !== itemLabel)
        : [...prev, itemLabel]
    );
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-white border-r border-gray-200 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
        {!collapsed && (
          <div>
            <h1 className="text-lg font-semibold text-gray-900">E-Track</h1>
            <p className="text-xs text-gray-500">
              {getRoleDisplayName(userRole)}
            </p>
          </div>
        )}
        <button
          onClick={onToggle}
          className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item: NavItem) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedItems.includes(item.label);

          return (
            <div key={item.label}>
              <div className="flex items-center justify-between">
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors w-full",
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                    collapsed && "justify-center"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </div>
                </Link>

                {hasChildren && !collapsed && (
                  <button
                    onClick={() => toggleExpanded(item.label)}
                    className="ml-2 rounded p-1 text-gray-400 hover:bg-gray-100"
                    aria-label={
                      isExpanded
                        ? `Collapse ${item.label}`
                        : `Expand ${item.label}`
                    }
                  >
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isExpanded && "rotate-90"
                      )}
                    />
                  </button>
                )}
              </div>

              {hasChildren && !collapsed && (
                <div className="ml-6 mt-1 space-y-1">
                  {isExpanded &&
                    item.children?.map((child: NavItem) => {
                      const ChildIcon = child.icon;
                      const childActive = isActive(child.href);

                      return (
                        <Link
                          key={child.label}
                          href={child.href}
                          className={cn(
                            "flex items-center space-x-3 rounded-md px-3 py-2 text-sm transition-colors",
                            childActive
                              ? "bg-blue-50 text-blue-700"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                          )}
                        >
                          <ChildIcon className="h-4 w-4 flex-shrink-0" />
                          <span>{child.label}</span>
                        </Link>
                      );
                    })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        <Link
          href="/settings"
          className={cn(
            "flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900",
            collapsed && "justify-center"
          )}
        >
          <Settings className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>
      </div>
    </div>
  );
}
