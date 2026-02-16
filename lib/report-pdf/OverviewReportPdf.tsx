import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { ReportPdfLayout } from "./ReportPdfLayout";
import { reportPdfStyles as s } from "./styles";
import { reportPdfTheme as t } from "./theme";
import { formatCurrency } from "./utils";
import type { ReportOverviewData } from "@/types";
import { getRoleDisplayName } from "@/lib/auth";
import type { UserRole } from "@/types";

export interface OverviewReportPdfProps {
  data: ReportOverviewData;
  generatedAt: string;
  dateRange?: string;
}

export function OverviewReportPdf({
  data,
  generatedAt,
  dateRange,
}: OverviewReportPdfProps) {
  const usersByRoleEntries = Object.entries(data.usersByRole).map(
    ([role, value]) => ({
      name: getRoleDisplayName(role as UserRole),
      value,
    })
  );
  const projectsByStatusEntries = Object.entries(data.projectsByStatus).map(
    ([name, count]) => ({ name, count })
  );

  return (
    <ReportPdfLayout
      title="Overview Report"
      reportType="Overview"
      generatedAt={generatedAt}
      dateRange={dateRange}
    >
      <View style={s.kpiRow}>
        <View style={s.kpiCard}>
          <Text style={s.kpiLabel}>Users</Text>
          <Text style={s.kpiValue}>{data.totalUsers}</Text>
          <Text style={s.subtitle}>{data.activeUsers} active</Text>
        </View>
        <View style={s.kpiCard}>
          <Text style={s.kpiLabel}>MDAs</Text>
          <Text style={s.kpiValue}>{data.totalMDAs}</Text>
          <Text style={s.subtitle}>{data.activeMDAs} active</Text>
        </View>
        <View style={s.kpiCard}>
          <Text style={s.kpiLabel}>Projects</Text>
          <Text style={s.kpiValue}>{data.totalProjects}</Text>
        </View>
        <View style={s.kpiCard}>
          <Text style={s.kpiLabel}>Budget</Text>
          <Text style={s.kpiValueSecondary}>{formatCurrency(data.totalBudget)}</Text>
        </View>
        <View style={s.kpiCard}>
          <Text style={s.kpiLabel}>Revenue</Text>
          <Text style={s.kpiValueAccent}>{formatCurrency(data.totalRevenue)}</Text>
        </View>
        <View style={s.kpiCard}>
          <Text style={s.kpiLabel}>Expenditure</Text>
          <Text style={s.kpiValue}>{formatCurrency(data.totalExpenditure)}</Text>
        </View>
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Users by Role</Text>
        <View style={s.table}>
          <View style={s.tableRowHeader}>
            <Text style={[s.tableCell, { flex: 2 }]}>Role</Text>
            <Text style={s.tableCellRight}>Count</Text>
          </View>
          {usersByRoleEntries.map((row) => (
            <View key={row.name} style={s.tableRow}>
              <Text style={[s.tableCell, { flex: 2 }]}>{row.name}</Text>
              <Text style={s.tableCellRight}>{row.value}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Projects by Status</Text>
        <View style={s.table}>
          <View style={s.tableRowHeader}>
            <Text style={[s.tableCell, { flex: 2 }]}>Status</Text>
            <Text style={s.tableCellRight}>Count</Text>
          </View>
          {projectsByStatusEntries.map((row) => (
            <View key={row.name} style={s.tableRow}>
              <Text style={[s.tableCell, { flex: 2 }]}>{row.name}</Text>
              <Text style={s.tableCellRight}>{row.value}</Text>
            </View>
          ))}
        </View>
      </View>

      {data.mdaCounts.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Projects by MDA</Text>
          <View style={s.table}>
            <View style={s.tableRowHeader}>
              <Text style={[s.tableCell, { flex: 2 }]}>MDA</Text>
              <Text style={s.tableCellRight}>Projects</Text>
            </View>
            {data.mdaCounts.map((row) => (
              <View key={row.name} style={s.tableRow}>
                <Text style={[s.tableCell, { flex: 2 }]}>{row.name}</Text>
                <Text style={s.tableCellRight}>{row.count}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ReportPdfLayout>
  );
}
