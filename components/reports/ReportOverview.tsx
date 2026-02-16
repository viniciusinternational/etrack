"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Users, Building2, FolderKanban, DollarSign, TrendingUp, Wallet } from "lucide-react";
import type { ReportOverviewData } from "@/types";
import { getRoleDisplayName } from "@/lib/auth";
import { REPORT_THEME } from "./ReportPdfContainer";

const CHART_COLORS = [
  REPORT_THEME.primary,
  REPORT_THEME.secondary,
  REPORT_THEME.accent,
  "#2E7D32",
  "#1565C0",
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export interface ReportOverviewProps {
  data: ReportOverviewData;
}

export function ReportOverview({ data }: ReportOverviewProps) {
  const usersByRoleChart = Object.entries(data.usersByRole).map(([role, value]) => ({
    name: getRoleDisplayName(role as import("@/types").UserRole),
    value,
  }));

  const projectsByStatusChart = Object.entries(data.projectsByStatus).map(([name, count]) => ({
    name,
    count,
  }));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card className="border-2 shadow-sm" style={{ borderColor: REPORT_THEME.border, backgroundColor: REPORT_THEME.neutral[50] }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide" style={{ color: REPORT_THEME.neutral[500] }}>Users</CardTitle>
            <Users className="h-4 w-4" style={{ color: REPORT_THEME.primary }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: REPORT_THEME.primary }}>{data.totalUsers}</div>
            <p className="text-xs mt-0.5" style={{ color: REPORT_THEME.neutral[500] }}>{data.activeUsers} active</p>
          </CardContent>
        </Card>
        <Card className="border-2 shadow-sm" style={{ borderColor: REPORT_THEME.border, backgroundColor: REPORT_THEME.neutral[50] }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide" style={{ color: REPORT_THEME.neutral[500] }}>MDAs</CardTitle>
            <Building2 className="h-4 w-4" style={{ color: REPORT_THEME.primary }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: REPORT_THEME.primary }}>{data.totalMDAs}</div>
            <p className="text-xs mt-0.5" style={{ color: REPORT_THEME.neutral[500] }}>{data.activeMDAs} active</p>
          </CardContent>
        </Card>
        <Card className="border-2 shadow-sm" style={{ borderColor: REPORT_THEME.border, backgroundColor: REPORT_THEME.neutral[50] }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide" style={{ color: REPORT_THEME.neutral[500] }}>Projects</CardTitle>
            <FolderKanban className="h-4 w-4" style={{ color: REPORT_THEME.primary }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: REPORT_THEME.primary }}>{data.totalProjects}</div>
          </CardContent>
        </Card>
        <Card className="border-2 shadow-sm" style={{ borderColor: REPORT_THEME.border, backgroundColor: REPORT_THEME.neutral[50] }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide" style={{ color: REPORT_THEME.neutral[500] }}>Budget</CardTitle>
            <Wallet className="h-4 w-4" style={{ color: REPORT_THEME.secondary }} />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold" style={{ color: REPORT_THEME.secondary }}>{formatCurrency(data.totalBudget)}</div>
          </CardContent>
        </Card>
        <Card className="border-2 shadow-sm" style={{ borderColor: REPORT_THEME.border, backgroundColor: REPORT_THEME.neutral[50] }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide" style={{ color: REPORT_THEME.neutral[500] }}>Revenue</CardTitle>
            <DollarSign className="h-4 w-4" style={{ color: REPORT_THEME.accent }} />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold" style={{ color: REPORT_THEME.accent }}>{formatCurrency(data.totalRevenue)}</div>
          </CardContent>
        </Card>
        <Card className="border-2 shadow-sm" style={{ borderColor: REPORT_THEME.border, backgroundColor: REPORT_THEME.neutral[50] }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide" style={{ color: REPORT_THEME.neutral[500] }}>Expenditure</CardTitle>
            <TrendingUp className="h-4 w-4" style={{ color: REPORT_THEME.primary }} />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold" style={{ color: REPORT_THEME.primary }}>{formatCurrency(data.totalExpenditure)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-2 shadow-sm" style={{ borderColor: REPORT_THEME.border, backgroundColor: "#fff" }}>
          <CardHeader className="pb-2" style={{ borderLeft: `4px solid ${REPORT_THEME.secondary}`, paddingLeft: 12 }}>
            <CardTitle className="text-base font-bold" style={{ color: REPORT_THEME.neutral[900] }}>Users by Role</CardTitle>
            <CardDescription style={{ color: REPORT_THEME.neutral[500] }}>Distribution across system roles</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={Object.fromEntries(
                usersByRoleChart.map((d, i) => [
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
                    data={usersByRoleChart}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {usersByRoleChart.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm" style={{ borderColor: REPORT_THEME.border, backgroundColor: "#fff" }}>
          <CardHeader className="pb-2" style={{ borderLeft: `4px solid ${REPORT_THEME.primary}`, paddingLeft: 12 }}>
            <CardTitle className="text-base font-bold" style={{ color: REPORT_THEME.neutral[900] }}>Projects by Status</CardTitle>
            <CardDescription style={{ color: REPORT_THEME.neutral[500] }}>Current project status distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ count: { label: "Count", color: REPORT_THEME.primary } }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectsByStatusChart} layout="vertical" margin={{ left: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={80} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {data.mdaCounts.length > 0 && (
          <Card className="lg:col-span-2 border-2 shadow-sm" style={{ borderColor: REPORT_THEME.border, backgroundColor: "#fff" }}>
            <CardHeader className="pb-2" style={{ borderLeft: `4px solid ${REPORT_THEME.accent}`, paddingLeft: 12 }}>
              <CardTitle className="text-base font-bold" style={{ color: REPORT_THEME.neutral[900] }}>Projects by MDA</CardTitle>
              <CardDescription style={{ color: REPORT_THEME.neutral[500] }}>Project count per supervising MDA</CardDescription>
            </CardHeader>
            <CardContent>
            <ChartContainer
              config={{ count: { label: "Projects", color: REPORT_THEME.secondary } }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.mdaCounts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
