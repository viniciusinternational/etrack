import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { reportPdfTheme as t } from "./theme";
import { formatCurrency } from "./utils";
import { getRoleDisplayName } from "@/lib/auth";
import type { UserRole } from "@/types";
import type {
  ReportType,
  ReportOverviewData,
  ReportFinancialData,
  ReportProjectsData,
  ReportUsersData,
} from "@/types";

export interface GenerateReportPdfOptions {
  type: ReportType;
  data:
    | ReportOverviewData
    | ReportFinancialData
    | ReportProjectsData
    | ReportUsersData;
  startDate?: string;
  endDate?: string;
}

function formatDateRange(startDate?: string, endDate?: string): string | undefined {
  if (!startDate || !endDate) return undefined;
  return `${startDate} to ${endDate}`;
}

export function reportPdfFilename(reportType: string): string {
  const date = new Date().toISOString().slice(0, 10);
  return `report-${reportType.toLowerCase()}-${date}.pdf`;
}

// Theme helpers for jsPDF (hex -> rgb)
function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const primary = hexToRgb(t.colors.primary);
const secondary = hexToRgb(t.colors.secondary);
const accent = hexToRgb(t.colors.accent);
const neutral900 = hexToRgb(t.colors.neutral[900]);
const neutral500 = hexToRgb(t.colors.neutral[500]);
const border = hexToRgb(t.colors.border);
const borderStrong = hexToRgb(t.colors.borderStrong);
const neutral100 = hexToRgb(t.colors.neutral[100]);
const neutral50 = hexToRgb(t.colors.neutral[50]);

const PAGE_W = 210;
const PAGE_H = 297;
const PADDING = t.spacing.pagePadding;
const CONTENT_TOP = 50;
const CONTENT_BOTTOM = PAGE_H - 28;

function addHeader(
  doc: jsPDF,
  title: string,
  subtitle: string,
  pageNum?: number
) {
  doc.setFontSize(t.typography.titleSize);
  doc.setTextColor(primary[0], primary[1], primary[2]);
  doc.setFont("helvetica", "bold");
  doc.text(title, PADDING, 22);

  doc.setFontSize(t.typography.subtitleSize);
  doc.setTextColor(neutral500[0], neutral500[1], neutral500[2]);
  doc.setFont("helvetica", "normal");
  doc.text(subtitle, PADDING, 30);

  // Line under header
  doc.setDrawColor(border[0], border[1], border[2]);
  doc.setLineWidth(0.5);
  doc.line(PADDING, 36, PAGE_W - PADDING, 36);
}

function addFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  const y = PAGE_H - 12;
  doc.setFontSize(t.typography.smallSize);
  doc.setTextColor(neutral500[0], neutral500[1], neutral500[2]);
  doc.setFont("helvetica", "normal");
  doc.text("E-Track Report · Confidential", PADDING, y);
  doc.text(`Page ${pageNum} of ${totalPages}`, PAGE_W - PADDING, y, {
    align: "right",
  });
}

function applyHeaderFooterToAllPages(
  doc: jsPDF,
  title: string,
  generatedAt: string,
  reportType?: string,
  dateRange?: string
) {
  const totalPages = doc.getNumberOfPages();
  const subtitle = [
    `Generated on ${generatedAt}`,
    reportType ?? "",
    dateRange ?? "",
  ]
    .filter(Boolean)
    .join(" · ");

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addHeader(doc, title, subtitle, i);
    addFooter(doc, i, totalPages);
  }
}

// Shared table styling for autoTable
const tableStyles = {
  headStyles: {
    fillColor: neutral100 as [number, number, number],
    textColor: neutral900 as [number, number, number],
    fontStyle: "bold" as const,
    fontSize: t.typography.smallSize,
  },
  bodyStyles: {
    textColor: neutral900 as [number, number, number],
    fontSize: t.typography.bodySize,
  },
  alternateRowStyles: {
    fillColor: neutral50 as [number, number, number],
  },
  margin: { left: PADDING, right: PADDING },
};

