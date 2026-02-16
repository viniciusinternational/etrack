"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ReportProjectsData } from "@/types";
import { REPORT_THEME } from "./ReportPdfContainer";

export interface ReportProjectsProps {
  data: ReportProjectsData;
}

export function ReportProjects({ data }: ReportProjectsProps) {
  return (
    <div className="space-y-8">
      {data.byStatus.length > 0 && (
        <Card className="border-2 shadow-sm" style={{ borderColor: REPORT_THEME.border, backgroundColor: "#fff" }}>
          <CardHeader className="pb-2" style={{ borderLeft: `4px solid ${REPORT_THEME.primary}`, paddingLeft: 12 }}>
            <CardTitle className="text-base font-bold" style={{ color: REPORT_THEME.neutral[900] }}>Projects by Status</CardTitle>
            <CardDescription style={{ color: REPORT_THEME.neutral[500] }}>Distribution by current status</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ count: { label: "Projects", color: REPORT_THEME.primary } }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.byStatus}>
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

      {data.byCategory.length > 0 && (
        <Card className="border-2 shadow-sm" style={{ borderColor: REPORT_THEME.border, backgroundColor: "#fff" }}>
          <CardHeader className="pb-2" style={{ borderLeft: `4px solid ${REPORT_THEME.secondary}`, paddingLeft: 12 }}>
            <CardTitle className="text-base font-bold" style={{ color: REPORT_THEME.neutral[900] }}>Projects by Category</CardTitle>
            <CardDescription style={{ color: REPORT_THEME.neutral[500] }}>Distribution by project category</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ count: { label: "Projects", color: REPORT_THEME.secondary } }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.byCategory} margin={{ left: 20 }}>
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

      {data.byMda.length > 0 && (
        <Card className="border-2 shadow-sm" style={{ borderColor: REPORT_THEME.border, backgroundColor: "#fff" }}>
          <CardHeader className="pb-2" style={{ borderLeft: `4px solid ${REPORT_THEME.accent}`, paddingLeft: 12 }}>
            <CardTitle className="text-base font-bold" style={{ color: REPORT_THEME.neutral[900] }}>Projects by MDA</CardTitle>
            <CardDescription style={{ color: REPORT_THEME.neutral[500] }}>Project count per supervising MDA</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ count: { label: "Projects", color: REPORT_THEME.accent } }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.byMda}>
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

      {data.byStatus.length === 0 &&
        data.byCategory.length === 0 &&
        data.byMda.length === 0 && (
          <Card className="border-2" style={{ borderColor: REPORT_THEME.border }}>
            <CardContent className="flex items-center justify-center py-12" style={{ color: REPORT_THEME.neutral[500] }}>
              No project data available for the selected period.
            </CardContent>
          </Card>
        )}
    </div>
  );
}
