import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { ReportPdfLayout } from "./ReportPdfLayout";
import { reportPdfStyles as s } from "./styles";
import type { ReportProjectsData } from "@/types";

export interface ProjectsReportPdfProps {
  data: ReportProjectsData;
  generatedAt: string;
  dateRange?: string;
}

export function ProjectsReportPdf({
  data,
  generatedAt,
  dateRange,
}: ProjectsReportPdfProps) {
  const hasData =
    data.byStatus.length > 0 ||
    data.byCategory.length > 0 ||
    data.byMda.length > 0;

  return (
    <ReportPdfLayout
      title="Projects Report"
      reportType="Projects"
      generatedAt={generatedAt}
      dateRange={dateRange}
    >
      {data.byStatus.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Projects by Status</Text>
          <View style={s.table}>
            <View style={s.tableRowHeader}>
              <Text style={[s.tableCell, { flex: 2 }]}>Status</Text>
              <Text style={s.tableCellRight}>Count</Text>
            </View>
            {data.byStatus.map((row) => (
              <View key={row.name} style={s.tableRow}>
                <Text style={[s.tableCell, { flex: 2 }]}>{row.name}</Text>
                <Text style={s.tableCellRight}>{row.count}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {data.byCategory.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Projects by Category</Text>
          <View style={s.table}>
            <View style={s.tableRowHeader}>
              <Text style={[s.tableCell, { flex: 2 }]}>Category</Text>
              <Text style={s.tableCellRight}>Count</Text>
            </View>
            {data.byCategory.map((row) => (
              <View key={row.name} style={s.tableRow}>
                <Text style={[s.tableCell, { flex: 2 }]}>{row.name}</Text>
                <Text style={s.tableCellRight}>{row.count}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {data.byMda.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Projects by MDA</Text>
          <View style={s.table}>
            <View style={s.tableRowHeader}>
              <Text style={[s.tableCell, { flex: 2 }]}>MDA</Text>
              <Text style={s.tableCellRight}>Count</Text>
            </View>
            {data.byMda.map((row) => (
              <View key={row.name} style={s.tableRow}>
                <Text style={[s.tableCell, { flex: 2 }]}>{row.name}</Text>
                <Text style={s.tableCellRight}>{row.count}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {!hasData && (
        <View style={s.emptyState}>
          <Text>No project data available for the selected period.</Text>
        </View>
      )}
    </ReportPdfLayout>
  );
}
