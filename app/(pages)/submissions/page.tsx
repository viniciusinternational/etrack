"use client";

import React, { useState, useMemo } from "react";
import type { ColumnDef, Row } from "@tanstack/react-table";
import Link from "next/link";
import { GlobalTable } from "@/components/global/global-table";
import { Plus } from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";


import { MilestoneSubmission, SubmissionStatus } from "@/types";

import { useSubmissions } from "@/hooks/use-submissions";
import { useAuthGuard } from "@/hooks/use-auth-guard";

export default function SubmissionsListPage() {
  // Check authentication and permission
  const { isChecking } = useAuthGuard(['view_submission']);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data: submissionsData } = useSubmissions();
  const submissions = useMemo(() => submissionsData || [], [submissionsData]);

  // Filtered submissions (status filter applied; GlobalTable handles text search)
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      const matchesStatus =
        statusFilter === "all" || sub.status === statusFilter;
      return matchesStatus;
    });
  }, [submissions, statusFilter]);

  const getStatusBadge = (status: SubmissionStatus) => {
    switch (status) {
      case SubmissionStatus.Approved:
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Approved
          </Badge>
        );
      case SubmissionStatus.Rejected:
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        );
    }
  };

  // Statistics
  const stats = useMemo(() => {
    const total = submissions.length;
    const pending = submissions.filter(
      (s) => s.status === SubmissionStatus.Pending
    ).length;
    const approved = submissions.filter(
      (s) => s.status === SubmissionStatus.Approved
    ).length;
    const rejected = submissions.filter(
      (s) => s.status === SubmissionStatus.Rejected
    ).length;
    return { total, pending, approved, rejected };
  }, [submissions]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Contractor Submissions
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and manage contractor milestone submissions
          </p>
        </div>
        <Link href="/submissions/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Submission
          </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All submissions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-3">
              {stats.pending}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting review
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-2">
              {stats.approved}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Successfully approved
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">
              {stats.rejected}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Declined</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters (search lives inside GlobalTable) */}
      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.values(SubmissionStatus).map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Submissions Table (Global TanStack Table) */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Submissions List</CardTitle>
          <CardDescription>
            Showing {filteredSubmissions.length} of {submissions.length}{" "}
            submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GlobalTable
            data={filteredSubmissions}
            columns={(() => {
              const cols: ColumnDef<MilestoneSubmission>[] = [
                {
                  accessorKey: "project.title",
                  header: "Project",
                  cell: ({ row }: { row: Row<MilestoneSubmission> }) => (
                    <div className="max-w-[250px]">
                      <div className="font-medium text-foreground">
                        {row.original.project?.title || "Untitled Project"}
                      </div>
                    </div>
                  ),
                },
                {
                  accessorKey: "contractor.name",
                  header: "Contractor",
                  cell: ({ row }: { row: Row<MilestoneSubmission> }) => (
                    <div className="text-sm">{row.original.contractor?.name || "Unknown Contractor"}</div>
                  ),
                },
                {
                  accessorKey: "milestoneStage",
                  header: "Milestone",
                  cell: ({ row }: { row: Row<MilestoneSubmission> }) => (
                    <div className="text-sm">{row.original.milestoneStage}</div>
                  ),
                },
                {
                  accessorKey: "percentComplete",
                  header: "Progress",
                  cell: ({ row }: { row: Row<MilestoneSubmission> }) => (
                    <div className="text-sm font-medium">
                      {row.original.percentComplete}%
                    </div>
                  ),
                },
                {
                  accessorKey: "createdAt",
                  header: "Date",
                  cell: ({ row }: { row: Row<MilestoneSubmission> }) => (
                    <div className="text-sm text-muted-foreground">
                      {new Date(row.original.createdAt).toLocaleDateString()}
                    </div>
                  ),
                },
                {
                  accessorKey: "status",
                  header: "Status",
                  cell: ({ row }: { row: Row<MilestoneSubmission> }) => getStatusBadge(row.original.status),
                },
              ];
              return cols;
            })()}
            title="Submissions"
            rowClickHref={(row) => `/submissions/${row.id}`}
          />
        </CardContent>
      </Card>
    </div>
  );
}
