"use client";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Clock, XCircle, FileText, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import type { MilestoneSubmission } from "@/types";
import { SubmissionStatus } from "@/types";
import {
  formatDate,
  formatDateLong,
  getMilestoneLabel,
  getStatusColor,
} from "@/components/contractor/utils";

export function MilestoneStatusView({
  projectId,
  submissions,
  projectTitle,
  onBack,
}: {
  projectId: string;
  submissions: MilestoneSubmission[];
  projectTitle?: string;
  onBack: () => void;
}) {
  const projectSubmissions = submissions.filter(
    (s) => s.projectId === projectId
  );

  const stats = {
    total: projectSubmissions.length,
    approved: projectSubmissions.filter(
      (s) => s.status === SubmissionStatus.Approved
    ).length,
    pending: projectSubmissions.filter(
      (s) => s.status === SubmissionStatus.Pending
    ).length,
    rejected: projectSubmissions.filter(
      (s) => s.status === SubmissionStatus.Rejected
    ).length,
  };

  const getStatusIcon = (status: SubmissionStatus) => {
    switch (status) {
      case SubmissionStatus.Approved:
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case SubmissionStatus.Pending:
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case SubmissionStatus.Rejected:
        return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Submission Status
          </h1>
          <p className="text-muted-foreground mt-1">
            {projectTitle || "Project"}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {stats.total}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-600">
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {stats.approved}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-yellow-600">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {stats.pending}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-600">
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {stats.rejected}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Milestone Submissions</CardTitle>
          <CardDescription>
            Track all your milestone submissions for this project
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border w-full overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="w-full table-auto">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Milestone</TableHead>
                    <TableHead className="w-[100px]">Progress</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead className="w-[130px]">Submitted</TableHead>
                    <TableHead className="w-[130px]">Reviewed</TableHead>
                    <TableHead className="w-[100px]">Docs</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projectSubmissions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No submissions yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    projectSubmissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium">
                          {getMilestoneLabel(submission.milestoneStage)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {submission.percentComplete}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(submission.status)}
                            <span className="text-sm">{submission.status}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(submission.createdAt)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {submission.reviewedAt
                            ? formatDate(submission.reviewedAt)
                            : "Pending"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {submission.evidenceDocs.length}
                            </Badge>
                            {submission.status === SubmissionStatus.Pending && (
                                <Link href={`/contract/submission/${submission.id}/edit`}>
                                    <Button variant="ghost" size="icon" title="Edit Submission">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </Link>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Submission Details */}
      {projectSubmissions.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Latest Submission Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(() => {
              const latest = projectSubmissions[projectSubmissions.length - 1];
              return (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Milestone Stage
                      </p>
                      <p className="font-medium">
                        {getMilestoneLabel(latest.milestoneStage)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Completion
                      </p>
                      <p className="font-medium">{latest.percentComplete}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge className={getStatusColor(latest.status)}>
                        {latest.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Submitted</p>
                      <p className="font-medium">
                        {formatDateLong(latest.createdAt)}
                      </p>
                    </div>
                  </div>

                  {latest.notes && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Notes
                        </p>
                        <p className="text-sm">{latest.notes}</p>
                      </div>
                    </>
                  )}

                  {latest.reviewedAt && (
                    <>
                      <Separator />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Reviewed By
                          </p>
                          <p className="font-medium">
                            {latest.reviewer?.name || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Reviewed At
                          </p>
                          <p className="font-medium">
                            {formatDateLong(latest.reviewedAt)}
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {latest.evidenceDocs.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Evidence Documents
                        </p>
                        <div className="space-y-2">
                          {latest.evidenceDocs.map((doc, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 text-sm"
                            >
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span>{doc}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </>
              );
            })()}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-4 mt-6">
        <Link href={`/contract/${projectId}/submit`}>
          <Button>Submit New Milestone</Button>
        </Link>
      </div>
    </>
  );
}