function buildOverviewPdf(
  doc: jsPDF,
  data: ReportOverviewData,
  generatedAt: string,
  dateRange?: string
) {
  let y = CONTENT_TOP;

  // KPI row as a simple grid of text
  const kpis = [
    { label: "Users", value: String(data.totalUsers), sub: `${data.activeUsers} active`, color: primary },
    { label: "MDAs", value: String(data.totalMDAs), sub: `${data.activeMDAs} active`, color: primary },
    { label: "Projects", value: String(data.totalProjects), sub: undefined, color: primary },
    { label: "Budget", value: formatCurrency(data.totalBudget), sub: undefined, color: secondary },
    { label: "Revenue", value: formatCurrency(data.totalRevenue), sub: undefined, color: accent },
    { label: "Expenditure", value: formatCurrency(data.totalExpenditure), sub: undefined, color: primary },
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(t.typography.kpiLabelSize);
  doc.setTextColor(neutral500[0], neutral500[1], neutral500[2]);
  const colWidth = (PAGE_W - 2 * PADDING) / 3;
  kpis.forEach((k, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = PADDING + col * colWidth + 8;
    const yy = y + row * 28;
    doc.text(k.label.toUpperCase(), x, yy);
    doc.setFontSize(t.typography.kpiValueSize);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(k.color[0], k.color[1], k.color[2]);
    doc.text(k.value, x, yy + 8);
    if (k.sub) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(t.typography.subtitleSize);
      doc.setTextColor(neutral500[0], neutral500[1], neutral500[2]);
      doc.text(k.sub, x, yy + 14);
    }
    doc.setFontSize(t.typography.kpiLabelSize);
    doc.setTextColor(neutral500[0], neutral500[1], neutral500[2]);
  });

  y += 60;

  // Users by Role
  const usersByRoleEntries = Object.entries(data.usersByRole).map(([role, value]) => [
    getRoleDisplayName(role as UserRole),
    String(value),
  ]);
  doc.setFontSize(t.typography.sectionTitleSize);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(neutral900[0], neutral900[1], neutral900[2]);
  doc.text("Users by Role", PADDING + 8, y);
  doc.setDrawColor(secondary[0], secondary[1], secondary[2]);
  doc.setLineWidth(0.8);
  doc.line(PADDING, y + 2, PADDING + 4, y + 2);
  y += 14;

  autoTable(doc, {
    startY: y,
    head: [["Role", "Count"]],
    body: usersByRoleEntries,
    ...tableStyles,
    columnStyles: { 0: { cellWidth: "auto" }, 1: { cellWidth: 40, halign: "right" } },
  });
  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + t.spacing.sectionGap;

  // Projects by Status
  const projectsByStatusEntries = Object.entries(data.projectsByStatus).map(([name, count]) => [name, String(count)]);
  doc.setFontSize(t.typography.sectionTitleSize);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(neutral900[0], neutral900[1], neutral900[2]);
  doc.text("Projects by Status", PADDING + 8, y);
  doc.line(PADDING, y + 2, PADDING + 4, y + 2);
  y += 14;

  autoTable(doc, {
    startY: y,
    head: [["Status", "Count"]],
    body: projectsByStatusEntries,
    ...tableStyles,
    columnStyles: { 0: { cellWidth: "auto" }, 1: { cellWidth: 40, halign: "right" } },
  });
  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + t.spacing.sectionGap;

  // Projects by MDA
  if (data.mdaCounts.length > 0) {
    if (y > CONTENT_BOTTOM - 40) {
      doc.addPage();
      y = CONTENT_TOP;
    }
    const mdaRows = data.mdaCounts.map((r) => [r.name, String(r.count)]);
    doc.setFontSize(t.typography.sectionTitleSize);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(neutral900[0], neutral900[1], neutral900[2]);
    doc.text("Projects by MDA", PADDING + 8, y);
    doc.line(PADDING, y + 2, PADDING + 4, y + 2);
    y += 14;

    autoTable(doc, {
      startY: y,
      head: [["MDA", "Projects"]],
      body: mdaRows,
      ...tableStyles,
      columnStyles: { 0: { cellWidth: "auto" }, 1: { cellWidth: 40, halign: "right" } },
    });
  }
}

