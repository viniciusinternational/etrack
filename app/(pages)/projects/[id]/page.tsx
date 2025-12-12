"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { ProjectDetailView } from "@/components/global/project-detail-view";
import { AddMilestoneModal } from "@/components/projects/add-milestone-modal";
import { useProject } from "@/hooks/use-projects";
import { useCreateSubmission } from "@/hooks/use-submissions";
import { useProject as useProjectQuery } from "@/hooks/use-projects";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { MilestoneSubmissionFormInput } from "@/types";

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: project, isLoading, error, refetch } = useProject(projectId);
  const { mutateAsync: createSubmission, isPending: isSubmitting } = useCreateSubmission();

  // Expose modal opener to window for ProjectDetailView button
  if (typeof window !== 'undefined') {
    (window as any).openMilestoneModal = () => setIsModalOpen(true);
  }

  const handleSaveMilestone = async (data: MilestoneSubmissionFormInput) => {
    try {
      await createSubmission({
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      });
      toast.success("Milestone added successfully");
      refetch(); // Refresh project data to get new milestone
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to create milestone", error);
      toast.error("Failed to add milestone");
      throw error;
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
      />
      {project.contractorId && (
        <AddMilestoneModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          project={project}
          milestones={project.milestones || []}
          contractorId={project.contractorId}
          onSave={handleSaveMilestone}
          isSubmitting={isSubmitting}
        />
      )}
    </>
  );
}
