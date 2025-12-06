"use client";
import { useRouter, useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { ProjectDetailView } from "@/components/global/project-detail-view";
import { useProject } from "@/hooks/use-projects";
import { Loader2 } from "lucide-react";

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const { data: project, isLoading, error } = useProject(projectId);

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
    <ProjectDetailView
      project={project}
      milestones={project.milestones || []}
      onBack={() => router.back()}
      onEdit={() => router.push(`/projects/${projectId}/edit`)}
    />
  );
}