function buildFinancialPdf(
  doc: jsPDF,
  data: ReportFinancialData,
  _generatedAt: string,
  _dateRange?: string
) {
  let y = CONTENT_TOP;
  const hasData =
    data.budgetByMda.length > 0 ||
    data.revenueTrend.length > 0 ||
    data.expenditureByRecipient.length > 0;

  if (!hasData) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(t.typography.bodySize);
    doc.setTextColor(neutral500[0], neutral500[1], neutral500[2]);
    doc.text("No financial data available for the selected period.", PADDING, y + 20);
    return;
  }

  if (data.budgetByMda.length > 0) {
    doc.setFontSize(t.typography.sectionTitleSize);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(neutral900[0], neutral900[1], neutral900[2]);
    doc.text("Budget vs Expenditure by MDA", PADDING + 8, y);
    doc.line(PADDING, y + 2, PADDING + 4, y + 2);
    y += 14;

    autoTable(doc, {
      startY: y,
      head: [["MDA", "Budget", "Expenditure"]],
      body: data.budgetByMda.map((r) => [r.name, formatCurrency(r.budget), formatCurrency(r.expenditure)]),
      ...tableStyles,
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { cellWidth: 45, halign: "right" },
        2: { cellWidth: 45, halign: "right" },
      },
    });
    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + t.spacing.sectionGap;
  }

  if (data.revenueTrend.length > 0) {
    if (y > CONTENT_BOTTOM - 40) {
      doc.addPage();
      y = CONTENT_TOP;
    }
    doc.setFontSize(t.typography.sectionTitleSize);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(neutral900[0], neutral900[1], neutral900[2]);
    doc.text("Revenue & Expenditure Trend", PADDING + 8, y);
    doc.line(PADDING, y + 2, PADDING + 4, y + 2);
    y += 14;

    autoTable(doc, {
      startY: y,
      head: [["Period", "Revenue", "Expenditure"]],
      body: data.revenueTrend.map((r) => [r.period, formatCurrency(r.revenue), formatCurrency(r.expenditure)]),
      ...tableStyles,
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { cellWidth: 45, halign: "right" },
        2: { cellWidth: 45, halign: "right" },
      },
    });
    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + t.spacing.sectionGap;
  }

  if (data.expenditureByRecipient.length > 0) {
    if (y > CONTENT_BOTTOM - 40) {
      doc.addPage();
      y = CONTENT_TOP;
    }
    doc.setFontSize(t.typography.sectionTitleSize);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(neutral900[0], neutral900[1], neutral900[2]);
    doc.text("Top Expenditure by Project", PADDING + 8, y);
    doc.line(PADDING, y + 2, PADDING + 4, y + 2);
    y += 14;

    autoTable(doc, {
      startY: y,
      head: [["Project", "Amount"]],
      body: data.expenditureByRecipient.map((r) => [r.name, formatCurrency(r.value)]),
      ...tableStyles,
      columnStyles: { 0: { cellWidth: "auto" }, 1: { cellWidth: 45, halign: "right" } },
    });
  }
}

function buildProjectsPdf(
  doc: jsPDF,
  data: ReportProjectsData,
  _generatedAt: string,
  _dateRange?: string
) {
  let y = CONTENT_TOP;
  const hasData =
    data.byStatus.length > 0 || data.byCategory.length > 0 || data.byMda.length > 0;

  if (!hasData) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(t.typography.bodySize);
    doc.setTextColor(neutral500[0], neutral500[1], neutral500[2]);
    doc.text("No project data available for the selected period.", PADDING, y + 20);
    return;
  }

  if (data.byStatus.length > 0) {
    doc.setFontSize(t.typography.sectionTitleSize);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(neutral900[0], neutral900[1], neutral900[2]);
    doc.text("Projects by Status", PADDING + 8, y);
    doc.line(PADDING, y + 2, PADDING + 4, y + 2);
    y += 14;

    autoTable(doc, {
      startY: y,
      head: [["Status", "Count"]],
      body: data.byStatus.map((r) => [r.name, String(r.count)]),
      ...tableStyles,
      columnStyles: { 0: { cellWidth: "auto" }, 1: { cellWidth: 40, halign: "right" } },
    });
    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + t.spacing.sectionGap;
  }

  if (data.byCategory.length > 0) {
    if (y > CONTENT_BOTTOM - 40) {
      doc.addPage();
      y = CONTENT_TOP;
    }
    doc.setFontSize(t.typography.sectionTitleSize);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(neutral900[0], neutral900[1], neutral900[2]);
    doc.text("Projects by Category", PADDING + 8, y);
    doc.line(PADDING, y + 2, PADDING + 4, y + 2);
    y += 14;

    autoTable(doc, {
      startY: y,
      head: [["Category", "Count"]],
      body: data.byCategory.map((r) => [r.name, String(r.count)]),
      ...tableStyles,
      columnStyles: { 0: { cellWidth: "auto" }, 1: { cellWidth: 40, halign: "right" } },
    });
    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + t.spacing.sectionGap;
  }

  if (data.byMda.length > 0) {
    if (y > CONTENT_BOTTOM - 40) {
      doc.addPage();
      y = CONTENT_TOP;
    }
    doc.setFontSize(t.typography.sectionTitleSize);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(neutral900[0], neutral900[1], neutral900[2]);
    doc.text("Projects by MDA", PADDING + 8, y);
    doc.line(PADDING, y + 2, PADDING + 4, y + 2);
    y += 14;

    autoTable(doc, {
      startY: y,
      head: [["MDA", "Count"]],
      body: data.byMda.map((r) => [r.name, String(r.count)]),
      ...tableStyles,
      columnStyles: { 0: { cellWidth: "auto" }, 1: { cellWidth: 40, halign: "right" } },
    });
  }
}

