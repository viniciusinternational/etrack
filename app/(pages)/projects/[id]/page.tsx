"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { ProjectDetailView } from "@/components/global/project-detail-view";
import { AddMilestoneModal } from "@/components/projects/add-milestone-modal";
import { useProject } from "@/hooks/use-projects";
import { useCreateSubmission, useUpdateSubmission } from "@/hooks/use-submissions";
import { useProject as useProjectQuery } from "@/hooks/use-projects";
import { useAuthStore } from "@/store/auth-store";
import { hasPermission } from "@/lib/permissions";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { MilestoneSubmissionFormInput, MilestoneSubmission } from "@/types";
import { SubmissionStatus } from "@/types";

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<MilestoneSubmission | null>(null);
  const { user } = useAuthStore();

  const { data: project, isLoading, error, refetch } = useProject(projectId);
  const { mutateAsync: createSubmission, isPending: isSubmitting } = useCreateSubmission();
  const { mutateAsync: updateSubmission, isPending: isUpdating } = useUpdateSubmission();

  // Expose modal opener to window for ProjectDetailView button
  if (typeof window !== 'undefined') {
    (window as any).openMilestoneModal = () => setIsModalOpen(true);
  }

  const handleSaveMilestone = async (data: MilestoneSubmissionFormInput) => {
    try {
      // Determine status based on user role
      // Supervisors and Admins get auto-approved, Contractors need approval
      const isAutoApproved = user && (
        user.role === 'SuperAdmin' ||
        user.role === 'Admin' ||
        user.role === 'ProjectManager'
      );

      await createSubmission({
        ...data,
        status: isAutoApproved ? SubmissionStatus.Approved : SubmissionStatus.Pending,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      });
      
      if (isAutoApproved) {
        toast.success("Milestone added and approved automatically");
      } else {
        toast.success("Milestone added successfully - pending approval");
      }
      
      refetch(); // Refresh project data to get new milestone
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to create milestone", error);
      toast.error("Failed to add milestone");
      throw error;
    }
  };

  const handleEditMilestone = (milestone: MilestoneSubmission) => {
    setEditingMilestone(milestone);
    setIsModalOpen(true);
  };

  const handleUpdateMilestone = async (data: MilestoneSubmissionFormInput) => {
    if (!editingMilestone) return;
    
    try {
      // Don't include createdAt/updatedAt in update - API handles these
      const { createdAt, updatedAt, ...updateData } = data;
      
      // If editing a rejected milestone and user is contractor, reset to Pending for re-approval
      const isContractorResubmitting = 
        user?.role === 'Contractor' && 
        editingMilestone.status === SubmissionStatus.Rejected;
      
      await updateSubmission({
        id: editingMilestone.id,
        ...updateData,
        ...(isContractorResubmitting && { status: SubmissionStatus.Pending }),
      });
      
      if (isContractorResubmitting) {
        toast.success("Milestone re-submitted for approval");
      } else {
        toast.success("Milestone updated successfully");
      }
      
      refetch(); // Refresh project data
      setIsModalOpen(false);
      setEditingMilestone(null);
    } catch (error) {
      console.error("Failed to update milestone", error);
      toast.error("Failed to update milestone");
      throw error;
    }
  };

  const handleApproveMilestone = async (milestone: MilestoneSubmission) => {
    if (!user || !hasPermission(user as any, 'approve_submission')) {
      toast.error("You don't have permission to approve milestones");
      return;
    }

    try {
      await updateSubmission({
        id: milestone.id,
        status: SubmissionStatus.Approved,
      });
      toast.success("Milestone approved successfully");
      refetch();
    } catch (error) {
      console.error("Failed to approve milestone", error);
      toast.error("Failed to approve milestone");
    }
  };

  const handleRejectMilestone = async (milestone: MilestoneSubmission) => {
    if (!user || !hasPermission(user as any, 'reject_submission')) {
      toast.error("You don't have permission to reject milestones");
      return;
    }

    try {
      await updateSubmission({
        id: milestone.id,
        status: SubmissionStatus.Rejected,
      });
      toast.success("Milestone rejected");
      refetch();
    } catch (error) {
      console.error("Failed to reject milestone", error);
      toast.error("Failed to reject milestone");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !project) {
    notFound();
  }

  return (
    <>
      <ProjectDetailView
        project={project}
        milestones={project.milestones || []}
        onBack={() => router.back()}
        onEdit={() => router.push(`/projects/${projectId}/edit`)}
        onEditMilestone={handleEditMilestone}
        onApproveMilestone={user && hasPermission(user as any, 'approve_submission') ? handleApproveMilestone : undefined}
        onRejectMilestone={user && hasPermission(user as any, 'reject_submission') ? handleRejectMilestone : undefined}
      />
      {project.contractorId && (
        <AddMilestoneModal
          open={isModalOpen}
          onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) setEditingMilestone(null);
          }}
          project={project}
          milestones={project.milestones || []}
          contractorId={project.contractorId}
          onSave={editingMilestone ? handleUpdateMilestone : handleSaveMilestone}
          isSubmitting={editingMilestone ? isUpdating : isSubmitting}
          milestone={editingMilestone || undefined}
          userRole={user?.role}
        />
      )}
    </>
  );
}
