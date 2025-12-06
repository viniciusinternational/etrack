"use client";

import { KPICard } from "@/components/dashboard/KPICard";
import { Users, Building2, Activity } from "lucide-react";
import { AdminStats } from "@/types";

interface DashboardKPICardsProps {
  stats: AdminStats;
}

export function DashboardKPICards({ stats }: DashboardKPICardsProps) {
  const activeUserPercentage = stats.totalUsers > 0 
    ? Math.round((stats.activeUsers / stats.totalUsers) * 100)
    : 0;
  const activeMDAPercentage = stats.totalMDAs > 0
    ? Math.round((stats.activeMDAs / stats.totalMDAs) * 100)
    : 0;

  return (
    <section aria-labelledby="kpi-heading" className="space-y-6">
      <h2 id="kpi-heading" className="sr-only">
        Key Performance Indicators
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Users"
          value={stats.totalUsers}
          description="Registered accounts across all roles"
          icon={Users}
          variant="primary"
          trend={
            stats.recentUsers.length > 0
              ? {
                  value: 12,
                  label: "New this month",
                }
              : undefined
          }
        />
        <KPICard
          title="Active Users"
          value={stats.activeUsers}
          description={`${activeUserPercentage}% active rate`}
          icon={Activity}
          variant="success"
          trend={{
            value: 8,
            label: "vs last month",
          }}
        />
        <KPICard
          title="Total MDAs"
          value={stats.totalMDAs}
          description="Government entities registered"
          icon={Building2}
          variant="default"
        />
        <KPICard
          title="Active MDAs"
          value={stats.activeMDAs}
          description={`${activeMDAPercentage}% operational`}
          icon={Building2}
          variant="warning"
        />
      </div>
    </section>
  );
}

