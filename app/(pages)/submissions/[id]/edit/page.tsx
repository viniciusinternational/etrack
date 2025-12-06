"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { MilestoneSubmissionFormView } from "@/components/contractor/milestone-submission-form-view";
import { useSubmission, useUpdateSubmission } from "@/hooks/use-submissions";
import { MilestoneSubmissionFormInput } from "@/types";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EditSubmissionPage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const { data: submission, isLoading } = useSubmission(id as string);
  const { mutate: updateSubmission, isPending: isSaving } = useUpdateSubmission();

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

  if (isLoading) {
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

  return (
    <div className="container py-6">
      <MilestoneSubmissionFormView
        projectId={submission.projectId}
        submission={submission}
        projectTitle={submission.project?.title}
        onBack={() => router.back()}
        onSave={handleSave}
      />
    </div>
  );
}
