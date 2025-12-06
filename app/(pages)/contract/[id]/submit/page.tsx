"use client";
import { useRouter, useParams } from "next/navigation";
import { MilestoneSubmissionFormView } from "@/components/contractor/milestone-submission-form-view";
import type { MilestoneSubmissionFormInput } from "@/types";
import { useCreateSubmission } from "@/hooks/use-submissions";
import { useContract } from "@/hooks/use-contract";
import { toast } from "sonner";

export default function SubmitMilestonePage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const { data: project } = useContract(projectId);
  const { mutateAsync: createSubmission, isPending: isSubmitting } = useCreateSubmission();

  const handleSave = async (input: MilestoneSubmissionFormInput) => {
    try {
      await createSubmission({
        ...input,
        projectId,
        // Ensure contractorId is set, potentially from auth context or project
        contractorId: input.contractorId || project?.contractorId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      toast.success("Milestone submitted successfully");
      router.push(`/contract/${projectId}/status`);
    } catch (error) {
      console.error("Failed to submit milestone", error);
      toast.error("Failed to submit milestone");
    }
  };

  const handleBack = () => {
    router.push("/contract");
  };

  return (
    <MilestoneSubmissionFormView
      projectId={projectId}
      submission={null} // For new submissions
      projectTitle={project?.title}
      contractorId={project?.contractorId}
      onBack={handleBack}
      onSave={handleSave}
      isSubmitting={isSubmitting}
    />
  );
}
