import React from "react";
import { pdf } from "@react-pdf/renderer";
import "./fonts";
import { OverviewReportPdf } from "./OverviewReportPdf";
import { FinancialReportPdf } from "./FinancialReportPdf";
import { ProjectsReportPdf } from "./ProjectsReportPdf";
import { UsersReportPdf } from "./UsersReportPdf";
import type {
  ReportType,
  ReportOverviewData,
  ReportFinancialData,
  ReportProjectsData,
  ReportUsersData,
} from "@/types";

export interface GenerateReportPdfOptions {
  type: ReportType;
  data: ReportOverviewData | ReportFinancialData | ReportProjectsData | ReportUsersData;
  startDate?: string;
  endDate?: string;
}

function formatDateRange(startDate?: string, endDate?: string): string | undefined {
  if (!startDate || !endDate) return undefined;
  return `${startDate} to ${endDate}`;
}

function reportPdfFilename(reportType: string): string {
  const date = new Date().toISOString().slice(0, 10);
  return `report-${reportType.toLowerCase()}-${date}.pdf`;
}

export function getReportDocument(
  options: GenerateReportPdfOptions
): React.ReactElement {
  const generatedAt = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const dateRange = formatDateRange(options.startDate, options.endDate);

  switch (options.type) {
    case "overview":
      return (
        <OverviewReportPdf
          data={options.data as ReportOverviewData}
          generatedAt={generatedAt}
          dateRange={dateRange}
        />
      );
    case "financial":
      return (
        <FinancialReportPdf
          data={options.data as ReportFinancialData}
          generatedAt={generatedAt}
          dateRange={dateRange}
        />
      );
    case "projects":
      return (
        <ProjectsReportPdf
          data={options.data as ReportProjectsData}
          generatedAt={generatedAt}
          dateRange={dateRange}
        />
      );
    case "users":
      return (
        <UsersReportPdf
          data={options.data as ReportUsersData}
          generatedAt={generatedAt}
          dateRange={dateRange}
        />
      );
    default:
      throw new Error(`Unknown report type: ${options.type}`);
  }
}

export async function generateReportPdf(
  options: GenerateReportPdfOptions
): Promise<void> {
  const blob = await pdf(getReportDocument(options)).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = reportPdfFilename(options.type);
  a.click();
  URL.revokeObjectURL(url);
}

export { reportPdfFilename };
