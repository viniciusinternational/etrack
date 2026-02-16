"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Users, UserCheck } from "lucide-react";
import type { ReportUsersData } from "@/types";
import { getRoleDisplayName } from "@/lib/auth";
import { REPORT_THEME } from "./ReportPdfContainer";

const CHART_COLORS = [
  REPORT_THEME.primary,
  REPORT_THEME.secondary,
  REPORT_THEME.accent,
  "#2E7D32",
  "#1565C0",
];

export interface ReportUsersProps {
  data: ReportUsersData;
}

export function ReportUsers({ data }: ReportUsersProps) {
  const byRoleChart = data.byRole.map((r) => ({
    name: getRoleDisplayName(r.name as import("@/types").UserRole),
    value: r.value,
  }));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-2 shadow-sm" style={{ borderColor: REPORT_THEME.border, backgroundColor: REPORT_THEME.neutral[50] }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide" style={{ color: REPORT_THEME.neutral[500] }}>Total Users</CardTitle>
            <Users className="h-4 w-4" style={{ color: REPORT_THEME.primary }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: REPORT_THEME.primary }}>{data.totalUsers}</div>
          </CardContent>
        </Card>
        <Card className="border-2 shadow-sm" style={{ borderColor: REPORT_THEME.border, backgroundColor: REPORT_THEME.neutral[50] }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide" style={{ color: REPORT_THEME.neutral[500] }}>Active Users</CardTitle>
            <UserCheck className="h-4 w-4" style={{ color: REPORT_THEME.secondary }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: REPORT_THEME.secondary }}>{data.activeUsers}</div>
            <p className="text-xs mt-0.5" style={{ color: REPORT_THEME.neutral[500] }}>
              {data.totalUsers > 0
                ? Math.round((data.activeUsers / data.totalUsers) * 100)
                : 0}
              % of total
            </p>
          </CardContent>
        </Card>
      </div>

      {byRoleChart.length > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="border-2 shadow-sm" style={{ borderColor: REPORT_THEME.border, backgroundColor: "#fff" }}>
            <CardHeader className="pb-2" style={{ borderLeft: `4px solid ${REPORT_THEME.primary}`, paddingLeft: 12 }}>
              <CardTitle className="text-base font-bold" style={{ color: REPORT_THEME.neutral[900] }}>Users by Role (Pie)</CardTitle>
              <CardDescription style={{ color: REPORT_THEME.neutral[500] }}>Distribution across system roles</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={Object.fromEntries(
                  byRoleChart.map((d, i) => [
                    d.name,
                    { label: d.name, color: CHART_COLORS[i % CHART_COLORS.length] },
                  ])
                )}
                className="h-80"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie
                      data={byRoleChart}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {byRoleChart.map((_, index) => (
                        <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-sm" style={{ borderColor: REPORT_THEME.border, backgroundColor: "#fff" }}>
            <CardHeader className="pb-2" style={{ borderLeft: `4px solid ${REPORT_THEME.secondary}`, paddingLeft: 12 }}>
              <CardTitle className="text-base font-bold" style={{ color: REPORT_THEME.neutral[900] }}>Users by Role (Bar)</CardTitle>
              <CardDescription style={{ color: REPORT_THEME.neutral[500] }}>Count per role</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{ value: { label: "Users", color: REPORT_THEME.primary } }}
                className="h-80"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byRoleChart} margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {data.byRole.length === 0 && (
        <Card className="border-2" style={{ borderColor: REPORT_THEME.border }}>
          <CardContent className="flex items-center justify-center py-12" style={{ color: REPORT_THEME.neutral[500] }}>
            No user data available.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
