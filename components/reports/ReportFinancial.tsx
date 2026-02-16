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
  LineChart,
  Line,
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
import type { ReportFinancialData } from "@/types";
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

export interface ReportFinancialProps {
  data: ReportFinancialData;
}

export function ReportFinancial({ data }: ReportFinancialProps) {
  return (
    <div className="space-y-8">
      {data.budgetByMda.length > 0 && (
        <Card className="border-2 shadow-sm" style={{ borderColor: REPORT_THEME.border, backgroundColor: "#fff" }}>
          <CardHeader className="pb-2" style={{ borderLeft: `4px solid ${REPORT_THEME.primary}`, paddingLeft: 12 }}>
            <CardTitle className="text-base font-bold" style={{ color: REPORT_THEME.neutral[900] }}>Budget vs Expenditure by MDA</CardTitle>
            <CardDescription style={{ color: REPORT_THEME.neutral[500] }}>Allocated budget and actual expenditure per MDA</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                budget: { label: "Budget", color: REPORT_THEME.primary },
                expenditure: { label: "Expenditure", color: REPORT_THEME.secondary },
              }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.budgetByMda}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(v) => formatCurrency(v)} />
                  <ChartTooltip
                    content={<ChartTooltipContent formatter={(v) => formatCurrency(Number(v))} />}
                  />
                  <Bar dataKey="budget" fill="var(--color-budget)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenditure" fill="var(--color-expenditure)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {data.revenueTrend.length > 0 && (
        <Card className="border-2 shadow-sm" style={{ borderColor: REPORT_THEME.border, backgroundColor: "#fff" }}>
          <CardHeader className="pb-2" style={{ borderLeft: `4px solid ${REPORT_THEME.accent}`, paddingLeft: 12 }}>
            <CardTitle className="text-base font-bold" style={{ color: REPORT_THEME.neutral[900] }}>Revenue & Expenditure Trend</CardTitle>
            <CardDescription style={{ color: REPORT_THEME.neutral[500] }}>Monthly revenue and expenditure over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                revenue: { label: "Revenue", color: REPORT_THEME.primary },
                expenditure: { label: "Expenditure", color: REPORT_THEME.secondary },
              }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis tickFormatter={(v) => formatCurrency(v)} />
                  <ChartTooltip
                    content={<ChartTooltipContent formatter={(v) => formatCurrency(Number(v))} />}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" />
                  <Line type="monotone" dataKey="expenditure" stroke="var(--color-expenditure)" />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {data.expenditureByRecipient.length > 0 && (
        <Card className="border-2 shadow-sm" style={{ borderColor: REPORT_THEME.border, backgroundColor: "#fff" }}>
          <CardHeader className="pb-2" style={{ borderLeft: `4px solid ${REPORT_THEME.secondary}`, paddingLeft: 12 }}>
            <CardTitle className="text-base font-bold" style={{ color: REPORT_THEME.neutral[900] }}>Top Expenditure by Project</CardTitle>
            <CardDescription style={{ color: REPORT_THEME.neutral[500] }}>Largest expenditure amounts by project</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={Object.fromEntries(
                data.expenditureByRecipient.map((d, i) => [
                  d.name,
                  { label: d.name, color: CHART_COLORS[i % CHART_COLORS.length] },
                ])
              )}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent formatter={(v) => formatCurrency(Number(v))} />
                    }
                  />
                  <Pie
                    data={data.expenditureByRecipient}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                  >
                    {data.expenditureByRecipient.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {data.budgetByMda.length === 0 &&
        data.revenueTrend.length === 0 &&
        data.expenditureByRecipient.length === 0 && (
          <Card className="border-2" style={{ borderColor: REPORT_THEME.border }}>
            <CardContent className="flex items-center justify-center py-12" style={{ color: REPORT_THEME.neutral[500] }}>
              No financial data available for the selected period.
            </CardContent>
          </Card>
        )}
    </div>
  );
}
