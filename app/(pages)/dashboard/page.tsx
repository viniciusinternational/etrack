"use client";

/**
 * Admin Dashboard Page
 * Modern, professional system overview and management
 */

import { Suspense } from "react";
import { useDashboard } from "@/hooks/use-dashboard";
import { Loader2, Users, Building2, Activity, Settings, Shield, ArrowRight } from "lucide-react";
import { DashboardPanel } from "@/components/dashboard/DashboardPanel";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardKPICards } from "@/components/dashboard/DashboardKPICards";
import { DashboardUserDistribution } from "@/components/dashboard/DashboardUserDistribution";
import { DashboardRecentUsers } from "@/components/dashboard/DashboardRecentUsers";

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-foreground mb-2">
            Failed to load dashboard data
          </p>
          <p className="text-sm text-muted-foreground">
            Please refresh the page or contact support
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          System Administration
        </h1>
        <p className="text-base text-muted-foreground">
          Comprehensive overview of users, organizations, and system performance
        </p>
      </header>

      {/* KPI Cards Row with Suspense */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-8 w-20 mb-1" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-12 w-12 rounded-xl" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        }
      >
        <DashboardKPICards stats={stats} />
      </Suspense>

      {/* Primary Content Grid with Suspense */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Suspense
          fallback={
            <DashboardPanel
              title="Users by Role"
              description="Distribution of users across different system roles"
            >
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Skeleton className="h-2 w-2 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Skeleton className="w-24 h-2 rounded-full" />
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-3 w-10" />
                    </div>
                  </div>
                ))}
              </div>
            </DashboardPanel>
          }
        >
          <DashboardUserDistribution stats={stats} />
        </Suspense>

        <Suspense
          fallback={
            <DashboardPanel
              title="Recent Users"
              description="Latest user registrations and activity"
            >
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg"
                  >
                    <Skeleton className="h-2 w-2 rounded-full mt-2" />
                    <div className="flex-1 min-w-0 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </DashboardPanel>
          }
        >
          <DashboardRecentUsers stats={stats} />
        </Suspense>
      </div>

      {/* Quick Actions */}
      <DashboardPanel
        title="Quick Actions"
        description="Frequently used administrative tasks"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link href="/users">
            <Button
              variant="outline"
              className="w-full h-auto p-6 flex flex-col items-start gap-3 hover:bg-accent hover:border-primary/50 transition-all duration-200 group"
            >
              <div className="flex items-center justify-between w-full">
                <Users className="h-5 w-5 text-primary" />
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-foreground mb-1">
                  Manage Users
                </h4>
                <p className="text-sm text-muted-foreground">
                  Create, edit, and manage user accounts
                </p>
              </div>
            </Button>
          </Link>
          <Link href="/mdas">
            <Button
              variant="outline"
              className="w-full h-auto p-6 flex flex-col items-start gap-3 hover:bg-accent hover:border-primary/50 transition-all duration-200 group"
            >
              <div className="flex items-center justify-between w-full">
                <Building2 className="h-5 w-5 text-primary" />
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-foreground mb-1">
                  Manage MDAs
                </h4>
                <p className="text-sm text-muted-foreground">
                  Add, edit, and configure MDA information
                </p>
              </div>
            </Button>
          </Link>
          <Link href="/settings">
            <Button
              variant="outline"
              className="w-full h-auto p-6 flex flex-col items-start gap-3 hover:bg-accent hover:border-primary/50 transition-all duration-200 group"
            >
              <div className="flex items-center justify-between w-full">
                <Settings className="h-5 w-5 text-primary" />
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-foreground mb-1">
                  System Settings
                </h4>
                <p className="text-sm text-muted-foreground">
                  Configure system-wide settings and preferences
                </p>
              </div>
            </Button>
          </Link>
        </div>
      </DashboardPanel>

      {/* System Health */}
      <DashboardPanel
        title="System Health"
        description="Current system performance and status metrics"
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="text-center p-6 rounded-xl bg-green-500/5 border border-green-500/20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-4">
              <Shield className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="text-2xl font-bold text-foreground mb-1">99.9%</h4>
            <p className="text-sm font-medium text-foreground mb-1">Uptime</p>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </div>
          <div className="text-center p-6 rounded-xl bg-primary/5 border border-primary/20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <h4 className="text-2xl font-bold text-foreground mb-1">2.1s</h4>
            <p className="text-sm font-medium text-foreground mb-1">
              Response Time
            </p>
            <p className="text-xs text-muted-foreground">Average load time</p>
          </div>
          <div className="text-center p-6 rounded-xl bg-orange-500/5 border border-orange-500/20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-500/10 mb-4">
              <Shield className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h4 className="text-2xl font-bold text-foreground mb-1">0</h4>
            <p className="text-sm font-medium text-foreground mb-1">
              Active Issues
            </p>
            <p className="text-xs text-muted-foreground">No critical issues</p>
          </div>
        </div>
      </DashboardPanel>
    </div>
  );
}

