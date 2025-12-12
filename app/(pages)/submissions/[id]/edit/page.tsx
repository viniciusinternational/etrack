"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { MilestoneSubmissionFormView } from "@/components/contractor/milestone-submission-form-view";
import { useSubmission, useUpdateSubmission } from "@/hooks/use-submissions";
import { MilestoneSubmissionFormInput, SubmissionStatus } from "@/types";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { hasPermission } from "@/lib/permissions";
import { useAuthGuard } from "@/hooks/use-auth-guard";

export default function EditSubmissionPage() {
  // Check authentication and permission
  const { isChecking } = useAuthGuard(['edit_submission']);
  
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const { user } = useAuthStore();
  const { data: submission, isLoading } = useSubmission(id as string);
  const { mutate: updateSubmission, isPending: isSaving } = useUpdateSubmission();

  // Check if user can edit this submission
  const canEdit = hasPermission(user, 'edit_submission');
  const canApprove = hasPermission(user, 'approve_submission');
  const canReject = hasPermission(user, 'reject_submission');
  
  // Contractors can only edit their own pending submissions
  const isContractor = user?.role === 'Contractor';
  const isOwnSubmission = submission && user && submission.contractorId === user.id;
  const isPending = submission?.status === SubmissionStatus.Pending;
  
  const canEditSubmission = canEdit && (
    !isContractor || (isOwnSubmission && isPending)
  );

  const handleSave = (data: MilestoneSubmissionFormInput) => {
    updateSubmission({
      ...data,
      id: id as string,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    }, {
      onSuccess: () => {
        router.push(`/submissions/${id}`);
      },
      onError: (error) => {
        console.error("Failed to update submission:", error);
      },
    });
  };

  if (isChecking || isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">Submission not found</h1>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  // Check if user has permission to edit this specific submission
  if (!canEditSubmission) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-gray-600">
          {isContractor && !isOwnSubmission
            ? "You can only edit your own submissions."
            : isContractor && !isPending
            ? "You can only edit pending submissions."
            : "You don't have permission to edit this submission."}
        </p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <MilestoneSubmissionFormView
        projectId={submission.projectId}
        submission={submission}
        projectTitle={submission.project?.title}
        onBack={() => router.back()}
        onSave={handleSave}
        canApprove={canApprove}
        canReject={canReject}
        isContractor={isContractor}
      />
    </div>
  );
}
