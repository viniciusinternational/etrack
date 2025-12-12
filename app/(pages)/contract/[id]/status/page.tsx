"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { MilestoneStatusView } from "@/components/contractor/milestone-status-view";
import { AddMilestoneModal } from "@/components/projects/add-milestone-modal";
import { useSubmissions, useCreateSubmission } from "@/hooks/use-submissions";
import { useContract } from "@/hooks/use-contract";
import { toast } from "sonner";
import type { MilestoneSubmissionFormInput } from "@/types";

export default function MilestoneStatusPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: project } = useContract(projectId);
  const { data: submissions, isLoading, refetch } = useSubmissions();
  const { mutateAsync: createSubmission, isPending: isSubmitting } = useCreateSubmission();

  const handleSaveMilestone = async (data: MilestoneSubmissionFormInput) => {
    try {
      await createSubmission({
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      });
      toast.success("Milestone submitted successfully");
      refetch();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to submit milestone", error);
      toast.error("Failed to submit milestone");
    }
  };

  const handleBack = () => {
    router.push("/contract/");
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <MilestoneStatusView
        projectId={projectId}
        submissions={submissions || []}
        projectTitle={project?.title}
        onBack={handleBack}
        onNewSubmission={() => setIsModalOpen(true)}
      />
      {project && (
        <AddMilestoneModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          project={project}
          milestones={submissions || []}
          contractorId={project.contractorId || ""}
          onSave={handleSaveMilestone}
          isSubmitting={isSubmitting}
        />
      )}
    </>
  );
}
