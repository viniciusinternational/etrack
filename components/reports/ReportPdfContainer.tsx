"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export const REPORT_THEME = {
  primary: "#0F5C2E",
  primaryLight: "#E8F5E9",
  secondary: "#0D47A1",
  secondaryLight: "#E3F2FD",
  accent: "#B45309",
  accentLight: "#FFF3E0",
  neutral: {
    900: "#1a1a1a",
    700: "#334155",
    500: "#64748b",
    200: "#e2e8f0",
    100: "#f1f5f9",
    50: "#f8fafc",
  },
  border: "#e2e8f0",
} as const;

export interface ReportPdfContainerProps {
  children: React.ReactNode;
  title?: string;
  reportType?: string;
  className?: string;
}

const ReportPdfContainer = React.forwardRef<HTMLDivElement, ReportPdfContainerProps>(
  function ReportPdfContainer({ children, title, reportType, className }, ref) {
    const reportTitle = title ?? "Report";
    const generatedAt = new Date().toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    return (
      <div
        ref={ref}
        id="report-pdf-content"
        className={cn(
          "rounded-xl border-2 shadow-lg print:border print:shadow-none",
          className
        )}
        style={{
          backgroundColor: REPORT_THEME.neutral[50],
          borderColor: REPORT_THEME.border,
          minWidth: 800,
          color: REPORT_THEME.neutral[900],
        }}
      >
        <header
          className="px-6 pt-6 pb-5"
          style={{
            borderBottom: `3px solid ${REPORT_THEME.primary}`,
          }}
        >
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: REPORT_THEME.primary }}
          >
            {reportTitle}
          </h1>
          <p
            className="mt-1.5 text-sm tracking-wide"
            style={{ color: REPORT_THEME.neutral[500] }}
          >
            Generated on {generatedAt}
            {reportType ? ` · ${reportType}` : ""}
          </p>
        </header>
        <div className="space-y-8 px-6 py-6">{children}</div>
        <footer
          className="px-6 py-4 text-center text-xs"
          style={{
            borderTop: `1px solid ${REPORT_THEME.border}`,
            color: REPORT_THEME.neutral[500],
          }}
        >
          E-Track Report · Confidential
        </footer>
      </div>
    );
  }
);

ReportPdfContainer.displayName = "ReportPdfContainer";

export { ReportPdfContainer };
