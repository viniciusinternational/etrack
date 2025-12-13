"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";

import { MilestoneStatusView } from "@/components/contractor/milestone-status-view";
import { ProjectDetailView } from "@/components/global/project-detail-view";
import { ContractProjectDetailView } from "@/components/contractor/contract-project-detail-view";
import { AddMilestoneModal } from "@/components/projects/add-milestone-modal";
import { ContractAddMilestoneModal } from "@/components/contractor/contract-add-milestone-modal";

import {
  useSubmissions,
  useCreateSubmission,
  useUpdateSubmission,
} from "@/hooks/use-submissions";
import { useContract } from "@/hooks/use-contract";

import { useAuthStore } from "@/store/auth-store";
import { UserRole, SubmissionStatus } from "@/types";
import type {
  MilestoneSubmission,
  MilestoneSubmissionFormInput,
} from "@/types";

export default function MilestoneStatusPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] =
    useState<MilestoneSubmission | null>(null);

  const { data: project } = useContract(projectId);
  const { data: submissions, isLoading, refetch } = useSubmissions();
  const { mutateAsync: createSubmission, isPending: isSubmitting } =
    useCreateSubmission();
  const { mutateAsync: updateSubmission, isPending: isUpdating } =
    useUpdateSubmission();

  const currentUser = useAuthStore((s) => s.user);
  // On the contract page: contractors see ContractProjectDetailView (with edit milestone only)
  // Non-contractors (supervisors, admins) see ProjectDetailView (with approve/reject)
  // Determine if user is a contractor either by role OR by being the project contractor
  const isContractor =
    currentUser?.role === UserRole.Contractor ||
    (currentUser && project && project.contractorId === currentUser.id);

  /* -------------------- Handlers -------------------- */

  const handleSaveMilestone = async (data: MilestoneSubmissionFormInput) => {
    try {
      await createSubmission({
        ...data,
        status: SubmissionStatus.Pending,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      });

      toast.success("Milestone submitted (pending approval)");
      refetch();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
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
      const isResubmitting =
        editingMilestone.status === SubmissionStatus.Rejected;

      await updateSubmission({
        id: editingMilestone.id,
        ...updateData,
        ...(isResubmitting && {
          status: SubmissionStatus.Pending,
        }),
      });

      toast.success(
        isResubmitting
          ? "Milestone re-submitted for approval"
          : "Milestone updated"
      );

      refetch();
      setIsModalOpen(false);
      setEditingMilestone(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update milestone");
    }
  };

  const handleApproveMilestone = async (milestone: MilestoneSubmission) => {
    try {
      await updateSubmission({
        id: milestone.id,
        status: SubmissionStatus.Approved,
      });
      toast.success("Milestone approved");
      refetch();
    } catch (err) {
      toast.error("Failed to approve milestone");
    }
  };

  const handleRejectMilestone = async (milestone: MilestoneSubmission) => {
    try {
      await updateSubmission({
        id: milestone.id,
        status: SubmissionStatus.Rejected,
      });
      toast.success("Milestone rejected");
      refetch();
    } catch (err) {
      toast.error("Failed to reject milestone");
    }
  };

  const handleBack = () => router.push("/contract");

  /* -------------------- Render -------------------- */

  if (isLoading) return <div>Loading...</div>;

  const projectMilestones =
    submissions?.filter((s) => s.projectId === projectId) || [];

  return (
    <>
      {project ? (
        // Always use ContractProjectDetailView for contract pages (contractors only see edit)
        <ContractProjectDetailView
          project={project}
          milestones={projectMilestones}
          onBack={handleBack}
          onEdit={() => router.push(`/contract/${projectId}/edit`)}
          onEditMilestone={handleEditMilestone}
        />
      ) : (
        <MilestoneStatusView
          projectId={projectId}
          submissions={submissions || []}
          projectTitle={project?.title}
          onBack={handleBack}
          onNewSubmission={() => setIsModalOpen(true)}
          onEditMilestone={handleEditMilestone}
        />
      )}

      {project &&
        (isContractor ? (
          <ContractAddMilestoneModal
            open={isModalOpen}
            onOpenChange={(open) => {
              setIsModalOpen(open);
              if (!open) setEditingMilestone(null);
            }}
            project={project}
            milestones={projectMilestones}
            contractorId={project.contractorId || ""}
            onSave={
              editingMilestone ? handleUpdateMilestone : handleSaveMilestone
            }
            isSubmitting={editingMilestone ? isUpdating : isSubmitting}
            milestone={editingMilestone || undefined}
          />
        ) : (
          <AddMilestoneModal
            open={isModalOpen}
            onOpenChange={(open) => {
              setIsModalOpen(open);
              if (!open) setEditingMilestone(null);
            }}
            project={project}
            milestones={projectMilestones}
            contractorId={project.contractorId || ""}
            onSave={
              editingMilestone ? handleUpdateMilestone : handleSaveMilestone
            }
            isSubmitting={editingMilestone ? isUpdating : isSubmitting}
            milestone={editingMilestone || undefined}
            userRole="Admin"
          />
        ))}
    </>
  );
}
