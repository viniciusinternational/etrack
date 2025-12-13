"use client";
import { useMemo } from "react";

import type { ColumnDef } from "@tanstack/react-table";
import { GlobalTable } from "@/components/global/global-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { MilestoneSubmission, Project } from "@/types";
import { formatDate } from "@/components/contractor/utils";
import numeral from "numeral";
import { Badge } from "../ui/badge";
import { getCategoryColor, getStatusColor } from "../projects-manager/utils";

export function ContractorProjectsListView({
  projects,
  submissions,
}: {
  projects: Project[];
  submissions: MilestoneSubmission[];
}) {
  const stats = useMemo(() => {
    const total = projects.length;
    const totalBudget = projects.reduce((sum, p) => sum + p.contractValue, 0);
    const submittedCount = new Set(submissions.map((s) => s.projectId)).size;
    return { total, totalBudget, submittedCount };
  }, [projects, submissions]);
  const formatCompactNumber = (value: number): string => {
    return numeral(value).format("0.0a").toUpperCase();
  };

  const getProjectProgress = (projectId: string) => {
    const projectSubmissions = submissions.filter(
      (s) => s.projectId === projectId
    );
    if (projectSubmissions.length === 0) return 0;
    const avgProgress =
      projectSubmissions.reduce((sum, s) => sum + s.percentComplete, 0) /
      projectSubmissions.length;
    return Math.round(avgProgress);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Assigned Projects
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage your assigned projects
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {stats.total}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Assigned to you
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCompactNumber(stats.totalBudget)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Combined budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {submissions.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Milestone submissions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Projects Table (Global TanStack Table) */}
      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
          <CardDescription>Showing {projects.length} projects</CardDescription>
        </CardHeader>

        <CardContent>
          <GlobalTable
            data={projects}
            columns={(() => {
              const cols: ColumnDef<Project>[] = [
                {
                  accessorKey: "title",
                  header: "Project",
                  cell: ({ row }) => (
                    <div className="max-w-[220px]">
                      <div className="font-medium text-foreground truncate">
                        {row.original.title}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {row.original.description}
                      </div>
                    </div>
                  ),
                },
                {
                  accessorKey: "category",
                  header: "Category",
                  cell: ({ row }) => (
                    <Badge
                      variant="secondary"
                      className={getCategoryColor(row.original.category)}
                    >
                      {row.original.category}
                    </Badge>
                  ),
                },
                {
                  accessorKey: "supervisingMda.name",
                  header: "MDA",
                  cell: ({ row }) => (
                    <div className="text-sm truncate max-w-[160px]">
                      {row.original.supervisingMda?.name || "N/A"}
                    </div>
                  ),
                },
                {
                  accessorKey: "contractor.name",
                  header: "Contractor",
                  cell: ({ row }) => (
                    <div className="text-sm truncate max-w-[160px]">
                      {row.original.contractor
                        ? `${row.original.contractor.firstname} ${row.original.contractor.lastname}`
                        : "N/A"}
                    </div>
                  ),
                },
                {
                  accessorKey: "contractValue",
                  header: "Value",
                  cell: ({ row }) => (
                    <div className="text-sm font-medium">
                      ₦
                      {numeral(row.original.contractValue)
                        .format("0.0a")
                        .toUpperCase()}
                    </div>
                  ),
                },
                {
                  accessorKey: "status",
                  header: "Status",
                  cell: ({ row }) => (
                    <Badge
                      variant="secondary"
                      className={getStatusColor(row.original.status)}
                    >
                      {row.original.status}
                    </Badge>
                  ),
                },
                {
                  id: "timeline",
                  header: "Timeline",
                  cell: ({ row }) => {
                    const start = row.original.startDate;
                    const end = row.original.endDate;
                    return (
                      <div className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(start)} – {formatDate(end)}
                      </div>
                    );
                  },
                },
              ];
              return cols;
            })()}
            title="Projects"
            rowClickHref={(row) => `/contract/${row.id}/status`}
          />
        </CardContent>
      </Card>
    </>
  );
}
