"use client";

import { DashboardPanel } from "@/components/dashboard/DashboardPanel";
import { getRoleDisplayName } from "@/lib/auth";
import { UserRole, AdminStats } from "@/types";

interface DashboardUserDistributionProps {
  stats: AdminStats;
}

export function DashboardUserDistribution({ stats }: DashboardUserDistributionProps) {
  return (
    <DashboardPanel
      title="Users by Role"
      description="Distribution of users across different system roles"
    >
      <div className="space-y-4">
        {Object.entries(stats.usersByRole)
          .sort(([, a], [, b]) => b - a)
          .map(([role, count]) => {
            const percentage = stats.totalUsers > 0
              ? Math.round((count / stats.totalUsers) * 100)
              : 0;
            return (
              <div
                key={role}
                className="flex items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary"></div>
                  <span className="text-sm font-medium text-foreground truncate">
                    {getRoleDisplayName(role as UserRole)}
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-foreground w-12 text-right">
                    {count}
                  </span>
                  <span className="text-xs text-muted-foreground w-10 text-right">
                    {percentage}%
                  </span>
                </div>
              </div>
            );
          })}
      </div>
    </DashboardPanel>
  );
}

