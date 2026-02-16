import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { ReportPdfLayout } from "./ReportPdfLayout";
import { reportPdfStyles as s } from "./styles";
import { formatCurrency } from "./utils";
import type { ReportFinancialData } from "@/types";

export interface FinancialReportPdfProps {
  data: ReportFinancialData;
  generatedAt: string;
  dateRange?: string;
}

export function FinancialReportPdf({
  data,
  generatedAt,
  dateRange,
}: FinancialReportPdfProps) {
  const hasData =
    data.budgetByMda.length > 0 ||
    data.revenueTrend.length > 0 ||
    data.expenditureByRecipient.length > 0;

  return (
    <ReportPdfLayout
      title="Financial Report"
      reportType="Financial"
      generatedAt={generatedAt}
      dateRange={dateRange}
    >
      {data.budgetByMda.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Budget vs Expenditure by MDA</Text>
          <View style={s.table}>
            <View style={s.tableRowHeader}>
              <Text style={[s.tableCell, { flex: 2 }]}>MDA</Text>
              <Text style={s.tableCellRight}>Budget</Text>
              <Text style={s.tableCellRight}>Expenditure</Text>
            </View>
            {data.budgetByMda.map((row) => (
              <View key={row.name} style={s.tableRow}>
                <Text style={[s.tableCell, { flex: 2 }]}>{row.name}</Text>
                <Text style={s.tableCellRight}>{formatCurrency(row.budget)}</Text>
                <Text style={s.tableCellRight}>
                  {formatCurrency(row.expenditure)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {data.revenueTrend.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Revenue & Expenditure Trend</Text>
          <View style={s.table}>
            <View style={s.tableRowHeader}>
              <Text style={[s.tableCell, { flex: 1 }]}>Period</Text>
              <Text style={s.tableCellRight}>Revenue</Text>
              <Text style={s.tableCellRight}>Expenditure</Text>
            </View>
            {data.revenueTrend.map((row) => (
              <View key={row.period} style={s.tableRow}>
                <Text style={[s.tableCell, { flex: 1 }]}>{row.period}</Text>
                <Text style={s.tableCellRight}>
                  {formatCurrency(row.revenue)}
                </Text>
                <Text style={s.tableCellRight}>
                  {formatCurrency(row.expenditure)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {data.expenditureByRecipient.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Top Expenditure by Project</Text>
          <View style={s.table}>
            <View style={s.tableRowHeader}>
              <Text style={[s.tableCell, { flex: 2 }]}>Project</Text>
              <Text style={s.tableCellRight}>Amount</Text>
            </View>
            {data.expenditureByRecipient.map((row) => (
              <View key={row.name} style={s.tableRow}>
                <Text style={[s.tableCell, { flex: 2 }]}>{row.name}</Text>
                <Text style={s.tableCellRight}>
                  {formatCurrency(row.value)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {!hasData && (
        <View style={s.emptyState}>
          <Text>No financial data available for the selected period.</Text>
        </View>
      )}
    </ReportPdfLayout>
  );
}
