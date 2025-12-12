"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { MilestoneStatusView } from "@/components/contractor/milestone-status-view";
import { AddMilestoneModal } from "@/components/projects/add-milestone-modal";
import { useSubmissions, useCreateSubmission, useUpdateSubmission } from "@/hooks/use-submissions";
import { useContract } from "@/hooks/use-contract";
import { toast } from "sonner";
import type { MilestoneSubmissionFormInput, MilestoneSubmission } from "@/types";
import { SubmissionStatus } from "@/types";

export default function MilestoneStatusPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<MilestoneSubmission | null>(null);

  const { data: project } = useContract(projectId);
  const { data: submissions, isLoading, refetch } = useSubmissions();
  const { mutateAsync: createSubmission, isPending: isSubmitting } = useCreateSubmission();
  const { mutateAsync: updateSubmission, isPending: isUpdating } = useUpdateSubmission();

  const handleSaveMilestone = async (data: MilestoneSubmissionFormInput) => {
    try {
      // Contractors always get Pending status
      await createSubmission({
        ...data,
        status: SubmissionStatus.Pending,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      });
      toast.success("Milestone submitted - pending approval");
      refetch();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to submit milestone", error);
      toast.error("Failed to submit milestone");
    }
  };

  const handleEditMilestone = (milestone: MilestoneSubmission) => {
    setEditingMilestone(milestone);
    setIsModalOpen(true);
  };

  const handleUpdateMilestone = async (data: MilestoneSubmissionFormInput) => {
    if (!editingMilestone) return;
    
    try {
      const { createdAt, updatedAt, ...updateData } = data;
      
      // If editing rejected milestone, reset to Pending for re-approval
      const isResubmitting = editingMilestone.status === SubmissionStatus.Rejected;
      
      await updateSubmission({
        id: editingMilestone.id,
        ...updateData,
        ...(isResubmitting && { status: SubmissionStatus.Pending }),
      });
      
      if (isResubmitting) {
        toast.success("Milestone re-submitted for approval");
      } else {
        toast.success("Milestone updated successfully");
      }
      
      refetch();
      setIsModalOpen(false);
      setEditingMilestone(null);
    } catch (error) {
      console.error("Failed to update milestone", error);
      toast.error("Failed to update milestone");
      throw error;
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
        onEditMilestone={handleEditMilestone}
      />
      {project && (
        <AddMilestoneModal
          open={isModalOpen}
          onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) setEditingMilestone(null);
          }}
          project={project}
          milestones={submissions || []}
          contractorId={project.contractorId || ""}
          onSave={editingMilestone ? handleUpdateMilestone : handleSaveMilestone}
          isSubmitting={editingMilestone ? isUpdating : isSubmitting}
          milestone={editingMilestone || undefined}
          userRole="Contractor"
        />
      )}
    </>
  );
}
