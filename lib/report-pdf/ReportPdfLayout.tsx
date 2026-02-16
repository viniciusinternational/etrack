import React from "react";
import { Document, Page, View, Text } from "@react-pdf/renderer";
import { reportPdfStyles as s } from "./styles";

export interface ReportPdfLayoutProps {
  title: string;
  reportType?: string;
  generatedAt: string;
  dateRange?: string;
  children: React.ReactNode;
}

export function ReportPdfLayout({
  title,
  reportType,
  generatedAt,
  dateRange,
  children,
}: ReportPdfLayoutProps) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header} fixed>
          <Text style={s.title}>{title}</Text>
          <Text style={s.subtitle}>
            Generated on {generatedAt}
            {reportType ? ` · ${reportType}` : ""}
            {dateRange ? ` · ${dateRange}` : ""}
          </Text>
        </View>

        <View style={{ marginTop: 8 }}>{children}</View>

        <View style={s.footer} fixed>
          <Text>E-Track Report · Confidential</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
