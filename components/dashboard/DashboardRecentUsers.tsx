"use client";

import { DashboardPanel } from "@/components/dashboard/DashboardPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getRoleDisplayName } from "@/lib/auth";
import { AdminStats } from "@/types";

interface DashboardRecentUsersProps {
  stats: AdminStats;
}

export function DashboardRecentUsers({ stats }: DashboardRecentUsersProps) {
  return (
    <DashboardPanel
      title="Recent Users"
      description="Latest user registrations and activity"
      action={
        <Link href="/users">
          <Button variant="ghost" size="sm" className="gap-1">
            View All
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      }
    >
      <div className="space-y-4">
        {stats.recentUsers.length > 0 ? (
          stats.recentUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors duration-200 group"
            >
              <div className="flex-shrink-0 w-2 h-2 rounded-full bg-green-500 mt-2"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  New user &quot;{`${user.firstname} ${user.lastname}`}&quot; created
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="secondary"
                    className="text-xs font-medium bg-primary/10 text-primary border-primary/20"
                  >
                    {getRoleDisplayName(user.role)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              No recent user activity
            </p>
          </div>
        )}
      </div>
    </DashboardPanel>
  );
}

