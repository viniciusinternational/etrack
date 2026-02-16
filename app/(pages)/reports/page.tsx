"use client";

import { useRef, useState } from "react";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { useReports } from "@/hooks/use-reports";
import { ReportPdfContainer } from "@/components/reports/ReportPdfContainer";
import { ReportOverview } from "@/components/reports/ReportOverview";
import { ReportFinancial } from "@/components/reports/ReportFinancial";
import { ReportProjects } from "@/components/reports/ReportProjects";
import { ReportUsers } from "@/components/reports/ReportUsers";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, FileDown, Printer } from "lucide-react";
import { generateReportPdf } from "@/lib/report-pdf";
import type {
  ReportType,
  ReportOverviewData,
  ReportFinancialData,
  ReportProjectsData,
  ReportUsersData,
} from "@/types";

const REPORT_TYPES: { value: ReportType; label: string }[] = [
  { value: "overview", label: "Overview" },
  { value: "financial", label: "Financial" },
  { value: "projects", label: "Projects" },
  { value: "users", label: "Users" },
];

const REPORT_TITLES: Record<ReportType, string> = {
  overview: "Overview Report",
  financial: "Financial Report",
  projects: "Projects Report",
  users: "Users Report",
};

export default function ReportsPage() {
  const { isChecking } = useAuthGuard(["view_dashboard"]);
  const [type, setType] = useState<ReportType>("overview");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);

  const pdfContainerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError, error } = useReports({
    type,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const handleExportPdf = async () => {
    if (!data) return;
    setIsExporting(true);
    try {
      await generateReportPdf({
        type,
        data,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isChecking) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Reports</h1>
          <p className="text-muted-foreground mt-1">
            View and export analytics across users, projects, and finances
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="print:hidden"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button
            size="sm"
            onClick={handleExportPdf}
            disabled={isExporting || isLoading || isError}
            className="print:hidden"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4 mr-2" />
            )}
            Export PDF
          </Button>
        </div>
      </header>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end print:hidden">
        <div className="flex gap-4 items-end">
          <div className="grid gap-2">
            <Label htmlFor="startDate">Start date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="endDate">End date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Tabs value={type} onValueChange={(v) => setType(v as ReportType)}>
        <TabsList className="print:hidden">
          {REPORT_TYPES.map((r) => (
            <TabsTrigger key={r.value} value={r.value}>
              {r.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {isLoading && (
          <div className="flex h-[40vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {isError && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            {error?.message ?? "Failed to load report"}
          </div>
        )}

        {!isLoading && !isError && data && (
          <div className="mt-6">
            <ReportPdfContainer
              ref={pdfContainerRef}
              title={REPORT_TITLES[type]}
              reportType={REPORT_TYPES.find((r) => r.value === type)?.label}
            >
              {type === "overview" && <ReportOverview data={data as ReportOverviewData} />}
              {type === "financial" && <ReportFinancial data={data as ReportFinancialData} />}
              {type === "projects" && <ReportProjects data={data as ReportProjectsData} />}
              {type === "users" && <ReportUsers data={data as ReportUsersData} />}
            </ReportPdfContainer>
          </div>
        )}
      </Tabs>
    </div>
  );
}
