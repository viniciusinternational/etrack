import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { ReportPdfLayout } from "./ReportPdfLayout";
import { reportPdfStyles as s } from "./styles";
import type { ReportUsersData } from "@/types";
import { getRoleDisplayName } from "@/lib/auth";
import type { UserRole } from "@/types";

export interface UsersReportPdfProps {
  data: ReportUsersData;
  generatedAt: string;
  dateRange?: string;
}

export function UsersReportPdf({
  data,
  generatedAt,
  dateRange,
}: UsersReportPdfProps) {
  const byRoleDisplay = data.byRole.map((r) => ({
    name: getRoleDisplayName(r.name as UserRole),
    value: r.value,
  }));

  return (
    <ReportPdfLayout
      title="Users Report"
      reportType="Users"
      generatedAt={generatedAt}
      dateRange={dateRange}
    >
      <View style={s.kpiRow}>
        <View style={s.kpiCard}>
          <Text style={s.kpiLabel}>Total Users</Text>
          <Text style={s.kpiValue}>{data.totalUsers}</Text>
        </View>
        <View style={s.kpiCard}>
          <Text style={s.kpiLabel}>Active Users</Text>
          <Text style={s.kpiValueSecondary}>{data.activeUsers}</Text>
          <Text style={s.subtitle}>
            {data.totalUsers > 0
              ? `${Math.round((data.activeUsers / data.totalUsers) * 100)}% of total`
              : "0% of total"}
          </Text>
        </View>
      </View>

      {byRoleDisplay.length > 0 ? (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Users by Role</Text>
          <View style={s.table}>
            <View style={s.tableRowHeader}>
              <Text style={[s.tableCell, { flex: 2 }]}>Role</Text>
              <Text style={s.tableCellRight}>Count</Text>
            </View>
            {byRoleDisplay.map((row) => (
              <View key={row.name} style={s.tableRow}>
                <Text style={[s.tableCell, { flex: 2 }]}>{row.name}</Text>
                <Text style={s.tableCellRight}>{row.value}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <View style={s.emptyState}>
          <Text>No user data available.</Text>
        </View>
      )}
    </ReportPdfLayout>
  );
}
