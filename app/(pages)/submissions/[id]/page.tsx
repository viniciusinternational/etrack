"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, CheckCircle, XCircle, Edit, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useSubmission, useUpdateSubmission } from "@/hooks/use-submissions";
import { SubmissionStatus } from "@/types";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { hasPermission } from "@/lib/permissions";

export default function SubmissionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const { user } = useAuthStore();
  const { data: submission, isLoading } = useSubmission(id as string);
  const { mutate: updateSubmission, isPending: isUpdating } = useUpdateSubmission();

  // Check permissions
  const canApprove = hasPermission(user as any, 'approve_submission');
  const canReject = hasPermission(user as any, 'reject_submission');
  const canEdit = hasPermission(user as any, 'edit_submission');

  const handleStatusUpdate = (status: SubmissionStatus) => {
    if (!submission) return;
    updateSubmission(
      { id: submission.id, status },
      {
        onSuccess: () => {
          // Ideally show a toast here
          router.refresh();
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!submission) {
    notFound();
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Review Submission
            </h1>
            <p className="text-gray-600 mt-1">
              View details and approve or reject contractor’s milestone
            </p>
          </div>
        </div>
        <Link href={submission.project?.id ? `/projects/${submission.project.id}` : '#'}>
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            View in Project
          </Button>
        </Link>
      </div>

      {/* Card */}
      <Card>
        <CardHeader>
          <CardTitle>{submission.project?.title || "Untitled Project"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm text-gray-500">Contractor</h3>
            <p className="text-lg font-semibold">{submission.contractor ? `${submission.contractor.firstname} ${submission.contractor.lastname}` : "Unknown Contractor"}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm text-gray-500">Milestone</h3>
              <p className="font-medium">{submission.milestoneStage}</p>
            </div>
            <div>
              <h3 className="text-sm text-gray-500">Progress</h3>
              <div className="flex items-center gap-2">
                <Progress
                  value={submission.percentComplete}
                  className="h-2 w-full"
                />
                <span className="text-sm font-medium">
                  {submission.percentComplete}%
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm text-gray-500">Notes</h3>
            <p>{submission.notes || "No notes provided."}</p>
          </div>

          <div>
            <h3 className="text-sm text-gray-500 mb-2">Evidence Documents</h3>
            <div className="space-y-2">
              {submission.evidenceDocs && submission.evidenceDocs.length > 0 ? (
                submission.evidenceDocs.map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded"
                  >
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span>{doc}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400">No documents attached.</p>
              )}
            </div>
          </div>

          <div className="pt-6 flex justify-end gap-3 border-t mt-4">
            {submission.status === SubmissionStatus.Pending && (
                <>
                    {canReject && (
                      <Button 
                          variant="destructive" 
                          onClick={() => handleStatusUpdate(SubmissionStatus.Rejected)}
                          disabled={isUpdating}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    )}
                    {canApprove && (
                      <Button 
                          onClick={() => handleStatusUpdate(SubmissionStatus.Approved)}
                          disabled={isUpdating}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    )}
                    {!canApprove && !canReject && (
                      <div className="text-sm text-gray-500">
                        You don't have permission to approve or reject this submission.
                      </div>
                    )}
                </>
            )}
            {submission.status !== SubmissionStatus.Pending && (
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        submission.status === SubmissionStatus.Approved ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                        {submission.status}
                    </span>
                    {submission.reviewer && (
                      <span className="text-xs text-gray-500">
                        Reviewed by: {submission.reviewer.firstname} {submission.reviewer.lastname}
                      </span>
                    )}
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