function buildUsersPdf(
  doc: jsPDF,
  data: ReportUsersData,
  _generatedAt: string,
  _dateRange?: string
) {
  let y = CONTENT_TOP;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(t.typography.kpiLabelSize);
  doc.setTextColor(neutral500[0], neutral500[1], neutral500[2]);
  doc.text("TOTAL USERS", PADDING + 8, y);
  doc.setFontSize(t.typography.kpiValueSize);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(primary[0], primary[1], primary[2]);
  doc.text(String(data.totalUsers), PADDING + 8, y + 10);

  doc.setFontSize(t.typography.kpiLabelSize);
  doc.setTextColor(neutral500[0], neutral500[1], neutral500[2]);
  doc.text("ACTIVE USERS", PADDING + 70, y);
  doc.setFontSize(t.typography.kpiValueSize);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(secondary[0], secondary[1], secondary[2]);
  doc.text(String(data.activeUsers), PADDING + 70, y + 10);
  const pct =
    data.totalUsers > 0 ? Math.round((data.activeUsers / data.totalUsers) * 100) : 0;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(t.typography.subtitleSize);
  doc.setTextColor(neutral500[0], neutral500[1], neutral500[2]);
  doc.text(`${pct}% of total`, PADDING + 70, y + 16);

  y += 36;

  const byRoleDisplay = data.byRole.map((r) => [
    getRoleDisplayName(r.name as UserRole),
    String(r.value),
  ]);

  if (byRoleDisplay.length > 0) {
    doc.setFontSize(t.typography.sectionTitleSize);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(neutral900[0], neutral900[1], neutral900[2]);
    doc.text("Users by Role", PADDING + 8, y);
    doc.line(PADDING, y + 2, PADDING + 4, y + 2);
    y += 14;

    autoTable(doc, {
      startY: y,
      head: [["Role", "Count"]],
      body: byRoleDisplay,
      ...tableStyles,
      columnStyles: { 0: { cellWidth: "auto" }, 1: { cellWidth: 40, halign: "right" } },
    });
  } else {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(t.typography.bodySize);
    doc.setTextColor(neutral500[0], neutral500[1], neutral500[2]);
    doc.text("No user data available.", PADDING, y + 10);
  }
}

const REPORT_TITLES: Record<ReportType, string> = {
  overview: "Overview Report",
  financial: "Financial Report",
  projects: "Projects Report",
  users: "Users Report",
};

export async function generateReportPdf(
  options: GenerateReportPdfOptions
): Promise<void> {
  const generatedAt = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const dateRange = formatDateRange(options.startDate, options.endDate);
  const title = REPORT_TITLES[options.type];

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  switch (options.type) {
    case "overview":
      buildOverviewPdf(doc, options.data as ReportOverviewData, generatedAt, dateRange);
      break;
    case "financial":
      buildFinancialPdf(doc, options.data as ReportFinancialData, generatedAt, dateRange);
      break;
    case "projects":
      buildProjectsPdf(doc, options.data as ReportProjectsData, generatedAt, dateRange);
      break;
    case "users":
      buildUsersPdf(doc, options.data as ReportUsersData, generatedAt, dateRange);
      break;
    default:
      throw new Error(`Unknown report type: ${options.type}`);
  }

  const reportTypeLabel =
    options.type === "overview"
      ? "Overview"
      : options.type.charAt(0).toUpperCase() + options.type.slice(1);
  applyHeaderFooterToAllPages(doc, title, generatedAt, reportTypeLabel, dateRange);

  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = reportPdfFilename(options.type);
  a.click();
  URL.revokeObjectURL(url);
}
