"use client";

/**
 * App Layout using shadcn/ui components
 * Modern layout with sidebar and header
 */

import { User } from "@/types";
import { AppSidebar } from "./AppSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
  user: User;
  className?: string;
}

export function AppLayout({ children, user, className }: AppLayoutProps) {
  const handleLogout = () => {
    // Implement logout logic
    console.log("Logging out...");
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-gradient-to-br from-background via-background to-muted/20 flex flex-col h-screen overflow-hidden">
        <DashboardHeader user={user} onLogout={handleLogout} />
        <main
          className={`flex-1 overflow-visible overflow-x-hidden p-4 sm:p-6 lg:p-8 relative ${
            className || ""
          }`}
        >
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-[0.015] pointer-events-none">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
                backgroundSize: "32px 32px",
              }}
            />
          </div>
          <div className="relative z-10 mx-auto w-full max-w-7xl">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
